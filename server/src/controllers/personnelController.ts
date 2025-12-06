import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { normalizeString, normalizeProject, toMySQLDateTime, toMySQLDate, buildSearchClause, buildSortClause } from '../utils/dataHelpers.js';
import bcrypt from 'bcryptjs';
import type { Personnel } from '../types/index.js';

export const getPersonnel = async (req: Request, res: Response) => {
  try {
    const { pageSize, pageIndex, search, sortBy, sortOrder } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Build search and sort clauses (using users table, map position to role)
    const queryParams: any[] = [];
    const searchFields = ['name', 'code', 'phone', 'email', 'role', 'team', 'project_name', 'status'];
    const searchClause = buildSearchClause(
      search as string,
      searchFields,
      queryParams
    );
    
    // Map sort fields: position -> role
    let mappedSortBy = sortBy as string;
    if (mappedSortBy === 'position') {
      mappedSortBy = 'role';
    }
    const allowedSortFields = ['name', 'code', 'phone', 'email', 'role', 'team', 'project_name', 'status', 'hire_date', 'created_at', 'updated_at'];
    const sortClause = buildSortClause(mappedSortBy, allowedSortFields, 'created_at', sortOrder as string);
    
    // Get total count with search
    // Update search clause to use table alias for count query
    const countSearchClause = searchClause
      .replace(/\bname\b/g, 'u.name')
      .replace(/\bcode\b/g, 'u.code')
      .replace(/\bphone\b/g, 'u.phone')
      .replace(/\bemail\b/g, 'u.email')
      .replace(/\brole\b/g, 'u.role')
      .replace(/\bteam\b/g, 'u.team')
      .replace(/\bproject_name\b/g, 'u.project_name')
      .replace(/\bstatus\b/g, 'u.status');
    
    const countQuery = `SELECT COUNT(*) as total FROM users u ${countSearchClause}`;
    const countResults = await query<any[]>(countQuery, queryParams);
    const total = countResults[0]?.total || 0;
    
    // Get paginated data with role description
    // Note: LIMIT and OFFSET cannot use placeholders in MySQL, so we inject the values directly
    // but we've already validated them as numbers above
    // Map role to position for backward compatibility
    // Update search clause to use table aliases
    const searchClauseWithAlias = searchClause
      .replace(/\bname\b/g, 'u.name')
      .replace(/\bcode\b/g, 'u.code')
      .replace(/\bphone\b/g, 'u.phone')
      .replace(/\bemail\b/g, 'u.email')
      .replace(/\brole\b/g, 'u.role')
      .replace(/\bteam\b/g, 'u.team')
      .replace(/\bproject_name\b/g, 'u.project_name')
      .replace(/\bstatus\b/g, 'u.status');
    
    // Update sort clause to use table aliases
    const sortClauseWithAlias = sortClause
      .replace(/\bname\b/g, 'u.name')
      .replace(/\bcode\b/g, 'u.code')
      .replace(/\bphone\b/g, 'u.phone')
      .replace(/\bemail\b/g, 'u.email')
      .replace(/\brole\b/g, 'u.role')
      .replace(/\bteam\b/g, 'u.team')
      .replace(/\bproject_name\b/g, 'u.project_name')
      .replace(/\bstatus\b/g, 'u.status')
      .replace(/\bhire_date\b/g, 'u.hire_date')
      .replace(/\bcreated_at\b/g, 'u.created_at')
      .replace(/\bupdated_at\b/g, 'u.updated_at');
    
    const results = await query<any[]>(
      `SELECT 
        u.id, u.code, u.name, u.phone, u.email, 
        u.role as position,
        COALESCE(r.description, r.name) as position_description,
        u.team, u.project_id, u.project_name, u.status, u.hire_date, 
        u.created_at, u.updated_at
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
    console.error('Error fetching personnel:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách nhân sự' });
  }
};

export const getPersonnelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      `SELECT 
        u.id, u.code, u.name, u.phone, u.email, 
        u.role as position,
        COALESCE(r.description, r.name) as position_description,
        u.team, u.project_id, u.project_name, u.status, u.hire_date, 
        u.created_at, u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role = r.id
      WHERE u.id = ?`,
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhân sự' });
    }
    
    res.json(results[0]);
  } catch (error: any) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách nhân sự' });
  }
};

export const createPersonnel = async (req: Request, res: Response) => {
  try {
    const personnelData = req.body;
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    // Normalize project data
    const { projectId, projectName } = await normalizeProject(
      personnelData.projectId,
      personnelData.projectName,
      query
    );
    
    // Position is now role_id, validate it exists in roles table
    let positionValue = personnelData.position;
    if (!positionValue) {
      // Try to get a default role (first role in database)
      try {
        const defaultRole = await query<any[]>(
          'SELECT id FROM roles LIMIT 1'
        );
        if (defaultRole.length > 0) {
          positionValue = defaultRole[0].id;
        } else {
          throw new Error('No roles found in database. Please create at least one role first.');
        }
      } catch (roleError) {
        throw new Error('Position (role_id) is required and no default role found');
      }
    } else {
      // Validate that the role exists
      try {
        const roleCheck = await query<any[]>(
          'SELECT id FROM roles WHERE id = ?',
          [positionValue]
        );
        if (roleCheck.length === 0) {
          throw new Error(`Role with id ${positionValue} does not exist`);
        }
      } catch (roleError: any) {
        throw new Error(`Invalid role_id: ${roleError.message}`);
      }
    }
    
    // Auto-generate code if not provided
    let code = personnelData.code;
    if (!code) {
      // Generate code from name and timestamp, ensure uniqueness
      const namePrefix = personnelData.name ? personnelData.name.substring(0, 3).toUpperCase().replace(/\s/g, '') : 'NS';
      let attempt = 0;
      do {
        code = `${namePrefix}-${Date.now().toString().slice(-6)}${attempt > 0 ? `-${attempt}` : ''}`;
        const existingCode = await query<any[]>(
          'SELECT id FROM users WHERE code = ?',
          [code]
        );
        if (existingCode.length === 0) break;
        attempt++;
      } while (attempt < 10);
    }
    
    // Use defaults for status and hire_date if not provided
    const status = personnelData.status || 'active';
    const hireDate = personnelData.hireDate ? toMySQLDate(personnelData.hireDate) : toMySQLDate(new Date());
    
    // Generate email if not provided (required in users table)
    const email = personnelData.email || `personnel_${id}@temp.local`;
    
    // Generate default password hash (123456)
    const defaultPasswordHash = await bcrypt.hash('123456', 10);
    
    await query(
      `INSERT INTO users (
        id, code, name, phone, email, password_hash, role, team, 
        project_id, project_name, status, hire_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        code,
        personnelData.name,
        personnelData.phone,
        email,
        defaultPasswordHash,
        positionValue,
        normalizeString(personnelData.team || null),
        projectId,
        projectName,
        status,
        hireDate,
        createdAt,
        createdAt,
      ]
    );
    
    const newPersonnel = await query<any[]>(
      `SELECT 
        u.id, u.code, u.name, u.phone, u.email, 
        u.role as position,
        COALESCE(r.description, r.name) as position_description,
        u.team, u.project_id, u.project_name, u.status, u.hire_date, 
        u.created_at, u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role = r.id
      WHERE u.id = ?`,
      [id]
    );
    
    res.status(201).json(newPersonnel[0]);
  } catch (error: any) {
    console.error('Error creating personnel:', error);
    console.error('Request data:', req.body);
    res.status(500).json({ 
      error: 'Không thể tạo nhân sự',
      message: error.message 
    });
  }
};

