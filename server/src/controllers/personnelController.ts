import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { normalizeString, normalizeProject, toMySQLDateTime, toMySQLDate } from '../utils/dataHelpers.js';
import type { Personnel } from '../types/index.js';

export const getPersonnel = async (req: Request, res: Response) => {
  try {
    const results = await query<any[]>(
      'SELECT * FROM personnel ORDER BY created_at DESC'
    );
    res.json(results);
  } catch (error: any) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách nhân sự' });
  }
};

export const getPersonnelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      'SELECT * FROM personnel WHERE id = ?',
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
    
    await query(
      `INSERT INTO personnel (
        id, code, name, phone, email, position, team, 
        project_id, project_name, status, hire_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        personnelData.code,
        personnelData.name,
        personnelData.phone,
        normalizeString(personnelData.email),
        personnelData.position,
        normalizeString(personnelData.team),
        projectId,
        projectName,
        personnelData.status || 'active',
        toMySQLDate(personnelData.hireDate),
        createdAt,
        createdAt,
      ]
    );
    
    const newPersonnel = await query<any[]>(
      'SELECT * FROM personnel WHERE id = ?',
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
      'SELECT * FROM personnel WHERE id = ?',
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
    
    await query(
      `UPDATE personnel SET
        code = ?, name = ?, phone = ?, email = ?, position = ?, team = ?,
        project_id = ?, project_name = ?, status = ?, hire_date = ?, updated_at = ?
      WHERE id = ?`,
      [
        personnelData.code,
        personnelData.name,
        personnelData.phone,
        normalizeString(personnelData.email),
        personnelData.position,
        normalizeString(personnelData.team),
        projectId,
        projectName,
        personnelData.status,
        toMySQLDate(personnelData.hireDate),
        updatedAt,
        id,
      ]
    );
    
    const updated = await query<any[]>(
      'SELECT * FROM personnel WHERE id = ?',
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
      'SELECT * FROM personnel WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhân sự' });
    }
    
    await query('DELETE FROM personnel WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting personnel:', error);
    res.status(500).json({ error: 'Không thể xóa nhân sự' });
  }
};
