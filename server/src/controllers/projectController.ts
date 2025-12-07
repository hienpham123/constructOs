import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, toMySQLDate, buildSearchClause, buildSortClause } from '../utils/dataHelpers.js';
import type { Project } from '../types/index.js';

export const getProjects = async (req: Request, res: Response) => {
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
      ['name', 'description', 'investor', 'client', 'contact_person', 'location'],
      queryParams
    );
    
    const allowedSortFields = ['name', 'investor', 'client', 'location', 'status', 'progress', 'budget', 'actual_cost', 'start_date', 'end_date', 'created_at', 'updated_at'];
    const sortClause = buildSortClause(sortBy as string, allowedSortFields, 'created_at', sortOrder as string);
    
    // Get total count with search
    const countQuery = `SELECT COUNT(*) as total FROM projects ${searchClause}`;
    const countResults = await query<any[]>(countQuery, queryParams);
    const total = countResults[0]?.total || 0;
    
    // Get paginated data
    // Note: LIMIT and OFFSET cannot use placeholders in MySQL, so we inject the values directly
    // but we've already validated them as numbers above
    const results = await query<any[]>(
      `SELECT * FROM projects ${searchClause} ${sortClause} LIMIT ${pageSizeNum} OFFSET ${offset}`,
      queryParams
    );
    
    // For each project, get manager name (stages and documents are no longer loaded)
    const projectsWithRelations = await Promise.all(
      results.map(async (project) => {
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
          investor: project.investor || project.client || '',
          contactPerson: project.contact_person || null,
          stages: [],
          documents: [],
          managerName,
        };
      })
    );
    
    res.json({
      data: projectsWithRelations,
      total,
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
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
    
    // Get manager name (stages and documents are no longer loaded)
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
      investor: project.investor || project.client || '',
      contactPerson: project.contact_person || null,
      stages: [],
      documents: [],
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
    
    // Generate unique code from UUID (first 8 chars) to satisfy NOT NULL UNIQUE constraint
    const code = id.substring(0, 8).toUpperCase();
    const investor = projectData.investor || projectData.client || '';
    
    await query(
      `INSERT INTO projects (
        id, code, name, description, client, investor, contact_person, location, start_date, end_date,
        status, progress, budget, actual_cost, manager_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        code, // code - use first 8 chars of UUID for unique constraint
        projectData.name,
        projectData.description || null,
        investor, // client - use investor value for backward compatibility
        investor,
        projectData.contactPerson || null,
        projectData.location,
        toMySQLDate(projectData.startDate),
        toMySQLDate(projectData.endDate),
        projectData.status || 'quoting',
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
      investor: createdProject.investor || createdProject.client || '',
      contactPerson: createdProject.contact_person || null,
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
        name = ?, description = ?, investor = ?, contact_person = ?, location = ?,
        start_date = ?, end_date = ?, status = ?, progress = ?,
        budget = ?, actual_cost = ?, manager_id = ?, updated_at = ?
      WHERE id = ?`,
      [
        projectData.name,
        projectData.description || null,
        projectData.investor || projectData.client || '',
        projectData.contactPerson || null,
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
    
    const updatedProject = updated[0];
    
    // Get manager name (stages and documents are no longer loaded)
    let managerName = '';
    if (updatedProject.manager_id) {
      const manager = await query<any[]>(
        'SELECT name FROM users WHERE id = ?',
        [updatedProject.manager_id]
      );
      managerName = manager.length > 0 ? manager[0].name : '';
    }
    
    res.json({
      ...updatedProject,
      startDate: updatedProject.start_date,
      endDate: updatedProject.end_date,
      actualCost: updatedProject.actual_cost,
      managerId: updatedProject.manager_id,
      createdAt: updatedProject.created_at,
      investor: updatedProject.investor || updatedProject.client || '',
      contactPerson: updatedProject.contact_person || null,
      stages: [],
      documents: [],
      managerName,
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
    
    // Delete project (related data will be automatically deleted via CASCADE)
    // Note: project_stages and project_documents will be automatically deleted via CASCADE
    await query('DELETE FROM projects WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Không thể xóa dự án' });
  }
};
