import { List, Typography, Stack, CircularProgress } from '@mui/material';
import { ProjectTask } from '../../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: ProjectTask[];
  expandedTasks: Set<string>;
  onToggleExpand: (taskId: string) => void;
  onStatusChange: (taskId: string, status: ProjectTask['status']) => void;
  onAddChild: (task: ProjectTask) => void;
  isLoading?: boolean;
  currentUserId: string;
  isProjectManager: boolean;
}

export default function TaskList({
  tasks,
  expandedTasks,
  onToggleExpand,
  onStatusChange,
  onAddChild,
  isLoading = false,
  currentUserId,
  isProjectManager,
}: TaskListProps) {
  const renderTask = (task: ProjectTask, depth = 0): JSX.Element => {
    const isExpanded = expandedTasks.has(task.id);

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
        currentUserId={currentUserId}
        isProjectManager={isProjectManager}
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
      {tasks.map((task) => renderTask(task))}
    </List>
  );
}

