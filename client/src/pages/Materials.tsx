import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useMaterialStore } from '../stores/materialStore';
import { useProjectStore } from '../stores/projectStore';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { formatDate } from '../utils/dateFormat';
import { DataTable, Button, SearchInput } from '../components/common';
import type { SearchInputRef } from '../components/common/SearchInput';
import { mapSortField, getReverseFieldMap } from '../utils/sortFieldMapper';
import { exportToExcel } from '../utils/export';
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
  const [isExporting, setIsExporting] = useState(false);
  
  // Search and sort states for each tab
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Separate search/sort for transactions
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionSortBy, setTransactionSortBy] = useState<string>('performed_at');
  const [transactionSortOrder, setTransactionSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Separate search/sort for purchase requests
  const [purchaseRequestSearch, setPurchaseRequestSearch] = useState('');
  const [purchaseRequestSortBy, setPurchaseRequestSortBy] = useState<string>('requested_at');
  const [purchaseRequestSortOrder, setPurchaseRequestSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Refs for search inputs
  const searchInputRef = useRef<SearchInputRef>(null);
  const transactionSearchInputRef = useRef<SearchInputRef>(null);
  const purchaseRequestSearchInputRef = useRef<SearchInputRef>(null);
  const prevIsLoadingRef = useRef(isLoading);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === 'list') {
      fetchMaterials(rowsPerPage, page, search.trim() || undefined, sortBy, sortOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy, sortOrder, rowsPerPage, page, tab]);

  useEffect(() => {
    if (tab === 'transactions') {
      fetchTransactions(rowsPerPage, page, transactionSearch.trim() || undefined, transactionSortBy, transactionSortOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionSearch, transactionSortBy, transactionSortOrder, rowsPerPage, page, tab]);

  useEffect(() => {
    if (tab === 'purchase-requests') {
      fetchPurchaseRequests(rowsPerPage, page, purchaseRequestSearch.trim() || undefined, purchaseRequestSortBy, purchaseRequestSortOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseRequestSearch, purchaseRequestSortBy, purchaseRequestSortOrder, rowsPerPage, page, tab]);

  // Focus search input after data is loaded
  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading) {
      setTimeout(() => {
        if (tab === 'list' && search) {
          searchInputRef.current?.focus();
        } else if (tab === 'transactions' && transactionSearch) {
          transactionSearchInputRef.current?.focus();
        } else if (tab === 'purchase-requests' && purchaseRequestSearch) {
          purchaseRequestSearchInputRef.current?.focus();
        }
      }, 100);
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading, search, transactionSearch, purchaseRequestSearch, tab]);

  useEffect(() => {
    // Initial fetch when tab changes
    if (tab === 'list') {
      fetchMaterials(rowsPerPage, page, search.trim() || undefined, sortBy, sortOrder);
    }
    if (tab === 'transactions') {
      fetchTransactions(rowsPerPage, page, transactionSearch.trim() || undefined, transactionSortBy, transactionSortOrder);
    }
    if (tab === 'purchase-requests') {
      fetchPurchaseRequests(rowsPerPage, page, purchaseRequestSearch.trim() || undefined, purchaseRequestSortBy, purchaseRequestSortOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    const backendField = mapSortField(field, 'material');
    setSortBy(backendField);
    setSortOrder(order);
  };

  const handleTransactionSort = (field: string, order: 'asc' | 'desc') => {
    const backendField = mapSortField(field, 'transaction');
    setTransactionSortBy(backendField);
    setTransactionSortOrder(order);
  };

  const handlePurchaseRequestSort = (field: string, order: 'asc' | 'desc') => {
    const backendField = mapSortField(field, 'purchaseRequest');
    setPurchaseRequestSortBy(backendField);
    setPurchaseRequestSortOrder(order);
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

  // Only show full page loading if no data exists yet
  const hasData = tab === 'list' ? materials.length > 0 : 
                  tab === 'transactions' ? transactions.length > 0 : 
                  purchaseRequests.length > 0;
  
  if (isLoading && !hasData) {
    return <LinearProgress />;
  }


  const handleExportMaterials = async () => {
    setIsExporting(true);
    try {
      // Fetch all materials for export (use large page size to get all)
      await fetchMaterials(10000, 0);
      
      // Get materials from store after fetch
      const { materials: allMaterials } = useMaterialStore.getState();
      
      // Prepare data for export
      const exportData = allMaterials.map((material) => ({
        'Tên vật tư': material.name || '',
        'Chủng loại': material.type || '',
        'Đơn vị': material.unit || '',
        'Tồn kho': material.currentStock || 0,
        'Đơn giá nhập (VND)': material.importPrice || 0,
        'Nhà cung cấp': material.supplier || '',
        'Trạng thái': material.status === 'available' ? 'Có sẵn' : 
                      material.status === 'low_stock' ? 'Sắp hết' : 
                      material.status === 'out_of_stock' ? 'Hết hàng' : '',
      }));
      
      // Export with date time in filename (format: Danh_sach_vat_tu_YYYYMMDD_HHmmss.xlsx)
      exportToExcel(exportData, 'Danh_sach_vat_tu', 'Vật tư', true);
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting materials:', error);
      alert('Không thể xuất dữ liệu. Vui lòng thử lại.');
      setIsExporting(false);
    }
  };

  return (
    <Box>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        gap={1}
        sx={{
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        {tab === 'list' && (
          <>
            <Box sx={{ flex: { xs: 'none', md: 1 }, maxWidth: { xs: '100%', md: 280 }, width: { xs: '100%', md: 'auto' }, order: { xs: 1, md: 0 } }}>
              <SearchInput
                ref={searchInputRef}
                value={search}
                onChange={setSearch}
                placeholder="Tìm kiếm"
                debounceMs={1000}
              />
            </Box>
            <Box display="flex" gap={1} sx={{ order: { xs: 2, md: 0 } }}>
              <Button 
                variant="outlined" 
                startIcon={<FileDownloadIcon />} 
                onClick={handleExportMaterials}
                disabled={isExporting}
              >
                {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/materials/add')} sx={{ px: 2 }}>
                Thêm vật tư
              </Button>
            </Box>
          </>
        )}
        {tab === 'transactions' && (
          <>
            <Box sx={{ flex: { xs: 'none', md: 1 }, maxWidth: { xs: '100%', md: 280 }, width: { xs: '100%', md: 'auto' }, order: { xs: 1, md: 0 } }}>
              <SearchInput
                ref={transactionSearchInputRef}
                value={transactionSearch}
                onChange={setTransactionSearch}
                placeholder="Tìm kiếm"
                debounceMs={1000}
              />
            </Box>
            <Box sx={{ order: { xs: 2, md: 0 } }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/materials/transactions/add')} sx={{ px: 2 }}>
                Thêm giao dịch
              </Button>
            </Box>
          </>
        )}
        {tab === 'purchase-requests' && (
          <>
            <Box sx={{ flex: { xs: 'none', md: 1 }, maxWidth: { xs: '100%', md: 280 }, width: { xs: '100%', md: 'auto' }, order: { xs: 1, md: 0 } }}>
              <SearchInput
                ref={purchaseRequestSearchInputRef}
                value={purchaseRequestSearch}
                onChange={setPurchaseRequestSearch}
                placeholder="Tìm kiếm"
                debounceMs={1000}
              />
            </Box>
            <Box sx={{ order: { xs: 2, md: 0 } }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/materials/purchase-requests/add')} sx={{ px: 2 }}>
                Thêm đề xuất mua hàng
              </Button>
            </Box>
          </>
        )}
      </Box>

      {tab === 'list' && (
        <>
          {isLoading && materials.length > 0 && (
            <Box sx={{ position: 'relative', mb: 1 }}>
              <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />
            </Box>
          )}
          <DataTable<Material>
          columns={[
            {
              label: 'Tên vật tư',
              field: 'name',
              width: 250,
              minWidth: 200,
              sortable: true,
            },
            {
              label: 'Chủng loại',
              field: 'type',
              width: 150,
              minWidth: 120,
              sortable: true,
              render: (value, row) => value || (row as any).category || '-',
            },
            {
              label: 'Tồn kho',
              field: 'currentStock',
              width: 150,
              minWidth: 120,
              sortable: true,
              render: (value, row) => `${value} ${row.unit}`,
            },
            {
              label: 'Đơn giá nhập',
              field: 'importPrice',
              width: 180,
              minWidth: 150,
              sortable: true,
              render: (value, row) => formatCurrency(value || (row as any).unitPrice || 0),
            },
            {
              label: 'Trạng thái',
              field: 'status',
              width: 150,
              minWidth: 120,
              sortable: true,
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
          sortable={true}
          onSort={handleSort}
          sortField={sortBy ? getReverseFieldMap('material')[sortBy] || sortBy : undefined}
          sortOrder={sortOrder}
        />
        </>
      )}

      {tab === 'transactions' && (
        <>
          {isLoading && transactions.length > 0 && (
            <Box sx={{ position: 'relative', mb: 1 }}>
              <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />
            </Box>
          )}
          <DataTable
          columns={[
            {
              label: 'Ngày',
              field: 'performedAt',
              width: 150,
              minWidth: 120,
              sortable: true,
              render: (value) => formatDate(value),
            },
            {
              label: 'Vật tư',
              field: 'materialName',
              width: 200,
              minWidth: 150,
              sortable: true,
            },
            {
              label: 'Loại',
              field: 'type',
              width: 120,
              minWidth: 100,
              sortable: true,
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
              sortable: true,
              render: (value, row) => `${value} ${row.unit}`,
            },
            {
              label: 'Dự án',
              field: 'projectName',
              width: 200,
              minWidth: 150,
              sortable: true,
              render: (value) => value || '-',
            },
            {
              label: 'Lý do',
              field: 'reason',
              width: 200,
              minWidth: 150,
              sortable: false,
            },
            {
              label: 'Người thực hiện',
              field: 'performedBy',
              width: 150,
              minWidth: 120,
              sortable: false,
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
          sortable={true}
          onSort={handleTransactionSort}
          sortField={transactionSortBy ? getReverseFieldMap('transaction')[transactionSortBy] || transactionSortBy : undefined}
          sortOrder={transactionSortOrder}
        />
        </>
      )}

      {tab === 'purchase-requests' && (
        <>
          {isLoading && purchaseRequests.length > 0 && (
            <Box sx={{ position: 'relative', mb: 1 }}>
              <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />
            </Box>
          )}
          <DataTable
            columns={[
              {
                label: 'Ngày đề xuất',
                field: 'requestedAt',
                width: 150,
                minWidth: 120,
                sortable: true,
                render: (value) => formatDate(value),
              },
              {
                label: 'Vật tư',
                field: 'materialName',
                width: 200,
                minWidth: 150,
                sortable: true,
              },
              {
                label: 'Số lượng',
                field: 'quantity',
                width: 120,
                minWidth: 100,
                sortable: true,
                render: (value, row) => `${value} ${row.unit}`,
              },
              {
                label: 'Lý do',
                field: 'reason',
                width: 200,
                minWidth: 150,
                sortable: false,
              },
              {
                label: 'Trạng thái',
                field: 'status',
                width: 150,
                minWidth: 120,
                sortable: true,
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
                            fetchPurchaseRequests(rowsPerPage, page, purchaseRequestSearch.trim() || undefined, purchaseRequestSortBy, purchaseRequestSortOrder);
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
                            fetchPurchaseRequests(rowsPerPage, page, purchaseRequestSearch.trim() || undefined, purchaseRequestSortBy, purchaseRequestSortOrder);
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
            sortable={true}
            onSort={handlePurchaseRequestSort}
            sortField={purchaseRequestSortBy ? getReverseFieldMap('purchaseRequest')[purchaseRequestSortBy] || purchaseRequestSortBy : undefined}
            sortOrder={purchaseRequestSortOrder}
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
              fetchPurchaseRequests(rowsPerPage, page, purchaseRequestSearch.trim() || undefined, purchaseRequestSortBy, purchaseRequestSortOrder);
            }
          }
        }}
        title="Xóa đề xuất mua hàng"
        message={`Bạn có chắc chắn muốn xóa đề xuất mua hàng này?`}
      />
    </Box>
  );
}

