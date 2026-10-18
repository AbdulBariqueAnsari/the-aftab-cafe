import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest, logAudit } from '../middleware/auth';

const router = Router();

// Public active coupons (for homepage & offers page)
router.get('/public', async (_req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      select: {
        code: true,
        discountType: true,
        discountValue: true,
        minOrderAmount: true,
        maxDiscount: true,
      },
      take: 6,
    });
    return res.json(coupons);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
});

// Admin list all coupons
router.get('/', authenticateToken, requireRole('MANAGER'), async (_req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { redemptions: true } },
      },
    });
    return res.json(coupons);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch admin coupons.' });
  }
});

// Admin create coupon
router.post('/', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, validUntil, usageLimit } = req.body;
    if (!code || discountValue === undefined) {
      return res.status(400).json({ error: 'Code and discount value are required.' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: String(code).trim().toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        isActive: true,
      },
    });

    await logAudit('COUPON_CREATE', `Created coupon: ${coupon.code}`, req);
    return res.status(201).json(coupon);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A coupon with this code already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create coupon.' });
  }
});

// Admin toggle coupon active status
router.patch('/:id/toggle', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    await logAudit('COUPON_TOGGLE', `Toggled coupon ${coupon.code} to ${coupon.isActive}`, req);
    return res.json(coupon);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update coupon status.' });
  }
});

// Admin delete coupon
router.delete('/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const coupon = await prisma.coupon.delete({ where: { id } });

    await logAudit('COUPON_DELETE', `Deleted coupon ${coupon.code}`, req);
    return res.json({ message: 'Coupon deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete coupon.' });
  }
});

export default router;
