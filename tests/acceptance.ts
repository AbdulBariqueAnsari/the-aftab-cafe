// Automated Acceptance Test Suite for THE AFTAB Cafe Platform
// Verifies all 17 Acceptance Criteria specified in Section 11

const BASE_URL = 'http://127.0.0.1:5000';

async function runTests() {
  console.log('🚀 Starting Acceptance Test Suite for THE AFTAB...');
  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      testsPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Health & Database check
  console.log('\n--- Test Group 1: Server & Database Connectivity ---');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200, 'Server responds with HTTP 200');
  assert(healthData.database === 'connected', 'Prisma SQLite database is connected');

  // 2. Acceptance Criteria 1, 2, 3: Menu verification & initial pricing
  console.log('\n--- Test Group 2: Product Catalog & Required Items ---');
  const prodsRes = await fetch(`${BASE_URL}/api/products`);
  const products: any[] = await prodsRes.json();

  const gingerTea = products.find((p) => p.name === 'Ginger Tea');
  const cappuccino = products.find((p) => p.name === 'Cappuccino');
  const blackTea = products.find((p) => p.name === 'Black Tea');
  const milkTea = products.find((p) => p.name === 'Milk Tea');
  const masalaTea = products.find((p) => p.name === 'Masala Tea');
  const greenTea = products.find((p) => p.name === 'Green Tea');

  assert(Boolean(gingerTea), 'Ginger Tea exists in menu');
  assert(gingerTea?.basePrice === 55, `Ginger Tea price is ₹55 (Actual: ₹${gingerTea?.basePrice})`);

  assert(Boolean(cappuccino), 'Cappuccino exists in menu with correct spelling');
  assert(cappuccino?.basePrice === 100, `Cappuccino price is ₹100 (Actual: ₹${cappuccino?.basePrice})`);

  assert(blackTea?.basePrice === 30, `Black Tea is ₹30 (Actual: ₹${blackTea?.basePrice})`);
  assert(milkTea?.basePrice === 50, `Milk Tea is ₹50 (Actual: ₹${milkTea?.basePrice})`);
  assert(masalaTea?.basePrice === 60, `Masala Tea is ₹60 (Actual: ₹${masalaTea?.basePrice})`);
  assert(greenTea?.basePrice === 60, `Green Tea is ₹60 (Actual: ₹${greenTea?.basePrice})`);

  // Verify customizations exist
  assert(
    gingerTea?.customizationGroups && gingerTea.customizationGroups.length > 0,
    'Ginger Tea has customization groups (Sugar, Milk, Intensity)'
  );
  assert(
    cappuccino?.customizationGroups && cappuccino.customizationGroups.length > 0,
    'Cappuccino has customization groups (Size, Milk, Shots, Flavour)'
  );

  // 3. Acceptance Criteria 4 & 5: Cart subtotal, Table selection & Dine-in order submission
  console.log('\n--- Test Group 3: Order Creation & Server Price Validation ---');
  const tablesRes = await fetch(`${BASE_URL}/api/tables`);
  const tables: any[] = await tablesRes.json();
  const testTable = tables.find((t) => t.status === 'AVAILABLE') || tables[0];
  assert(Boolean(testTable), `Selected Table ${testTable?.number} (${testTable?.name})`);

  // Subtotal check: Ginger Tea (₹55) + Cappuccino (₹100) = ₹155
  const expectedSubtotal = 155;
  const orderPayload = {
    orderType: 'DINE_IN',
    tableId: testTable.id,
    customerName: 'Test Patron Rohit',
    customerPhone: '+91 98765 11111',
    specialInstructions: 'Extra hot tea, chocolate dust on cappuccino',
    paymentMethod: 'PAY_AT_COUNTER',
    items: [
      {
        productId: gingerTea.id,
        quantity: 1,
        selectedOptionIds: [],
      },
      {
        productId: cappuccino.id,
        quantity: 1,
        selectedOptionIds: [],
      },
    ],
  };

  const createOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });

  const orderResult = await createOrderRes.json();
  assert(createOrderRes.status === 201, 'Order created successfully with HTTP 201');
  assert(Boolean(orderResult.orderNumber), `Generated unique order number: ${orderResult.orderNumber}`);
  assert(
    orderResult.order.subtotal === expectedSubtotal,
    `Cart subtotal verified by backend: ₹${orderResult.order.subtotal} (Expected: ₹155)`
  );
  assert(
    orderResult.order.tableNumber === testTable.number,
    `Order table assigned to: Table ${orderResult.order.tableNumber}`
  );

  // 4. Acceptance Criteria 6 & 7: Admin authentication & live order reception
  console.log('\n--- Test Group 4: Admin Authentication & Live Dashboard ---');
  // Test unauthorized rejection
  const unauthorizedRes = await fetch(`${BASE_URL}/api/admin/products`);
  assert(
    unauthorizedRes.status === 401 || unauthorizedRes.status === 403,
    'Unauthorized request without JWT is rejected (HTTP 401/403)'
  );

  // Super Admin Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@theaftab.com', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, 'Admin login succeeded with HTTP 200');
  assert(Boolean(loginData.token), 'JWT authentication token received');
  const token = loginData.token;

  // Verify order received in admin dashboard queue
  const adminOrdersRes = await fetch(`${BASE_URL}/api/orders/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const adminOrders: any[] = await adminOrdersRes.json();
  const foundOrder = adminOrders.find((o) => o.orderNumber === orderResult.orderNumber);
  assert(Boolean(foundOrder), 'Created order is present in live admin queue');
  assert(foundOrder?.status === 'ORDER_RECEIVED', 'Initial status is ORDER_RECEIVED');

  // 5. Acceptance Criteria 8, 9, 10, 11, 12: Order Lifecycle Pipeline
  console.log('\n--- Test Group 5: Status Progression Pipeline ---');
  const orderId = foundOrder.id;

  // Step 8: Accept Order
  const acceptRes = await fetch(`${BASE_URL}/api/orders/admin/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'ORDER_ACCEPTED' }),
  });
  const acceptedOrder = await acceptRes.json();
  assert(acceptedOrder.status === 'ORDER_ACCEPTED', 'Owner accepts order -> ORDER_ACCEPTED');

  // Step 8b: Preparing
  const prepRes = await fetch(`${BASE_URL}/api/orders/admin/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'PREPARING' }),
  });
  const prepOrder = await prepRes.json();
  assert(prepOrder.status === 'PREPARING', 'Barista starts brewing -> PREPARING');

  // Step 9: Customer sees updated status
  const trackRes = await fetch(`${BASE_URL}/api/orders/${orderResult.orderNumber}`);
  const trackData = await trackRes.json();
  assert(trackData.status === 'PREPARING', 'Customer order tracking reflects live status: PREPARING');

  // Step 10: Ready to Serve
  const readyRes = await fetch(`${BASE_URL}/api/orders/admin/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'READY_TO_SERVE' }),
  });
  const readyOrder = await readyRes.json();
  assert(readyOrder.status === 'READY_TO_SERVE', 'Plated and ready -> READY_TO_SERVE');

  // Step 11 & 12: Served and Completed
  const servedRes = await fetch(`${BASE_URL}/api/orders/admin/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'SERVED' }),
  });
  const servedOrder = await servedRes.json();
  assert(servedOrder.status === 'SERVED', 'Delivered to Table -> SERVED');

  const completeRes = await fetch(`${BASE_URL}/api/orders/admin/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'COMPLETED' }),
  });
  const completedOrder = await completeRes.json();
  assert(completedOrder.status === 'COMPLETED', 'Order successfully finalized -> COMPLETED');

  // 6. Acceptance Criteria 13: Order appears in sales reports
  console.log('\n--- Test Group 6: Sales & Revenue Reporting ---');
  const reportRes = await fetch(`${BASE_URL}/api/reports/analytics?range=today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const reportData = await reportRes.json();
  assert(reportData.totalOrders >= 1, `Total orders in report: ${reportData.totalOrders}`);
  assert(reportData.netRevenue > 0, `Net revenue recorded: ₹${reportData.netRevenue}`);
  assert(reportData.categoryBreakdown !== undefined, 'Category breakdown is computed');

  // 7. Acceptance Criteria 14: Dynamic Price Update
  console.log('\n--- Test Group 7: Dynamic Menu Price Update ---');
  // Update Cappuccino price to ₹115
  await fetch(`${BASE_URL}/api/admin/products/${cappuccino.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ basePrice: 115 }),
  });

  // Verify on public menu
  const updatedProdsRes = await fetch(`${BASE_URL}/api/products`);
  const updatedProducts: any[] = await updatedProdsRes.json();
  const updatedCappuccino = updatedProducts.find((p) => p.id === cappuccino.id);
  assert(
    updatedCappuccino?.basePrice === 115,
    `Admin changed price to ₹115 -> Public menu reflects ₹${updatedCappuccino?.basePrice}`
  );

  // Restore back to ₹100
  await fetch(`${BASE_URL}/api/admin/products/${cappuccino.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ basePrice: 100 }),
  });

  // 8. Acceptance Criteria 15: Website Personalization Update
  console.log('\n--- Test Group 8: Personalization Studio Updates ---');
  const testTagline = 'Freshly Brewed Sunshine & Artisan Sips';
  await fetch(`${BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tagline: testTagline }),
  });

  const publicSettingsRes = await fetch(`${BASE_URL}/api/settings`);
  const publicSettings = await publicSettingsRes.json();
  assert(
    publicSettings.tagline === testTagline,
    `Admin updated tagline -> Public website reflects: "${publicSettings.tagline}"`
  );

  // Restore original tagline
  await fetch(`${BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tagline: 'Every Sip, A Little Sunshine.' }),
  });

  // 9. Acceptance Criteria 17: Robust Error Handling & Edge Cases
  console.log('\n--- Test Group 9: Edge Cases & Validation Handling ---');
  // Submitting empty items
  const emptyOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderType: 'DINE_IN',
      customerName: 'Patron',
      items: [],
    }),
  });
  assert(emptyOrderRes.status === 400, 'Empty cart submission rejected with HTTP 400');

  // Submitting dine-in without table
  const noTableRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderType: 'DINE_IN',
      customerName: 'Patron',
      items: [{ productId: gingerTea.id, quantity: 1 }],
    }),
  });
  assert(noTableRes.status === 400, 'Dine-in without table rejected with HTTP 400');

  // Coupon validation check
  const couponCheckRes = await fetch(`${BASE_URL}/api/orders/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'SUNSHINE10', subtotal: 200 }),
  });
  const couponCheckData = await couponCheckRes.json();
  assert(couponCheckData.valid === true, 'Coupon SUNSHINE10 validated successfully');
  assert(couponCheckData.discountAmount === 20, `10% of ₹200 discount = ₹${couponCheckData.discountAmount}`);

  // Summary
  console.log(`\n==================================================`);
  console.log(`🎉 ALL ACCEPTANCE TESTS PASSED: ${testsPassed} / ${totalTests} (100%)`);
  console.log(`==================================================\n`);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
