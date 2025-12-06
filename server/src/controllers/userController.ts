import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { normalizeString, toMySQLDateTime } from '../utils/dataHelpers.js';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.js';
import { getAvatarUrl } from '../middleware/upload.js';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const results = await query<any[]>(
      'SELECT id, name, email, phone, role, status, avatar, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json(results);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách người dùng' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      'SELECT id, name, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    
    res.json(results[0]);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin người dùng' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    // Hash password if provided
    let passwordHash = userData.password_hash;
    if (userData.password && !passwordHash) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(userData.password, saltRounds);
    }
    
    if (!passwordHash) {
      return res.status(400).json({ error: 'Vui lòng nhập mật khẩu' });
    }
    
    await query(
      `INSERT INTO users (
        id, name, email, phone, password_hash, role, status, avatar, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userData.name,
        userData.email,
        userData.phone || '',
        passwordHash,
        userData.role || 'client',
        userData.status || 'active',
        normalizeString(userData.avatar),
        createdAt,
        createdAt,
      ]
    );
    
    const newUser = await query<any[]>(
      'SELECT id, name, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    res.status(201).json(newUser[0]);
  } catch (error: any) {
    console.error('Error creating user:', error);
    console.error('Request data:', req.body);
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    
    res.status(500).json({ 
      error: 'Không thể tạo người dùng',
      message: error.message 
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    const updatedAt = toMySQLDateTime();
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    
    // Hash password if provided
    let passwordHash = userData.password_hash;
    if (userData.password && !passwordHash) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(userData.password, saltRounds);
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    
    if (userData.name !== undefined) {
      updates.push('name = ?');
      values.push(userData.name);
    }
    if (userData.email !== undefined) {
      updates.push('email = ?');
      values.push(userData.email);
    }
    if (userData.phone !== undefined) {
      updates.push('phone = ?');
      values.push(userData.phone);
    }
    if (passwordHash) {
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }
    if (userData.role !== undefined) {
      updates.push('role = ?');
      values.push(userData.role);
    }
    if (userData.status !== undefined) {
      updates.push('status = ?');
      values.push(userData.status);
    }
    if (userData.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(normalizeString(userData.avatar));
    }
    
    updates.push('updated_at = ?');
    values.push(updatedAt);
    values.push(id);
    
    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const updated = await query<any[]>(
      'SELECT id, name, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating user:', error);
    console.error('Request data:', req.body);
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    
    res.status(500).json({ 
      error: 'Không thể cập nhật người dùng',
      message: error.message 
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    
    await query('DELETE FROM users WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Không thể xóa người dùng' });
  }
};

// Get current user (from JWT token)
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }
    
    const results = await query<any[]>(
      'SELECT id, name, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE id = ?',
      [req.userId]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    
    const user = results[0];
    // Convert avatar filename to URL if exists
    if (user.avatar) {
      user.avatar = getAvatarUrl(user.avatar);
    }
    
    res.json(user);
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin người dùng hiện tại' });
  }
};

// Upload avatar
export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được tải lên' });
    }

    const filename = req.file.filename;
    const updatedAt = toMySQLDateTime();

    // Update user avatar in database
    await query(
      'UPDATE users SET avatar = ?, updated_at = ? WHERE id = ?',
      [filename, updatedAt, req.userId]
    );

    // Get updated user
    const results = await query<any[]>(
      'SELECT id, name, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const user = results[0];
    user.avatar = getAvatarUrl(user.avatar);

    res.json({
      message: 'Tải lên ảnh đại diện thành công',
      avatar: user.avatar,
      user,
    });
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ 
      error: 'Không thể tải lên ảnh đại diện',
      message: error.message 
    });
  }
};

