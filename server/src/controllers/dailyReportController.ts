import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, toMySQLDate, normalizeString, buildSearchClause, buildSortClause } from '../utils/dataHelpers.js';

// Get daily reports with filter by date
export const getDailyReports = async (req: AuthRequest, res: Response) => {
  try {
    const { date, pageSize, pageIndex, search, sortBy, sortOrder } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Build search and sort clauses
    const queryParams: any[] = [];
    const searchFields = ['u.name', 'u.code', 'dr.content', 'dr.suggestion', 'dr.time_slot', 'dr.location'];
    let searchClause = buildSearchClause(
      search as string,
      searchFields,
      queryParams
    );
    
    // Add date filter
    if (date) {
      const dateFilter = searchClause ? ' AND dr.report_date = ?' : ' WHERE dr.report_date = ?';
      searchClause = searchClause ? searchClause + dateFilter : `WHERE dr.report_date = ?`;
      queryParams.push(date);
    }
    
    const allowedSortFields = ['name', 'code', 'report_date', 'created_at'];
    const sortClause = buildSortClause(sortBy as string, allowedSortFields, 'report_date', sortOrder as string);
    
    // Update sort clause to use table aliases
    const sortClauseWithAlias = sortClause
      .replace(/\bname\b/g, 'u.name')
      .replace(/\bcode\b/g, 'u.code')
      .replace(/\breport_date\b/g, 'dr.report_date')
      .replace(/\bcreated_at\b/g, 'dr.created_at');
    
    // Get all active users (personnel)
    const allUsers = await query<any[]>(
      `SELECT id, name, code, status FROM users WHERE status = 'active' ORDER BY name`
    );
    
    // Get total count with search
    const countSearchClause = searchClause
      .replace(/\bu\.name\b/g, 'u.name')
      .replace(/\bu\.code\b/g, 'u.code')
      .replace(/\bdr\.content\b/g, 'dr.content')
      .replace(/\bdr\.suggestion\b/g, 'dr.suggestion')
      .replace(/\bdr\.time_slot\b/g, 'dr.time_slot')
      .replace(/\bdr\.location\b/g, 'dr.location');
    
    const countQuery = `SELECT COUNT(*) as total 
      FROM daily_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
      ${countSearchClause}`;
    const countResults = await query<any[]>(countQuery, queryParams);
    const total = countResults[0]?.total || 0;
    
    // Get paginated reports
    const reports = await query<any[]>(
      `SELECT 
        dr.id, dr.user_id, dr.report_date, dr.content, dr.suggestion,
        dr.time_slot, dr.location,
        dr.created_at, dr.updated_at,
        u.name as user_name, u.code as user_code
      FROM daily_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
      ${searchClause} ${sortClauseWithAlias} LIMIT ${pageSizeNum} OFFSET ${offset}`,
      queryParams
    );
    
    // Create a map of user_id -> report for quick lookup
    const reportsMap = new Map(reports.map(r => [r.user_id, r]));
    
    // Build response with all users and their report status
    const responseData = allUsers.map(user => {
      const report = reportsMap.get(user.id);
      return {
        user_id: user.id,
        user_name: user.name,
        user_code: user.code,
        has_report: !!report,
        report: report ? {
          id: report.id,
          content: report.content,
          suggestion: report.suggestion,
          time_slot: report.time_slot,
          location: report.location,
          report_date: report.report_date,
          created_at: report.created_at,
          updated_at: report.updated_at,
        } : null,
      };
    });
    
    res.json({
      data: responseData,
      total: allUsers.length, // Total is all users, not just reports
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching daily reports:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách báo cáo ngày' });
  }
};

// Get daily report by user and date
export const getDailyReportByUserAndDate = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, date } = req.params;
    
    // Parse date from URL (could be ISO string or YYYY-MM-DD)
    let reportDate: string;
    try {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        // Valid date, format as YYYY-MM-DD
        reportDate = toMySQLDate(dateObj);
      } else {
        // Try to use as-is (already YYYY-MM-DD)
        reportDate = date;
      }
    } catch {
      // If parsing fails, use as-is
      reportDate = date;
    }
    
    const results = await query<any[]>(
      `SELECT 
        dr.*,
        u.name as user_name, u.code as user_code, u.status as user_status
      FROM daily_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
      WHERE dr.user_id = ? AND dr.report_date = ?`,
      [userId, reportDate]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy báo cáo' });
    }
    
    res.json(results[0]);
  } catch (error: any) {
    console.error('Error fetching daily report:', error);
    res.status(500).json({ error: 'Không thể lấy báo cáo ngày' });
  }
};

// Create or update daily report
export const createOrUpdateDailyReport = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, date } = req.params;
    const { content, suggestion, time_slot, location } = req.body;
    const currentUserId = req.userId;
    
    // Only allow users to create/update their own reports
    if (userId !== currentUserId) {
      return res.status(403).json({ error: 'Bạn chỉ có thể báo cáo cho chính mình' });
    }
    
    if (!content) {
      return res.status(400).json({ error: 'Nội dung báo cáo là bắt buộc' });
    }
    
    // Parse date from URL (could be ISO string or YYYY-MM-DD)
    let reportDate: string;
    try {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        // Valid date, format as YYYY-MM-DD
        reportDate = toMySQLDate(dateObj);
      } else {
        // Try to use as-is (already YYYY-MM-DD)
        reportDate = toMySQLDate(date);
      }
    } catch {
      // If parsing fails, try toMySQLDate
      reportDate = toMySQLDate(date);
    }
    
    const createdAt = toMySQLDateTime();
    
    // Check if report exists
    const existing = await query<any[]>(
      'SELECT id FROM daily_reports WHERE user_id = ? AND report_date = ?',
      [userId, reportDate]
    );
    
    if (existing.length > 0) {
      // Update existing report
      const id = existing[0].id;
      await query(
        `UPDATE daily_reports SET
          content = ?, suggestion = ?, time_slot = ?, location = ?, updated_at = ?
        WHERE id = ?`,
        [content, normalizeString(suggestion), normalizeString(time_slot), normalizeString(location), createdAt, id]
      );
      
      const updated = await query<any[]>(
        `SELECT 
          dr.*,
          u.name as user_name, u.code as user_code
        FROM daily_reports dr
        LEFT JOIN users u ON dr.user_id = u.id
        WHERE dr.id = ?`,
        [id]
      );
      
      res.json(updated[0]);
    } else {
      // Create new report
      const id = uuidv4();
      await query(
        `INSERT INTO daily_reports (
          id, user_id, report_date, content, suggestion, time_slot, location, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, reportDate, content, normalizeString(suggestion), normalizeString(time_slot), normalizeString(location), createdAt, createdAt]
      );
      
      const newReport = await query<any[]>(
        `SELECT 
          dr.*,
          u.name as user_name, u.code as user_code
        FROM daily_reports dr
        LEFT JOIN users u ON dr.user_id = u.id
        WHERE dr.id = ?`,
        [id]
      );
      
      res.status(201).json(newReport[0]);
    }
  } catch (error: any) {
    console.error('Error creating/updating daily report:', error);
    res.status(500).json({ error: 'Không thể tạo/cập nhật báo cáo ngày' });
  }
};

// Delete daily report
export const deleteDailyReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT id FROM daily_reports WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy báo cáo' });
    }
    
    await query('DELETE FROM daily_reports WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting daily report:', error);
    res.status(500).json({ error: 'Không thể xóa báo cáo ngày' });
  }
};

