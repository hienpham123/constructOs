import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { normalizeString, toMySQLDateTime, buildSearchClause, buildSortClause } from '../utils/dataHelpers.js';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.js';
import { getAvatarUrl, handleFileUpload } from '../middleware/upload.js';
import path from 'path';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { pageSize, pageIndex, search, sortBy, sortOrder } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Build search and sort clauses
    const queryParams: any[] = [];
    const searchClause = buildSearchClause(
      search as string,
      ['name', 'email', 'phone', 'role'],
      queryParams
    );
    
    const allowedSortFields = ['name', 'email', 'phone', 'role', 'status', 'created_at', 'updated_at'];
    const sortClause = buildSortClause(sortBy as string, allowedSortFields, 'created_at', sortOrder as string);
    
    // Get total count with search
    // Update search clause to use table alias for count query
    const countSearchClause = searchClause
      .replace(/\bname\b/g, 'u.name')
      .replace(/\bemail\b/g, 'u.email')
      .replace(/\bphone\b/g, 'u.phone')
      .replace(/\brole\b/g, 'u.role');
    
    const countQuery = `SELECT COUNT(*) as total FROM users u ${countSearchClause}`;
    const countResults = await query<any[]>(countQuery, queryParams);
    const total = countResults[0]?.total || 0;
    
    // Get paginated data with role description
    // Update search and sort clauses to use table aliases
    const searchClauseWithAlias = searchClause
      .replace(/\bname\b/g, 'u.name')
      .replace(/\bemail\b/g, 'u.email')
      .replace(/\bphone\b/g, 'u.phone')
      .replace(/\brole\b/g, 'u.role');
    
    const sortClauseWithAlias = sortClause
      .replace(/\bname\b/g, 'u.name')
      .replace(/\bemail\b/g, 'u.email')
      .replace(/\bphone\b/g, 'u.phone')
      .replace(/\brole\b/g, 'u.role')
      .replace(/\bstatus\b/g, 'u.status')
      .replace(/\bcreated_at\b/g, 'u.created_at')
      .replace(/\bupdated_at\b/g, 'u.updated_at');
    
    const results = await query<any[]>(
      `SELECT 
        u.id, u.name, u.email, u.phone, 
        u.role,
        COALESCE(r.description, r.name) as role_description,
        u.status, u.avatar, u.created_at, u.updated_at 
      FROM users u
      LEFT JOIN roles r ON u.role = r.id
      ${searchClauseWithAlias} ${sortClauseWithAlias} LIMIT ${pageSizeNum} OFFSET ${offset}`,
      queryParams
    );
    
    res.json({
      data: results,
      total,
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách người dùng' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      `SELECT 
        u.id, u.name, u.email, u.phone, 
        u.role,
        COALESCE(r.description, r.name) as role_description,
        u.status, u.avatar, u.created_at, u.updated_at 
      FROM users u
      LEFT JOIN roles r ON u.role = r.id
      WHERE u.id = ?`,
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
    
    // Validate role_id
    let roleId = userData.role;
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
      // Validate that the role exists
      try {
        const roleCheck = await query<any[]>(
          'SELECT id FROM roles WHERE id = ?',
          [roleId]
        );
        if (roleCheck.length === 0) {
          return res.status(400).json({ error: `Role with id ${roleId} does not exist` });
        }
      } catch (roleError: any) {
        return res.status(400).json({ error: `Invalid role_id: ${roleError.message}` });
      }
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
        roleId,
        userData.status || 'active',
        normalizeString(userData.avatar),
        createdAt,
        createdAt,
      ]
    );
    
    const newUser = await query<any[]>(
      `SELECT 
        u.id, u.name, u.email, u.phone, 
        u.role,
        COALESCE(r.description, r.name) as role_description,
        u.status, u.avatar, u.created_at, u.updated_at 
      FROM users u
      LEFT JOIN roles r ON u.role = r.id
      WHERE u.id = ?`,
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
      // Validate that the role exists
      try {
        const roleCheck = await query<any[]>(
          'SELECT id FROM roles WHERE id = ?',
          [userData.role]
        );
        if (roleCheck.length === 0) {
          return res.status(400).json({ error: `Role with id ${userData.role} does not exist` });
        }
      updates.push('role = ?');
      values.push(userData.role);
      } catch (roleError: any) {
        return res.status(400).json({ error: `Invalid role_id: ${roleError.message}` });
      }
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
      `SELECT 
        u.id, u.name, u.email, u.phone, 
        u.role,
        COALESCE(r.description, r.name) as role_description,
        u.status, u.avatar, u.created_at, u.updated_at 
      FROM users u
      LEFT JOIN roles r ON u.role = r.id
      WHERE u.id = ?`,
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
      `SELECT 
        u.id, u.name, u.email, u.phone, 
        u.role,
        COALESCE(r.description, r.name) as role_description,
        u.status, u.avatar, u.created_at, u.updated_at 
      FROM users u
      LEFT JOIN roles r ON u.role = r.id
      WHERE u.id = ?`,
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

    const updatedAt = toMySQLDateTime();

    // Handle file upload (Supabase or filesystem)
    const { filename, url } = await handleFileUpload(req.file, 'avatars');
    
    // Store filename or full URL in database depending on storage type
    // If URL is a full URL (Supabase), store the full URL, otherwise store filename
    const avatarValue = url.startsWith('http') ? url : filename;

    // Update user avatar in database
    await query(
      'UPDATE users SET avatar = ?, updated_at = ? WHERE id = ?',
      [avatarValue, updatedAt, req.userId]
    );

    // Get updated user
    const results = await query<any[]>(
      `SELECT 
        u.id, u.name, u.email, u.phone, 
        u.role,
        COALESCE(r.description, r.name) as role_description,
        u.status, u.avatar, u.created_at, u.updated_at 
      FROM users u
      LEFT JOIN roles r ON u.role = r.id
      WHERE u.id = ?`,
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

