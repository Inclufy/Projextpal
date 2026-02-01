// ============================================================
// ADMIN PORTAL API ROUTES
// Express routes for admin portal functionality
// SuperAdmin access only
// ============================================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireSuperAdmin, logSuperAdminAction } from '../middleware/superadmin';

const router = Router();
const prisma = new PrismaClient();

// Apply SuperAdmin middleware to all routes
router.use(requireSuperAdmin);
router.use(logSuperAdminAction);

// =============================================
// DASHBOARD STATS
// =============================================

router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Users stats
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Tenants stats
    const [
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { status: 'ACTIVE' } }),
      prisma.organization.count({ where: { status: 'TRIAL' } }),
      prisma.organization.count({ where: { status: 'SUSPENDED' } }),
    ]);

    // Revenue stats (from subscriptions)
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { priceMonthly: true, priceYearly: true, billingCycle: true },
    });

    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const monthlyPrice = sub.billingCycle === 'YEARLY'
        ? Number(sub.priceYearly || 0) / 12
        : Number(sub.priceMonthly);
      return sum + monthlyPrice;
    }, 0);

    // Recent activity
    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json({
      users: {
        totalUsers,
        activeUsers,
        pendingUsers,
        suspendedUsers,
        newUsersThisMonth,
        activeUsersToday: await prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        roleDistribution: {
          user: await prisma.user.count({ where: { role: 'USER' } }),
          admin: await prisma.user.count({ where: { role: 'ADMIN' } }),
          superAdmin: await prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
        },
      },
      tenants: {
        totalTenants,
        activeTenants,
        trialTenants,
        suspendedTenants,
        newTenantsThisMonth: await prisma.organization.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      },
      revenue: {
        mrr,
        arr: mrr * 12,
        activeSubscriptions: activeSubscriptions.length,
      },
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
        userEmail: log.user?.email,
        action: log.action,
        resource: log.resource,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// =============================================
// USER MANAGEMENT
// =============================================

// List all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      role,
      organizationId,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          organization: {
            select: { id: true, name: true },
          },
          _count: {
            select: { projects: true },
          },
        },
        orderBy: { [sortBy as string]: sortOrder },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        isSuperAdmin: user.isSuperAdmin,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        jobTitle: user.jobTitle,
        department: user.department,
        language: user.language,
        timezone: user.timezone,
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        projectCount: user._count.projects,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true },
        },
        _count: {
          select: { projects: true, programs: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
        organizationName: user.organization?.name,
        projectCount: user._count.projects,
        programCount: user._count.programs,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user
router.post('/users', async (req: Request, res: Response) => {
  try {
    const {
      email,
      firstName,
      lastName,
      role,
      status,
      organizationId,
      jobTitle,
      department,
      sendInvite,
    } = req.body;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role: role || 'USER',
        status: status || 'PENDING',
        organizationId,
        jobTitle,
        department,
      },
    });

    // TODO: Send invite email if sendInvite is true

    res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      role,
      status,
      organizationId,
      jobTitle,
      department,
      isSuperAdmin,
    } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        role,
        status,
        organizationId,
        jobTitle,
        department,
        isSuperAdmin,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Suspend user
router.post('/users/:id/suspend', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspendedReason: reason,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

// Activate user
router.post('/users/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        suspendedAt: null,
        suspendedReason: null,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

// Delete user
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete - mark as DELETED status
    await prisma.user.update({
      where: { id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Reset user password
router.post('/users/:id/reset-password', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // TODO: Send password reset email

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// =============================================
// TENANT/ORGANIZATION MANAGEMENT
// =============================================

// List all tenants
router.get('/tenants', async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      plan,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (plan && plan !== 'all') {
      where.subscription = { planName: plan };
    }

    const [tenants, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          subscription: {
            select: { planName: true, status: true, priceMonthly: true },
          },
          _count: {
            select: { users: true, projects: true, programs: true },
          },
        },
        orderBy: { [sortBy as string]: sortOrder },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      }),
      prisma.organization.count({ where }),
    ]);

    res.json({
      tenants: tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logo: tenant.logo,
        status: tenant.status,
        plan: tenant.subscription?.planName || 'starter',
        email: tenant.email,
        phone: tenant.phone,
        website: tenant.website,
        address: tenant.address,
        city: tenant.city,
        country: tenant.country,
        postalCode: tenant.postalCode,
        vatNumber: tenant.vatNumber,
        ownerId: tenant.owner?.id,
        ownerName: tenant.owner
          ? `${tenant.owner.firstName} ${tenant.owner.lastName}`
          : null,
        maxProjects: tenant.maxProjects,
        maxPrograms: tenant.maxPrograms,
        maxUsers: tenant.maxUsers,
        maxStorage: tenant.maxStorage,
        currentProjects: tenant._count.projects,
        currentPrograms: tenant._count.programs,
        currentUsers: tenant._count.users,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Get single tenant
router.get('/tenants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.organization.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        subscription: true,
        _count: {
          select: { users: true, projects: true, programs: true },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      tenant: {
        ...tenant,
        ownerName: tenant.owner
          ? `${tenant.owner.firstName} ${tenant.owner.lastName}`
          : null,
        currentProjects: tenant._count.projects,
        currentPrograms: tenant._count.programs,
        currentUsers: tenant._count.users,
      },
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

// Create tenant
router.post('/tenants', async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      email,
      phone,
      website,
      address,
      city,
      country,
      postalCode,
      vatNumber,
      ownerId,
      planId,
    } = req.body;

    // Check if slug already exists
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Slug already in use' });
    }

    // Get plan defaults
    const plan = planId
      ? await prisma.pricingPlan.findUnique({ where: { id: planId } })
      : await prisma.pricingPlan.findFirst({ where: { name: 'starter' } });

    const tenant = await prisma.organization.create({
      data: {
        name,
        slug,
        email,
        phone,
        website,
        address,
        city,
        country,
        postalCode,
        vatNumber,
        ownerId,
        status: 'TRIAL',
        maxProjects: plan?.maxProjects || 3,
        maxPrograms: plan?.maxPrograms || 1,
        maxUsers: plan?.maxUsers || 5,
        maxStorage: plan?.maxStorage || 1024,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });

    res.status(201).json({ tenant });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// Update tenant
router.put('/tenants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const tenant = await prisma.organization.update({
      where: { id },
      data: updateData,
    });

    res.json({ tenant });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// Suspend tenant
router.post('/tenants/:id/suspend', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tenant = await prisma.organization.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspendedReason: reason,
      },
    });

    res.json({ tenant });
  } catch (error) {
    console.error('Error suspending tenant:', error);
    res.status(500).json({ error: 'Failed to suspend tenant' });
  }
});

// Activate tenant
router.post('/tenants/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.organization.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        suspendedAt: null,
        suspendedReason: null,
      },
    });

    res.json({ tenant });
  } catch (error) {
    console.error('Error activating tenant:', error);
    res.status(500).json({ error: 'Failed to activate tenant' });
  }
});

