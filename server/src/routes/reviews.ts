import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest, logAudit } from '../middleware/auth';

const router = Router();

// Public list of approved reviews
router.get('/', async (_req, res) => {
  try {
    const reviews = await prisma.customerReview.findMany({
      where: { isApproved: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// Public submit review
router.post('/', async (req, res) => {
  try {
    const { customerName, rating, reviewText } = req.body;
    if (!customerName || !rating || !reviewText) {
      return res.status(400).json({ error: 'Name, rating, and review text are required.' });
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const review = await prisma.customerReview.create({
      data: {
        customerName: customerName.trim(),
        rating: numRating,
        reviewText: reviewText.trim(),
        isApproved: true, // auto-approve by default, owner can moderate
        isFeatured: false,
      },
    });

    return res.status(201).json({
      message: 'Thank you for your review! Your feedback warms our hearts.',
      review,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// Admin list all reviews
router.get('/admin', authenticateToken, requireRole('MANAGER'), async (_req, res) => {
  try {
    const reviews = await prisma.customerReview.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch admin reviews.' });
  }
});

// Admin moderate review (toggle approval / featured)
router.patch('/admin/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isApproved, isFeatured } = req.body;

    const review = await prisma.customerReview.update({
      where: { id },
      data: {
        isApproved: isApproved !== undefined ? Boolean(isApproved) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
      },
    });

    await logAudit('REVIEW_MODERATION', `Updated review moderation for review by ${review.customerName}`, req);
    return res.json(review);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update review status.' });
  }
});

// Admin delete review
router.delete('/admin/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.customerReview.delete({ where: { id } });

    await logAudit('REVIEW_DELETE', `Deleted review ID ${id}`, req);
    return res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete review.' });
  }
});

export default router;
