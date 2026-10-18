import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for THE AFTAB...');

  // 1. Initial Admin & Staff Users
  const superAdminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const baristaPassword = await bcrypt.hash('barista123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@theaftab.com' },
    update: {},
    create: {
      name: 'Aftab Ahmad (Owner)',
      email: 'admin@theaftab.com',
      passwordHash: superAdminPassword,
      role: 'SUPER_ADMIN',
      phone: '+91 98765 43210',
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@theaftab.com' },
    update: {},
    create: {
      name: 'Priya Sharma (Manager)',
      email: 'manager@theaftab.com',
      passwordHash: managerPassword,
      role: 'MANAGER',
      phone: '+91 98765 43211',
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'barista@theaftab.com' },
    update: {},
    create: {
      name: 'Kabir Verma (Head Barista)',
      email: 'barista@theaftab.com',
      passwordHash: baristaPassword,
      role: 'BARISTA',
      phone: '+91 98765 43212',
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@theaftab.com' },
    update: {},
    create: {
      name: 'Rohan Sen (Service Staff)',
      email: 'staff@theaftab.com',
      passwordHash: staffPassword,
      role: 'SERVICE_STAFF',
      phone: '+91 98765 43213',
      active: true,
    },
  });

  console.log('✓ Staff & Admin users created');

  // 2. Website Settings
  await prisma.websiteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      cafeName: 'THE AFTAB',
      tagline: 'Every Sip, A Little Sunshine.',
      heroHeadline: 'THE AFTAB — Every Sip, A Little Sunshine.',
      heroSubtitle: 'Freshly Brewed. Beautifully Served.',
      heroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80',
      announcementBanner: '☀️ Welcome to THE AFTAB. Enjoy 10% off your first order with code SUNSHINE10!',
      showAnnouncement: true,
      primaryColor: '#2C1810',
      accentColor: '#C67D3A',
      darkModeEnabled: false,
      phone: '+91 98765 43210',
      email: 'hello@theaftabcafe.com',
      address: '42 Sunshine Boulevard, Heritage Quarter, New Delhi, India 110001',
      openingHours: 'Monday – Sunday: 8:00 AM – 11:00 PM',
      googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14008.114878201202!2d77.214476!3d28.632429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b92781b1%3A0x6b80145c8b730f24!2sConnaught%20Place%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000',
      instagramUrl: 'https://instagram.com/theaftabcafe',
      facebookUrl: 'https://facebook.com/theaftabcafe',
      twitterUrl: 'https://twitter.com/theaftabcafe',
      currencySymbol: '₹',
      taxRatePercent: 5.0,
      serviceChargePercent: 0.0,
      minOrderAmount: 0.0,
      requireCustomerPhone: false,
      allowDineIn: true,
      allowTakeaway: true,
      enableReviews: true,
    },
  });

  // 3. Cafe Tables
  const tablesData = [
    { number: 'T1', name: 'Window Arch Corner', capacity: 2, status: 'AVAILABLE', notes: 'Best for couples & reading' },
    { number: 'T2', name: 'Heritage Courtyard 1', capacity: 4, status: 'AVAILABLE', notes: 'Spacious 4-seater' },
    { number: 'T3', name: 'Heritage Courtyard 2', capacity: 4, status: 'AVAILABLE', notes: 'Near garden wall' },
    { number: 'T4', name: 'Sunlit Patio', capacity: 6, status: 'AVAILABLE', notes: 'Family & group table' },
    { number: 'T5', name: 'Royal Velvet Lounge', capacity: 6, status: 'AVAILABLE', notes: 'Plush seating, sofa style' },
    { number: 'T6', name: 'Barista Counter Nook', capacity: 2, status: 'AVAILABLE', notes: 'Watch live coffee brewing' },
    { number: 'T7', name: 'Bonsai Terrace', capacity: 4, status: 'AVAILABLE', notes: 'Outdoor fresh air seating' },
    { number: 'T8', name: 'Writer\'s Desk', capacity: 2, status: 'AVAILABLE', notes: 'Quiet work table with power outlets' },
  ];

  for (const table of tablesData) {
    await prisma.cafeTable.upsert({
      where: { number: table.number },
      update: {},
      create: table,
    });
  }
  console.log('✓ Tables seeded');

  // 4. Categories
  const categoriesData = [
    { name: 'Tea', slug: 'tea', description: 'Freshly steeped traditional & artisanal leaf teas', displayOrder: 1, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80' },
    { name: 'Coffee', slug: 'coffee', description: 'Handcrafted espresso beverages and rich brews', displayOrder: 2, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cold Coffee', slug: 'cold-coffee', description: 'Silky chilled brews, frappés, and iced lattes', displayOrder: 3, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80' },
    { name: 'Iced Beverages', slug: 'iced-beverages', description: 'Chilled berry coolers, mint fizzes, and lemonades', displayOrder: 4, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' },
    { name: 'Special Drinks', slug: 'special-drinks', description: 'Exclusive house creations and comforting elixirs', displayOrder: 5, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80' },
    { name: 'Snacks', slug: 'snacks', description: 'Artisan toasts, warm croissants, and gourmet bites', displayOrder: 6, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
    { name: 'Desserts', slug: 'desserts', description: 'Indulgent cheesecakes, warm pastries, and sweets', displayOrder: 7, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80' },
    { name: 'Combos and Special Offers', slug: 'combos', description: 'Curated pairings of tea, coffee, and gourmet snacks', displayOrder: 8, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log('✓ Categories seeded');

  // 5. Products (Must include exact required initial items)
  // 1. Black Tea — ₹30
  // 2. Milk Tea — ₹50
  // 3. Ginger Tea — ₹55
  // 4. Masala Tea — ₹60
  // 5. Green Tea — ₹60
  // 6. Cappuccino — ₹100
  const productsData = [
    {
      name: 'Black Tea',
      slug: 'black-tea',
      description: 'Single-estate Assam black leaf tea steeped to amber perfection with a robust, brisk aroma.',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('tea')!,
      basePrice: 30,
      isVeg: true,
      isBestseller: false,
      isNew: false,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 5,
      displayOrder: 1,
      customizations: [
        {
          name: 'Sugar Level',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Normal Sugar', priceModifier: 0, isDefault: true },
            { name: 'No Sugar', priceModifier: 0 },
            { name: 'Less Sugar', priceModifier: 0 },
            { name: 'Extra Sugar', priceModifier: 0 },
          ],
        },
        {
          name: 'Cup Size',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Regular (150ml)', priceModifier: 0, isDefault: true },
            { name: 'Large Mug (250ml)', priceModifier: 15 },
          ],
        },
        {
          name: 'Flavour Infusion',
          type: 'MULTIPLE',
          required: false,
          maxSelections: 2,
          options: [
            { name: 'Fresh Lemon Slice', priceModifier: 5 },
            { name: 'Mint Leaves', priceModifier: 5 },
            { name: 'Organic Honey Dip', priceModifier: 10 },
          ],
        },
      ],
    },
    {
      name: 'Milk Tea',
      slug: 'milk-tea',
      description: 'Homestyle slow-simmered tea brewed with farm-fresh milk and golden jaggery or sugar.',
      image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('tea')!,
      basePrice: 50,
      isVeg: true,
      isBestseller: true,
      isNew: false,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 7,
      displayOrder: 2,
      customizations: [
        {
          name: 'Sugar Level',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Normal Sugar', priceModifier: 0, isDefault: true },
            { name: 'No Sugar', priceModifier: 0 },
            { name: 'Less Sugar', priceModifier: 0 },
            { name: 'Extra Sugar', priceModifier: 0 },
          ],
        },
        {
          name: 'Milk Choice',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Fresh Whole Dairy Milk', priceModifier: 0, isDefault: true },
            { name: 'Oat Milk (Dairy-Free)', priceModifier: 25 },
            { name: 'Almond Milk', priceModifier: 30 },
          ],
        },
        {
          name: 'Serving Size',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Kulhad Clay Cup (150ml)', priceModifier: 0, isDefault: true },
            { name: 'Large Ceramic Mug (250ml)', priceModifier: 20 },
          ],
        },
      ],
    },
    {
      name: 'Ginger Tea',
      slug: 'ginger-tea',
      description: 'Hand-crushed fresh ginger root boiled with strong Assam tea leaves and milk for comforting warmth.',
      image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('tea')!,
      basePrice: 55,
      isVeg: true,
      isBestseller: true,
      isNew: false,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 7,
      displayOrder: 3,
      customizations: [
        {
          name: 'Sugar Level',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Normal Sugar', priceModifier: 0, isDefault: true },
            { name: 'No Sugar', priceModifier: 0 },
            { name: 'Less Sugar', priceModifier: 0 },
            { name: 'Extra Sugar', priceModifier: 0 },
          ],
        },
        {
          name: 'Ginger Intensity',
          type: 'SINGLE',
          required: false,
          options: [
            { name: 'Standard Ginger Kick', priceModifier: 0, isDefault: true },
            { name: 'Extra Strong Ginger Punch', priceModifier: 5 },
          ],
        },
        {
          name: 'Milk Choice',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Dairy Milk', priceModifier: 0, isDefault: true },
            { name: 'Oat Milk', priceModifier: 25 },
          ],
        },
      ],
    },
    {
      name: 'Masala Tea',
      slug: 'masala-tea',
      description: 'Signature spiced blend of green cardamom, cloves, cinnamon, black pepper, and crushed ginger.',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('tea')!,
      basePrice: 60,
      isVeg: true,
      isBestseller: true,
      isNew: false,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 8,
      displayOrder: 4,
      customizations: [
        {
          name: 'Sugar Level',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Normal Sugar', priceModifier: 0, isDefault: true },
            { name: 'No Sugar', priceModifier: 0 },
            { name: 'Less Sugar', priceModifier: 0 },
            { name: 'Extra Sugar', priceModifier: 0 },
          ],
        },
        {
          name: 'Cup Size',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Regular Kulhad', priceModifier: 0, isDefault: true },
            { name: 'Grand Cup (+₹20)', priceModifier: 20 },
          ],
        },
        {
          name: 'Milk Choice',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Creamy Dairy Milk', priceModifier: 0, isDefault: true },
            { name: 'Oat Milk', priceModifier: 25 },
          ],
        },
      ],
    },
    {
      name: 'Green Tea',
      slug: 'green-tea',
      description: 'Delicate high-grown Himalayan whole green tea leaves with crisp floral notes and antioxidants.',
      image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('tea')!,
      basePrice: 60,
      isVeg: true,
      isBestseller: false,
      isNew: false,
      isRecommended: false,
      isAvailable: true,
      preparationTimeMinutes: 5,
      displayOrder: 5,
      customizations: [
        {
          name: 'Infusion Choice',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Pure Himalayan Leaves', priceModifier: 0, isDefault: true },
            { name: 'Lemon & Honey Infusion', priceModifier: 15 },
            { name: 'Mint Jasmine Infusion', priceModifier: 15 },
          ],
        },
        {
          name: 'Sweetener',
          type: 'SINGLE',
          required: false,
          options: [
            { name: 'No Sweetener', priceModifier: 0, isDefault: true },
            { name: 'Organic Honey Spoon', priceModifier: 10 },
          ],
        },
      ],
    },
    {
      name: 'Cappuccino',
      slug: 'cappuccino',
      description: 'Double shot of artisan roasted Arabica espresso balanced with velvety steamed milk and dense foam.',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('coffee')!,
      basePrice: 100,
      discountedPrice: null,
      isVeg: true,
      isBestseller: true,
      isNew: false,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 8,
      displayOrder: 6,
      customizations: [
        {
          name: 'Size',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Regular (240ml)', priceModifier: 0, isDefault: true },
            { name: 'Large (350ml)', priceModifier: 30 },
          ],
        },
        {
          name: 'Milk Preference',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Full Cream Milk', priceModifier: 0, isDefault: true },
            { name: 'Skimmed Milk', priceModifier: 0 },
            { name: 'Oat Milk (Barista Edition)', priceModifier: 35 },
            { name: 'Almond Milk', priceModifier: 40 },
          ],
        },
        {
          name: 'Espresso Shots',
          type: 'SINGLE',
          required: false,
          options: [
            { name: 'Standard (Double Shot)', priceModifier: 0, isDefault: true },
            { name: 'Extra Shot (+₹40)', priceModifier: 40 },
          ],
        },
        {
          name: 'Flavour & Toppings',
          type: 'MULTIPLE',
          required: false,
          maxSelections: 3,
          options: [
            { name: 'Cinnamon Dust', priceModifier: 0 },
            { name: 'Dark Cocoa Powder', priceModifier: 0 },
            { name: 'Madagascar Vanilla Syrup', priceModifier: 25 },
            { name: 'Caramel Drizzle', priceModifier: 25 },
            { name: 'Whipped Cream', priceModifier: 30 },
          ],
        },
      ],
    },
    {
      name: 'Signature Cold Brew',
      slug: 'signature-cold-brew',
      description: 'Slow-steeped for 18 hours in cold filtered mountain water. Ultra-smooth with zero bitterness.',
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('cold-coffee')!,
      basePrice: 130,
      isVeg: true,
      isBestseller: true,
      isNew: true,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 4,
      displayOrder: 7,
      customizations: [
        {
          name: 'Style',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Straight Black on Ice', priceModifier: 0, isDefault: true },
            { name: 'With Vanilla Sweet Cream', priceModifier: 30 },
            { name: 'Salted Caramel Cold Foam', priceModifier: 40 },
          ],
        },
      ],
    },
    {
      name: 'Iced Caramel Macchiato',
      slug: 'iced-caramel-macchiato',
      description: 'Chilled milk marked with rich espresso shots, finished with buttery house-made caramel drizzle.',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('cold-coffee')!,
      basePrice: 140,
      isVeg: true,
      isBestseller: true,
      isNew: false,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 6,
      displayOrder: 8,
      customizations: [
        {
          name: 'Size',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Regular (350ml)', priceModifier: 0, isDefault: true },
            { name: 'Large (500ml)', priceModifier: 35 },
          ],
        },
        {
          name: 'Milk Choice',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Full Cream Milk', priceModifier: 0, isDefault: true },
            { name: 'Oat Milk', priceModifier: 35 },
          ],
        },
      ],
    },
    {
      name: 'Wild Berry Hibiscus Cooler',
      slug: 'wild-berry-hibiscus-cooler',
      description: 'Brewed Egyptian ruby hibiscus tea infused with fresh crushed berries, mint, and sparkling soda.',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('iced-beverages')!,
      basePrice: 110,
      isVeg: true,
      isBestseller: false,
      isNew: true,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 5,
      displayOrder: 9,
      customizations: [
        {
          name: 'Sweetness',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Balanced', priceModifier: 0, isDefault: true },
            { name: 'Extra Tart / Less Sweet', priceModifier: 0 },
          ],
        },
      ],
    },
    {
      name: 'Aftab Royal Saffron Kahwa',
      slug: 'aftab-royal-saffron-kahwa',
      description: 'Kashmiri green tea infused with pure saffron strands, crushed cinnamon, green cardamom, and slivered almonds.',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('special-drinks')!,
      basePrice: 120,
      isVeg: true,
      isBestseller: true,
      isNew: false,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 8,
      displayOrder: 10,
      customizations: [
        {
          name: 'Honey Level',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Pure Honey Infused', priceModifier: 0, isDefault: true },
            { name: 'Light Honey', priceModifier: 0 },
            { name: 'No Honey', priceModifier: 0 },
          ],
        },
      ],
    },
    {
      name: 'Artisan Paneer Tikka Croissant',
      slug: 'artisan-paneer-croissant',
      description: 'Buttery flaky French croissant stuffed with smoked tandoori cottage cheese cubes, mint chutney, and mozzarella.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('snacks')!,
      basePrice: 140,
      isVeg: true,
      isBestseller: true,
      isNew: true,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 10,
      displayOrder: 11,
      customizations: [
        {
          name: 'Preparation Style',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Warm & Toasted', priceModifier: 0, isDefault: true },
            { name: 'Extra Crispy Grilled', priceModifier: 0 },
          ],
        },
        {
          name: 'Dip Extras',
          type: 'MULTIPLE',
          required: false,
          options: [
            { name: 'Spicy Garlic Mayo Dip', priceModifier: 20 },
            { name: 'Mint Herb Chutney', priceModifier: 15 },
          ],
        },
      ],
    },
    {
      name: 'Belgium Dark Chocolate Pastry',
      slug: 'belgium-dark-chocolate-pastry',
      description: 'Layers of moist dark chocolate sponge and rich 70% Belgian chocolate ganache.',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('desserts')!,
      basePrice: 130,
      isVeg: true,
      isBestseller: true,
      isNew: false,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 3,
      displayOrder: 12,
      customizations: [
        {
          name: 'Serving Option',
          type: 'SINGLE',
          required: false,
          options: [
            { name: 'Chilled', priceModifier: 0, isDefault: true },
            { name: 'Warm with Molten Center', priceModifier: 0 },
            { name: 'Add Vanilla Ice Cream Scoop', priceModifier: 40 },
          ],
        },
      ],
    },
    {
      name: 'Chai & Gourmet Samosa Combo',
      slug: 'chai-samosa-combo',
      description: '2 Cups of hot Masala or Ginger Tea served with 2 crispy artisanal spiced potato & pea samosas and chutneys.',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryMap.get('combos')!,
      basePrice: 140,
      discountedPrice: 120,
      isVeg: true,
      isBestseller: true,
      isNew: false,
      isRecommended: true,
      isAvailable: true,
      preparationTimeMinutes: 10,
      displayOrder: 13,
      customizations: [
        {
          name: 'Tea Selection',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Masala Tea', priceModifier: 0, isDefault: true },
            { name: 'Ginger Tea', priceModifier: 0 },
            { name: 'Milk Tea', priceModifier: 0 },
          ],
        },
        {
          name: 'Sugar Level',
          type: 'SINGLE',
          required: true,
          options: [
            { name: 'Normal Sugar', priceModifier: 0, isDefault: true },
            { name: 'Less Sugar', priceModifier: 0 },
            { name: 'No Sugar', priceModifier: 0 },
          ],
        },
      ],
    },
  ];

  for (const item of productsData) {
    const { customizations, ...productFields } = item;
    const product = await prisma.product.upsert({
      where: { slug: productFields.slug },
      update: productFields,
      create: productFields,
    });

    if (customizations && customizations.length > 0) {
      // Clear existing customization groups for idempotency
      await prisma.customizationGroup.deleteMany({
        where: { productId: product.id },
      });

      for (let i = 0; i < customizations.length; i++) {
        const groupData = customizations[i];
        const group = await prisma.customizationGroup.create({
          data: {
            productId: product.id,
            name: groupData.name,
            type: groupData.type,
            required: groupData.required,
            maxSelections: groupData.maxSelections || 1,
            displayOrder: i,
          },
        });

        for (let j = 0; j < groupData.options.length; j++) {
          const opt = groupData.options[j];
          await prisma.customizationOption.create({
            data: {
              groupId: group.id,
              name: opt.name,
              priceModifier: opt.priceModifier,
              isDefault: opt.isDefault || false,
              displayOrder: j,
            },
          });
        }
      }
    }
  }
  console.log('✓ Products & Customizations seeded');

  // 6. Coupons
  const couponsData = [
    {
      code: 'SUNSHINE10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 100,
      maxDiscount: 50,
      isActive: true,
    },
    {
      code: 'AFTAB50',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderAmount: 200,
      isActive: true,
    },
    {
      code: 'WELCOME15',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderAmount: 150,
      maxDiscount: 100,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  console.log('✓ Coupons seeded');

  // 7. Gallery Images
  const galleryData = [
    {
      title: 'Heritage Sunlit Archway',
      category: 'Cafe Interior',
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80',
      caption: 'Warm amber tones and morning sunbeams at Table 1 and 2.',
      displayOrder: 1,
    },
    {
      title: 'Artisan Barista Counter',
      category: 'Cafe Interior',
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80',
      caption: 'Where our baristas handcraft every pour-over and espresso.',
      displayOrder: 2,
    },
    {
      title: 'Steaming Royal Kulhad Chai',
      category: 'Coffee and Tea',
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80',
      caption: 'Slow-simmered Assam leaf tea served in earthen clay cups.',
      displayOrder: 3,
    },
    {
      title: 'Cappuccino Latte Art',
      category: 'Coffee and Tea',
      imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80',
      caption: 'Silky micro-foam with rising-sun rosette art.',
      displayOrder: 4,
    },
    {
      title: 'Freshly Baked Croissant & Tarts',
      category: 'Food and Snacks',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
      caption: 'Golden crispy pastries baked fresh in-house every sunrise.',
      displayOrder: 5,
    },
    {
      title: 'Evening Acoustic Jazz Session',
      category: 'Events',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
      caption: 'Live musical evenings under golden fairy lights.',
      displayOrder: 6,
    },
    {
      title: 'Laughter & Conversations',
      category: 'Customer Moments',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
      caption: 'Friends bonding over coffee and warmth at THE AFTAB.',
      displayOrder: 7,
    },
  ];

  await prisma.galleryImage.deleteMany();
  for (const img of galleryData) {
    await prisma.galleryImage.create({ data: img });
  }
  console.log('✓ Gallery seeded');

  // 8. Customer Reviews
  const reviewsData = [
    {
      customerName: 'Ananya Deshmukh',
      rating: 5,
      reviewText: 'The Masala Chai and Paneer Tikka Croissant at THE AFTAB are truly world-class! The ambience has such a warm, golden glow. My favourite spot to work and relax.',
      isApproved: true,
      isFeatured: true,
    },
    {
      customerName: 'Vikramaditya Roy',
      rating: 5,
      reviewText: 'Proper artisan Cappuccino in Delhi! The coffee bean roast is balanced, velvety, and brewed to perfection. Also loved ordering directly from our table on the phone.',
      isApproved: true,
      isFeatured: true,
    },
    {
      customerName: 'Meera & Siddharth',
      rating: 5,
      reviewText: 'We booked Table 1 for our anniversary evening. The staff greeted us with warm smiles, the Royal Saffron Kahwa was divine, and the live jazz music was magical.',
      isApproved: true,
      isFeatured: true,
    },
    {
      customerName: 'Dr. Sameer Kapoor',
      rating: 5,
      reviewText: 'Outstanding hospitality, prompt service, and impeccable cleanliness. The ginger tea is medicine for the soul!',
      isApproved: true,
      isFeatured: false,
    },
  ];

  await prisma.customerReview.deleteMany();
  for (const rev of reviewsData) {
    await prisma.customerReview.create({ data: rev });
  }
  console.log('✓ Reviews seeded');

  // 9. Inventory Ingredients
  const ingredientsData = [
    { name: 'Assam Tea Leaves (Special Reserve)', unit: 'kg', currentStock: 25.0, minStockAlert: 5.0, unitCost: 450, supplier: 'Assam Valley Estates' },
    { name: 'Arabica Coffee Beans (Dark Roast)', unit: 'kg', currentStock: 18.5, minStockAlert: 4.0, unitCost: 950, supplier: 'Chikmagalur Plantation' },
    { name: 'Fresh Whole Dairy Milk', unit: 'liters', currentStock: 45.0, minStockAlert: 10.0, unitCost: 65, supplier: 'Green Valley Organic Dairy' },
    { name: 'Barista Oat Milk', unit: 'liters', currentStock: 12.0, minStockAlert: 4.0, unitCost: 220, supplier: 'Oat Goodness Co.' },
    { name: 'Fresh Raw Ginger Root', unit: 'kg', currentStock: 8.0, minStockAlert: 2.0, unitCost: 90, supplier: 'Local Farmer Market' },
    { name: 'Whole Cardamom & Spices', unit: 'kg', currentStock: 3.5, minStockAlert: 1.0, unitCost: 1800, supplier: 'Kerala Spice Merchants' },
    { name: 'Kashmiri Mogra Saffron', unit: 'grams', currentStock: 50.0, minStockAlert: 10.0, unitCost: 240, supplier: 'Pampore Saffron Guild' },
    { name: 'Belgian Chocolate Callets 70%', unit: 'kg', currentStock: 9.0, minStockAlert: 3.0, unitCost: 1100, supplier: 'Gourmet Chocolatier' },
    { name: 'Butter Croissants (Unbaked)', unit: 'pieces', currentStock: 40.0, minStockAlert: 15.0, unitCost: 45, supplier: 'Artisan Bakery Hub' },
  ];

  for (const ing of ingredientsData) {
    await prisma.inventoryIngredient.upsert({
      where: { name: ing.name },
      update: ing,
      create: ing,
    });
  }
  console.log('✓ Inventory seeded');

  console.log('🎉 Seeding successfully completed for THE AFTAB!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
