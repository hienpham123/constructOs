import { Request, Response } from 'express';
import { query } from '../config/db.js';
import moment from 'moment';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get all data from database
    const [projects, personnel, equipment, materials, maintenanceSchedules, siteLogs] = await Promise.all([
      query<any[]>('SELECT * FROM projects'),
      query<any[]>('SELECT * FROM personnel'),
      query<any[]>('SELECT * FROM equipment'),
      query<any[]>('SELECT * FROM materials'),
      query<any[]>('SELECT * FROM maintenance_schedules'),
      query<any[]>('SELECT * FROM site_logs ORDER BY created_at DESC LIMIT 10'),
    ]);

    // Calculate stats
    const activeProjects = projects.filter((p) => p.status === 'in_progress');
    const totalRevenue = projects.reduce((sum: number, p: any) => sum + parseFloat(p.actual_cost || 0), 0);
    const totalExpenses = totalRevenue * 0.85; // Can be calculated from actual expenses
    const totalProfit = totalRevenue - totalExpenses;

    const activePersonnel = personnel.filter((p) => p.status === 'active');
    const equipmentInUse = equipment.filter((e) => e.status === 'in_use');

    const lowStockMaterials = materials.filter(
      (m) => parseFloat(m.current_stock || 0) <= parseFloat(m.min_stock || 0)
    );

    const today = moment().startOf('day');
    const overdueMaintenance = maintenanceSchedules.filter((m) => {
      if (m.status === 'completed') return false;
      const scheduledDate = moment(m.scheduled_date);
      return scheduledDate.isBefore(today);
    });

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

    // Recent site logs (last 5)
    const recentSiteLogs = siteLogs.slice(0, 5).map((log) => ({
      id: log.id,
      projectName: log.project_name,
      date: log.date,
      workDescription: log.work_description || '',
      createdAt: log.created_at,
    }));

    // Upcoming maintenance (next 5)
    const upcomingMaintenance = maintenanceSchedules
      .filter((m) => m.status === 'scheduled')
      .sort((a, b) => moment(a.scheduled_date).valueOf() - moment(b.scheduled_date).valueOf())
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        equipmentName: m.equipment_name,
        scheduledDate: m.scheduled_date,
        description: m.description || '',
        status: m.status,
      }));

    // Alerts
    const alerts = [
      ...lowStockMaterials.map((m) => ({
        id: `alert-low-stock-${m.id}`,
        type: 'warning' as const,
        title: 'Vật tư sắp hết',
        message: `${m.name} chỉ còn ${m.current_stock} ${m.unit}`,
        relatedId: m.id,
        createdAt: moment().toISOString(),
      })),
      ...overdueMaintenance.map((m) => ({
        id: `alert-maintenance-${m.id}`,
        type: 'error' as const,
        title: 'Bảo trì quá hạn',
        message: `${m.equipment_name} cần bảo trì từ ${moment(m.scheduled_date).format('DD/MM/YYYY')}`,
        relatedId: m.id,
        createdAt: moment().toISOString(),
      })),
    ];

    res.json({
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      totalRevenue,
      totalExpenses,
      totalProfit,
      totalPersonnel: personnel.length,
      activePersonnel: activePersonnel.length,
      totalEquipment: equipment.length,
      equipmentInUse: equipmentInUse.length,
      lowStockMaterials: lowStockMaterials.length,
      overdueMaintenance: overdueMaintenance.length,
      recentProjects,
      recentSiteLogs,
      upcomingMaintenance,
      alerts,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Không thể lấy thống kê dashboard' });
  }
};

export const getMonthlyStats = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;
    
    // Default to current year/month if not provided
    const targetYear = year ? parseInt(year as string) : moment().year();
    const targetMonth = month ? parseInt(month as string) : moment().month() + 1;
    
    const startDate = moment(`${targetYear}-${targetMonth}-01`).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(`${targetYear}-${targetMonth}-01`).endOf('month').format('YYYY-MM-DD');
    
    // Get projects created in this month
    const projects = await query<any[]>(
      `SELECT * FROM projects WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?`,
      [startDate, endDate]
    );
    
    // Get personnel created in this month
    const personnel = await query<any[]>(
      `SELECT * FROM personnel WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?`,
      [startDate, endDate]
    );
    
    // Get site logs in this month
    const siteLogs = await query<any[]>(
      `SELECT * FROM site_logs WHERE DATE(date) >= ? AND DATE(date) <= ?`,
      [startDate, endDate]
    );
    
    // Calculate revenue by day in the month
    const daysInMonth = moment(`${targetYear}-${targetMonth}-01`).daysInMonth();
    const monthlyData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = moment(`${targetYear}-${targetMonth}-${day}`).format('YYYY-MM-DD');
      
      // Projects created on this day
      const projectsOnDay = projects.filter((p) => 
        moment(p.created_at).format('YYYY-MM-DD') === currentDate
      );
      
      // Revenue from projects (using actual_cost)
      const revenue = projectsOnDay.reduce((sum: number, p: any) => 
        sum + parseFloat(p.actual_cost || 0), 0
      );
      
      // Personnel added on this day
      const personnelOnDay = personnel.filter((p) => 
        moment(p.created_at).format('YYYY-MM-DD') === currentDate
      );
      
      // Site logs on this day
      const logsOnDay = siteLogs.filter((log) => 
        moment(log.date).format('YYYY-MM-DD') === currentDate
      );
      
      monthlyData.push({
        date: currentDate,
        day: day,
        revenue: revenue,
        projects: projectsOnDay.length,
        personnel: personnelOnDay.length,
        siteLogs: logsOnDay.length,
      });
    }
    
    // Also get data for last 12 months for comparison
    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = moment().subtract(i, 'months');
      const monthStart = monthDate.startOf('month').format('YYYY-MM-DD');
      const monthEnd = monthDate.endOf('month').format('YYYY-MM-DD');
      
      const monthProjects = await query<any[]>(
        `SELECT * FROM projects WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?`,
        [monthStart, monthEnd]
      );
      
      const monthRevenue = monthProjects.reduce((sum: number, p: any) => 
        sum + parseFloat(p.actual_cost || 0), 0
      );
      
      last12Months.push({
        month: monthDate.format('MM/YYYY'),
        monthName: monthDate.format('MMM YYYY'),
        revenue: monthRevenue,
        projects: monthProjects.length,
      });
    }
    
    res.json({
      monthlyData,
      last12Months,
      summary: {
        totalRevenue: monthlyData.reduce((sum, d) => sum + d.revenue, 0),
        totalProjects: monthlyData.reduce((sum, d) => sum + d.projects, 0),
        totalPersonnel: monthlyData.reduce((sum, d) => sum + d.personnel, 0),
        totalSiteLogs: monthlyData.reduce((sum, d) => sum + d.siteLogs, 0),
      },
    });
  } catch (error: any) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ error: 'Không thể lấy thống kê theo tháng' });
  }
};
