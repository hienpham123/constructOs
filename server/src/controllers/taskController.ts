import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/db.js';
import { toMySQLDate, toMySQLDateTime } from '../utils/dataHelpers.js';
import { AuthRequest } from '../middleware/auth.js';

type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'completed' | 'blocked' | 'cancelled';
type TaskPriority = 'low' | 'normal' | 'high';

const allowedStatuses: TaskStatus[] = ['pending', 'in_progress', 'submitted', 'completed', 'blocked', 'cancelled'];
const allowedPriorities: TaskPriority[] = ['low', 'normal', 'high'];

const transitionRules: Record<TaskStatus, TaskStatus[]> = {
  pending: ['in_progress', 'blocked', 'cancelled'],
  in_progress: ['submitted', 'blocked', 'cancelled'],
  submitted: ['completed', 'blocked', 'cancelled'],
  blocked: ['in_progress', 'cancelled'],
  completed: [],
  cancelled: [],
};

interface TaskRow {
  id: string;
  project_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_to_name?: string;
  created_by_name?: string;
}

const mapTask = (row: TaskRow) => ({
  id: row.id,
  projectId: row.project_id,
  parentTaskId: row.parent_task_id,
  title: row.title,
  description: row.description,
  priority: row.priority,
  status: row.status,
  dueDate: row.due_date,
  assignedTo: row.assigned_to,
  assignedToName: row.assigned_to_name || '',
  createdBy: row.created_by,
  createdByName: row.created_by_name || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  children: [] as any[],
});

async function getTaskRow(taskId: string): Promise<TaskRow | null> {
  const rows = await query<TaskRow[]>(
    `SELECT pt.*, u1.name AS assigned_to_name, u2.name AS created_by_name
     FROM project_tasks pt
     LEFT JOIN users u1 ON pt.assigned_to = u1.id
     LEFT JOIN users u2 ON pt.created_by = u2.id
     WHERE pt.id = ?`,
    [taskId]
  );
  return rows[0] || null;
}

async function assertProjectExists(projectId: string) {
  const projects = await query<any[]>(
    'SELECT id FROM projects WHERE id = ?',
    [projectId]
  );
  if (projects.length === 0) {
    const err: any = new Error('Dự án không tồn tại');
    err.status = 404;
    throw err;
  }
}

async function getProjectManagers(projectId: string): Promise<string[]> {
  // Get managers from manager_ids JSON field
  const projects = await query<any[]>(
    'SELECT manager_ids, manager_id FROM projects WHERE id = ?',
    [projectId]
  );
  
  if (projects.length === 0) {
    return [];
  }
  
  const project = projects[0];
  
  // Try to parse manager_ids JSON field
  if (project.manager_ids) {
    try {
      const managerIds = JSON.parse(project.manager_ids);
      if (Array.isArray(managerIds) && managerIds.length > 0) {
        return managerIds;
      }
    } catch (e) {
      // Invalid JSON, fall through to manager_id
    }
  }
  
  // Fallback to manager_id for backward compatibility
  if (project.manager_id) {
    return [project.manager_id];
  }
  
  return [];
}

async function isProjectManager(userId: string, projectId: string): Promise<boolean> {
  const managerIds = await getProjectManagers(projectId);
  return managerIds.includes(userId);
}

