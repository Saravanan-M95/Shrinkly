import { nanoid } from 'nanoid';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import UAParser from 'ua-parser-js';
import { Url, Click } from '../models/index.js';

export const createUrl = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { originalUrl, title, customCode, expiresAt } = req.body;

    // Generate or use custom short code
    let shortCode = customCode || nanoid(7);

    // Check if custom code is already taken
    if (customCode) {
      const existing = await Url.findOne({ where: { shortCode: customCode } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'This custom code is already taken. Please choose another.',
        });
      }
    }

    // Ensure generated code is unique
    let attempts = 0;
    while (!customCode && attempts < 5) {
      const existing = await Url.findOne({ where: { shortCode } });
      if (!existing) break;
      shortCode = nanoid(7);
      attempts++;
    }

    const url = await Url.create({
      userId: req.user.id,
      shortCode,
      originalUrl,
      title: title || null,
      expiresAt: expiresAt || null,
    });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    res.status(201).json({
      success: true,
      message: 'URL shortened successfully',
      data: {
        url: {
          id: url.id,
          shortCode: url.shortCode,
          shortUrl: `${backendUrl}/${url.shortCode}`,
          originalUrl: url.originalUrl,
          title: url.title,
          isActive: url.isActive,
          clickCount: url.clickCount,
          expiresAt: url.expiresAt,
          createdAt: url.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserUrls = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };

    if (search) {
      where[Op.or] = [
        { originalUrl: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { shortCode: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: urls } = await Url.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    res.json({
      success: true,
      data: {
        urls: urls.map((u) => ({
          id: u.id,
          shortCode: u.shortCode,
          shortUrl: `${backendUrl}/${u.shortCode}`,
          originalUrl: u.originalUrl,
          title: u.title,
          isActive: u.isActive,
          clickCount: u.clickCount,
          expiresAt: u.expiresAt,
          createdAt: u.createdAt,
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUrlById = async (req, res, next) => {
  try {
    const url = await Url.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    res.json({
      success: true,
      data: {
        url: {
          id: url.id,
          shortCode: url.shortCode,
          shortUrl: `${backendUrl}/${url.shortCode}`,
          originalUrl: url.originalUrl,
          title: url.title,
          isActive: url.isActive,
          clickCount: url.clickCount,
          expiresAt: url.expiresAt,
          createdAt: url.createdAt,
          updatedAt: url.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    const { title, isActive, originalUrl } = req.body;

    if (title !== undefined) url.title = title;
    if (isActive !== undefined) url.isActive = isActive;
    if (originalUrl !== undefined) url.originalUrl = originalUrl;

    await url.save();

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    res.json({
      success: true,
      message: 'URL updated',
      data: {
        url: {
          id: url.id,
          shortCode: url.shortCode,
          shortUrl: `${backendUrl}/${url.shortCode}`,
          originalUrl: url.originalUrl,
          title: url.title,
          isActive: url.isActive,
          clickCount: url.clickCount,
          expiresAt: url.expiresAt,
          createdAt: url.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    await url.destroy();

    res.json({
      success: true,
      message: 'URL deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const redirectUrl = async (req, res, next) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ where: { shortCode: code } });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found',
      });
    }

    if (!url.isActive) {
      return res.status(410).json({
        success: false,
        message: 'This link has been deactivated',
      });
    }

    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'This link has expired',
      });
    }

    // Track click asynchronously
    const parser = new UAParser(req.headers['user-agent']);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    Click.create({
      urlId: url.id,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer || req.headers.referrer || null,
      country: null, // Would use IP geolocation service in production
      deviceType: device.type || 'desktop',
      browser: browser.name || 'Unknown',
      os: os.name || 'Unknown',
    }).catch(console.error);

    // Increment click count
    url.clickCount += 1;
    url.save().catch(console.error);

    // Return redirect info (for interstitial page) or redirect to frontend
    const wantsJson = req.headers.accept?.includes('application/json');

    if (wantsJson) {
      return res.json({
        success: true,
        data: {
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          title: url.title,
        },
      });
    }

    // Redirect to frontend interstitial page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
    res.redirect(302, `${frontendUrl}/go/${url.shortCode}`);
  } catch (error) {
    next(error);
  }
};

export const getUrlAnalytics = async (req, res, next) => {
  try {
    const url = await Url.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const clicks = await Click.findAll({
      where: {
        urlId: url.id,
        clickedAt: { [Op.gte]: since },
      },
      order: [['clickedAt', 'DESC']],
    });

    // Aggregate stats
    const deviceStats = {};
    const browserStats = {};
    const osStats = {};
    const dailyClicks = {};

    clicks.forEach((click) => {
      // Device
      const dt = click.deviceType || 'unknown';
      deviceStats[dt] = (deviceStats[dt] || 0) + 1;

      // Browser
      const br = click.browser || 'unknown';
      browserStats[br] = (browserStats[br] || 0) + 1;

      // OS
      const o = click.os || 'unknown';
      osStats[o] = (osStats[o] || 0) + 1;

      // Daily
      const day = new Date(click.clickedAt).toISOString().split('T')[0];
      dailyClicks[day] = (dailyClicks[day] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalClicks: url.clickCount,
        clicksInPeriod: clicks.length,
        period: `${days} days`,
        dailyClicks: Object.entries(dailyClicks).map(([date, count]) => ({
          date,
          count,
        })),
        deviceStats: Object.entries(deviceStats).map(([device, count]) => ({
          device,
          count,
        })),
        browserStats: Object.entries(browserStats).map(([browser, count]) => ({
          browser,
          count,
        })),
        osStats: Object.entries(osStats).map(([os, count]) => ({
          os,
          count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOverallStats = async (req, res, next) => {
  try {
    const totalUrls = await Url.count({ where: { userId: req.user.id } });
    const activeUrls = await Url.count({
      where: { userId: req.user.id, isActive: true },
    });

    const urls = await Url.findAll({
      where: { userId: req.user.id },
      attributes: ['clickCount'],
    });

    const totalClicks = urls.reduce((sum, u) => sum + u.clickCount, 0);

    const topUrl = await Url.findOne({
      where: { userId: req.user.id },
      order: [['clickCount', 'DESC']],
    });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    res.json({
      success: true,
      data: {
        totalUrls,
        activeUrls,
        totalClicks,
        topUrl: topUrl
          ? {
              id: topUrl.id,
              shortCode: topUrl.shortCode,
              shortUrl: `${backendUrl}/${topUrl.shortCode}`,
              originalUrl: topUrl.originalUrl,
              title: topUrl.title,
              clickCount: topUrl.clickCount,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};
