namespace ConstructOs.Server.Models;

public class ProjectManagerDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserEmail { get; set; }
    public string? UserAvatar { get; set; }
}

public class ProjectDto
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Client { get; set; } = string.Empty;
    public string Investor { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string Status { get; set; } = "quoting";
    public int Progress { get; set; }
    public decimal Budget { get; set; }
    public decimal ActualCost { get; set; }
    public string? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public List<ProjectManagerDto> Managers { get; set; } = new();
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}

public class CreateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Client { get; set; }
    public string? Investor { get; set; }
    public string? ContactPerson { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string Status { get; set; } = "quoting";
    public decimal? Budget { get; set; }
    public decimal? ActualCost { get; set; }
    public string? ManagerId { get; set; }
    public List<string>? Managers { get; set; }
}

public class UpdateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Client { get; set; }
    public string? Investor { get; set; }
    public string? ContactPerson { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? Budget { get; set; }
    public decimal? ActualCost { get; set; }
    public string? ManagerId { get; set; }
    public List<string>? Managers { get; set; }
}