export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    await assertProjectExists(projectId);

    const rows = await query<TaskRow[]>(
      `SELECT pt.*, u1.name AS assigned_to_name, u2.name AS created_by_name
       FROM project_tasks pt
       LEFT JOIN users u1 ON pt.assigned_to = u1.id
       LEFT JOIN users u2 ON pt.created_by = u2.id
       WHERE pt.project_id = ?
       ORDER BY pt.created_at ASC`,
      [projectId]
    );

    const tasksMap = new Map<string, any>();
    const roots: any[] = [];

    rows.forEach((row) => {
      const task = mapTask(row);
      tasksMap.set(task.id, task);
    });

    rows.forEach((row) => {
      const task = tasksMap.get(row.id);
      if (row.parent_task_id && tasksMap.has(row.parent_task_id)) {
        tasksMap.get(row.parent_task_id).children.push(task);
      } else {
        roots.push(task);
      }
    });

    res.json(roots);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(error.status || 500).json({ error: error.message || 'Không thể lấy danh sách công việc' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { projectId } = req.params;
    const { title, description, priority = 'normal', dueDate, assignedTo, parentTaskId } = req.body;
    const createdBy = userId;

    if (!title || !assignedTo) {
      return res.status(400).json({ error: 'Thiếu tiêu đề hoặc người được giao' });
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Độ ưu tiên không hợp lệ' });
    }

    await assertProjectExists(projectId);

    // Check if user is project manager
    const isManager = await isProjectManager(userId, projectId);
    if (!isManager) {
      return res.status(403).json({ error: 'Chỉ quản lý dự án mới có thể tạo công việc' });
    }

    if (parentTaskId) {
      const parent = await query<any[]>(
        'SELECT id, project_id, status FROM project_tasks WHERE id = ?',
        [parentTaskId]
      );
      if (parent.length === 0 || parent[0].project_id !== projectId) {
        return res.status(400).json({ error: 'Công việc cha không hợp lệ' });
      }
      if (parent[0].status === 'cancelled') {
        return res.status(400).json({ error: 'Không thể tạo công việc con vì công việc cha đã bị hủy' });
      }
    }

    const id = uuidv4();
    const now = toMySQLDateTime();

    await transaction(async (client) => {
      await client.query(
        `INSERT INTO project_tasks (
          id, project_id, parent_task_id, title, description, priority, status,
          due_date, assigned_to, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          projectId,
          parentTaskId || null,
          title,
          description || null,
          priority,
          'pending',
          dueDate ? toMySQLDate(dueDate) : null,
          assignedTo,
          createdBy,
          now,
          now,
        ]
      );

      await client.query(
        `INSERT INTO task_activity (id, task_id, action, note, actor_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), id, 'created', description || '', createdBy || assignedTo, now]
      );
    });

    const newTask = await getTaskRow(id);
    res.status(201).json(newTask ? mapTask(newTask) : null);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(error.status || 500).json({ error: error.message || 'Không thể tạo công việc' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, dueDate, assignedTo } = req.body;

    const existing = await getTaskRow(taskId);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy công việc' });
    }

    const nextPriority = priority || existing.priority;
    if (!allowedPriorities.includes(nextPriority)) {
      return res.status(400).json({ error: 'Độ ưu tiên không hợp lệ' });
    }

    await query(
      `UPDATE project_tasks SET
        title = ?, description = ?, priority = ?, due_date = ?, assigned_to = ?, updated_at = ?
      WHERE id = ?`,
      [
        title || existing.title,
        description ?? existing.description,
        nextPriority,
        dueDate ? toMySQLDate(dueDate) : existing.due_date || null,
        assignedTo || existing.assigned_to,
        toMySQLDateTime(),
        taskId,
      ]
    );

    const updated = await getTaskRow(taskId);
    res.json(updated ? mapTask(updated) : null);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Không thể cập nhật công việc' });
  }
};

async function validateCompletionOrder(task: TaskRow) {
  // Chỉ kiểm tra khi hoàn thành công việc cha
  // Con có thể hoàn thành độc lập (không cần cha completed)
  // Nhưng cha chỉ có thể hoàn thành khi tất cả con đã completed hoặc cancelled
  
  const children = await query<any[]>(
    'SELECT id, status FROM project_tasks WHERE parent_task_id = ?',
    [task.id]
  );
  
  if (children.length > 0) {
    const unfinishedChildren = children.filter(
      (c) => c.status !== 'completed' && c.status !== 'cancelled'
    );
    
    if (unfinishedChildren.length > 0) {
      const unfinishedStatuses = unfinishedChildren.map(c => c.status).join(', ');
      throw new Error(`Cần hoàn thành hoặc hủy tất cả công việc con trước. Còn ${unfinishedChildren.length} công việc con ở trạng thái: ${unfinishedStatuses}`);
    }
  }
}

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { taskId } = req.params;
    const { status, note } = req.body;
    const actorId = userId;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    const task = await getTaskRow(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Không tìm thấy công việc' });
    }

    // Check permission: only assigned user or project manager can change status
    const isManager = await isProjectManager(userId, task.project_id);
    const isAssigned = task.assigned_to === userId;
    
    if (!isManager && !isAssigned) {
      return res.status(403).json({ error: 'Chỉ người được giao hoặc quản lý dự án mới có thể thay đổi trạng thái' });
    }

    if (!transitionRules[task.status].includes(status)) {
      return res.status(400).json({ error: 'Không thể chuyển trạng thái theo thứ tự này' });
    }

    if (status === 'completed') {
      await validateCompletionOrder(task);
    }

    const now = toMySQLDateTime();

    await transaction(async (client) => {
      await client.query(
        'UPDATE project_tasks SET status = ?, updated_at = ? WHERE id = ?',
        [status, now, taskId]
      );
      await client.query(
        `INSERT INTO task_activity (id, task_id, action, note, actor_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), taskId, 'status_change', note || `${task.status} -> ${status}`, actorId || task.assigned_to, now]
      );
    });

    const updated = await getTaskRow(taskId);
    res.json(updated ? mapTask(updated) : null);
  } catch (error: any) {
    console.error('Error updating task status:', error);
    res.status(400).json({ error: error.message || 'Không thể cập nhật trạng thái' });
  }
};


