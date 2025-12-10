import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Button } from './common';
import { useTaskStore } from '../stores/taskStore';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { ProjectTask } from '../types';
import TaskList from './task/TaskList';
import TaskFormDialog from './task/TaskFormDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface ProjectTasksProps {
  projectId: string;
  highlightTaskId?: string; // Task ID để highlight khi load
}

export default function ProjectTasks({ projectId, highlightTaskId }: ProjectTasksProps) {
  const { tasks, fetchTasks, addTask, updateTask, updateStatus, deleteTask, isLoading } = useTaskStore();
  const { selectedProject } = useProjectStore();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [parentTask, setParentTask] = useState<ProjectTask | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Check if current user is project manager (check in managers array)
  const isProjectManager = React.useMemo(() => {
    if (!selectedProject || !user?.id) return false;
    
    // Check in managers array first
    if (selectedProject.managers && selectedProject.managers.length > 0) {
      const managerIds = selectedProject.managers.map(m => String(m.userId));
      const userId = String(user.id);
      return managerIds.includes(userId);
    }
    
    // Fallback to managerId for backward compatibility
    return String(selectedProject.managerId || '') === String(user.id);
  }, [selectedProject, user]);

  useEffect(() => {
    fetchTasks(projectId);
  }, [projectId, fetchTasks]);

  // Fetch lại tasks khi có highlightTaskId mới (khi click vào notification)
  // Đảm bảo task mới được giao sẽ hiển thị ngay
  const prevHighlightTaskIdRef = React.useRef<string | undefined>();
  useEffect(() => {
    if (highlightTaskId && highlightTaskId !== prevHighlightTaskIdRef.current) {
      prevHighlightTaskIdRef.current = highlightTaskId;
      // Luôn fetch lại tasks khi có highlightTaskId mới để đảm bảo task mới được hiển thị
      fetchTasks(projectId);
    }
  }, [highlightTaskId, projectId, fetchTasks]);

  // Auto-expand all tasks with children when tasks are loaded
  // Nếu có highlightTaskId, expand tất cả parent tasks để hiển thị task đó
  useEffect(() => {
    const expandAllTasks = (items: ProjectTask[], targetTaskId?: string): Set<string> => {
      const expanded = new Set<string>();
      
      const findTaskPath = (items: ProjectTask[], targetId: string, path: string[] = []): string[] | null => {
        for (const task of items) {
          const currentPath = [...path, task.id];
          if (task.id === targetId) {
            return currentPath;
          }
          if (task.children && task.children.length > 0) {
            const found = findTaskPath(task.children, targetId, currentPath);
            if (found) return found;
          }
        }
        return null;
      };

      // Nếu có highlightTaskId, tìm path và expand tất cả parent
      if (targetTaskId) {
        const path = findTaskPath(items, targetTaskId);
        if (path) {
          // Expand tất cả parent tasks
          path.forEach((taskId) => expanded.add(taskId));
        }
      }

      // Luôn expand tasks có children
      items.forEach((task) => {
        if (task.children && task.children.length > 0) {
          expanded.add(task.id);
          // Recursively expand children
          const childExpanded = expandAllTasks(task.children, targetTaskId);
          childExpanded.forEach((id) => expanded.add(id));
        }
      });
      return expanded;
    };
    
    if (tasks.length > 0) {
      setExpandedTasks(expandAllTasks(tasks, highlightTaskId));
    }
  }, [tasks, highlightTaskId]);

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleCreate = async (data: {
    title: string;
    description?: string;
    priority: ProjectTask['priority'];
    dueDate?: string;
    assignedTo: string;
  }) => {
    await addTask(projectId, {
      ...data,
      parentTaskId: parentTask?.id || null,
    });
    setOpen(false);
    setParentTask(null);
    // Auto-expand parent task if creating a child
    if (parentTask?.id) {
      setExpandedTasks((prev) => new Set(prev).add(parentTask.id));
    }
  };

  const handleEdit = async (data: {
    title: string;
    description?: string;
    priority: ProjectTask['priority'];
    dueDate?: string;
    assignedTo: string;
  }) => {
    if (!taskToEdit) return;
    
    await updateTask(taskToEdit.id, {
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate,
      assignedTo: data.assignedTo,
    });
    setOpen(false);
    setTaskToEdit(null);
    await fetchTasks(projectId);
  };

  const handleEditTask = (task: ProjectTask) => {
    setTaskToEdit(task);
    setParentTask(null);
    setOpen(true);
  };

  const handleStatusChange = async (taskId: string, newStatus: ProjectTask['status']) => {
    await updateStatus(taskId, newStatus);
    // Refresh tasks to ensure children are still visible
    await fetchTasks(projectId);
  };

  const handleAddChild = (task: ProjectTask) => {
    setParentTask(task);
    setOpen(true);
  };

  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteTask = (taskId: string) => {
    setDeleteTaskId(taskId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTaskId) {
      try {
        await deleteTask(deleteTaskId, projectId);
        // Đảm bảo refresh lại danh sách task sau khi xóa
        await fetchTasks(projectId);
        setDeleteTaskId(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error('Error deleting task:', error);
        // Error đã được handle trong taskStore
      }
    }
  };

  const handleOpenCreateDialog = () => {
    setParentTask(null);
    setTaskToEdit(null);
    setOpen(true);
  };

  return (
    <Box>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={{ xs: 2, sm: 0 }}
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Giao việc theo từng bậc</Typography>
        {isProjectManager && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
            sx={{ 
              minWidth: { xs: 'auto', sm: 160 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Thêm công việc
          </Button>
        )}
      </Stack>

      <TaskList
        tasks={tasks}
        expandedTasks={expandedTasks}
        onToggleExpand={toggleExpand}
        onStatusChange={handleStatusChange}
        onAddChild={handleAddChild}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
        isLoading={isLoading}
        currentUserId={user?.id || ''}
        isProjectManager={isProjectManager}
        highlightTaskId={highlightTaskId}
      />

      <TaskFormDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setParentTask(null);
          setTaskToEdit(null);
        }}
        onSubmit={taskToEdit ? handleEdit : handleCreate}
        parentTask={parentTask}
        taskToEdit={taskToEdit}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTaskId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xóa công việc"
        message="Bạn có chắc chắn muốn xóa công việc này? Xóa task cha sẽ xóa tất cả task con."
        confirmButtonText="Xóa"
        confirmButtonColor="error"
      />
    </Box>
  );
}
