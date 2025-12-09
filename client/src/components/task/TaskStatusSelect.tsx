import { MenuItem, TextField } from '@mui/material';
import { ProjectTask } from '../../types';

const statusLabels: Record<ProjectTask['status'], string> = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang làm',
  submitted: 'Chờ duyệt',
  completed: 'Hoàn thành',
  blocked: 'Tắc nghẽn',
  cancelled: 'Hủy',
};

const statusColors: Record<ProjectTask['status'], 'default' | 'primary' | 'warning' | 'success' | 'error' | 'info'> = {
  pending: 'default',
  in_progress: 'info',
  submitted: 'warning',
  completed: 'success',
  blocked: 'error',
  cancelled: 'error',
};

const transitionRules: Record<ProjectTask['status'], ProjectTask['status'][]> = {
  pending: ['in_progress', 'blocked', 'cancelled'],
  in_progress: ['submitted', 'blocked', 'cancelled'],
  submitted: ['completed', 'blocked', 'cancelled'],
  blocked: ['in_progress', 'cancelled'],
  completed: [],
  cancelled: [],
};

interface TaskStatusSelectProps {
  value: ProjectTask['status'];
  onChange: (status: ProjectTask['status']) => void;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

export default function TaskStatusSelect({ value, onChange, size = 'small', disabled = false }: TaskStatusSelectProps) {
  const nextStatuses = transitionRules[value] || [];

  return (
    <TextField
      select
      size={size}
      value={value}
      onChange={(e) => onChange(e.target.value as ProjectTask['status'])}
      disabled={disabled}
      sx={{ minWidth: 140 }}
    >
      <MenuItem value={value} disabled>
        Trạng thái hiện tại
      </MenuItem>
      {nextStatuses.map((s) => (
        <MenuItem key={s} value={s}>
          {statusLabels[s]}
        </MenuItem>
      ))}
    </TextField>
  );
}

export { statusLabels, statusColors };

