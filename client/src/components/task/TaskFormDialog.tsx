import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  MenuItem,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from '../../config/dayjs';
import 'dayjs/locale/vi';
import { Button, Input, DatePicker, PeoplePicker } from '../common';
import { ProjectTask } from '../../types';
import { PeoplePickerOption } from '../common/PeoplePicker';

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    priority: ProjectTask['priority'];
    dueDate?: string;
    assignedTo: string;
  }) => Promise<void>;
  parentTask?: ProjectTask | null;
  taskToEdit?: ProjectTask | null; // Task cần edit
  isLoading?: boolean;
}

export default function TaskFormDialog({
  open,
  onClose,
  onSubmit,
  parentTask,
  taskToEdit,
  isLoading = false,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ProjectTask['priority']>('normal');
  const [dueDate, setDueDate] = useState<dayjs.Dayjs | null>(null);
  const [assignedTo, setAssignedTo] = useState<PeoplePickerOption | null>(null);

  useEffect(() => {
    if (open && taskToEdit) {
      // Edit mode: load task data
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate ? dayjs(taskToEdit.dueDate) : null);
      setAssignedTo({
        id: taskToEdit.assignedTo,
        name: taskToEdit.assignedToName || taskToEdit.assignedTo,
      } as PeoplePickerOption);
    } else if (!open) {
      // Reset form when dialog closes
      setTitle('');
      setDescription('');
      setPriority('normal');
      setDueDate(null);
      setAssignedTo(null);
    }
  }, [open, taskToEdit]);

  const handleSubmit = async () => {
    if (!title.trim() || !assignedTo) {
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? dueDate.format('YYYY-MM-DD') : undefined,
      assignedTo: assignedTo.id,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {taskToEdit ? 'Chỉnh sửa công việc' : parentTask ? `Tạo công việc con của "${parentTask.title}"` : 'Tạo công việc mới'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Input
              label="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />
            <Input
              label="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction="row" spacing={2}>
              <Input
                select
                label="Độ ưu tiên"
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectTask['priority'])}
                fullWidth
              >
                <MenuItem value="low">Thấp</MenuItem>
                <MenuItem value="normal">Thường</MenuItem>
                <MenuItem value="high">Cao</MenuItem>
              </Input>
              <DatePicker
                label="Hạn hoàn thành"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Stack>
            <PeoplePicker
              label="Người được giao"
              value={assignedTo}
              onChange={(value) => setAssignedTo(value as PeoplePickerOption | null)}
              placeholder="Chọn người được giao..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!title.trim() || !assignedTo || isLoading}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

