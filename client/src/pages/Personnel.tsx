import { useEffect, useState } from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePersonnelStore } from '../stores/personnelStore';
import PersonnelForm from '../components/forms/PersonnelForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

export default function Personnel() {
  const { personnel, attendance, isLoading, fetchPersonnel, fetchAttendance, deletePersonnel } = usePersonnelStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);

  useEffect(() => {
    fetchPersonnel();
    fetchAttendance();
  }, [fetchPersonnel, fetchAttendance]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
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
          onClick={() => { setSelectedPersonnel(null); setFormOpen(true); }}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
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
              <TableCell>Mã nhân sự</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Vị trí</TableCell>
              <TableCell>Tổ đội</TableCell>
              <TableCell>Dự án</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {personnel
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((person) => (
                <TableRow
                  key={person.id}
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
                      {person.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {person.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{person.phone}</TableCell>
                  <TableCell>{getPositionLabel(person.position)}</TableCell>
                  <TableCell>{person.team || '-'}</TableCell>
                  <TableCell>{person.projectName || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(person.status)}
                      color={getStatusColor(person.status) as any}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => { setSelectedPersonnel(person); setFormOpen(true); }}
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
                          onClick={() => { setSelectedPersonnel(person); setDeleteOpen(true); }}
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
          count={personnel.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </TableContainer>

      <PersonnelForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedPersonnel(null);
          fetchPersonnel();
        }}
        personnel={selectedPersonnel}
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

