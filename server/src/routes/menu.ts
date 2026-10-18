import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest, logAudit } from '../middleware/auth';

const router = Router();

// ================= CATEGORIES =================

// Public list of categories
router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isAvailable: true } } },
        },
      },
    });
    return res.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// Admin list of all categories (including inactive)
router.get('/admin/categories', authenticateToken, requireRole('MANAGER'), async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch admin categories.' });
  }
});

// Admin create category
router.post('/admin/categories', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { name, slug, description, image, displayOrder, active } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug: generatedSlug,
        description,
        image,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    await logAudit('CATEGORY_CREATE', `Created category: ${name}`, req);
    return res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name or slug already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create category.' });
  }
});

// Admin update category
router.put('/admin/categories/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, displayOrder, active } = req.body;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    await logAudit('CATEGORY_UPDATE', `Updated category: ${updated.name}`, req);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update category.' });
  }
});

// Admin delete category
router.delete('/admin/categories/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.delete({
      where: { id },
    });

    await logAudit('CATEGORY_DELETE', `Deleted category: ${category.name}`, req);
    return res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete category.' });
  }
});

// ================= PRODUCTS =================

// Public list of products
router.get('/products', async (req, res) => {
  try {
    const { category, search, veg, bestseller } = req.query;

    const where: any = { isAvailable: true };

    if (category) {
      where.category = { slug: String(category) };
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    if (veg === 'true') {
      where.isVeg = true;
    }

    if (bestseller === 'true') {
      where.isBestseller = true;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        customizationGroups: {
          orderBy: { displayOrder: 'asc' },
          include: {
            options: {
              where: { isAvailable: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    return res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// Admin list of all products (including sold out)
router.get('/admin/products', authenticateToken, requireRole('MANAGER'), async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ category: { displayOrder: 'asc' } }, { displayOrder: 'asc' }],
      include: {
        category: true,
        customizationGroups: {
          include: { options: true },
        },
      },
    });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch admin products.' });
  }
});

// Get single product by id or slug
router.get('/products/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: true,
        customizationGroups: {
          orderBy: { displayOrder: 'asc' },
          include: {
            options: {
              where: { isAvailable: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch product details.' });
  }
});

// Admin create product
router.post('/admin/products', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      categoryId,
      basePrice,
      discountedPrice,
      isVeg,
      isBestseller,
      isNew,
      isRecommended,
      isAvailable,
      preparationTimeMinutes,
      displayOrder,
      customizations,
    } = req.body;

    if (!name || !categoryId || basePrice === undefined) {
      return res.status(400).json({ error: 'Name, category, and base price are required.' });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
        categoryId,
        basePrice: parseFloat(basePrice),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
        isBestseller: Boolean(isBestseller),
        isNew: Boolean(isNew),
        isRecommended: Boolean(isRecommended),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        preparationTimeMinutes: preparationTimeMinutes ? parseInt(preparationTimeMinutes) : 10,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
    });

    // Add customizations if provided
    if (customizations && Array.isArray(customizations)) {
      for (let i = 0; i < customizations.length; i++) {
        const groupData = customizations[i];
        const group = await prisma.customizationGroup.create({
          data: {
            productId: product.id,
            name: groupData.name,
            type: groupData.type || 'SINGLE',
            required: Boolean(groupData.required),
            maxSelections: groupData.maxSelections || 1,
            displayOrder: i,
          },
        });

        if (groupData.options && Array.isArray(groupData.options)) {
          for (let j = 0; j < groupData.options.length; j++) {
            const opt = groupData.options[j];
            await prisma.customizationOption.create({
              data: {
                groupId: group.id,
                name: opt.name,
                priceModifier: parseFloat(opt.priceModifier) || 0,
                isDefault: Boolean(opt.isDefault),
                isAvailable: opt.isAvailable !== undefined ? Boolean(opt.isAvailable) : true,
                displayOrder: j,
              },
            });
          }
        }
      }
    }

    await logAudit('PRODUCT_CREATE', `Created product: ${name} (₹${basePrice})`, req);

    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, customizationGroups: { include: { options: true } } },
    });

    return res.status(201).json(fullProduct);
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Product name or slug already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create product.' });
  }
});

// Admin update product
router.put('/admin/products/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      image,
      categoryId,
      basePrice,
      discountedPrice,
      isVeg,
      isBestseller,
      isNew,
      isRecommended,
      isAvailable,
      preparationTimeMinutes,
      displayOrder,
      customizations,
    } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        categoryId,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
        discountedPrice: discountedPrice !== undefined ? (discountedPrice ? parseFloat(discountedPrice) : null) : undefined,
        isVeg: isVeg !== undefined ? Boolean(isVeg) : undefined,
        isBestseller: isBestseller !== undefined ? Boolean(isBestseller) : undefined,
        isNew: isNew !== undefined ? Boolean(isNew) : undefined,
        isRecommended: isRecommended !== undefined ? Boolean(isRecommended) : undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
        preparationTimeMinutes: preparationTimeMinutes !== undefined ? parseInt(preparationTimeMinutes) : undefined,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
      },
    });

    // If customizations were explicitly provided, replace them
    if (customizations && Array.isArray(customizations)) {
      await prisma.customizationGroup.deleteMany({ where: { productId: id } });

      for (let i = 0; i < customizations.length; i++) {
        const groupData = customizations[i];
        const group = await prisma.customizationGroup.create({
          data: {
            productId: id,
            name: groupData.name,
            type: groupData.type || 'SINGLE',
            required: Boolean(groupData.required),
            maxSelections: groupData.maxSelections || 1,
            displayOrder: i,
          },
        });

        if (groupData.options && Array.isArray(groupData.options)) {
          for (let j = 0; j < groupData.options.length; j++) {
            const opt = groupData.options[j];
            await prisma.customizationOption.create({
              data: {
                groupId: group.id,
                name: opt.name,
                priceModifier: parseFloat(opt.priceModifier) || 0,
                isDefault: Boolean(opt.isDefault),
                isAvailable: opt.isAvailable !== undefined ? Boolean(opt.isAvailable) : true,
                displayOrder: j,
              },
            });
          }
        }
      }
    }

    await logAudit('PRODUCT_UPDATE', `Updated product: ${updated.name} (₹${updated.basePrice})`, req);

    const fullProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true, customizationGroups: { include: { options: true } } },
    });

    return res.json(fullProduct);
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ error: 'Failed to update product.' });
  }
});

// Admin toggle product availability (Sold Out vs Available)
router.patch('/admin/products/:id/availability', authenticateToken, requireRole('BARISTA', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { isAvailable: Boolean(isAvailable) },
    });

    await logAudit('PRODUCT_AVAILABILITY', `Toggled ${product.name} to ${isAvailable ? 'AVAILABLE' : 'SOLD_OUT'}`, req);
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update product availability.' });
  }
});

// Admin delete product
router.delete('/admin/products/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.delete({ where: { id } });

    await logAudit('PRODUCT_DELETE', `Deleted product: ${product.name}`, req);
    return res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

export default router;
