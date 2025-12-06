import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, toMySQLDate } from '../utils/dataHelpers.js';
import type { SiteLog } from '../types/index.js';

export const getSiteLogs = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    
    let sql = 'SELECT * FROM site_logs ORDER BY date DESC, created_at DESC';
    let params: any[] = [];
    
    if (projectId) {
      sql = 'SELECT * FROM site_logs WHERE project_id = ? ORDER BY date DESC, created_at DESC';
      params = [projectId as string];
    }
    
    const results = await query<any[]>(sql, params);
    
    // Convert JSON photos to array
    const logs = results.map((log) => ({
      ...log,
      photos: log.photos ? (typeof log.photos === 'string' ? JSON.parse(log.photos) : log.photos) : [],
    }));
    
    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching site logs:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách nhật ký công trường' });
  }
};

export const getSiteLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      'SELECT * FROM site_logs WHERE id = ?',
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

export const createSiteLog = async (req: Request, res: Response) => {
  try {
    const logData = req.body;
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    // Get project name if projectId is provided
    let projectName = logData.projectName;
    if (logData.projectId && !projectName) {
      const project = await query<any[]>(
        'SELECT name FROM projects WHERE id = ?',
        [logData.projectId]
      );
      projectName = project.length > 0 ? project[0].name : '';
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
        logData.projectId,
        projectName || '',
        toMySQLDate(logData.date),
        logData.weather,
        logData.workDescription,
        logData.issues || null,
        photosJson,
        logData.createdBy,
        createdAt,
        createdAt,
      ]
    );
    
    const newLog = await query<any[]>(
      'SELECT * FROM site_logs WHERE id = ?',
      [id]
    );
    
    const log = newLog[0];
    log.photos = log.photos ? (typeof log.photos === 'string' ? JSON.parse(log.photos) : log.photos) : [];
    
    res.status(201).json(log);
  } catch (error: any) {
    console.error('Error creating site log:', error);
    res.status(500).json({ error: 'Không thể tạo nhật ký công trường' });
  }
};

export const updateSiteLog = async (req: Request, res: Response) => {
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
        logData.projectId,
        logData.projectName,
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
      'SELECT * FROM site_logs WHERE id = ?',
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

export const deleteSiteLog = async (req: Request, res: Response) => {
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
