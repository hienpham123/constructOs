import { List, Typography, Stack, CircularProgress } from '@mui/material';
import { ProjectTask } from '../../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: ProjectTask[];
  expandedTasks: Set<string>;
  onToggleExpand: (taskId: string) => void;
  onStatusChange: (taskId: string, status: ProjectTask['status']) => void;
  onAddChild: (task: ProjectTask) => void;
  onDelete: (taskId: string) => void;
  onEdit?: (task: ProjectTask) => void;
  isLoading?: boolean;
  currentUserId: string;
  isProjectManager: boolean;
  highlightTaskId?: string; // Task ID để highlight
}

export default function TaskList({
  tasks,
  expandedTasks,
  onToggleExpand,
  onStatusChange,
  onAddChild,
  onDelete,
  onEdit,
  isLoading = false,
  currentUserId,
  isProjectManager,
  highlightTaskId,
}: TaskListProps) {
  const renderTask = (task: ProjectTask, depth = 0, highlightId?: string): JSX.Element => {
    const isExpanded = expandedTasks.has(task.id);
    const isHighlighted = task.id === highlightId;

    return (
      <TaskItem
        key={task.id}
        task={task}
        depth={depth}
        isExpanded={isExpanded}
        expandedTasks={expandedTasks}
        onToggleExpand={onToggleExpand}
        onStatusChange={(status) => onStatusChange(task.id, status)}
        onAddChild={() => onAddChild(task)}
        onDelete={() => onDelete(task.id)}
        onEdit={onEdit ? () => onEdit(task) : undefined}
        currentUserId={currentUserId}
        isProjectManager={isProjectManager}
        isHighlighted={isHighlighted}
        highlightTaskId={highlightId}
        onStatusChangeWithTaskId={onStatusChange} // Truyền callback gốc để task con có thể dùng
        onAddChildWithTask={onAddChild} // Truyền callback gốc để task con có thể dùng
        onDeleteWithTaskId={onDelete} // Truyền callback gốc để task con có thể dùng
        onEditWithTask={onEdit} // Truyền callback gốc để task con có thể dùng
      />
    );
  };

  if (isLoading && tasks.length === 0) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (tasks.length === 0) {
    return (
      <Typography color="text.secondary">Chưa có công việc nào.</Typography>
    );
  }

  return (
    <List disablePadding>
      {tasks.map((task) => renderTask(task, 0, highlightTaskId))}
    </List>
  );
}

