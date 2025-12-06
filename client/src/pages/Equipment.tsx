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
import { useEquipmentStore } from '../stores/equipmentStore';
import { formatDate, formatDateTime } from '../utils/dateFormat';
import EquipmentForm from '../components/forms/EquipmentForm';
import UsageForm from '../components/forms/UsageForm';
import MaintenanceScheduleForm from '../components/forms/MaintenanceScheduleForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

interface EquipmentProps {
  tab?: 'list' | 'usage' | 'maintenance';
}

export default function Equipment({ tab = 'list' }: EquipmentProps) {
  const { 
    equipment, equipmentTotal, 
    usage, usageTotal, 
    maintenanceSchedules, maintenanceSchedulesTotal, 
    isLoading, 
    fetchEquipment, fetchUsage, fetchMaintenanceSchedules, 
    deleteEquipment, deleteUsage, deleteMaintenanceSchedule 
  } = useEquipmentStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [usageFormOpen, setUsageFormOpen] = useState(false);
  const [maintenanceFormOpen, setMaintenanceFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [selectedUsage, setSelectedUsage] = useState<any>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // Fetch equipment list for dropdowns (only once when component mounts or tab changes)
  useEffect(() => {
    fetchEquipment(100, 0);
  }, [fetchEquipment, tab]);

  useEffect(() => {
    if (tab === 'list') {
      fetchEquipment(rowsPerPage, page);
    } else if (tab === 'usage') {
      fetchUsage(undefined, rowsPerPage, page);
    } else if (tab === 'maintenance') {
      fetchMaintenanceSchedules(undefined, rowsPerPage, page);
    }
  }, [fetchEquipment, fetchUsage, fetchMaintenanceSchedules, rowsPerPage, page, tab]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
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

  const getTitle = () => {
    switch (tab) {
      case 'list':
        return 'Danh sách thiết bị';
      case 'usage':
        return 'Lịch sử sử dụng';
      case 'maintenance':
        return 'Lịch bảo trì';
      default:
        return 'Quản lý thiết bị';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">{getTitle()}</Typography>
        {tab === 'list' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
            setSelectedEquipment(null);
            setFormOpen(true);
          }}>
            Thêm thiết bị
          </Button>
        )}
      </Box>

      {tab === 'list' && (
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
              {equipment.map((eq) => (
                  <TableRow key={eq.id} hover>
                    <TableCell>{eq.code}</TableCell>
                    <TableCell>{eq.name}</TableCell>
                    <TableCell>{getTypeLabel(eq.type)}</TableCell>
                    <TableCell>{eq.currentProjectName || '-'}</TableCell>
                    <TableCell>{eq.currentUser ? eq.currentUser : '-'}</TableCell>
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
            count={equipmentTotal}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
          />
        </TableContainer>
      )}

      {tab === 'usage' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Lịch sử sử dụng</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedUsage(null);
                setUsageFormOpen(true);
              }}
            >
              Thêm lịch sử sử dụng
            </Button>
          </Box>
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
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usage.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.equipmentName}</TableCell>
                    <TableCell>{u.projectName || '-'}</TableCell>
                    <TableCell>{u.userName || '-'}</TableCell>
                    <TableCell>
                      {formatDateTime(u.startTime)}
                    </TableCell>
                    <TableCell>
                      {u.endTime
                        ? formatDateTime(u.endTime)
                        : '-'}
                    </TableCell>
                    <TableCell>{u.fuelConsumption ? `${u.fuelConsumption}L` : '-'}</TableCell>
                    <TableCell>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUsage(u);
                            setUsageFormOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUsage(u);
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
              count={usageTotal}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng mỗi trang:"
            />
          </TableContainer>
        </>
      )}

      {tab === 'maintenance' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Lịch bảo trì</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedSchedule(null);
                setMaintenanceFormOpen(true);
              }}
            >
              Thêm lịch bảo trì
            </Button>
          </Box>
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
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maintenanceSchedules.map((schedule) => (
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
                    <TableCell>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setMaintenanceFormOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedSchedule(schedule);
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
              count={maintenanceSchedulesTotal}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng mỗi trang:"
            />
          </TableContainer>
        </>
      )}

      <EquipmentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedEquipment(null);
          if (tab === 'list') {
            fetchEquipment(rowsPerPage, page);
          }
        }}
        equipment={selectedEquipment}
      />
      <UsageForm
        open={usageFormOpen}
        onClose={() => {
          setUsageFormOpen(false);
          setSelectedUsage(null);
          if (tab === 'usage') {
            fetchUsage(undefined, rowsPerPage, page);
          }
        }}
        usage={selectedUsage}
      />
      <MaintenanceScheduleForm
        open={maintenanceFormOpen}
        onClose={() => {
          setMaintenanceFormOpen(false);
          setSelectedSchedule(null);
          if (tab === 'maintenance') {
            fetchMaintenanceSchedules(undefined, rowsPerPage, page);
          }
        }}
        schedule={selectedSchedule}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedEquipment(null);
          setSelectedUsage(null);
          setSelectedSchedule(null);
        }}
        onConfirm={async () => {
          if (selectedEquipment) {
            await deleteEquipment(selectedEquipment.id);
            setDeleteOpen(false);
            setSelectedEquipment(null);
            if (tab === 'list') {
              fetchEquipment(rowsPerPage, page);
            }
          } else if (selectedUsage) {
            await deleteUsage(selectedUsage.id);
            setDeleteOpen(false);
            setSelectedUsage(null);
            if (tab === 'usage') {
              fetchUsage(undefined, rowsPerPage, page);
            }
          } else if (selectedSchedule) {
            await deleteMaintenanceSchedule(selectedSchedule.id);
            setDeleteOpen(false);
            setSelectedSchedule(null);
            if (tab === 'maintenance') {
              fetchMaintenanceSchedules(undefined, rowsPerPage, page);
            }
          }
        }}
        title={selectedEquipment ? "Xóa thiết bị" : selectedUsage ? "Xóa lịch sử sử dụng" : "Xóa lịch bảo trì"}
        message={
          selectedEquipment 
            ? `Bạn có chắc chắn muốn xóa thiết bị "${selectedEquipment?.name}"?`
            : selectedUsage
            ? `Bạn có chắc chắn muốn xóa lịch sử sử dụng này?`
            : `Bạn có chắc chắn muốn xóa lịch bảo trì này?`
        }
      />
    </Box>
  );
}

