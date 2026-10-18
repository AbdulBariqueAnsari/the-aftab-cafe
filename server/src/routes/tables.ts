import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest, logAudit } from '../middleware/auth';
import { notifyTableUpdated } from '../socket';

const router = Router();

// Public list of active tables (for customer table selection at checkout)
router.get('/', async (_req, res) => {
  try {
    const tables = await prisma.cafeTable.findMany({
      where: { active: true },
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        name: true,
        capacity: true,
        status: true,
      },
    });
    return res.json(tables);
  } catch (error) {
    console.error('Fetch tables error:', error);
    return res.status(500).json({ error: 'Failed to fetch tables.' });
  }
});

// Admin list of tables with active orders and running bill
router.get('/admin', authenticateToken, requireRole('SERVICE_STAFF', 'CASHIER', 'MANAGER'), async (_req, res) => {
  try {
    const tables = await prisma.cafeTable.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: {
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
          include: {
            items: {
              include: { customizations: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Compute running total per table
    const enhancedTables = tables.map((t) => {
      const activeTotal = t.orders.reduce((sum, ord) => sum + ord.grandTotal, 0);
      return {
        ...t,
        activeOrdersCount: t.orders.length,
        currentBillTotal: activeTotal,
      };
    });

    return res.json(enhancedTables);
  } catch (error) {
    console.error('Admin tables error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin tables.' });
  }
});

// Admin create table
router.post('/admin', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { number, name, capacity, status, notes } = req.body;
    if (!number || !name) {
      return res.status(400).json({ error: 'Table number and name are required.' });
    }

    const table = await prisma.cafeTable.create({
      data: {
        number: String(number).trim().toUpperCase(),
        name,
        capacity: capacity ? parseInt(capacity) : 2,
        status: status || 'AVAILABLE',
        notes,
        active: true,
      },
    });

    notifyTableUpdated(table);
    await logAudit('TABLE_CREATE', `Created table ${table.number} (${table.name})`, req);
    return res.status(201).json(table);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Table number already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create table.' });
  }
});

// Admin update table
router.put('/admin/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { number, name, capacity, status, notes, active } = req.body;

    const table = await prisma.cafeTable.update({
      where: { id },
      data: {
        number: number !== undefined ? String(number).trim().toUpperCase() : undefined,
        name,
        capacity: capacity !== undefined ? parseInt(capacity) : undefined,
        status,
        notes,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    notifyTableUpdated(table);
    await logAudit('TABLE_UPDATE', `Updated table ${table.number}`, req);
    return res.json(table);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update table.' });
  }
});

// Admin change table status (e.g. mark OCCUPIED or AVAILABLE)
router.patch('/admin/:id/status', authenticateToken, requireRole('SERVICE_STAFF', 'CASHIER', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_SERVICE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const table = await prisma.cafeTable.update({
      where: { id },
      data: { status },
    });

    notifyTableUpdated(table);
    await logAudit('TABLE_STATUS_CHANGE', `Changed table ${table.number} status to ${status}`, req);
    return res.json(table);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update table status.' });
  }
});

// Admin settle table bill & complete all active orders on this table
router.post('/admin/:id/settle', authenticateToken, requireRole('CASHIER', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Complete all active orders for this table
    await prisma.order.updateMany({
      where: {
        tableId: id,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
      data: {
        status: 'COMPLETED',
        paymentStatus: 'PAID',
      },
    });

    // Mark table as AVAILABLE
    const table = await prisma.cafeTable.update({
      where: { id },
      data: { status: 'AVAILABLE' },
    });

    notifyTableUpdated(table);
    await logAudit('TABLE_SETTLED', `Settled bill and cleared table ${table.number}`, req);

    return res.json({ message: `Table ${table.number} bill settled and status reset to Available.` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to settle table bill.' });
  }
});

// Admin delete table
router.delete('/admin/:id', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const table = await prisma.cafeTable.delete({ where: { id } });

    await logAudit('TABLE_DELETE', `Deleted table ${table.number}`, req);
    return res.json({ message: 'Table deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete table.' });
  }
});

export default router;
