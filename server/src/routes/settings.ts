import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest, logAudit } from '../middleware/auth';

const router = Router();

// Public website settings
router.get('/', async (_req, res) => {
  try {
    let settings = await prisma.websiteSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.websiteSettings.create({
        data: { id: 1 },
      });
    }

    return res.json(settings);
  } catch (error) {
    console.error('Fetch settings error:', error);
    return res.status(500).json({ error: 'Failed to fetch website settings.' });
  }
});

// Update website settings (Owner / Manager)
router.put('/', authenticateToken, requireRole('MANAGER'), async (req: AuthRequest, res) => {
  try {
    const {
      cafeName,
      tagline,
      heroHeadline,
      heroSubtitle,
      heroImage,
      announcementBanner,
      showAnnouncement,
      primaryColor,
      accentColor,
      darkModeEnabled,
      phone,
      email,
      address,
      openingHours,
      googleMapsEmbedUrl,
      instagramUrl,
      facebookUrl,
      twitterUrl,
      currencySymbol,
      taxRatePercent,
      serviceChargePercent,
      minOrderAmount,
      requireCustomerPhone,
      allowDineIn,
      allowTakeaway,
      enableReviews,
    } = req.body;

    const updated = await prisma.websiteSettings.upsert({
      where: { id: 1 },
      update: {
        cafeName,
        tagline,
        heroHeadline,
        heroSubtitle,
        heroImage,
        announcementBanner,
        showAnnouncement: Boolean(showAnnouncement),
        primaryColor,
        accentColor,
        darkModeEnabled: Boolean(darkModeEnabled),
        phone,
        email,
        address,
        openingHours,
        googleMapsEmbedUrl,
        instagramUrl,
        facebookUrl,
        twitterUrl,
        currencySymbol: currencySymbol || '₹',
        taxRatePercent: taxRatePercent !== undefined ? parseFloat(taxRatePercent) : 5.0,
        serviceChargePercent: serviceChargePercent !== undefined ? parseFloat(serviceChargePercent) : 0.0,
        minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : 0.0,
        requireCustomerPhone: Boolean(requireCustomerPhone),
        allowDineIn: Boolean(allowDineIn),
        allowTakeaway: Boolean(allowTakeaway),
        enableReviews: Boolean(enableReviews),
      },
      create: {
        id: 1,
        cafeName,
        tagline,
        heroHeadline,
        heroSubtitle,
        heroImage,
        announcementBanner,
        showAnnouncement: Boolean(showAnnouncement),
        primaryColor,
        accentColor,
        darkModeEnabled: Boolean(darkModeEnabled),
        phone,
        email,
        address,
        openingHours,
        googleMapsEmbedUrl,
        instagramUrl,
        facebookUrl,
        twitterUrl,
        currencySymbol: currencySymbol || '₹',
        taxRatePercent: taxRatePercent !== undefined ? parseFloat(taxRatePercent) : 5.0,
        serviceChargePercent: serviceChargePercent !== undefined ? parseFloat(serviceChargePercent) : 0.0,
        minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : 0.0,
        requireCustomerPhone: Boolean(requireCustomerPhone),
        allowDineIn: Boolean(allowDineIn),
        allowTakeaway: Boolean(allowTakeaway),
        enableReviews: Boolean(enableReviews),
      },
    });

    await logAudit('SETTINGS_UPDATE', 'Updated cafe personalization settings', req);

    return res.json({ message: 'Settings updated successfully.', settings: updated });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ error: 'Failed to save settings.' });
  }
});

// Reset settings to defaults
router.post('/reset', authenticateToken, requireRole('SUPER_ADMIN'), async (req: AuthRequest, res) => {
  try {
    const defaults = {
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
      currencySymbol: '₹',
      taxRatePercent: 5.0,
      serviceChargePercent: 0.0,
      minOrderAmount: 0.0,
      requireCustomerPhone: false,
      allowDineIn: true,
      allowTakeaway: true,
      enableReviews: true,
    };

    const resetSettings = await prisma.websiteSettings.update({
      where: { id: 1 },
      data: defaults,
    });

    await logAudit('SETTINGS_RESET', 'Reset website personalization settings to defaults', req);

    return res.json({ message: 'Settings reset to factory defaults.', settings: resetSettings });
  } catch (error) {
    console.error('Reset settings error:', error);
    return res.status(500).json({ error: 'Failed to reset settings.' });
  }
});

export default router;
