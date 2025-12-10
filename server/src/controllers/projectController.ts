import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, toMySQLDate, buildSearchClause, buildSortClause } from '../utils/dataHelpers.js';
import type { Project, ProjectManager } from '../types/index.js';

// Helper function to get project managers from manager_ids field
async function getProjectManagers(managerIdsJson: string | null): Promise<ProjectManager[]> {
  if (!managerIdsJson) {
    return [];
  }
  
  let managerIds: string[] = [];
  try {
    managerIds = JSON.parse(managerIdsJson);
    if (!Array.isArray(managerIds)) {
      return [];
    }
  } catch (e) {
    return [];
  }
  
  if (managerIds.length === 0) {
    return [];
  }
  
  // Get user details for each manager ID
  const placeholders = managerIds.map(() => '?').join(',');
  const users = await query<any[]>(
    `SELECT id, name, email, avatar FROM users WHERE id IN (${placeholders})`,
    managerIds
  );
  
  return users.map((u) => ({
    id: u.id,
    userId: u.id,
    userName: u.name || '',
    userEmail: u.email || undefined,
    userAvatar: u.avatar || undefined,
  }));
}

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
    
    // For each project, get managers from manager_ids field
    const projectsWithRelations = await Promise.all(
      results.map(async (project) => {
        // Get managers from manager_ids JSON field
        const managers = await getProjectManagers(project.manager_ids);
        
        // Backward compatibility: get manager name from manager_id if no managers
        let managerName = '';
        let managerId = project.manager_id;
        if (managers.length === 0 && project.manager_id) {
          const manager = await query<any[]>(
            'SELECT name FROM users WHERE id = ?',
            [project.manager_id]
          );
          managerName = manager.length > 0 ? manager[0].name : '';
        } else if (managers.length > 0) {
          managerId = managers[0].userId;
          managerName = managers.map(m => m.userName).join(', ');
        }
        
        return {
          ...project,
          startDate: project.start_date,
          endDate: project.end_date,
          actualCost: project.actual_cost,
          managerId,
          createdAt: project.created_at,
          investor: project.investor || project.client || '',
          contactPerson: project.contact_person || null,
          stages: [],
          documents: [],
          managerName,
          managers,
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

/**
 * Tính và cập nhật tiến độ dự án tự động khi lấy project
 */
async function refreshProjectProgress(projectId: string): Promise<void> {
  try {
    const { updateProjectProgress } = await import('../utils/projectProgress.js');
    await updateProjectProgress(projectId);
  } catch (error) {
    console.warn('⚠️ Lỗi cập nhật tiến độ dự án:', error);
    // Không throw để không ảnh hưởng đến response
  }
}

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Tự động tính và cập nhật tiến độ dự án
    await refreshProjectProgress(id);
    
    const results = await query<any[]>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy dự án' });
    }
    
    const project = results[0];
    
    // Get managers from manager_ids JSON field
    const managers = await getProjectManagers(project.manager_ids);
    
    // Backward compatibility: get manager name from manager_id if no managers
    let managerName = '';
    let managerId = project.manager_id;
    if (managers.length === 0 && project.manager_id) {
      const manager = await query<any[]>(
        'SELECT name FROM users WHERE id = ?',
        [project.manager_id]
      );
      managerName = manager.length > 0 ? manager[0].name : '';
    } else if (managers.length > 0) {
      managerId = managers[0].userId;
      managerName = managers.map(m => m.userName).join(', ');
    }
    
    res.json({
      ...project,
      startDate: project.start_date,
      endDate: project.end_date,
      actualCost: project.actual_cost,
      managerId,
      createdAt: project.created_at,
      investor: project.investor || project.client || '',
      contactPerson: project.contact_person || null,
      stages: [],
      documents: [],
      managerName,
      managers,
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
    
    // Get manager IDs from managers array or fallback to managerId
    const managerIds = projectData.managers && Array.isArray(projectData.managers) 
      ? projectData.managers.map((m: any) => typeof m === 'string' ? m : m.id || m.userId)
      : projectData.managerId ? [projectData.managerId] : [];
    
    // Use first manager as manager_id for backward compatibility
    const primaryManagerId = managerIds.length > 0 ? managerIds[0] : null;
    
    // Convert managerIds array to JSON string
    const managerIdsJson = JSON.stringify(managerIds);
    
    await query(
      `INSERT INTO projects (
        id, code, name, description, client, investor, contact_person, location, start_date, end_date,
        status, progress, budget, actual_cost, manager_id, manager_ids, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        code,
        projectData.name,
        projectData.description || null,
        investor,
        investor,
        projectData.contactPerson || null,
        projectData.location,
        toMySQLDate(projectData.startDate),
        toMySQLDate(projectData.endDate),
        projectData.status || 'quoting',
        0, // Tiến độ ban đầu = 0, sẽ được tính tự động khi có tasks
        projectData.budget || 0,
        projectData.actualCost || 0,
        primaryManagerId,
        managerIdsJson,
        createdAt,
        createdAt,
      ]
    );
    
    const newProject = await query<any[]>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    const createdProject = newProject[0];
    const managers = await getProjectManagers(createdProject.manager_ids);
    const managerName = managers.length > 0 ? managers.map(m => m.userName).join(', ') : '';
    
    res.status(201).json({
      ...createdProject,
      startDate: createdProject.start_date,
      endDate: createdProject.end_date,
      actualCost: createdProject.actual_cost,
      managerId: primaryManagerId || createdProject.manager_id,
      createdAt: createdProject.created_at,
      investor: createdProject.investor || createdProject.client || '',
      contactPerson: createdProject.contact_person || null,
      stages: [],
      documents: [],
      managerName,
      managers,
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
    
    // Get manager IDs from managers array or fallback to managerId
    const managerIds = projectData.managers && Array.isArray(projectData.managers)
      ? projectData.managers.map((m: any) => typeof m === 'string' ? m : m.id || m.userId)
      : projectData.managerId ? [projectData.managerId] : [];
    
    // Use first manager as manager_id for backward compatibility
    const primaryManagerId = managerIds.length > 0 ? managerIds[0] : null;
    
    // Convert managerIds array to JSON string
    const managerIdsJson = JSON.stringify(managerIds);
    
    // Tính tiến độ tự động dựa trên tasks (không cho phép nhập thủ công)
    await refreshProjectProgress(id);
    
    // Lấy tiến độ đã được tính tự động
    const projectWithProgress = await query<any[]>(
      'SELECT progress FROM projects WHERE id = ?',
      [id]
    );
    const autoProgress = projectWithProgress[0]?.progress || 0;
    
    await query(
      `UPDATE projects SET
        name = ?, description = ?, investor = ?, contact_person = ?, location = ?,
        start_date = ?, end_date = ?, status = ?, progress = ?,
        budget = ?, actual_cost = ?, manager_id = ?, manager_ids = ?, updated_at = ?
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
        autoProgress, // Sử dụng tiến độ tự động, không dùng từ request
        projectData.budget,
        projectData.actualCost,
        primaryManagerId,
        managerIdsJson,
        updatedAt,
        id,
      ]
    );
    
    const updated = await query<any[]>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    const updatedProject = updated[0];
    const managers = await getProjectManagers(updatedProject.manager_ids);
    const managerName = managers.length > 0 ? managers.map(m => m.userName).join(', ') : '';
    
    res.json({
      ...updatedProject,
      startDate: updatedProject.start_date,
      endDate: updatedProject.end_date,
      actualCost: updatedProject.actual_cost,
      managerId: primaryManagerId || updatedProject.manager_id,
      createdAt: updatedProject.created_at,
      investor: updatedProject.investor || updatedProject.client || '',
      contactPerson: updatedProject.contact_person || null,
      stages: [],
      documents: [],
      managerName,
      managers,
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
