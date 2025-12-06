import { Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, toMySQLDate, normalizeString, buildSearchClause, buildSortClause } from '../utils/dataHelpers.js';
import { AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'server', 'uploads', 'project-reports');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Get all project reports
export const getProjectReports = async (req: AuthRequest, res: Response) => {
  try {
    const { pageSize, pageIndex, search, sortBy, sortOrder, projectId } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Build search and sort clauses
    const queryParams: any[] = [];
    const searchFields = ['p.name', 'p.code', 'pr.content', 'pr.comment'];
    let searchClause = buildSearchClause(
      search as string,
      searchFields,
      queryParams
    );
    
    // Add project filter
    if (projectId) {
      const projectFilter = searchClause ? ' AND pr.project_id = ?' : ' WHERE pr.project_id = ?';
      searchClause = searchClause ? searchClause + projectFilter : `WHERE pr.project_id = ?`;
      queryParams.push(projectId);
    }
    
    const allowedSortFields = ['project_name', 'report_date', 'created_at'];
    const sortClause = buildSortClause(sortBy as string, allowedSortFields, 'report_date', sortOrder as string);
    
    // Update sort clause to use table aliases
    const sortClauseWithAlias = sortClause
      .replace(/\bproject_name\b/g, 'p.name')
      .replace(/\breport_date\b/g, 'pr.report_date')
      .replace(/\bcreated_at\b/g, 'pr.created_at');
    
    // Get total count with search
    const countSearchClause = searchClause
      .replace(/\bp\.name\b/g, 'p.name')
      .replace(/\bp\.code\b/g, 'p.code')
      .replace(/\bpr\.content\b/g, 'pr.content')
      .replace(/\bpr\.comment\b/g, 'pr.comment');
    
    const countQuery = `SELECT COUNT(*) as total 
      FROM project_reports pr
      LEFT JOIN projects p ON pr.project_id = p.id
      ${countSearchClause}`;
    const countResults = await query<any[]>(countQuery, queryParams);
    const total = countResults[0]?.total || 0;
    
    // Get paginated reports with project info
    const reports = await query<any[]>(
      `SELECT 
        pr.id, pr.project_id, pr.report_date, pr.content, pr.comment,
        pr.created_by, pr.created_at, pr.updated_at,
        p.name as project_name, p.code as project_code, p.status as project_status, p.progress as project_progress,
        u.name as created_by_name
      FROM project_reports pr
      LEFT JOIN projects p ON pr.project_id = p.id
      LEFT JOIN users u ON pr.created_by = u.id
      ${searchClause} ${sortClauseWithAlias} LIMIT ${pageSizeNum} OFFSET ${offset}`,
      queryParams
    );
    
    // Get attachments for each report
    for (const report of reports) {
      const attachments = await query<any[]>(
        'SELECT * FROM project_report_attachments WHERE report_id = ? ORDER BY uploaded_at DESC',
        [report.id]
      );
      report.attachments = attachments;
    }
    
    res.json({
      data: reports,
      total,
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching project reports:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách báo cáo dự án' });
  }
};

// Get project report by ID
export const getProjectReportById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const results = await query<any[]>(
      `SELECT 
        pr.*,
        p.name as project_name, p.code as project_code, p.status as project_status, p.progress as project_progress,
        u.name as created_by_name
      FROM project_reports pr
      LEFT JOIN projects p ON pr.project_id = p.id
      LEFT JOIN users u ON pr.created_by = u.id
      WHERE pr.id = ?`,
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy báo cáo dự án' });
    }
    
    const report = results[0];
    
    // Get attachments
    const attachments = await query<any[]>(
      'SELECT * FROM project_report_attachments WHERE report_id = ? ORDER BY uploaded_at DESC',
      [id]
    );
    report.attachments = attachments;
    
    res.json(report);
  } catch (error: any) {
    console.error('Error fetching project report:', error);
    res.status(500).json({ error: 'Không thể lấy báo cáo dự án' });
  }
};