export const updatePersonnel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const personnelData = req.body;
    const updatedAt = toMySQLDateTime();
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhân sự' });
    }
    
    // Normalize project data
    const { projectId, projectName } = await normalizeProject(
      personnelData.projectId,
      personnelData.projectName,
      query
    );
    
    // Position is now role_id, use existing if not provided, otherwise validate
    let positionValue = existing[0].role;
    if (personnelData.position) {
      // Validate that the role exists
      try {
        const roleCheck = await query<any[]>(
          'SELECT id FROM roles WHERE id = ?',
          [personnelData.position]
        );
        if (roleCheck.length === 0) {
          throw new Error(`Role with id ${personnelData.position} does not exist`);
        }
        positionValue = personnelData.position;
      } catch (roleError: any) {
        throw new Error(`Invalid role_id: ${roleError.message}`);
      }
    }
    
    // Use existing values if not provided
    const code = personnelData.code !== undefined ? personnelData.code : existing[0].code;
    const status = personnelData.status !== undefined ? personnelData.status : existing[0].status;
    const hireDate = personnelData.hireDate ? toMySQLDate(personnelData.hireDate) : existing[0].hire_date;
    
    await query(
      `UPDATE users SET
        code = ?, name = ?, phone = ?, email = ?, role = ?, team = ?,
        project_id = ?, project_name = ?, status = ?, hire_date = ?, updated_at = ?
      WHERE id = ?`,
      [
        code,
        personnelData.name,
        personnelData.phone,
        normalizeString(personnelData.email || existing[0].email),
        positionValue,
        normalizeString(personnelData.team !== undefined ? personnelData.team : existing[0].team || null),
        projectId,
        projectName,
        status,
        hireDate,
        updatedAt,
        id,
      ]
    );
    
    const updated = await query<any[]>(
      `SELECT 
        u.id, u.code, u.name, u.phone, u.email, 
        u.role as position,
        COALESCE(r.description, r.name) as position_description,
        u.team, u.project_id, u.project_name, u.status, u.hire_date, 
        u.created_at, u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role = r.id
      WHERE u.id = ?`,
      [id]
    );
    
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating personnel:', error);
    console.error('Request data:', req.body);
    res.status(500).json({ 
      error: 'Không thể cập nhật nhân sự',
      message: error.message 
    });
  }
};

export const deletePersonnel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhân sự' });
    }
    
    await query('DELETE FROM users WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting personnel:', error);
    res.status(500).json({ error: 'Không thể xóa nhân sự' });
  }
};
