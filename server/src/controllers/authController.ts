import { Request, Response } from 'express';
import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime } from '../utils/dataHelpers.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'constructos-secret-key-change-in-production';

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên, email và mật khẩu' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    
    // Check if user already exists
    const existing = await query<any[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Validate and resolve role_id
    // Frontend may send role name (string) or role UUID
    let roleId = role;
    if (!roleId) {
      // Try to get a default role (first role in database)
      try {
        const defaultRole = await query<any[]>(
          'SELECT id FROM roles LIMIT 1'
        );
        if (defaultRole.length > 0) {
          roleId = defaultRole[0].id;
        } else {
          return res.status(400).json({ error: 'No roles found in database. Please create at least one role first.' });
        }
      } catch (roleError) {
        return res.status(400).json({ error: 'Role (role_id) is required and no default role found' });
      }
    } else {
      // Check if role is a UUID format (36 chars with dashes)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roleId);
      
      if (!isUUID) {
        // Role is a name string, find the UUID by name
        try {
          // Map common role names to database role names
          const roleNameMap: { [key: string]: string } = {
            'admin': 'admin',
            'project_manager': 'project_manager',
            'accountant': 'accountant',
            'warehouse': 'warehouse',
            'site_manager': 'site_manager',
            'engineer': 'engineer',
            'client': 'client',
            'kế toán': 'accountant',
            'quản lý công trường': 'site_manager',
            'quản lý dự án': 'project_manager',
          };
          
          const mappedRoleName = roleNameMap[roleId.toLowerCase()] || roleId.toLowerCase();
          const roleResult = await query<any[]>(
            'SELECT id FROM roles WHERE LOWER(name) = $1',
            [mappedRoleName]
          );
          
          if (roleResult.length === 0) {
            return res.status(400).json({ error: `Role "${roleId}" not found. Please use a valid role name or UUID.` });
          }
          
          roleId = roleResult[0].id;
        } catch (roleError: any) {
          return res.status(400).json({ error: `Invalid role: ${roleError.message}` });
        }
      } else {
        // Role is a UUID, validate it exists
        try {
          const roleCheck = await query<any[]>(
            'SELECT id FROM roles WHERE id = $1',
            [roleId]
          );
          if (roleCheck.length === 0) {
            return res.status(400).json({ error: `Role with id ${roleId} does not exist` });
          }
        } catch (roleError: any) {
          return res.status(400).json({ error: `Invalid role_id: ${roleError.message}` });
        }
      }
    }
    
    // Create user
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    await query(
      `INSERT INTO users (
        id, name, email, phone, password_hash, role, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        email,
        phone || '',
        passwordHash,
        roleId,
        'active',
        createdAt,
        createdAt,
      ]
    );
    
    // Get created user (without password)
    const newUser = await query<any[]>(
      'SELECT id, name, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: id, email, role: role || 'client' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      user: newUser[0],
      token,
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      error: 'Đăng ký thất bại',
      message: error.message 
    });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    }
    
    // Find user
    const users = await query<any[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }
    
    const user = users[0];
    
    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Tài khoản chưa được kích hoạt' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user (without password)
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      token,
    });
  } catch (error: any) {
    console.error('Error logging in:', error);
    res.status(500).json({ 
      error: 'Đăng nhập thất bại',
      message: error.message 
    });
  }
};

// Forgot password - Generate reset token
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Vui lòng nhập email' });
    }
    
    // Find user
    const users = await query<any[]>(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    );
    
    // Always return success (security: don't reveal if email exists)
    if (users.length > 0) {
      const user = users[0];
      
      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email, type: 'password_reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      // In production, send email with reset link
      // For now, we'll just return the token (in production, send via email)
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      // TODO: Send email with reset link
      // await sendPasswordResetEmail(user.email, resetToken);
    }
    
    // Always return success message
    res.json({ 
      message: 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi' 
    });
  } catch (error: any) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ 
      error: 'Xử lý yêu cầu đặt lại mật khẩu thất bại',
      message: error.message 
    });
  }
};

// Reset password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng nhập token và mật khẩu mới' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    
    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({ error: 'Loại token không hợp lệ' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    
    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    const updatedAt = toMySQLDateTime();
    await query(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [passwordHash, updatedAt, decoded.userId]
    );
    
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    res.status(500).json({ 
      error: 'Đặt lại mật khẩu thất bại',
      message: error.message 
    });
  }
};

// Verify token (for checking if reset token is valid)
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Vui lòng nhập token' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.type === 'password_reset') {
        res.json({ valid: true, type: 'password_reset' });
      } else {
        res.json({ valid: true, type: 'auth' });
      }
    } catch (error) {
      res.json({ valid: false });
    }
  } catch (error: any) {
    console.error('Error verifying token:', error);
    res.status(500).json({ 
      error: 'Xác thực token thất bại',
      message: error.message 
    });
  }
};

