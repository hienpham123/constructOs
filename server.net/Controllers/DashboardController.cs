using ConstructOs.Server.Config;
using Microsoft.AspNetCore.Mvc;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDatabaseService _db;

    public DashboardController(IDatabaseService db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        try
        {
            var projects = await _db.QueryAsync<dynamic>("SELECT * FROM projects");
            var personnel = await _db.QueryAsync<dynamic>("SELECT * FROM users");
            var materials = await _db.QueryAsync<dynamic>("SELECT * FROM materials");

            var activeProjects = projects.Where(p => p.status?.ToString() == "in_progress").ToList();
            var totalRevenue = projects.Sum(p => Convert.ToDouble(p.actual_cost ?? 0));
            var totalExpenses = totalRevenue * 0.85;
            var totalProfit = totalRevenue - totalExpenses;

            var activePersonnel = personnel.Where(p => p.status?.ToString() == "active").ToList();

            var lowStockMaterials = materials.Where(m =>
            {
                var currentStock = Convert.ToDouble(m.current_stock ?? 0);
                var minStock = Convert.ToDouble(m.min_stock ?? 0);
                return currentStock <= minStock;
            }).ToList();

            var recentProjects = projects
                .OrderByDescending(p => DateTime.Parse(p.created_at?.ToString() ?? DateTime.MinValue.ToString()))
                .Take(5)
                .Select(p => new
                {
                    id = p.id,
                    name = p.name,
                    status = p.status,
                    progress = p.progress ?? 0,
                    createdAt = p.created_at
                })
                .ToList();

            return Ok(new
            {
                totalProjects = projects.Count(),
                activeProjects = activeProjects.Count,
                totalRevenue,
                totalExpenses,
                totalProfit,
                totalPersonnel = personnel.Count(),
                activePersonnel = activePersonnel.Count,
                lowStockMaterials = lowStockMaterials.Count,
                recentProjects
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching dashboard stats: {ex}");
            return StatusCode(500, new { error = "Không thể lấy thống kê dashboard" });
        }
    }
}

