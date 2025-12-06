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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useContractStore } from '../stores/contractStore';
import { formatDate } from '../utils/dateFormat';
import ContractForm from '../components/forms/ContractForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

export default function Contracts() {
  const { contracts, contractsTotal, isLoading, fetchContracts, deleteContract } = useContractStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  useEffect(() => {
    fetchContracts(rowsPerPage, page);
  }, [fetchContracts, rowsPerPage, page]);

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'construction':
        return 'Thi công';
      case 'supply':
        return 'Cung cấp';
      case 'service':
        return 'Dịch vụ';
      case 'labor':
        return 'Nhân công';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'draft':
        return 'default';
      case 'terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Bản nháp';
      case 'pending':
        return 'Chờ ký';
      case 'active':
        return 'Đang hiệu lực';
      case 'completed':
        return 'Hoàn thành';
      case 'terminated':
        return 'Chấm dứt';
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
        <Typography variant="h4">Quản lý hợp đồng</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
          setSelectedContract(null);
          setFormOpen(true);
        }}>
          Thêm hợp đồng
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã hợp đồng</TableCell>
              <TableCell>Tên hợp đồng</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Dự án</TableCell>
              <TableCell>Giá trị</TableCell>
              <TableCell>Ngày ký</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
                <TableRow key={contract.id} hover>
                  <TableCell>{contract.code}</TableCell>
                  <TableCell>{contract.name}</TableCell>
                  <TableCell>{getTypeLabel(contract.type)}</TableCell>
                  <TableCell>{contract.client}</TableCell>
                  <TableCell>{contract.projectName || '-'}</TableCell>
                  <TableCell>{formatCurrency(contract.value)}</TableCell>
                  <TableCell>
                    {contract.signedDate
                      ? formatDate(contract.signedDate)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(contract.status)}
                      color={getStatusColor(contract.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedContract(contract);
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
                          setSelectedContract(contract);
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
          count={contractsTotal}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </TableContainer>

      <ContractForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedContract(null);
          fetchContracts(rowsPerPage, page);
        }}
        contract={selectedContract}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedContract(null);
        }}
        onConfirm={async () => {
          if (selectedContract) {
            await deleteContract(selectedContract.id);
            setDeleteOpen(false);
            setSelectedContract(null);
            fetchContracts(rowsPerPage, page);
          }
        }}
        title="Xóa hợp đồng"
        message={`Bạn có chắc chắn muốn xóa hợp đồng "${selectedContract?.name}"?`}
      />
    </Box>
  );
}

