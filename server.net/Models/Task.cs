namespace ConstructOs.Server.Models;

public class TaskRow
{
    public string Id { get; set; } = string.Empty;
    public string ProjectId { get; set; } = string.Empty;
    public string? ParentTaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "normal";
    public string Status { get; set; } = "pending";
    public string? DueDate { get; set; }
    public string AssignedTo { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
    public string? AssignedToName { get; set; }
    public string? CreatedByName { get; set; }
}

public class TaskDto
{
    public string Id { get; set; } = string.Empty;
    public string ProjectId { get; set; } = string.Empty;
    public string? ParentTaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "normal";
    public string Status { get; set; } = "pending";
    public string? DueDate { get; set; }
    public string AssignedTo { get; set; } = string.Empty;
    public string AssignedToName { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
    public List<TaskDto> Children { get; set; } = new();
}

public class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "normal";
    public string? DueDate { get; set; }
    public string AssignedTo { get; set; } = string.Empty;
    public string? ParentTaskId { get; set; }
}

public class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Priority { get; set; }
    public string? DueDate { get; set; }
    public string? AssignedTo { get; set; }
}

public class UpdateTaskStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
}

