import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest, logAudit } from '../middleware/auth';

const router = Router();

// Get all inventory ingredients
router.get('/', authenticateToken, requireRole('BARISTA', 'MANAGER'), async (_req, res) => {
  try {
    const ingredients = await prisma.inventoryIngredient.findMany({
      orderBy: { name: 'asc' },
      include: {
        movements: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const enhanced = ingredients.map((ing) => ({
      ...ing,
      isLowStock: ing.currentStock <= ing.minStockAlert,
    }));

    return res.json(enhanced);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch inventory.' });
  }
});

// Create new ingredient
router.post('/', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { name, unit, currentStock, minStockAlert, unitCost, supplier } = req.body;
    if (!name || !unit) {
      return res.status(400).json({ error: 'Ingredient name and unit are required.' });
    }

    const ingredient = await prisma.inventoryIngredient.create({
      data: {
        name: name.trim(),
        unit: unit.trim(),
        currentStock: parseFloat(currentStock) || 0,
        minStockAlert: parseFloat(minStockAlert) || 5,
        unitCost: parseFloat(unitCost) || 0,
        supplier,
      },
    });

    await logAudit('INVENTORY_CREATE', `Added ingredient: ${ingredient.name}`, req);
    return res.status(201).json(ingredient);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'An ingredient with this name already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create ingredient.' });
  }
});

// Adjust stock (Add stock, wastage, physical recount)
router.post('/:id/adjust', authenticateToken, requireRole('BARISTA', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { movementType, quantity, notes } = req.body;

    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty === 0) {
      return res.status(400).json({ error: 'Valid non-zero quantity is required.' });
    }

    const ingredient = await prisma.inventoryIngredient.findUnique({ where: { id } });
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found.' });
    }

    // Calculate new stock
    let updatedStock = ingredient.currentStock;
    if (['PURCHASE', 'ADJUSTMENT'].includes(movementType) && numQty > 0) {
      updatedStock += numQty;
    } else if (['USAGE', 'WASTAGE'].includes(movementType) || numQty < 0) {
      updatedStock = Math.max(0, updatedStock - Math.abs(numQty));
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ing = await tx.inventoryIngredient.update({
        where: { id },
        data: { currentStock: updatedStock },
      });

      await tx.stockMovement.create({
        data: {
          ingredientId: id,
          movementType: movementType || 'ADJUSTMENT',
          quantity: numQty,
          notes: notes || null,
          createdBy: req.user?.name || req.user?.email || 'Staff',
        },
      });

      return ing;
    });

    await logAudit(
      'STOCK_ADJUSTMENT',
      `Adjusted ${updated.name} by ${numQty} ${updated.unit}. New stock: ${updated.currentStock}`,
      req
    );

    return res.json({
      message: 'Stock updated successfully.',
      ingredient: {
        ...updated,
        isLowStock: updated.currentStock <= updated.minStockAlert,
      },
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    return res.status(500).json({ error: 'Failed to adjust stock.' });
  }
});

export default router;
