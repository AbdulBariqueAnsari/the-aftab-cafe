import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest, logAudit } from '../middleware/auth';
import { notifyNewOrder, notifyOrderStatusUpdated, notifyTableUpdated } from '../socket';

const router = Router();

// ================= COUPON VALIDATION =================

router.post('/coupons/validate', async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required.' });
  }

  const numericSubtotal = parseFloat(subtotal) || 0;

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ error: 'Invalid or expired coupon code.' });
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return res.status(400).json({ error: 'This coupon has expired.' });
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit has been reached.' });
    }

    if (numericSubtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (numericSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, numericSubtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return res.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return res.status(500).json({ error: 'Failed to validate coupon.' });
  }
});

// ================= CUSTOMER ORDER CREATION =================

router.post('/', async (req, res) => {
  try {
    const {
      orderType,
      tableId,
      customerName,
      customerPhone,
      specialInstructions,
      paymentMethod,
      couponCode,
      items,
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ error: 'Customer name is required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Please select at least one item.' });
    }

    // Load settings for tax and requirements
    const settings = await prisma.websiteSettings.findUnique({ where: { id: 1 } });
    if (settings?.requireCustomerPhone && (!customerPhone || !customerPhone.trim())) {
      return res.status(400).json({ error: 'Phone number is required for ordering.' });
    }

    const isDineIn = orderType === 'DINE_IN';
    let cafeTable = null;
    let tableNumberSnapshot = null;

    if (isDineIn) {
      if (!tableId) {
        return res.status(400).json({ error: 'Please select a table for Dine-in orders.' });
      }
      cafeTable = await prisma.cafeTable.findUnique({ where: { id: tableId } });
      if (!cafeTable || !cafeTable.active) {
        return res.status(400).json({ error: 'Selected table is not available.' });
      }
      tableNumberSnapshot = cafeTable.number;
    }

    // STRICT SERVER-SIDE PRICE AND INTEGRITY VALIDATION
    let calculatedSubtotal = 0;
    const validatedOrderItems: any[] = [];

    for (const item of items) {
      const { productId, quantity, selectedOptionIds, notes } = item;
      const numQty = parseInt(quantity);
      if (!productId || isNaN(numQty) || numQty < 1) {
        return res.status(400).json({ error: 'Invalid product or quantity.' });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          customizationGroups: {
            include: { options: true },
          },
        },
      });

      if (!product) {
        return res.status(404).json({ error: `Product not found: ${productId}` });
      }

      if (!product.isAvailable) {
        return res.status(400).json({ error: `"${product.name}" is currently sold out.` });
      }

      const basePrice = product.discountedPrice ?? product.basePrice;
      let optionsPrice = 0;
      const snapshotCustomizations: any[] = [];

      if (selectedOptionIds && Array.isArray(selectedOptionIds)) {
        for (const optId of selectedOptionIds) {
          // Find the option in product's customization groups
          let matchedOption: any = null;
          let matchedGroup: any = null;

          for (const group of product.customizationGroups) {
            const foundOpt = group.options.find((o) => o.id === optId);
            if (foundOpt) {
              matchedOption = foundOpt;
              matchedGroup = group;
              break;
            }
          }

          if (matchedOption && matchedGroup) {
            optionsPrice += matchedOption.priceModifier;
            snapshotCustomizations.push({
              groupName: matchedGroup.name,
              optionName: matchedOption.name,
              priceModifier: matchedOption.priceModifier,
            });
          }
        }
      }

      const itemUnitPrice = basePrice;
      const itemSubtotal = Math.round((basePrice + optionsPrice) * numQty * 100) / 100;
      calculatedSubtotal += itemSubtotal;

      validatedOrderItems.push({
        productId: product.id,
        productName: product.name,
        categoryName: product.category.name,
        unitPrice: itemUnitPrice,
        quantity: numQty,
        subtotal: itemSubtotal,
        notes: notes ? String(notes).trim() : null,
        isVeg: product.isVeg,
        customizations: snapshotCustomizations,
      });
    }

    calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;

    // Minimum order check
    if (settings?.minOrderAmount && calculatedSubtotal < settings.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order amount is ₹${settings.minOrderAmount}. Current subtotal is ₹${calculatedSubtotal}`,
      });
    }

    // Coupon discount verification
    let discountAmount = 0;
    let couponRecord: any = null;

    if (couponCode) {
      couponRecord = await prisma.coupon.findUnique({
        where: { code: String(couponCode).trim().toUpperCase() },
      });

      if (
        couponRecord &&
        couponRecord.isActive &&
        calculatedSubtotal >= couponRecord.minOrderAmount &&
        (!couponRecord.validUntil || new Date(couponRecord.validUntil) >= new Date()) &&
        (!couponRecord.usageLimit || couponRecord.timesUsed < couponRecord.usageLimit)
      ) {
        if (couponRecord.discountType === 'PERCENTAGE') {
          discountAmount = (calculatedSubtotal * couponRecord.discountValue) / 100;
          if (couponRecord.maxDiscount && discountAmount > couponRecord.maxDiscount) {
            discountAmount = couponRecord.maxDiscount;
          }
        } else {
          discountAmount = Math.min(couponRecord.discountValue, calculatedSubtotal);
        }
        discountAmount = Math.round(discountAmount * 100) / 100;
      }
    }

    const netTaxable = Math.max(0, calculatedSubtotal - discountAmount);
    const taxRate = settings?.taxRatePercent || 0;
    const serviceRate = settings?.serviceChargePercent || 0;

    const taxAmount = Math.round(((netTaxable * taxRate) / 100) * 100) / 100;
    const serviceCharge = Math.round(((netTaxable * serviceRate) / 100) * 100) / 100;
    const grandTotal = Math.round((netTaxable + taxAmount + serviceCharge) * 100) / 100;

    // Generate Order Number: AFT-YYYYMMDD-XXXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AFT-${dateStr}-${randomSuffix}`;

    // Execute in transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          orderType: isDineIn ? 'DINE_IN' : 'TAKEAWAY',
          status: 'ORDER_RECEIVED',
          customerName: customerName.trim(),
          customerPhone: customerPhone ? customerPhone.trim() : null,
          tableId: isDineIn ? tableId : null,
          tableNumber: tableNumberSnapshot,
          subtotal: calculatedSubtotal,
          discount: discountAmount,
          taxAmount,
          serviceCharge,
          grandTotal,
          paymentMethod: paymentMethod || 'PAY_AT_COUNTER',
          paymentStatus: paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
          specialInstructions: specialInstructions ? specialInstructions.trim() : null,
          items: {
            create: validatedOrderItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              categoryName: item.categoryName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.subtotal,
              notes: item.notes,
              isVeg: item.isVeg,
              customizations: {
                create: item.customizations.map((c: any) => ({
                  groupName: c.groupName,
                  optionName: c.optionName,
                  priceModifier: c.priceModifier,
                })),
              },
            })),
          },
        },
        include: {
          items: {
            include: { customizations: true },
          },
          table: true,
        },
      });

      // Update coupon timesUsed
      if (couponRecord) {
        await tx.coupon.update({
          where: { id: couponRecord.id },
          data: { timesUsed: { increment: 1 } },
        });

        await tx.couponRedemption.create({
          data: {
            couponId: couponRecord.id,
            orderId: created.id,
            discountAmount,
          },
        });
      }

      // If dine-in, mark table as OCCUPIED
      if (isDineIn && cafeTable && cafeTable.status === 'AVAILABLE') {
        const updatedTable = await tx.cafeTable.update({
          where: { id: cafeTable.id },
          data: { status: 'OCCUPIED' },
        });
        notifyTableUpdated(updatedTable);
      }

      return created;
    });

    // Notify live admin dashboard
    notifyNewOrder(newOrder);

    return res.status(201).json({
      message: 'Order placed successfully!',
      orderNumber: newOrder.orderNumber,
      order: newOrder,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Failed to process order. Please try again.' });
  }
});

