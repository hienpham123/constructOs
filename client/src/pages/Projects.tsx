import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useProjectStore } from '../stores/projectStore';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { DataTable, Button } from '../components/common';
import type { Project } from '../types';

export default function Projects() {
  const navigate = useNavigate();
  const { projects, projectsTotal, isLoading, fetchProjects, deleteProject } = useProjectStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    fetchProjects(rowsPerPage, page);
  }, [fetchProjects, rowsPerPage, page]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quoting':
        return 'default';
      case 'contract_signed_in_progress':
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'on_hold':
        return 'warning';
      case 'design_consulting':
      case 'design_appraisal':
      case 'preparing_acceptance':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'quoting':
        return 'Đang báo giá';
      case 'contract_signed_in_progress':
        return 'Đã ký HĐ - Đang thi công';
      case 'completed':
        return 'Hoàn thành';
      case 'on_hold':
        return 'Tạm dừng';
      case 'design_consulting':
        return 'Tư vấn thiết kế';
      case 'in_progress':
        return 'Đang thi công';
      case 'design_appraisal':
        return 'Thẩm định thiết kế';
      case 'preparing_acceptance':
        return 'Chuẩn bị nghiệm thu';
      case 'failed':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const handleAdd = () => {
    navigate('/projects/add');
  };

  const handleEdit = (project: any) => {
    navigate(`/projects/edit/${project.id}`);
  };

  const handleDelete = (project: any) => {
    setSelectedProject(project);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedProject) {
      await deleteProject(selectedProject.id);
      setSelectedProject(null);
    }
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Quản lý dự án</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Thêm dự án
        </Button>
      </Box>

      <DataTable<Project>
        columns={[
          {
            label: 'Tên dự án',
            field: 'name',
            width: 250,
            minWidth: 200,
            render: (value) => (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {value}
              </Typography>
            ),
          },
          {
            label: 'Chủ đầu tư',
            field: 'investor',
            width: 200,
            minWidth: 150,
          },
          {
            label: 'Đầu mối',
            field: 'contactPerson',
            width: 150,
            minWidth: 120,
          },
          {
            label: 'Địa điểm',
            field: 'location',
            width: 200,
            minWidth: 150,
          },
          {
            label: 'Tiến độ',
            field: 'progress',
            width: 180,
            minWidth: 150,
            render: (value) => (
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 100 }}>
                  <LinearProgress
                    variant="determinate"
                    value={value}
                    sx={{
                      height: 8,
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 0,
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {value}%
                </Typography>
              </Box>
            ),
          },
          {
            label: 'Ngân sách',
            field: 'budget',
            width: 180,
            minWidth: 150,
            render: (value) => (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatCurrency(value)}
              </Typography>
            ),
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
        data={projects}
        actions={{
          onView: (project) => navigate(`/projects/${project.id}`),
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
        pagination={{
          count: projectsTotal,
          page,
          rowsPerPage,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleChangeRowsPerPage,
        }}
        minWidth={1000}
        emptyMessage="Không có dự án nào"
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={confirmDelete}
        itemName={selectedProject?.name}
      />
    </Box>
  );
}

