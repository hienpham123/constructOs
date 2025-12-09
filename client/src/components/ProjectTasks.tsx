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

interface ProjectTasksProps {
  projectId: string;
}

export default function ProjectTasks({ projectId }: ProjectTasksProps) {
  const { tasks, fetchTasks, addTask, updateStatus, isLoading } = useTaskStore();
  const { selectedProject } = useProjectStore();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [parentTask, setParentTask] = useState<ProjectTask | null>(null);
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

  // Auto-expand all tasks with children when tasks are loaded
  useEffect(() => {
    const expandAllTasks = (items: ProjectTask[]): Set<string> => {
      const expanded = new Set<string>();
      items.forEach((task) => {
        if (task.children && task.children.length > 0) {
          expanded.add(task.id);
          // Recursively expand children
          const childExpanded = expandAllTasks(task.children);
          childExpanded.forEach((id) => expanded.add(id));
        }
      });
      return expanded;
    };
    if (tasks.length > 0) {
      setExpandedTasks(expandAllTasks(tasks));
    }
  }, [tasks]);

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

  const handleStatusChange = async (taskId: string, newStatus: ProjectTask['status']) => {
    await updateStatus(taskId, newStatus);
    // Refresh tasks to ensure children are still visible
    await fetchTasks(projectId);
  };

  const handleAddChild = (task: ProjectTask) => {
    setParentTask(task);
    setOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setParentTask(null);
    setOpen(true);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Giao việc theo từng bậc</Typography>
        {isProjectManager && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
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
        isLoading={isLoading}
        currentUserId={user?.id || ''}
        isProjectManager={isProjectManager}
      />

      <TaskFormDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setParentTask(null);
        }}
        onSubmit={handleCreate}
        parentTask={parentTask}
        isLoading={isLoading}
      />
    </Box>
  );
}
