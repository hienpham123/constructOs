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
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEquipmentStore } from '../stores/equipmentStore';
import { formatDate, formatDateTime } from '../utils/dateFormat';
import EquipmentForm from '../components/forms/EquipmentForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

export default function Equipment() {
  const { equipment, usage, maintenanceSchedules, isLoading, fetchEquipment, fetchUsage, fetchMaintenanceSchedules, deleteEquipment } = useEquipmentStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  useEffect(() => {
    fetchEquipment();
    fetchUsage();
    fetchMaintenanceSchedules();
  }, [fetchEquipment, fetchUsage, fetchMaintenanceSchedules]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'excavator':
        return 'Máy xúc';
      case 'crane':
        return 'Cần cẩu';
      case 'truck':
        return 'Xe tải';
      case 'concrete_mixer':
        return 'Máy trộn bê tông';
      case 'generator':
        return 'Máy phát điện';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'in_use':
        return 'primary';
      case 'maintenance':
        return 'warning';
      case 'broken':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Sẵn sàng';
      case 'in_use':
        return 'Đang sử dụng';
      case 'maintenance':
        return 'Bảo trì';
      case 'broken':
        return 'Hỏng';
      default:
        return status;
    }
  };

  const getMaintenanceStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      case 'overdue':
        return 'Quá hạn';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Quản lý thiết bị</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
          setSelectedEquipment(null);
          setFormOpen(true);
        }}>
          Thêm thiết bị
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Danh sách thiết bị" />
          <Tab label="Lịch sử sử dụng" />
          <Tab label="Lịch bảo trì" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã thiết bị</TableCell>
                <TableCell>Tên thiết bị</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Dự án</TableCell>
                <TableCell>Người sử dụng</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipment
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((eq) => (
                  <TableRow key={eq.id} hover>
                    <TableCell>{eq.code}</TableCell>
                    <TableCell>{eq.name}</TableCell>
                    <TableCell>{getTypeLabel(eq.type)}</TableCell>
                    <TableCell>{eq.currentProjectName || '-'}</TableCell>
                    <TableCell>{eq.currentUser || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(eq.status)}
                        color={getStatusColor(eq.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedEquipment(eq);
                            setFormOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedEquipment(eq);
                            setDeleteOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={equipment.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
          />
        </TableContainer>
      )}

      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thiết bị</TableCell>
                <TableCell>Dự án</TableCell>
                <TableCell>Người sử dụng</TableCell>
                <TableCell>Thời gian bắt đầu</TableCell>
                <TableCell>Thời gian kết thúc</TableCell>
                <TableCell>Tiêu hao nhiên liệu</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usage
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.equipmentName}</TableCell>
                    <TableCell>{u.projectName}</TableCell>
                    <TableCell>{u.userName}</TableCell>
                    <TableCell>
                      {formatDateTime(u.startTime)}
                    </TableCell>
                    <TableCell>
                      {u.endTime
                        ? formatDateTime(u.endTime)
                        : '-'}
                    </TableCell>
                    <TableCell>{u.fuelConsumption ? `${u.fuelConsumption}L` : '-'}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={usage.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
          />
        </TableContainer>
      )}

      {tabValue === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thiết bị</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Ngày lên lịch</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Chi phí</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenanceSchedules
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((schedule) => (
                  <TableRow key={schedule.id} hover>
                    <TableCell>{schedule.equipmentName}</TableCell>
                    <TableCell>
                      {schedule.type === 'routine' ? 'Định kỳ' : schedule.type === 'repair' ? 'Sửa chữa' : 'Kiểm tra'}
                    </TableCell>
                    <TableCell>
                      {formatDate(schedule.scheduledDate)}
                    </TableCell>
                    <TableCell>{schedule.description}</TableCell>
                    <TableCell>
                      {schedule.cost
                        ? new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(schedule.cost)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getMaintenanceStatusLabel(schedule.status)}
                        color={schedule.status === 'completed' ? 'success' : schedule.status === 'overdue' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={maintenanceSchedules.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
          />
        </TableContainer>
      )}

      <EquipmentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedEquipment(null);
          fetchEquipment();
        }}
        equipment={selectedEquipment}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedEquipment(null);
        }}
        onConfirm={async () => {
          if (selectedEquipment) {
            await deleteEquipment(selectedEquipment.id);
            setDeleteOpen(false);
            setSelectedEquipment(null);
            fetchEquipment();
          }
        }}
        title="Xóa thiết bị"
        message={`Bạn có chắc chắn muốn xóa thiết bị "${selectedEquipment?.name}"?`}
      />
    </Box>
  );
}