// Delete tenant
router.delete('/tenants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete
    await prisma.organization.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

// =============================================
// INTEGRATIONS MANAGEMENT
// =============================================

// List all integrations
router.get('/integrations', async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;

    const where: any = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const integrations = await prisma.integration.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Get enabled count for each integration
    const enabledCounts = await prisma.tenantIntegration.groupBy({
      by: ['integrationId'],
      where: { enabled: true },
      _count: true,
    });

    const countMap = new Map(
      enabledCounts.map((c) => [c.integrationId, c._count])
    );

    res.json({
      integrations: integrations.map((i) => ({
        ...i,
        enabledCount: countMap.get(i.id) || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Create integration
router.post('/integrations', async (req: Request, res: Response) => {
  try {
    const integrationData = req.body;

    const integration = await prisma.integration.create({
      data: integrationData,
    });

    res.status(201).json({ integration });
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

// Update integration
router.put('/integrations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const integration = await prisma.integration.update({
      where: { id },
      data: updateData,
    });

    res.json({ integration });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

// Toggle integration status
router.post('/integrations/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const integration = await prisma.integration.findUnique({ where: { id } });
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const newStatus =
      integration.status === 'enabled' ? 'disabled' : 'enabled';

    const updated = await prisma.integration.update({
      where: { id },
      data: { status: newStatus },
    });

    res.json({ integration: updated });
  } catch (error) {
    console.error('Error toggling integration:', error);
    res.status(500).json({ error: 'Failed to toggle integration' });
  }
});

// =============================================
// AUDIT LOGS
// =============================================

router.get('/logs', async (req: Request, res: Response) => {
  try {
    const {
      search,
      action,
      resource,
      userId,
      tenantId,
      startDate,
      endDate,
      page = '1',
      limit = '50',
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { resource: { contains: search as string, mode: 'insensitive' } },
        { resourceId: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (action && action !== 'all') {
      where.action = action;
    }

    if (resource && resource !== 'all') {
      where.resource = resource;
    }

    if (userId) {
      where.userId = userId;
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (startDate) {
      where.createdAt = { gte: new Date(startDate as string) };
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
          tenant: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      logs: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user
          ? `${log.user.firstName} ${log.user.lastName}`
          : 'System',
        userEmail: log.user?.email,
        tenantId: log.tenantId,
        tenantName: log.tenant?.name,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        details: log.details,
        previousValue: log.previousValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// =============================================
// SYSTEM SETTINGS
// =============================================

router.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // Return defaults
      return res.json({
        settings: {
          appName: 'ProjeXtPal',
          appUrl: 'https://app.projextpal.com',
          supportEmail: 'support@projextpal.com',
          maintenanceMode: false,
          registrationEnabled: true,
          trialEnabled: true,
          trialDays: 14,
          defaultMaxProjects: 3,
          defaultMaxPrograms: 1,
          defaultMaxUsers: 5,
          defaultMaxStorage: 1024,
          emailProvider: 'sendgrid',
          emailFromAddress: 'noreply@projextpal.com',
          emailFromName: 'ProjeXtPal',
          storageProvider: 's3',
          maxUploadSize: 50,
          passwordMinLength: 8,
          passwordRequireUppercase: true,
          passwordRequireNumbers: true,
          passwordRequireSymbols: false,
          maxLoginAttempts: 5,
          lockoutDuration: 30,
          sessionTimeout: 60,
          aiProvider: 'anthropic',
          aiModel: 'claude-3-sonnet',
          aiMaxTokens: 4096,
          aiEnabled: true,
        },
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const settingsData = req.body;

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'singleton' },
      update: settingsData,
      create: { id: 'singleton', ...settingsData },
    });

    res.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