// ================= CUSTOMER ORDER TRACKING =================

router.get('/:orderNumber', async (req, res) => {
  const { orderNumber } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
      include: {
        items: {
          include: { customizations: true },
        },
        table: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Track order error:', error);
    return res.status(500).json({ error: 'Failed to fetch order status.' });
  }
});

// ================= ADMIN ORDER MANAGEMENT =================

// Admin list orders with filters
router.get('/admin/all', authenticateToken, requireRole('SERVICE_STAFF', 'BARISTA', 'CASHIER', 'MANAGER'), async (req, res) => {
  try {
    const { status, orderType, search, tableNumber, date } = req.query;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (orderType && orderType !== 'ALL') {
      where.orderType = String(orderType);
    }

    if (tableNumber) {
      where.tableNumber = String(tableNumber);
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: String(search) } },
        { customerName: { contains: String(search) } },
        { customerPhone: { contains: String(search) } },
      ];
    }

    if (date) {
      const queryDate = new Date(String(date));
      const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { customizations: true },
        },
        table: true,
      },
      take: 100,
    });

    return res.json(orders);
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Update order status (Live pipeline)
router.patch('/admin/:id/status', authenticateToken, requireRole('BARISTA', 'SERVICE_STAFF', 'CASHIER', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const validStatuses = [
      'ORDER_RECEIVED',
      'ORDER_ACCEPTED',
      'PREPARING',
      'READY_TO_SERVE',
      'SERVED',
      'COMPLETED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    // Role-specific check:
    // Barista can set ORDER_ACCEPTED, PREPARING, READY_TO_SERVE
    // Service staff can set SERVED, COMPLETED
    if (req.user?.role === 'BARISTA' && !['ORDER_ACCEPTED', 'PREPARING', 'READY_TO_SERVE'].includes(status)) {
      return res.status(403).json({ error: 'Baristas can only mark orders as Accepted, Preparing, or Ready to Serve.' });
    }

    if (req.user?.role === 'SERVICE_STAFF' && !['SERVED', 'COMPLETED'].includes(status)) {
      return res.status(403).json({ error: 'Service staff can only mark orders as Served or Completed.' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        cancellationReason: status === 'CANCELLED' ? cancellationReason || 'Cancelled by staff' : undefined,
      },
      include: {
        items: { include: { customizations: true } },
        table: true,
      },
    });

    // Notify both admin and the specific customer
    notifyOrderStatusUpdated(order);

    await logAudit('ORDER_STATUS_UPDATE', `Order ${order.orderNumber} status changed to ${status}`, req);

    return res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Update payment status (Cashier, Manager)
router.patch('/admin/:id/payment', authenticateToken, requireRole('CASHIER', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status.' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: { items: true, table: true },
    });

    notifyOrderStatusUpdated(order);
    await logAudit('ORDER_PAYMENT_UPDATE', `Order ${order.orderNumber} payment marked as ${paymentStatus}`, req);

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update payment status.' });
  }
});

export default router;
