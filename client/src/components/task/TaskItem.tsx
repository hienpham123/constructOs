import { Box, Chip, IconButton, ListItem, ListItemText, Stack, Typography, Divider, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useRef } from 'react';
import { ExpandMore, ExpandLess, ChevronRight, ArrowRight, Add, Delete, Edit } from '@mui/icons-material';
import { ProjectTask } from '../../types';
import { formatDate } from '../../utils/dateFormat';
import TaskStatusSelect, { statusLabels, statusStyleMap } from './TaskStatusSelect';

interface TaskItemProps {
  task: ProjectTask;
  depth?: number;
  isExpanded: boolean;
  expandedTasks: Set<string>;
  onToggleExpand: (taskId: string) => void;
  onStatusChange: (status: ProjectTask['status']) => void; // Callback này đã được bind với task.id từ TaskList
  onAddChild: () => void; // Callback này đã được bind với task từ TaskList
  onDelete: () => void;
  onEdit?: () => void; // Callback để edit task
  currentUserId: string;
  isProjectManager: boolean;
  isHighlighted?: boolean; // Highlight task này
  highlightTaskId?: string; // Task ID cần highlight (để truyền xuống children)
  // Thêm prop để truyền callback gốc từ TaskList (có taskId)
  onStatusChangeWithTaskId?: (taskId: string, status: ProjectTask['status']) => void;
  onAddChildWithTask?: (task: ProjectTask) => void; // Callback gốc từ TaskList để task con có thể dùng
  onDeleteWithTaskId?: (taskId: string) => void; // Callback gốc từ TaskList để task con có thể dùng
  onEditWithTask?: (task: ProjectTask) => void; // Callback gốc từ TaskList để task con có thể dùng
}

export default function TaskItem({
  task,
  depth = 0,
  isExpanded,
  expandedTasks,
  onToggleExpand,
  onStatusChange,
  onAddChild,
  onDelete,
  onEdit,
  currentUserId,
  isProjectManager,
  isHighlighted = false,
  highlightTaskId,
  onStatusChangeWithTaskId, // Callback gốc từ TaskList
  onAddChildWithTask, // Callback gốc từ TaskList
  onDeleteWithTaskId, // Callback gốc từ TaskList
  onEditWithTask, // Callback gốc từ TaskList
}: TaskItemProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const hasChildren = task.children && task.children.length > 0;
  // Check permission: assigned user or project manager can change status
  // NHƯNG: Task cha có task con thì không thể thay đổi status thủ công (tính tự động)
  const canChangeStatus = (isProjectManager || task.assignedTo === currentUserId) && !hasChildren;
  // Only project manager can add child tasks
  const canAddChild = isProjectManager;
  const taskRef = useRef<HTMLDivElement>(null);

  // Scroll to highlighted task
  useEffect(() => {
    if (isHighlighted && taskRef.current) {
      setTimeout(() => {
        taskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300); // Delay để đợi expand animation
    }
  }, [isHighlighted]);

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
      {canChangeStatus ? (
        <TaskStatusSelect value={task.status} onChange={onStatusChange} />
      ) : (
        <TaskStatusSelect 
          value={task.status} 
          onChange={() => {}} 
          disabled 
          title={hasChildren ? 'Status được tính tự động dựa trên task con' : 'Không có quyền thay đổi status'}
        />
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
      {isProjectManager && onEdit && (
        <IconButton
          size="small"
          onClick={onEdit}
          title="Chỉnh sửa công việc"
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          <Edit fontSize="small" />
        </IconButton>
      )}
      {isProjectManager && (
        <IconButton
          size="small"
          onClick={onDelete}
          title="Xóa công việc (sẽ xóa cả task con)"
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, color: 'error.main' }}
        >
          <Delete fontSize="small" />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <Box 
      ref={taskRef}
      sx={{ 
        ml: { xs: depth, sm: depth * 2 }, 
        borderLeft: depth > 0 ? '1px dashed #e0e0e0' : 'none', 
        pl: { xs: depth > 0 ? 1 : 0, sm: depth > 0 ? 2 : 0 },
        backgroundColor: isHighlighted ? '#e3f2fd' : 'transparent',
        borderRadius: isHighlighted ? '4px' : 0,
        p: isHighlighted ? 1 : 0,
        transition: 'background-color 0.3s ease',
      }}
    >
      {isMobile ? (
        <Box>
          <ListItem
            sx={{ 
              flexDirection: 'column', 
              alignItems: 'stretch', 
              px: { xs: 1, sm: 2 },
              backgroundColor: isHighlighted ? 'transparent' : undefined,
            }}
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
          sx={{
            backgroundColor: isHighlighted ? 'transparent' : undefined,
          }}
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
              onStatusChange={(status) => {
                // Sử dụng callback gốc từ TaskList với child.id
                    if (onStatusChangeWithTaskId) {
                      onStatusChangeWithTaskId(child.id, status);
                    } else {
                      onStatusChange(status);
                    }
              }}
              onAddChild={() => {
                if (onAddChildWithTask) {
                  onAddChildWithTask(child);
                } else {
                  onAddChild();
                }
              }}
              onDelete={() => {
                if (onDeleteWithTaskId) {
                  onDeleteWithTaskId(child.id);
                } else {
                  onDelete();
                }
              }}
              onEdit={() => {
                if (onEditWithTask) {
                  onEditWithTask(child);
                } else if (onEdit) {
                  onEdit();
                }
              }}
              currentUserId={currentUserId}
              isProjectManager={isProjectManager}
              isHighlighted={child.id === highlightTaskId}
              highlightTaskId={highlightTaskId}
              onStatusChangeWithTaskId={onStatusChangeWithTaskId} // Truyền xuống cho task con
              onAddChildWithTask={onAddChildWithTask} // Truyền xuống cho task con
              onDeleteWithTaskId={onDeleteWithTaskId} // Truyền xuống cho task con
              onEditWithTask={onEditWithTask} // Truyền xuống cho task con
            />
          ))}
        </Box>
      )}
      <Divider sx={{ my: { xs: 0.5, sm: 1 } }} />
    </Box>
  );
}

