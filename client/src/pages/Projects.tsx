import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useProjectStore } from '../stores/projectStore';
import ProjectForm from '../components/forms/ProjectForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { formatDate } from '../utils/dateFormat';

export default function Projects() {
  const navigate = useNavigate();
  const { projects, projectsTotal, isLoading, fetchProjects, deleteProject } = useProjectStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
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
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'on_hold':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return 'Lập kế hoạch';
      case 'in_progress':
        return 'Đang thi công';
      case 'on_hold':
        return 'Tạm dừng';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleAdd = () => {
    setSelectedProject(null);
    setFormOpen(true);
  };

  const handleEdit = (project: any) => {
    setSelectedProject(project);
    setFormOpen(true);
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

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f8fafc' : '#1e293b',
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  py: 2,
                },
              }}
            >
              <TableCell>Mã dự án</TableCell>
              <TableCell>Tên dự án</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Địa điểm</TableCell>
              <TableCell>Tiến độ</TableCell>
              <TableCell>Ngân sách</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
                <TableRow
                  key={project.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                    '& .MuiTableCell-body': {
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      py: 2,
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {project.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {project.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{project.location}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={project.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {project.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(project.budget)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status) as any}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/projects/${project.id}`)}
                          sx={{
                            color: 'info.main',
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(project)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(project)}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={projectsTotal}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </TableContainer>

      <ProjectForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedProject(null);
          fetchProjects(rowsPerPage, page);
        }}
        project={selectedProject}
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