// Create project report
export const createProjectReport = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, reportDate, content, comment } = req.body;
    const userId = req.userId!; // From auth middleware
    
    if (!projectId || !content) {
      return res.status(400).json({ error: 'Dự án và nội dung báo cáo là bắt buộc' });
    }
    
    const id = uuidv4();
    const date = reportDate ? toMySQLDate(reportDate) : toMySQLDate(new Date());
    const createdAt = toMySQLDateTime();
    
    await query(
      `INSERT INTO project_reports (
        id, project_id, report_date, content, comment, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, date, content, normalizeString(comment), userId, createdAt, createdAt]
    );
    
    // Handle file uploads if any
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files as Express.Multer.File[]) {
        const attachmentId = uuidv4();
        const fileUrl = `/uploads/project-reports/${file.filename}`;
        await query(
          `INSERT INTO project_report_attachments (
            id, report_id, file_name, file_url, file_size, file_type, uploaded_by, uploaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attachmentId,
            id,
            file.originalname,
            fileUrl,
            file.size,
            file.mimetype,
            userId,
            createdAt,
          ]
        );
      }
    }
    
    const newReport = await query<any[]>(
      `SELECT 
        pr.*,
        p.name as project_name, p.code as project_code, p.status as project_status, p.progress as project_progress,
        u.name as created_by_name
      FROM project_reports pr
      LEFT JOIN projects p ON pr.project_id = p.id
      LEFT JOIN users u ON pr.created_by = u.id
      WHERE pr.id = ?`,
      [id]
    );
    
    const report = newReport[0];
    
    // Get attachments
    const attachments = await query<any[]>(
      'SELECT * FROM project_report_attachments WHERE report_id = ? ORDER BY uploaded_at DESC',
      [id]
    );
    report.attachments = attachments;
    
    res.status(201).json(report);
  } catch (error: any) {
    console.error('Error creating project report:', error);
    res.status(500).json({ error: 'Không thể tạo báo cáo dự án' });
  }
};

// Update project report
export const updateProjectReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, comment } = req.body;
    const updatedAt = toMySQLDateTime();
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT id FROM project_reports WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy báo cáo dự án' });
    }
    
    await query(
      `UPDATE project_reports SET
        content = ?, comment = ?, updated_at = ?
      WHERE id = ?`,
      [content, normalizeString(comment), updatedAt, id]
    );
    
    // Handle new file uploads if any
    const userId = req.userId!;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files as Express.Multer.File[]) {
        const attachmentId = uuidv4();
        const fileUrl = `/uploads/project-reports/${file.filename}`;
        await query(
          `INSERT INTO project_report_attachments (
            id, report_id, file_name, file_url, file_size, file_type, uploaded_by, uploaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attachmentId,
            id,
            file.originalname,
            fileUrl,
            file.size,
            file.mimetype,
            userId,
            updatedAt,
          ]
        );
      }
    }
    
    const updated = await query<any[]>(
      `SELECT 
        pr.*,
        p.name as project_name, p.code as project_code, p.status as project_status, p.progress as project_progress,
        u.name as created_by_name
      FROM project_reports pr
      LEFT JOIN projects p ON pr.project_id = p.id
      LEFT JOIN users u ON pr.created_by = u.id
      WHERE pr.id = ?`,
      [id]
    );
    
    const report = updated[0];
    
    // Get attachments
    const attachments = await query<any[]>(
      'SELECT * FROM project_report_attachments WHERE report_id = ? ORDER BY uploaded_at DESC',
      [id]
    );
    report.attachments = attachments;
    
    res.json(report);
  } catch (error: any) {
    console.error('Error updating project report:', error);
    res.status(500).json({ error: 'Không thể cập nhật báo cáo dự án' });
  }
};

// Delete project report
export const deleteProjectReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT id FROM project_reports WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy báo cáo dự án' });
    }
    
    // Delete attachments first (files will be handled by cleanup job if needed)
    await query('DELETE FROM project_report_attachments WHERE report_id = ?', [id]);
    
    // Delete report
    await query('DELETE FROM project_reports WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting project report:', error);
    res.status(500).json({ error: 'Không thể xóa báo cáo dự án' });
  }
};

// Delete attachment
export const deleteAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get attachment info
    const attachment = await query<any[]>(
      'SELECT * FROM project_report_attachments WHERE id = ?',
      [id]
    );
    
    if (attachment.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy file đính kèm' });
    }
    
    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'server', attachment[0].file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await query('DELETE FROM project_report_attachments WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Không thể xóa file đính kèm' });
  }
};

