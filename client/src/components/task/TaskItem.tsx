import { Box, Chip, IconButton, ListItem, ListItemText, Stack, Typography, Divider } from '@mui/material';
import { ExpandMore, ExpandLess, ChevronRight, ArrowRight, Add } from '@mui/icons-material';
import { ProjectTask } from '../../types';
import { formatDate } from '../../utils/dateFormat';
import TaskStatusSelect, { statusLabels, statusColors } from './TaskStatusSelect';

interface TaskItemProps {
  task: ProjectTask;
  depth?: number;
  isExpanded: boolean;
  expandedTasks: Set<string>;
  onToggleExpand: (taskId: string) => void;
  onStatusChange: (status: ProjectTask['status']) => void;
  onAddChild: () => void;
  currentUserId: string;
  isProjectManager: boolean;
}

export default function TaskItem({
  task,
  depth = 0,
  isExpanded,
  expandedTasks,
  onToggleExpand,
  onStatusChange,
  onAddChild,
  currentUserId,
  isProjectManager,
}: TaskItemProps) {
  const hasChildren = task.children && task.children.length > 0;
  // Check permission: assigned user or project manager can change status
  const canChangeStatus = isProjectManager || task.assignedTo === currentUserId;
  // Only project manager can add child tasks
  const canAddChild = isProjectManager;

  const priorityLabels: Record<ProjectTask['priority'], string> = {
    low: 'Ưu tiên thấp',
    normal: 'Ưu tiên thường',
    high: 'Ưu tiên cao',
  };

  return (
    <Box sx={{ ml: depth * 2, borderLeft: depth > 0 ? '1px dashed #e0e0e0' : 'none', pl: depth > 0 ? 2 : 0 }}>
      <ListItem
        secondaryAction={
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={statusLabels[task.status]} color={statusColors[task.status]} />
            {canChangeStatus ? (
              <TaskStatusSelect value={task.status} onChange={onStatusChange} />
            ) : (
              <TaskStatusSelect value={task.status} onChange={() => {}} disabled />
            )}
            {canAddChild && (
              <IconButton
                size="small"
                onClick={onAddChild}
                title="Thêm công việc con"
              >
                <Add fontSize="small" />
              </IconButton>
            )}
          </Stack>
        }
      >
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => onToggleExpand(task.id)}
              sx={{ p: 0.5 }}
              title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
            >
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
          {!hasChildren && depth > 0 && (
            <Box sx={{ width: 40, display: 'flex', justifyContent: 'center' }}>
              <ChevronRight fontSize="small" color="disabled" />
            </Box>
          )}
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center" spacing={1}>
                {depth > 0 && !hasChildren && <ArrowRight fontSize="small" color="disabled" />}
                <Typography fontWeight={600}>{task.title}</Typography>
                <Chip size="small" label={priorityLabels[task.priority]} />
              </Stack>
            }
            secondary={
              <Stack spacing={0.5}>
                {task.description && (
                  <Typography variant="body2" color="text.secondary">
                    {task.description}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Giao cho: {task.assignedToName || task.assignedTo} {task.dueDate ? `• Hạn: ${formatDate(task.dueDate)}` : ''}
                </Typography>
              </Stack>
            }
          />
        </Stack>
      </ListItem>
      {hasChildren && isExpanded && (
        <Box sx={{ ml: 2 }}>
          {task.children!.map((child) => (
            <TaskItem
              key={child.id}
              task={child}
              depth={depth + 1}
              isExpanded={expandedTasks.has(child.id)}
              expandedTasks={expandedTasks}
              onToggleExpand={onToggleExpand}
              onStatusChange={onStatusChange}
              onAddChild={onAddChild}
              currentUserId={currentUserId}
              isProjectManager={isProjectManager}
            />
          ))}
        </Box>
      )}
      <Divider sx={{ my: 1 }} />
    </Box>
  );
}

