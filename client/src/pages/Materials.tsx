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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useMaterialStore } from '../stores/materialStore';
import { useProjectStore } from '../stores/projectStore';
import MaterialForm from '../components/forms/MaterialForm';
import TransactionForm from '../components/forms/TransactionForm';
import PurchaseRequestForm from '../components/forms/PurchaseRequestForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { formatDate } from '../utils/dateFormat';

interface MaterialsProps {
  tab?: 'list' | 'transactions' | 'purchase-requests';
}

export default function Materials({ tab = 'list' }: MaterialsProps) {
  const { materials, materialsTotal, transactions, transactionsTotal, purchaseRequests, purchaseRequestsTotal, isLoading, fetchMaterials, fetchTransactions, fetchPurchaseRequests, deleteMaterial, deleteTransaction, deletePurchaseRequest, updatePurchaseRequest } = useMaterialStore();
  const { fetchProjects } = useProjectStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [purchaseRequestFormOpen, setPurchaseRequestFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [transactionDeleteOpen, setTransactionDeleteOpen] = useState(false);
  const [purchaseRequestDeleteOpen, setPurchaseRequestDeleteOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterialState] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
    if (tab === 'list') {
      fetchMaterials(rowsPerPage, page);
    }
    if (tab === 'transactions') {
      fetchTransactions(rowsPerPage, page);
    }
    if (tab === 'purchase-requests') {
      fetchPurchaseRequests(rowsPerPage, page);
    }
  }, [fetchMaterials, fetchTransactions, fetchPurchaseRequests, fetchProjects, rowsPerPage, page, tab]);

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
      case 'available':
        return 'success';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'low_stock':
        return 'Sắp hết';
      case 'out_of_stock':
        return 'Hết hàng';
      default:
        return status;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'import':
        return 'Nhập kho';
      case 'export':
        return 'Xuất kho';
      case 'adjustment':
        return 'Điều chỉnh';
      default:
        return type;
    }
  };

  const getRequestStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'ordered':
        return 'Đã đặt hàng';
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
        return 'Danh sách vật tư';
      case 'transactions':
        return 'Nhập xuất kho';
      case 'purchase-requests':
        return 'Đề xuất mua hàng';
      default:
        return 'Quản lý vật tư';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">{getTitle()}</Typography>
        {tab === 'list' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedMaterialState(null); setFormOpen(true); }}>
            Thêm vật tư
          </Button>
        )}
        {tab === 'transactions' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
            setSelectedTransaction(null);
            setTransactionFormOpen(true);
          }}>
            Thêm giao dịch
          </Button>
        )}
        {tab === 'purchase-requests' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
            setSelectedPurchaseRequest(null);
            setPurchaseRequestFormOpen(true);
          }}>
            Thêm đề xuất mua hàng
          </Button>
        )}
      </Box>

      {tab === 'list' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã vật tư</TableCell>
                <TableCell>Tên vật tư</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Tồn kho</TableCell>
                <TableCell>Đơn giá</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material) => (
                  <TableRow key={material.id} hover>
                    <TableCell>{material.code}</TableCell>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.category}</TableCell>
                    <TableCell>
                      {material.currentStock} {material.unit}
                    </TableCell>
                    <TableCell>{formatCurrency(material.unitPrice)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(material.status)}
                        color={getStatusColor(material.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={() => { setSelectedMaterialState(material); setFormOpen(true); }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" onClick={() => { setSelectedMaterialState(material); setDeleteOpen(true); }} color="error">
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
            count={materialsTotal}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
          />
        </TableContainer>
      )}

      {tab === 'transactions' && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Vật tư</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Dự án</TableCell>
                  <TableCell>Lý do</TableCell>
                  <TableCell>Người thực hiện</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        {formatDate(transaction.performedAt)}
                      </TableCell>
                      <TableCell>{transaction.materialName}</TableCell>
                      <TableCell>
                        <Chip
                          label={getTransactionTypeLabel(transaction.type)}
                          color={transaction.type === 'import' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {transaction.quantity} {transaction.unit}
                      </TableCell>
                      <TableCell>{transaction.projectName || '-'}</TableCell>
                      <TableCell>{transaction.reason}</TableCell>
                      <TableCell>{transaction.performedBy || '-'}</TableCell>
                      <TableCell>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setTransactionFormOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setTransactionDeleteOpen(true);
                            }}
                            color="error"
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
              count={transactionsTotal}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng mỗi trang:"
            />
          </TableContainer>
        </>
      )}

      {tab === 'purchase-requests' && (
        <>
          <Box display="flex" justifyContent="flex-end" mb={2}>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày đề xuất</TableCell>
                  <TableCell>Vật tư</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Lý do</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        {formatDate(request.requestedAt)}
                      </TableCell>
                      <TableCell>{request.materialName}</TableCell>
                      <TableCell>
                        {request.quantity} {request.unit}
                      </TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={getRequestStatusLabel(request.status)}
                          color={request.status === 'approved' ? 'success' : request.status === 'pending' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <>
                            <Tooltip title="Duyệt">
                              <IconButton
                                size="small"
                                onClick={async () => {
                                  await updatePurchaseRequest(request.id, 'approved');
                                  if (tab === 'purchase-requests') {
                                    fetchPurchaseRequests(rowsPerPage, page);
                                  }
                                }}
                                sx={{ color: 'success.main' }}
                              >
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Từ chối">
                              <IconButton
                                size="small"
                                onClick={async () => {
                                  await updatePurchaseRequest(request.id, 'rejected');
                                  if (tab === 'purchase-requests') {
                                    fetchPurchaseRequests(rowsPerPage, page);
                                  }
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedPurchaseRequest(request);
                              setPurchaseRequestFormOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedPurchaseRequest(request);
                              setPurchaseRequestDeleteOpen(true);
                            }}
                            color="error"
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
              count={purchaseRequestsTotal}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng mỗi trang:"
            />
          </TableContainer>
        </>
      )}

      <MaterialForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedMaterialState(null);
        }}
        material={selectedMaterial}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedMaterialState(null);
        }}
        onConfirm={async () => {
          if (selectedMaterial) {
            await deleteMaterial(selectedMaterial.id);
          }
        }}
        itemName={selectedMaterial?.name}
      />

      <TransactionForm
        open={transactionFormOpen}
        onClose={() => {
          setTransactionFormOpen(false);
          setSelectedTransaction(null);
          if (tab === 'transactions') {
            fetchTransactions(rowsPerPage, page);
          }
        }}
        transaction={selectedTransaction}
      />

      <DeleteConfirmDialog
        open={transactionDeleteOpen}
        onClose={() => {
          setTransactionDeleteOpen(false);
          setSelectedTransaction(null);
        }}
        onConfirm={async () => {
          if (selectedTransaction) {
            await deleteTransaction(selectedTransaction.id);
            setTransactionDeleteOpen(false);
            setSelectedTransaction(null);
            if (tab === 'transactions') {
              fetchTransactions(rowsPerPage, page);
            }
          }
        }}
        title="Xóa giao dịch"
        message={`Bạn có chắc chắn muốn xóa giao dịch này?`}
      />

      <PurchaseRequestForm
        open={purchaseRequestFormOpen}
        onClose={() => {
          setPurchaseRequestFormOpen(false);
          setSelectedPurchaseRequest(null);
          if (tab === 'purchase-requests') {
            fetchPurchaseRequests(rowsPerPage, page);
          }
        }}
        purchaseRequest={selectedPurchaseRequest}
      />

      <DeleteConfirmDialog
        open={purchaseRequestDeleteOpen}
        onClose={() => {
          setPurchaseRequestDeleteOpen(false);
          setSelectedPurchaseRequest(null);
        }}
        onConfirm={async () => {
          if (selectedPurchaseRequest) {
            await deletePurchaseRequest(selectedPurchaseRequest.id);
            setPurchaseRequestDeleteOpen(false);
            setSelectedPurchaseRequest(null);
            if (tab === 'purchase-requests') {
              fetchPurchaseRequests(rowsPerPage, page);
            }
          }
        }}
        title="Xóa đề xuất mua hàng"
        message={`Bạn có chắc chắn muốn xóa đề xuất mua hàng này?`}
      />
    </Box>
  );
}

