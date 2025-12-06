import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useMaterialStore } from '../stores/materialStore';
import { useProjectStore } from '../stores/projectStore';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { formatDate } from '../utils/dateFormat';
import { DataTable, Button } from '../components/common';
import type { Material } from '../types';

interface MaterialsProps {
  tab?: 'list' | 'transactions' | 'purchase-requests';
}

export default function Materials({ tab = 'list' }: MaterialsProps) {
  const navigate = useNavigate();
  // Use separate selectors to ensure re-render
  const transactions = useMaterialStore((state) => state.transactions);
  const transactionsTotal = useMaterialStore((state) => state.transactionsTotal);
  const materials = useMaterialStore((state) => state.materials);
  const materialsTotal = useMaterialStore((state) => state.materialsTotal);
  const purchaseRequests = useMaterialStore((state) => state.purchaseRequests);
  const purchaseRequestsTotal = useMaterialStore((state) => state.purchaseRequestsTotal);
  const isLoading = useMaterialStore((state) => state.isLoading);
  const fetchMaterials = useMaterialStore((state) => state.fetchMaterials);
  const fetchTransactions = useMaterialStore((state) => state.fetchTransactions);
  const fetchPurchaseRequests = useMaterialStore((state) => state.fetchPurchaseRequests);
  const deleteMaterial = useMaterialStore((state) => state.deleteMaterial);
  const deleteTransaction = useMaterialStore((state) => state.deleteTransaction);
  const deletePurchaseRequest = useMaterialStore((state) => state.deletePurchaseRequest);
  const updatePurchaseRequest = useMaterialStore((state) => state.updatePurchaseRequest);
  const { fetchProjects } = useProjectStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsPerPage, page, tab]);

  // Fetch all materials once when switching to transactions or purchase-requests tab
  useEffect(() => {
    if ((tab === 'transactions' || tab === 'purchase-requests') && materials.length < 100) {
      fetchMaterials(1000, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/materials/add')}>
            Thêm vật tư
          </Button>
        )}
        {tab === 'transactions' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/materials/transactions/add')}>
            Thêm giao dịch
          </Button>
        )}
        {tab === 'purchase-requests' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/materials/purchase-requests/add')}>
            Thêm đề xuất mua hàng
          </Button>
        )}
      </Box>

      {tab === 'list' && (
        <DataTable<Material>
          columns={[
            {
              label: 'Tên vật tư',
              field: 'name',
              width: 250,
              minWidth: 200,
            },
            {
              label: 'Chủng loại',
              field: 'type',
              width: 150,
              minWidth: 120,
              render: (value, row) => value || (row as any).category || '-',
            },
            {
              label: 'Tồn kho',
              field: 'currentStock',
              width: 150,
              minWidth: 120,
              render: (value, row) => `${value} ${row.unit}`,
            },
            {
              label: 'Đơn giá nhập',
              field: 'importPrice',
              width: 180,
              minWidth: 150,
              render: (value, row) => formatCurrency(value || (row as any).unitPrice || 0),
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
                />
              ),
            },
          ]}
          data={materials}
          actions={{
            onEdit: (material) => {
              navigate(`/materials/edit/${material.id}`);
            },
            onDelete: (material) => {
              setSelectedMaterialState(material);
              setDeleteOpen(true);
            },
          }}
          pagination={{
            count: materialsTotal,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleChangeRowsPerPage,
          }}
          minWidth={800}
          emptyMessage="Không có vật tư nào"
        />
      )}

      {tab === 'transactions' && (
        <DataTable
          columns={[
            {
              label: 'Ngày',
              field: 'performedAt',
              width: 150,
              minWidth: 120,
              render: (value) => formatDate(value),
            },
            {
              label: 'Vật tư',
              field: 'materialName',
              width: 200,
              minWidth: 150,
            },
            {
              label: 'Loại',
              field: 'type',
              width: 120,
              minWidth: 100,
              render: (value) => (
                <Chip
                  label={getTransactionTypeLabel(value)}
                  color={value === 'import' ? 'success' : 'default'}
                  size="small"
                />
              ),
            },
            {
              label: 'Số lượng',
              field: 'quantity',
              width: 120,
              minWidth: 100,
              render: (value, row) => `${value} ${row.unit}`,
            },
            {
              label: 'Dự án',
              field: 'projectName',
              width: 200,
              minWidth: 150,
              render: (value) => value || '-',
            },
            {
              label: 'Lý do',
              field: 'reason',
              width: 200,
              minWidth: 150,
            },
            {
              label: 'Người thực hiện',
              field: 'performedBy',
              width: 150,
              minWidth: 120,
              render: (value) => value || '-',
            },
          ]}
          data={transactions.filter((t) => t && t.id)}
          actions={{
            onEdit: (transaction) => {
              navigate(`/materials/transactions/edit/${transaction.id}`);
            },
            onDelete: (transaction) => {
              setSelectedTransaction(transaction);
              setTransactionDeleteOpen(true);
            },
          }}
          pagination={{
            count: transactionsTotal,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleChangeRowsPerPage,
          }}
          minWidth={1000}
          emptyMessage="Chưa có giao dịch nào"
        />
      )}

      {tab === 'purchase-requests' && (
        <>
          <Box display="flex" justifyContent="flex-end" mb={2}>
          </Box>
          <DataTable
            columns={[
              {
                label: 'Ngày đề xuất',
                field: 'requestedAt',
                width: 150,
                minWidth: 120,
                render: (value) => formatDate(value),
              },
              {
                label: 'Vật tư',
                field: 'materialName',
                width: 200,
                minWidth: 150,
              },
              {
                label: 'Số lượng',
                field: 'quantity',
                width: 120,
                minWidth: 100,
                render: (value, row) => `${value} ${row.unit}`,
              },
              {
                label: 'Lý do',
                field: 'reason',
                width: 200,
                minWidth: 150,
              },
              {
                label: 'Trạng thái',
                field: 'status',
                width: 150,
                minWidth: 120,
                render: (value) => (
                  <Chip
                    label={getRequestStatusLabel(value)}
                    color={value === 'approved' ? 'success' : value === 'pending' ? 'warning' : 'default'}
                    size="small"
                  />
                ),
              },
            ]}
            data={purchaseRequests}
            actions={{
              customActions: (request) =>
                request.status === 'pending'
                  ? [
                      {
                        label: 'Duyệt',
                        icon: <CheckIcon fontSize="small" />,
                        onClick: async () => {
                          await updatePurchaseRequest(request.id, 'approved');
                          if (tab === 'purchase-requests') {
                            fetchPurchaseRequests(rowsPerPage, page);
                          }
                        },
                        color: 'success' as const,
                      },
                      {
                        label: 'Từ chối',
                        icon: <CloseIcon fontSize="small" />,
                        onClick: async () => {
                          await updatePurchaseRequest(request.id, 'rejected');
                          if (tab === 'purchase-requests') {
                            fetchPurchaseRequests(rowsPerPage, page);
                          }
                        },
                        color: 'error' as const,
                      },
                    ]
                  : [],
              onEdit: (request) => {
                navigate(`/materials/purchase-requests/edit/${request.id}`);
              },
              onDelete: (request) => {
                setSelectedPurchaseRequest(request);
                setPurchaseRequestDeleteOpen(true);
              },
              editLabel: 'Xem chi tiết',
            }}
            pagination={{
              count: purchaseRequestsTotal,
              page,
              rowsPerPage,
              onPageChange: handleChangePage,
              onRowsPerPageChange: handleChangeRowsPerPage,
            }}
            minWidth={900}
            emptyMessage="Không có đề xuất mua hàng nào"
          />
        </>
      )}

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

