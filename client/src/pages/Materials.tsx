import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faFileDownload,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
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
  const [approveRejectDialogOpen, setApproveRejectDialogOpen] = useState(false);
  const [approveRejectAction, setApproveRejectAction] = useState<'approve' | 'reject' | null>(null);
  const [approveRejectRequest, setApproveRejectRequest] = useState<any>(null);
  
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
  
  // Refs for tracking changes
  const prevSearchRef = useRef(search);
  const prevTransactionSearchRef = useRef(transactionSearch);
  const prevPurchaseRequestSearchRef = useRef(purchaseRequestSearch);
  const prevPageRef = useRef(page);
  
  // Skeleton states for each tab
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showTransactionSkeleton, setShowTransactionSkeleton] = useState(false);
  const [showPurchaseRequestSkeleton, setShowPurchaseRequestSkeleton] = useState(false);
  
  // Flags for tracking changes
  const [isSearchChanging, setIsSearchChanging] = useState(false);
  const [isTransactionSearchChanging, setIsTransactionSearchChanging] = useState(false);
  const [isPurchaseRequestSearchChanging, setIsPurchaseRequestSearchChanging] = useState(false);
  const [isPageChanging, setIsPageChanging] = useState(false);

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

  // Track when search or page changes
  useEffect(() => {
    if (prevSearchRef.current !== search) {
      setIsSearchChanging(true);
      prevSearchRef.current = search;
    }
  }, [search]);

  useEffect(() => {
    if (prevTransactionSearchRef.current !== transactionSearch) {
      setIsTransactionSearchChanging(true);
      prevTransactionSearchRef.current = transactionSearch;
    }
  }, [transactionSearch]);

  useEffect(() => {
    if (prevPurchaseRequestSearchRef.current !== purchaseRequestSearch) {
      setIsPurchaseRequestSearchChanging(true);
      prevPurchaseRequestSearchRef.current = purchaseRequestSearch;
    }
  }, [purchaseRequestSearch]);

  useEffect(() => {
    if (prevPageRef.current !== page) {
      setIsPageChanging(true);
      prevPageRef.current = page;
    }
  }, [page]);

  // Determine when to show skeleton for materials list
  useEffect(() => {
    if (tab === 'list') {
      const isInitialLoad = materials.length === 0 && isLoading;
      if (isLoading) {
        setShowSkeleton(isInitialLoad || isSearchChanging || isPageChanging);
      } else {
        setIsSearchChanging(false);
        setIsPageChanging(false);
        setShowSkeleton(false);
      }
    }
  }, [isLoading, materials.length, isSearchChanging, isPageChanging, tab]);

  // Determine when to show skeleton for transactions
  useEffect(() => {
    if (tab === 'transactions') {
      const isInitialLoad = transactions.length === 0 && isLoading;
      if (isLoading) {
        setShowTransactionSkeleton(isInitialLoad || isTransactionSearchChanging || isPageChanging);
      } else {
        setIsTransactionSearchChanging(false);
        setIsPageChanging(false);
        setShowTransactionSkeleton(false);
      }
    }
  }, [isLoading, transactions.length, isTransactionSearchChanging, isPageChanging, tab]);

  // Determine when to show skeleton for purchase requests
  useEffect(() => {
    if (tab === 'purchase-requests') {
      const isInitialLoad = purchaseRequests.length === 0 && isLoading;
      if (isLoading) {
        setShowPurchaseRequestSkeleton(isInitialLoad || isPurchaseRequestSearchChanging || isPageChanging);
      } else {
        setIsPurchaseRequestSearchChanging(false);
        setIsPageChanging(false);
        setShowPurchaseRequestSkeleton(false);
      }
    }
  }, [isLoading, purchaseRequests.length, isPurchaseRequestSearchChanging, isPageChanging, tab]);

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
    // Reset flags when tab changes
    setIsSearchChanging(false);
    setIsTransactionSearchChanging(false);
    setIsPurchaseRequestSearchChanging(false);
    setIsPageChanging(false);
    
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

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'ordered':
        return 'primary';
      default:
        return 'default';
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
      // Error is handled by instance.ts interceptor
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
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
                variant="contained"
                color="success"
                startIcon={<FontAwesomeIcon icon={faFileDownload} />} 
                onClick={handleExportMaterials}
                disabled={isExporting}
                sx={{
                  color: '#ffffff',
                  '& .MuiButton-startIcon': {
                    color: '#ffffff',
                  },
                }}
              >
                {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
              </Button>
              <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={() => navigate('/materials/add')} sx={{ px: 2 }}>
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
              <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={() => navigate('/materials/transactions/add')} sx={{ px: 2 }}>
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
              <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={() => navigate('/materials/purchase-requests/add')} sx={{ px: 2 }}>
                Thêm đề xuất mua hàng
              </Button>
            </Box>
          </>
        )}
      </Box>

      {tab === 'list' && (
        <>
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
          loading={showSkeleton}
          loadingRows={rowsPerPage}
        />
        </>
      )}

      {tab === 'transactions' && (
        <>
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
          loading={showTransactionSkeleton}
          loadingRows={rowsPerPage}
        />
        </>
      )}

      {tab === 'purchase-requests' && (
        <>
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
                label: 'Trạng thái',
                field: 'status',
                width: 150,
                minWidth: 120,
                sortable: true,
                render: (value) => {
                  return (
                    <Chip
                      label={getRequestStatusLabel(value)}
                      color={getRequestStatusColor(value) as any}
                      size="small"
                    />
                  );
                },
              },
            ]}
            data={purchaseRequests}
            actions={(request) => ({
              onView: () => {
                navigate(`/materials/purchase-requests/edit/${request.id}`);
              },
              onEdit: (request.status === 'pending' || request.status === 'rejected') ? () => {
                navigate(`/materials/purchase-requests/edit/${request.id}`);
              } : undefined,
              onDelete: () => {
                setSelectedPurchaseRequest(request);
                setPurchaseRequestDeleteOpen(true);
              },
              viewLabel: 'Xem chi tiết',
              editLabel: 'Chỉnh sửa',
              customActions: (() => {
                const actions = [];
                if (request.status === 'pending') {
                  actions.push(
                    {
                      label: 'Duyệt',
                      icon: <FontAwesomeIcon icon={faCheck} style={{ fontSize: '14px' }} />,
                      onClick: () => {
                        setApproveRejectRequest(request);
                        setApproveRejectAction('approve');
                        setApproveRejectDialogOpen(true);
                      },
                      color: 'success' as const,
                    },
                    {
                      label: 'Từ chối',
                      icon: <FontAwesomeIcon icon={faTimes} style={{ fontSize: '14px' }} />,
                      onClick: () => {
                        setApproveRejectRequest(request);
                        setApproveRejectAction('reject');
                        setApproveRejectDialogOpen(true);
                      },
                      color: 'error' as const,
                    }
                  );
                }
                return actions;
              })(),
            })}
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
            loading={showPurchaseRequestSkeleton}
            loadingRows={rowsPerPage}
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

      <DeleteConfirmDialog
        open={approveRejectDialogOpen}
        onClose={() => {
          setApproveRejectDialogOpen(false);
          setApproveRejectAction(null);
          setApproveRejectRequest(null);
        }}
        onConfirm={async () => {
          if (approveRejectRequest && approveRejectAction) {
            await updatePurchaseRequest(approveRejectRequest.id, { 
              status: approveRejectAction === 'approve' ? 'approved' : 'rejected' 
            });
            setApproveRejectDialogOpen(false);
            setApproveRejectAction(null);
            setApproveRejectRequest(null);
            if (tab === 'purchase-requests') {
              fetchPurchaseRequests(rowsPerPage, page, purchaseRequestSearch.trim() || undefined, purchaseRequestSortBy, purchaseRequestSortOrder);
            }
          }
        }}
        title={approveRejectAction === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
        message={approveRejectAction === 'approve' 
          ? `Bạn có chắc chắn muốn duyệt đề xuất mua hàng "${approveRejectRequest?.materialName}"?`
          : `Bạn có chắc chắn muốn từ chối đề xuất mua hàng "${approveRejectRequest?.materialName}"?`}
        confirmButtonText={approveRejectAction === 'approve' ? 'Duyệt' : 'Từ chối'}
        confirmButtonColor={approveRejectAction === 'approve' ? 'success' : 'error'}
      />
    </Box>
  );
}

