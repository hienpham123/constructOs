import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, toMySQLDate } from '../utils/dataHelpers.js';
import type { Project } from '../types/index.js';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const results = await query<any[]>(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    
    // For each project, get stages and documents
    const projectsWithRelations = await Promise.all(
      results.map(async (project) => {
        const stages = await query<any[]>(
          'SELECT * FROM project_stages WHERE project_id = ? ORDER BY start_date',
          [project.id]
        );
        
        // Get checklists for each stage
        const stagesWithChecklists = await Promise.all(
          stages.map(async (stage) => {
            const checklists = await query<any[]>(
              'SELECT * FROM stage_checklists WHERE stage_id = ?',
              [stage.id]
            );
            return { ...stage, checklist: checklists };
          })
        );
        
        const documents = await query<any[]>(
          'SELECT * FROM project_documents WHERE project_id = ? ORDER BY uploaded_at DESC',
          [project.id]
        );
        
        // Get manager name
        let managerName = '';
        if (project.manager_id) {
          const manager = await query<any[]>(
            'SELECT name FROM users WHERE id = ?',
            [project.manager_id]
          );
          managerName = manager.length > 0 ? manager[0].name : '';
        }
        
        return {
          ...project,
          startDate: project.start_date,
          endDate: project.end_date,
          actualCost: project.actual_cost,
          managerId: project.manager_id,
          createdAt: project.created_at,
          stages: stagesWithChecklists,
          documents,
          managerName,
        };
      })
    );
    
    res.json(projectsWithRelations);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách dự án' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy dự án' });
    }
    
    const project = results[0];
    
    // Get stages with checklists
    const stages = await query<any[]>(
      'SELECT * FROM project_stages WHERE project_id = ? ORDER BY start_date',
      [id]
    );
    
    const stagesWithChecklists = await Promise.all(
      stages.map(async (stage) => {
        const checklists = await query<any[]>(
          'SELECT * FROM stage_checklists WHERE stage_id = ?',
          [stage.id]
        );
        return { ...stage, checklist: checklists };
      })
    );
    
    // Get documents
    const documents = await query<any[]>(
      'SELECT * FROM project_documents WHERE project_id = ? ORDER BY uploaded_at DESC',
      [id]
    );
    
    // Get manager name
    let managerName = '';
    if (project.manager_id) {
      const manager = await query<any[]>(
        'SELECT name FROM users WHERE id = ?',
        [project.manager_id]
      );
      managerName = manager.length > 0 ? manager[0].name : '';
    }
    
    res.json({
      ...project,
      startDate: project.start_date,
      endDate: project.end_date,
      actualCost: project.actual_cost,
      managerId: project.manager_id,
      createdAt: project.created_at,
      stages: stagesWithChecklists,
      documents,
      managerName,
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin dự án' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const projectData = req.body;
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    await query(
      `INSERT INTO projects (
        id, code, name, description, client, location, start_date, end_date,
        status, progress, budget, actual_cost, manager_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectData.code,
        projectData.name,
        projectData.description || null,
        projectData.client,
        projectData.location,
        toMySQLDate(projectData.startDate),
        toMySQLDate(projectData.endDate),
        projectData.status || 'planning',
        projectData.progress || 0,
        projectData.budget || 0,
        projectData.actualCost || 0,
        projectData.managerId || null,
        createdAt,
        createdAt,
      ]
    );
    
    const newProject = await query<any[]>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    const createdProject = newProject[0];
    res.status(201).json({
      ...createdProject,
      startDate: createdProject.start_date,
      endDate: createdProject.end_date,
      actualCost: createdProject.actual_cost,
      managerId: createdProject.manager_id,
      createdAt: createdProject.created_at,
      stages: [],
      documents: [],
      managerName: '',
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Không thể tạo dự án' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectData = req.body;
    const updatedAt = toMySQLDateTime();
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy dự án' });
    }
    
    await query(
      `UPDATE projects SET
        code = ?, name = ?, description = ?, client = ?, location = ?,
        start_date = ?, end_date = ?, status = ?, progress = ?,
        budget = ?, actual_cost = ?, manager_id = ?, updated_at = ?
      WHERE id = ?`,
      [
        projectData.code,
        projectData.name,
        projectData.description || null,
        projectData.client,
        projectData.location,
        toMySQLDate(projectData.startDate),
        toMySQLDate(projectData.endDate),
        projectData.status,
        projectData.progress,
        projectData.budget,
        projectData.actualCost,
        projectData.managerId || null,
        updatedAt,
        id,
      ]
    );
    
    const updated = await query<any[]>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    // Get related data
    const stages = await query<any[]>(
      'SELECT * FROM project_stages WHERE project_id = ?',
      [id]
    );
    const documents = await query<any[]>(
      'SELECT * FROM project_documents WHERE project_id = ?',
      [id]
    );
    
    const updatedProject = updated[0];
    res.json({
      ...updatedProject,
      startDate: updatedProject.start_date,
      endDate: updatedProject.end_date,
      actualCost: updatedProject.actual_cost,
      managerId: updatedProject.manager_id,
      createdAt: updatedProject.created_at,
      stages,
      documents,
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Không thể cập nhật dự án' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy dự án' });
    }
    
    // Delete related data first (or use CASCADE)
    await query('DELETE FROM project_stages WHERE project_id = ?', [id]);
    await query('DELETE FROM project_documents WHERE project_id = ?', [id]);
    await query('DELETE FROM projects WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Không thể xóa dự án' });
  }
};
