import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateToken, AuthRequest, logAudit } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'the_aftab_super_secret_jwt_key_2026_cafe_management';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Login
router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Valid email and password are required.' });
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid credentials or account is disabled.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAudit('LOGIN', `User ${user.email} logged in successfully`, {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ip: req.ip,
      socket: req.socket,
    } as any);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred during login.' });
  }
});

// Current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});

// Setup Initial Admin (if database has 0 admin users)
router.post('/setup-admin', async (req, res) => {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' },
    });

    if (adminCount > 0) {
      return res.status(400).json({ error: 'Super Admin already initialized.' });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Name, email, and password (min 6 chars) are required.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'SUPER_ADMIN',
        active: true,
      },
    });

    const token = jwt.sign(
      { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Super Admin initialized successfully.',
      token,
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    console.error('Setup admin error:', err);
    return res.status(500).json({ error: 'Failed to initialize administrator.' });
  }
});

export default router;
