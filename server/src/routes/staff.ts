import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest, logAudit } from '../middleware/auth';

const router = Router();

// List all staff members
router.get('/', authenticateToken, requireRole('SUPER_ADMIN', 'MANAGER'), async (_req, res) => {
  try {
    const staff = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(staff);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch staff list.' });
  }
});

// Add new staff member
router.post('/', authenticateToken, requireRole('SUPER_ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    const validRoles = ['SUPER_ADMIN', 'MANAGER', 'CASHIER', 'BARISTA', 'SERVICE_STAFF'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${validRoles.join(', ')}` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        phone: phone ? phone.trim() : null,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        active: true,
        createdAt: true,
      },
    });

    await logAudit('STAFF_CREATE', `Created staff account: ${user.name} (${user.role})`, req);
    return res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A staff member with this email already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create staff member.' });
  }
});

// Update staff status or role
router.put('/:id', authenticateToken, requireRole('SUPER_ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, active, password } = req.body;

    const data: any = {};
    if (name) data.name = name.trim();
    if (role) data.role = role;
    if (phone !== undefined) data.phone = phone ? phone.trim() : null;
    if (active !== undefined) data.active = Boolean(active);
    if (password && password.length >= 6) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        active: true,
      },
    });

    await logAudit('STAFF_UPDATE', `Updated staff account ${updated.email}`, req);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update staff member.' });
  }
});

// Audit logs view (Super Admin only)
router.get('/audit-logs', authenticateToken, requireRole('SUPER_ADMIN'), async (_req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

export default router;
