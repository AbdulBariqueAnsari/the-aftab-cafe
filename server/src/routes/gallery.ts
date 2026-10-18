import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest, logAudit } from '../middleware/auth';

const router = Router();

// Public gallery images
router.get('/', async (_req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return res.json(images);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch gallery images.' });
  }
});

// Admin get all gallery images
router.get('/admin', authenticateToken, requireRole('MANAGER'), async (_req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return res.json(images);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch admin gallery.' });
  }
});

// Admin add image
router.post('/admin', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { title, category, imageUrl, caption, displayOrder } = req.body;
    if (!title || !category || !imageUrl) {
      return res.status(400).json({ error: 'Title, category, and image URL are required.' });
    }

    const item = await prisma.galleryImage.create({
      data: {
        title,
        category,
        imageUrl,
        caption,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isActive: true,
      },
    });

    await logAudit('GALLERY_ADD', `Added gallery image: ${title}`, req);
    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add gallery image.' });
  }
});

// Admin update image
router.put('/admin/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, category, imageUrl, caption, displayOrder, isActive } = req.body;

    const item = await prisma.galleryImage.update({
      where: { id },
      data: {
        title,
        category,
        imageUrl,
        caption,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await logAudit('GALLERY_UPDATE', `Updated gallery image: ${item.title}`, req);
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update gallery image.' });
  }
});

// Admin delete image
router.delete('/admin/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.galleryImage.delete({ where: { id } });

    await logAudit('GALLERY_DELETE', `Deleted gallery image: ${item.title}`, req);
    return res.json({ message: 'Image deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete gallery image.' });
  }
});

export default router;
