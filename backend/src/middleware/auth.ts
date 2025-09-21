import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';
import { User } from '../types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const user = await authService.verifyToken(token);
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        timestamp: new Date().toISOString(),
      });
      return;
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      timestamp: new Date().toISOString(),
    });
  }
};

export const authorize = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const hasPermission = await authService.hasPermission(req.user.id, resource, action);
      
      if (!hasPermission) {
        logger.warn('Authorization failed', {
          userId: req.user.id,
          resource,
          action,
          userRole: req.user.role,
        });

        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        error: 'Authorization failed',
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// Role-based middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Role authorization failed', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
      });

      res.status(403).json({
        success: false,
        error: 'Insufficient role permissions',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

// Organization-based middleware
export const requireSameOrganization = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const requestedOrgId = req.params.organizationId || req.body.organizationId;
  
  if (requestedOrgId && requestedOrgId !== req.user.organizationId) {
    // Only admins can access other organizations
    if (req.user.role !== 'admin') {
      logger.warn('Organization access denied', {
        userId: req.user.id,
        userOrgId: req.user.organizationId,
        requestedOrgId,
      });

      res.status(403).json({
        success: false,
        error: 'Access denied to this organization',
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  next();
};

// Optional authentication middleware
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const user = await authService.verifyToken(token);
        req.user = user;
      } catch (error) {
        // Token is invalid, but we continue without user
        logger.debug('Optional auth failed:', error);
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next(); // Continue even if there's an error
  }
};

// Rate limiting per user
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.id;
    const now = Date.now();
    const userRequests = requests.get(userId);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(userId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      logger.warn('User rate limit exceeded', {
        userId,
        count: userRequests.count,
        maxRequests,
      });

      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    userRequests.count++;
    next();
  };
};



