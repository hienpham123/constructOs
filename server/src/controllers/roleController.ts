import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth.js';

// Get all roles with permissions
export const getRoles = async (req: Request, res: Response) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;

    // Build WHERE clause for search
    let whereClause = '';
    const queryParams: any[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      whereClause = 'WHERE name LIKE $1 OR description LIKE $2';
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['name', 'description', 'created_at', 'updated_at'];
    const validSortBy = allowedSortFields.includes(sortBy as string) ? sortBy : 'name';
    const validSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

    // Build and execute query
    const sql = `SELECT * FROM roles ${whereClause} ORDER BY ${validSortBy} ${validSortOrder}`.trim();
    const roles = await query<any[]>(sql, queryParams);

    // Get permissions for each role
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        const permissions = await query<any[]>(
          'SELECT permission_type, allowed FROM role_permissions WHERE role_id = ?',
          [role.id]
        );
        return {
          ...role,
          permissions: permissions.reduce((acc, perm) => {
            acc[perm.permission_type] = perm.allowed;
            return acc;
          }, {} as Record<string, boolean>),
        };
      })
    );

    res.json(rolesWithPermissions);
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách vai trò' });
  }
};

// Get role by ID
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roles = await query<any[]>(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );

    if (roles.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy vai trò' });
    }

    const role = roles[0];
    const permissions = await query<any[]>(
      'SELECT permission_type, allowed FROM role_permissions WHERE role_id = ?',
      [id]
    );

    res.json({
      ...role,
      permissions: permissions.reduce((acc, perm) => {
        acc[perm.permission_type] = perm.allowed;
        return acc;
      }, {} as Record<string, boolean>),
    });
  } catch (error: any) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin vai trò' });
  }
};

// Create new role
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tên vai trò là bắt buộc' });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert role
    await query(
      'INSERT INTO roles (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, name, description || null, createdAt, createdAt]
    );

    // Insert permissions
    if (permissions && typeof permissions === 'object') {
      const permissionTypes = [
        'view_drawing',
        'view_contract',
        'view_report',
        'view_daily_report',
      ];

      for (const permType of permissionTypes) {
        const allowed = permissions[permType] === true;
        const permId = uuidv4();
        await query(
          'INSERT INTO role_permissions (id, role_id, permission_type, allowed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [permId, id, permType, allowed, createdAt, createdAt]
        );
      }
    }

    // Return created role with permissions
    const role = await query<any[]>(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );
    const rolePermissions = await query<any[]>(
      'SELECT permission_type, allowed FROM role_permissions WHERE role_id = ?',
      [id]
    );

    res.status(201).json({
      ...role[0],
      permissions: rolePermissions.reduce((acc, perm) => {
        acc[perm.permission_type] = perm.allowed;
        return acc;
      }, {} as Record<string, boolean>),
    });
  } catch (error: any) {
    console.error('Error creating role:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Tên vai trò đã tồn tại' });
    }
    res.status(500).json({ error: 'Không thể tạo vai trò' });
  }
};

// Update role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Check if role exists
    const existingRoles = await query<any[]>(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );

    if (existingRoles.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy vai trò' });
    }

    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Update role
    if (name !== undefined || description !== undefined) {
      await query(
        'UPDATE roles SET name = COALESCE(?, name), description = COALESCE(?, description), updated_at = ? WHERE id = ?',
        [name || null, description || null, updatedAt, id]
      );
    }

    // Update permissions
    if (permissions && typeof permissions === 'object') {
      const permissionTypes = [
        'view_drawing',
        'view_contract',
        'view_report',
        'view_daily_report',
      ];

      for (const permType of permissionTypes) {
        if (permissions[permType] !== undefined) {
          const allowed = permissions[permType] === true;
          // Check if permission exists
          const existingPerms = await query<any[]>(
            'SELECT id FROM role_permissions WHERE role_id = ? AND permission_type = ?',
            [id, permType]
          );

          if (existingPerms.length > 0) {
            // Update existing permission
            await query(
              'UPDATE role_permissions SET allowed = ?, updated_at = ? WHERE role_id = ? AND permission_type = ?',
              [allowed, updatedAt, id, permType]
            );
          } else {
            // Insert new permission
            const permId = uuidv4();
            await query(
              'INSERT INTO role_permissions (id, role_id, permission_type, allowed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
              [permId, id, permType, allowed, updatedAt, updatedAt]
            );
          }
        }
      }
    }

    // Return updated role with permissions
    const role = await query<any[]>(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );
    const rolePermissions = await query<any[]>(
      'SELECT permission_type, allowed FROM role_permissions WHERE role_id = ?',
      [id]
    );

    res.json({
      ...role[0],
      permissions: rolePermissions.reduce((acc, perm) => {
        acc[perm.permission_type] = perm.allowed;
        return acc;
      }, {} as Record<string, boolean>),
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Tên vai trò đã tồn tại' });
    }
    res.status(500).json({ error: 'Không thể cập nhật vai trò' });
  }
};

// Delete role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if role is being used by any user
    const usersWithRole = await query<any[]>(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      [id]
    );

    if (usersWithRole[0]?.count > 0) {
      return res.status(400).json({
        error: 'Không thể xóa vai trò này vì đang có người dùng sử dụng',
      });
    }

    // Check if role exists
    const existingRoles = await query<any[]>(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );

    if (existingRoles.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy vai trò' });
    }

    // Delete role (permissions will be deleted by CASCADE)
    await query('DELETE FROM roles WHERE id = ?', [id]);

    res.json({ message: 'Xóa vai trò thành công' });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Không thể xóa vai trò' });
  }
};

// Get permissions for a user's role
export const getUserPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's role (which is role_id)
    const users = await query<any[]>(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const user = users[0];
    // role column in users table is actually role_id (UUID reference to roles table)
    const roleId = user.role;

    // Default permissions (no access)
    const defaultPermissions = {
      view_drawing: false,
      view_contract: false,
      view_report: false,
      view_daily_report: false,
    };

    if (!roleId) {
      // Admin role gets all permissions by default if no role_id is set
      if (user.role === 'admin') {
        return res.json({
          permissions: {
            view_drawing: true,
            view_contract: true,
            view_report: true,
            view_daily_report: true,
          },
        });
      }
      return res.json({ permissions: defaultPermissions });
    }

    // Get permissions for the role
    const permissions = await query<any[]>(
      'SELECT permission_type, allowed FROM role_permissions WHERE role_id = ?',
      [roleId]
    );

    const permissionsMap = permissions.reduce((acc, perm) => {
      acc[perm.permission_type] = perm.allowed === 1 || perm.allowed === true;
      return acc;
    }, defaultPermissions as Record<string, boolean>);

    res.json({ permissions: permissionsMap });
  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Không thể lấy quyền của người dùng' });
  }
};

