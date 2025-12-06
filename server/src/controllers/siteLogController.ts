import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, toMySQLDate, normalizeProject } from '../utils/dataHelpers.js';
import type { SiteLog } from '../types/index.js';

export const getSiteLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, pageSize, pageIndex } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Build WHERE clause
    let whereClause = '';
    let params: any[] = [];
    
    if (projectId) {
      whereClause = 'WHERE sl.project_id = ?';
      params.push(projectId as string);
    }
    
    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM site_logs sl
      ${whereClause}
    `;
    const countResults = await query<any[]>(countSql, params);
    const total = countResults[0]?.total || 0;
    
    // Get paginated data
    // Note: LIMIT and OFFSET cannot use placeholders in MySQL, so we inject the values directly
    // but we've already validated them as numbers above
    let sql = `
      SELECT 
        sl.*,
        u.name as created_by_name
      FROM site_logs sl
      LEFT JOIN users u ON sl.created_by = u.id
      ${whereClause}
      ORDER BY sl.date DESC, sl.created_at DESC
      LIMIT ${pageSizeNum} OFFSET ${offset}
    `;
    
    const results = await query<any[]>(sql, params);
    
    // Convert JSON photos to array
    const logs = results.map((log) => ({
      ...log,
      photos: log.photos ? (typeof log.photos === 'string' ? JSON.parse(log.photos) : log.photos) : [],
    }));
    
    res.json({
      data: logs,
      total,
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching site logs:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách nhật ký công trường' });
  }
};

export const getSiteLogById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      `SELECT 
        sl.*,
        u.name as created_by_name
      FROM site_logs sl
      LEFT JOIN users u ON sl.created_by = u.id
      WHERE sl.id = ?`,
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhật ký công trường' });
    }
    
    const log = results[0];
    
    // Convert JSON photos to array
    log.photos = log.photos ? (typeof log.photos === 'string' ? JSON.parse(log.photos) : log.photos) : [];
    
    res.json(log);
  } catch (error: any) {
    console.error('Error fetching site log:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin nhật ký công trường' });
  }
};

export const createSiteLog = async (req: AuthRequest, res: Response) => {
  try {
    const logData = req.body;
    
    // Validation
    if (!logData.projectId) {
      return res.status(400).json({ error: 'Dự án là bắt buộc' });
    }
    if (!logData.date) {
      return res.status(400).json({ error: 'Ngày là bắt buộc' });
    }
    if (!logData.weather) {
      return res.status(400).json({ error: 'Thời tiết là bắt buộc' });
    }
    if (!logData.workDescription) {
      return res.status(400).json({ error: 'Mô tả công việc là bắt buộc' });
    }
    
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    // Normalize project data and validate project exists
    const { projectId, projectName } = await normalizeProject(
      logData.projectId,
      logData.projectName,
      query
    );
    
    if (!projectId) {
      return res.status(400).json({ error: 'Dự án là bắt buộc' });
    }
    
    // Validate project exists - normalizeProject returns null for projectName if project doesn't exist
    let finalProjectName = projectName;
    if (!projectName) {
      // Double check by querying directly
      const projectCheck = await query<any[]>(
        'SELECT id, name FROM projects WHERE id = ?',
        [projectId]
      );
      
      if (projectCheck.length === 0) {
        console.error('Project not found - projectId:', logData.projectId);
        console.error('Full request body:', JSON.stringify(logData, null, 2));
        return res.status(400).json({ error: 'Dự án không tồn tại' });
      }
      
      // Use the name from direct query if project exists
      finalProjectName = projectCheck[0].name || '';
    }
    
    // Get userId from JWT token (required for foreign key constraint)
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }
    
    // Convert photos array to JSON
    const photosJson = logData.photos && Array.isArray(logData.photos) 
      ? JSON.stringify(logData.photos) 
      : JSON.stringify([]);
    
    await query(
      `INSERT INTO site_logs (
        id, project_id, project_name, date, weather, work_description,
        issues, photos, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        finalProjectName,
        toMySQLDate(logData.date),
        logData.weather,
        logData.workDescription,
        logData.issues || null,
        photosJson,
        userId, // Use userId from JWT token, not from request body
        createdAt,
        createdAt,
      ]
    );
    
    const newLog = await query<any[]>(
      `SELECT 
        sl.*,
        u.name as created_by_name
      FROM site_logs sl
      LEFT JOIN users u ON sl.created_by = u.id
      WHERE sl.id = ?`,
      [id]
    );
    
    const log = newLog[0];
    log.photos = log.photos ? (typeof log.photos === 'string' ? JSON.parse(log.photos) : log.photos) : [];
    
    res.status(201).json(log);
  } catch (error: any) {
    console.error('Error creating site log:', error);
    const errorMessage = error.code === 'ER_NO_REFERENCED_ROW_2' 
      ? 'Dự án không tồn tại'
      : error.message?.includes('Duplicate') 
      ? 'Nhật ký đã tồn tại'
      : 'Không thể tạo nhật ký công trường';
    res.status(500).json({ error: errorMessage });
  }
};

export const updateSiteLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const logData = req.body;
    const updatedAt = toMySQLDateTime();
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM site_logs WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhật ký công trường' });
    }
    
    // Normalize project data and validate project exists if projectId is provided
    let projectId = logData.projectId || existing[0].project_id;
    let projectName = logData.projectName || existing[0].project_name;
    
    if (logData.projectId) {
      const normalized = await normalizeProject(
        logData.projectId,
        logData.projectName,
        query
      );
      projectId = normalized.projectId || projectId;
      projectName = normalized.projectName || projectName;
      
      if (normalized.projectId && !normalized.projectName) {
        return res.status(400).json({ error: 'Dự án không tồn tại' });
      }
    }
    
    // Convert photos array to JSON
    const photosJson = logData.photos && Array.isArray(logData.photos) 
      ? JSON.stringify(logData.photos) 
      : JSON.stringify([]);
    
    await query(
      `UPDATE site_logs SET
        project_id = ?, project_name = ?, date = ?, weather = ?,
        work_description = ?, issues = ?, photos = ?, updated_at = ?
      WHERE id = ?`,
      [
        projectId,
        projectName,
        toMySQLDate(logData.date),
        logData.weather,
        logData.workDescription,
        logData.issues || null,
        photosJson,
        updatedAt,
        id,
      ]
    );
    
    const updated = await query<any[]>(
      `SELECT 
        sl.*,
        u.name as created_by_name
      FROM site_logs sl
      LEFT JOIN users u ON sl.created_by = u.id
      WHERE sl.id = ?`,
      [id]
    );
    
    const log = updated[0];
    log.photos = log.photos ? (typeof log.photos === 'string' ? JSON.parse(log.photos) : log.photos) : [];
    
    res.json(log);
  } catch (error: any) {
    console.error('Error updating site log:', error);
    res.status(500).json({ error: 'Không thể cập nhật nhật ký công trường' });
  }
};

export const deleteSiteLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM site_logs WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhật ký công trường' });
    }
    
    await query('DELETE FROM site_logs WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting site log:', error);
    res.status(500).json({ error: 'Không thể xóa nhật ký công trường' });
  }
};
