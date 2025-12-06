import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { usePersonnelStore } from '../stores/personnelStore';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { DataTable, Button } from '../components/common';

export default function Personnel() {
  const navigate = useNavigate();
  const { personnel, personnelTotal, attendance, isLoading, fetchPersonnel, fetchAttendance, deletePersonnel } = usePersonnelStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);

  useEffect(() => {
    fetchPersonnel(rowsPerPage, page);
    fetchAttendance();
  }, [fetchPersonnel, fetchAttendance, rowsPerPage, page]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'worker':
        return 'Công nhân';
      case 'engineer':
        return 'Kỹ sư';
      case 'supervisor':
        return 'Giám sát';
      case 'team_leader':
        return 'Tổ trưởng';
      default:
        return position;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'on_leave':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang làm việc';
      case 'inactive':
        return 'Không hoạt động';
      case 'on_leave':
        return 'Nghỉ phép';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Quản lý nhân sự
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý thông tin nhân sự và phân công dự án
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/personnel/add')}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 0,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0px 6px 16px rgba(25, 118, 210, 0.4)',
            },
          }}
        >
          Thêm nhân sự
        </Button>
      </Box>

      <DataTable
        columns={[
          {
            label: 'Mã nhân sự',
            field: 'code',
            width: 120,
            minWidth: 100,
            render: (value) => (
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {value}
              </Typography>
            ),
          },
          {
            label: 'Họ tên',
            field: 'name',
            width: 200,
            minWidth: 150,
            render: (value) => (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {value}
              </Typography>
            ),
          },
          {
            label: 'Số điện thoại',
            field: 'phone',
            width: 150,
            minWidth: 120,
          },
          {
            label: 'Vị trí',
            field: 'position',
            width: 150,
            minWidth: 120,
            render: (value) => getPositionLabel(value),
          },
          {
            label: 'Tổ đội',
            field: 'team',
            width: 150,
            minWidth: 120,
            render: (value) => value || '-',
          },
          {
            label: 'Dự án',
            field: 'projectName',
            width: 200,
            minWidth: 150,
            render: (value) => value || '-',
          },
          {
            label: 'Trạng thái',
            field: 'status',
            width: 150,
            minWidth: 120,
            render: (value) => (
              <Chip
                label={getStatusLabel(value)}
                color={getStatusColor(value) as any}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            ),
          },
        ]}
        data={personnel}
        actions={{
          onEdit: (person) => {
            navigate(`/personnel/edit/${person.id}`);
          },
          onDelete: (person) => {
            setSelectedPersonnel(person);
            setDeleteOpen(true);
          },
        }}
        pagination={{
          count: personnelTotal,
          page,
          rowsPerPage,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleChangeRowsPerPage,
        }}
        minWidth={1000}
        emptyMessage="Không có nhân sự nào"
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedPersonnel(null);
        }}
        onConfirm={async () => {
          if (selectedPersonnel) {
            await deletePersonnel(selectedPersonnel.id);
          }
        }}
        itemName={selectedPersonnel?.name}
      />
    </Box>
  );
}

