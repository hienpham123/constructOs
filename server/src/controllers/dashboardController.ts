import { Request, Response } from 'express';
import { query } from '../config/db.js';
import moment from 'moment';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get all data from database
    const [projects, personnel, materials] = await Promise.all([
      query<any[]>('SELECT * FROM projects'),
      query<any[]>('SELECT * FROM personnel'),
      query<any[]>('SELECT * FROM materials'),
    ]);

    // Calculate stats
    const activeProjects = projects.filter((p) => p.status === 'in_progress');
    const totalRevenue = projects.reduce((sum: number, p: any) => sum + parseFloat(p.actual_cost || 0), 0);
    const totalExpenses = totalRevenue * 0.85; // Can be calculated from actual expenses
    const totalProfit = totalRevenue - totalExpenses;

    const activePersonnel = personnel.filter((p) => p.status === 'active');

    const lowStockMaterials = materials.filter(
      (m) => parseFloat(m.current_stock || 0) <= parseFloat(m.min_stock || 0)
    );

    // Recent projects (last 5)
    const recentProjects = projects
      .sort((a, b) => moment(b.created_at).valueOf() - moment(a.created_at).valueOf())
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: p.progress || 0,
        createdAt: p.created_at,
      }));

    res.json({
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      totalRevenue,
      totalExpenses,
      totalProfit,
      totalPersonnel: personnel.length,
      activePersonnel: activePersonnel.length,
      lowStockMaterials: lowStockMaterials.length,
      recentProjects,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Không thể lấy thống kê dashboard' });
  }
};

