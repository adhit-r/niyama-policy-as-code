import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { User, UserRole, AuthTokens, LoginRequest, RegisterRequest } from '../types';
import { query, transaction } from '../database/connection';
import { cache, session } from '../database/redis';

class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private refreshExpiresIn: string;
  private bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  }

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, firstName, lastName, organizationName } = data;

    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);

    // Create organization and user in a transaction
    const result = await transaction(async (client) => {
      // Create organization
      const orgResult = await client.query(
        `INSERT INTO organizations (name, domain, plan, settings) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id`,
        [
          organizationName,
          email.split('@')[1], // Extract domain from email
          'starter',
          JSON.stringify({
            maxPolicies: 50,
            maxUsers: 5,
            allowedFrameworks: ['soc2-type-ii', 'iso-27001'],
            features: ['basic_ai', 'basic_compliance'],
            integrations: []
          })
        ]
      );

      const organizationId = orgResult.rows[0].id;

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, organization_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, email, first_name, last_name, role, organization_id, is_active, created_at, updated_at`,
        [email, passwordHash, firstName, lastName, UserRole.ADMIN, organizationId]
      );

      return {
        user: this.mapRowToUser(userResult.rows[0]),
        organizationId
      };
    });

    // Generate tokens
    const tokens = await this.generateTokens(result.user);

    // Store refresh token
    await this.storeRefreshToken(result.user.id, tokens.refreshToken);

    logger.info('User registered successfully', {
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.organizationId,
    });

    return {
      user: result.user,
      tokens,
    };
  }

  async login(credentials: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password } = credentials;

    // Get user by email
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Create session
    await session.create(user.id, {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    }, 7 * 24 * 60 * 60); // 7 days

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
    });

    return {
      user: this.mapRowToUser(user),
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, this.jwtSecret) as any;
    
    // Check if refresh token exists in database
    const tokenResult = await query(
      'SELECT user_id FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
      [this.hashToken(refreshToken)]
    );

    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid refresh token');
    }

    const userId = tokenResult.rows[0].user_id;

    // Get user
    const user = await this.getUserById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    // Update refresh token
    await this.storeRefreshToken(userId, tokens.refreshToken);

    logger.info('Token refreshed successfully', {
      userId: user.id,
      email: user.email,
    });

    return { tokens };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    // Remove refresh token
    if (refreshToken) {
      await query(
        'DELETE FROM refresh_tokens WHERE token_hash = $1',
        [this.hashToken(refreshToken)]
      );
    } else {
      // Remove all refresh tokens for user
      await query(
        'DELETE FROM refresh_tokens WHERE user_id = $1',
        [userId]
      );
    }

    // Remove session
    await session.delete(`session:${userId}:*`);

    logger.info('User logged out successfully', { userId });
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const user = await this.getUserById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return this.mapRowToUser(user);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, this.bcryptRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Invalidate all refresh tokens
    await query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );

    logger.info('Password changed successfully', { userId });
  }

  async resetPassword(email: string): Promise<void> {
    // Get user
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await cache.set(`password_reset:${resetToken}`, user.id, 3600);

    // TODO: Send email with reset link
    logger.info('Password reset token generated', {
      userId: user.id,
      email: user.email,
      resetToken,
    });
  }

  async confirmPasswordReset(resetToken: string, newPassword: string): Promise<void> {
    // Get user ID from reset token
    const userId = await cache.get(`password_reset:${resetToken}`);
    if (!userId) {
      throw new Error('Invalid or expired reset token');
    }

    // Get user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, this.bcryptRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Remove reset token
    await cache.del(`password_reset:${resetToken}`);

    // Invalidate all refresh tokens
    await query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );

    logger.info('Password reset completed', { userId });
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: this.refreshExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
    };
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.parseExpiresIn(this.refreshExpiresIn) * 1000);

    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );
  }

  private async getUserByEmail(email: string): Promise<any> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  private async getUserById(id: string): Promise<any> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      organizationId: row.organization_id,
      isActive: row.is_active,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private hashToken(token: string): string {
    return require('crypto').createHash('sha256').update(token).digest('hex');
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return value;
    }
  }

  // RBAC methods
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    const role = user.role;

    // Define role-based permissions
    const permissions: Record<UserRole, Record<string, string[]>> = {
      [UserRole.ADMIN]: {
        policies: ['create', 'read', 'update', 'delete'],
        templates: ['create', 'read', 'update', 'delete'],
        compliance: ['create', 'read', 'update', 'delete'],
        users: ['create', 'read', 'update', 'delete'],
        settings: ['read', 'update'],
      },
      [UserRole.COMPLIANCE_OFFICER]: {
        policies: ['read', 'update'],
        templates: ['read'],
        compliance: ['create', 'read', 'update'],
        users: ['read'],
        settings: ['read'],
      },
      [UserRole.DEVSECOPS_ENGINEER]: {
        policies: ['create', 'read', 'update', 'delete'],
        templates: ['create', 'read', 'update'],
        compliance: ['read'],
        users: ['read'],
        settings: ['read'],
      },
      [UserRole.PLATFORM_ENGINEER]: {
        policies: ['read', 'update'],
        templates: ['read'],
        compliance: ['read'],
        users: ['read'],
        settings: ['read', 'update'],
      },
      [UserRole.VIEWER]: {
        policies: ['read'],
        templates: ['read'],
        compliance: ['read'],
        users: ['read'],
        settings: ['read'],
      },
    };

    const rolePermissions = permissions[role];
    if (!rolePermissions) return false;

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.mapRowToUser(user);
  }
}

export const authService = new AuthService();



