import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// ================= ADMIN DASHBOARD KPIS & STATS =================

router.get('/stats', authenticateToken, requireRole('MANAGER', 'CASHIER'), async (_req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfToday, lte: endOfToday },
      },
      include: {
        items: true,
      },
    });

    const nonCancelledToday = todayOrders.filter((o) => o.status !== 'CANCELLED');
    const todaySales = nonCancelledToday.reduce((sum, o) => sum + o.grandTotal, 0);
    const todayOrdersCount = todayOrders.length;
    const averageOrderValue = nonCancelledToday.length > 0 ? todaySales / nonCancelledToday.length : 0;

    // Status counts
    const pendingOrdersCount = todayOrders.filter((o) => ['ORDER_RECEIVED', 'ORDER_ACCEPTED'].includes(o.status)).length;
    const preparingOrdersCount = todayOrders.filter((o) => o.status === 'PREPARING').length;
    const readyOrdersCount = todayOrders.filter((o) => o.status === 'READY_TO_SERVE').length;
    const completedOrdersCount = todayOrders.filter((o) => o.status === 'COMPLETED').length;

    // Table occupancy
    const totalTables = await prisma.cafeTable.count({ where: { active: true } });
    const occupiedTables = await prisma.cafeTable.count({
      where: { active: true, status: 'OCCUPIED' },
    });
    const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

    // Top selling products (all time or last 30 days)
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { status: { not: 'CANCELLED' } },
      },
    });

    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const item of orderItems) {
      const existing = productSalesMap.get(item.productName) || {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.subtotal;
      productSalesMap.set(item.productName, existing);
    }

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Hourly orders for today (0 to 23)
    const hourlyCounts = Array(24).fill(0);
    for (const o of nonCancelledToday) {
      const hr = new Date(o.createdAt).getHours();
      hourlyCounts[hr]++;
    }

    return res.json({
      todaySales: Math.round(todaySales * 100) / 100,
      todayOrdersCount,
      pendingOrdersCount,
      preparingOrdersCount,
      readyOrdersCount,
      completedOrdersCount,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      occupancyRate,
      occupiedTables,
      totalTables,
      topProducts,
      hourlyCounts,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Failed to calculate stats.' });
  }
});

// ================= DETAILED REPORTS & ANALYTICS =================

router.get('/analytics', authenticateToken, requireRole('MANAGER'), async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;

    let start = new Date();
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    if (range === 'yesterday') {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'last7') {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'last30') {
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'custom' && startDate && endDate) {
      start = new Date(String(startDate));
      start.setHours(0, 0, 0, 0);
      end = new Date(String(endDate));
      end.setHours(23, 59, 59, 999);
    } else {
      // default today
      start.setHours(0, 0, 0, 0);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

    const grossSales = validOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalDiscounts = validOrders.reduce((sum, o) => sum + o.discount, 0);
    const totalTaxes = validOrders.reduce((sum, o) => sum + o.taxAmount, 0);
    const totalServiceCharges = validOrders.reduce((sum, o) => sum + o.serviceCharge, 0);
    const netRevenue = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    // Payment methods breakdown
    const paymentBreakdown: Record<string, { count: number; total: number }> = {};
    for (const o of validOrders) {
      const pm = o.paymentMethod || 'PAY_AT_COUNTER';
      if (!paymentBreakdown[pm]) {
        paymentBreakdown[pm] = { count: 0, total: 0 };
      }
      paymentBreakdown[pm].count++;
      paymentBreakdown[pm].total += o.grandTotal;
    }

    // Category-wise sales
    const categoryBreakdown: Record<string, { count: number; total: number }> = {};
    for (const o of validOrders) {
      for (const item of o.items) {
        const cat = item.categoryName || 'Other';
        if (!categoryBreakdown[cat]) {
          categoryBreakdown[cat] = { count: 0, total: 0 };
        }
        categoryBreakdown[cat].count += item.quantity;
        categoryBreakdown[cat].total += item.subtotal;
      }
    }

    // Table sales breakdown
    const tableBreakdown: Record<string, { count: number; total: number }> = {};
    for (const o of validOrders) {
      if (o.tableNumber) {
        const tb = o.tableNumber;
        if (!tableBreakdown[tb]) {
          tableBreakdown[tb] = { count: 0, total: 0 };
        }
        tableBreakdown[tb].count++;
        tableBreakdown[tb].total += o.grandTotal;
      }
    }

    return res.json({
      dateRange: { start, end },
      totalOrders: orders.length,
      validOrdersCount: validOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      grossSales: Math.round(grossSales * 100) / 100,
      totalDiscounts: Math.round(totalDiscounts * 100) / 100,
      totalTaxes: Math.round(totalTaxes * 100) / 100,
      totalServiceCharges: Math.round(totalServiceCharges * 100) / 100,
      netRevenue: Math.round(netRevenue * 100) / 100,
      paymentBreakdown,
      categoryBreakdown,
      tableBreakdown,
    });
  } catch (error) {
    console.error('Analytics report error:', error);
    return res.status(500).json({ error: 'Failed to generate report.' });
  }
});

// CSV Export
router.get('/export-csv', authenticateToken, requireRole('MANAGER'), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      take: 500,
    });

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Order Type',
      'Table',
      'Status',
      'Subtotal',
      'Discount',
      'Tax',
      'Grand Total',
      'Payment Method',
      'Payment Status',
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.orderType}"`,
      `"${o.tableNumber || 'N/A'}"`,
      `"${o.status}"`,
      o.subtotal.toFixed(2),
      o.discount.toFixed(2),
      o.taxAmount.toFixed(2),
      o.grandTotal.toFixed(2),
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="the_aftab_orders_report.csv"');
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to export CSV.' });
  }
});

export default router;
