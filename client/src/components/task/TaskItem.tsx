import { Box, Chip, IconButton, ListItem, ListItemText, Stack, Typography, Divider, useMediaQuery, useTheme } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

  const actionButtons = (
    <Stack 
      direction={{ xs: 'column', sm: 'row' }} 
      spacing={1} 
      alignItems={{ xs: 'stretch', sm: 'center' }}
      sx={{ width: { xs: '100%', sm: 'auto' } }}
    >
      <Chip 
        size="small" 
        label={statusLabels[task.status]} 
        color={statusColors[task.status]}
        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
      />
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
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          <Add fontSize="small" />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <Box 
      sx={{ 
        ml: { xs: depth, sm: depth * 2 }, 
        borderLeft: depth > 0 ? '1px dashed #e0e0e0' : 'none', 
        pl: { xs: depth > 0 ? 1 : 0, sm: depth > 0 ? 2 : 0 } 
      }}
    >
      {isMobile ? (
        <Box>
          <ListItem
            sx={{ flexDirection: 'column', alignItems: 'stretch', px: { xs: 1, sm: 2 } }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: '100%', mb: 1 }}>
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
                <Box sx={{ width: 32, display: 'flex', justifyContent: 'center' }}>
                  <ChevronRight fontSize="small" color="disabled" />
                </Box>
              )}
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    {depth > 0 && !hasChildren && <ArrowRight fontSize="small" color="disabled" />}
                    <Typography fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      {task.title}
                    </Typography>
                    <Chip size="small" label={priorityLabels[task.priority]} />
                  </Stack>
                }
                secondary={
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {task.description}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Giao cho: {task.assignedToName || task.assignedTo} {task.dueDate ? `• Hạn: ${formatDate(task.dueDate)}` : ''}
                    </Typography>
                  </Stack>
                }
              />
            </Stack>
            <Box sx={{ mt: 1 }}>
              {actionButtons}
            </Box>
          </ListItem>
        </Box>
      ) : (
        <ListItem
          secondaryAction={actionButtons}
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
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
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
      )}
      {hasChildren && isExpanded && (
        <Box sx={{ ml: { xs: 1, sm: 2 } }}>
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
      <Divider sx={{ my: { xs: 0.5, sm: 1 } }} />
    </Box>
  );
}

