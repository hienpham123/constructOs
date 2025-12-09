import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { useProjectStore } from '../stores/projectStore';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { DataTable, Button, SearchInput } from '../components/common';
import type { SearchInputRef } from '../components/common/SearchInput';
import { mapSortField, getReverseFieldMap } from '../utils/sortFieldMapper';
import { exportToExcel } from '../utils/export';
import type { Project } from '../types';

export default function Projects() {
  const navigate = useNavigate();
  const { projects, projectsTotal, isLoading, fetchProjects, deleteProject } = useProjectStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const searchInputRef = useRef<SearchInputRef>(null);
  const prevIsLoadingRef = useRef(isLoading);
  const prevSearchRef = useRef(search);
  const prevPageRef = useRef(page);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isSearchChanging, setIsSearchChanging] = useState(false);
  const [isPageChanging, setIsPageChanging] = useState(false);

  useEffect(() => {
    fetchProjects(rowsPerPage, page, search.trim() || undefined, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy, sortOrder, rowsPerPage, page]);

  // Track when search or page changes
  useEffect(() => {
    if (prevSearchRef.current !== search) {
      setIsSearchChanging(true);
      prevSearchRef.current = search;
    }
  }, [search]);

  useEffect(() => {
    if (prevPageRef.current !== page) {
      setIsPageChanging(true);
      prevPageRef.current = page;
    }
  }, [page]);

  // Determine when to show skeleton
  useEffect(() => {
    const isInitialLoad = projects.length === 0 && isLoading;
    
    // Show skeleton for initial load, search change, or page change
    // Don't show for sort only
    if (isLoading) {
      setShowSkeleton(isInitialLoad || isSearchChanging || isPageChanging);
    } else {
      // Reset flags when loading completes
      setIsSearchChanging(false);
      setIsPageChanging(false);
      setShowSkeleton(false);
    }
  }, [isLoading, projects.length, isSearchChanging, isPageChanging]);

  // Focus search input after data is loaded
  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading && search) {
      // Data just finished loading, focus the search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading, search]);

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    const backendField = mapSortField(field, 'project');
    setSortBy(backendField);
    setSortOrder(order);
  };

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all projects for export (use large page size to get all)
      await fetchProjects(10000, 0);
      
      // Get projects from store after fetch
      const { projects: allProjects } = useProjectStore.getState();
      
      // Prepare data for export
      const exportData = allProjects.map((project) => ({
        'Tên dự án': project.name || '',
        'Mô tả': project.description || '',
        'Chủ đầu tư': project.investor || '',
        'Đầu mối': project.contactPerson || '',
        'Địa điểm': project.location || '',
        'Ngày bắt đầu': project.startDate || '',
        'Ngày kết thúc': project.endDate || '',
        'Ngân sách (VND)': project.budget || 0,
        'Chi phí thực tế (VND)': project.actualCost || 0,
        'Tiến độ (%)': project.progress || 0,
        'Trạng thái': getStatusLabel(project.status || ''),
        'Quản lý dự án': project.managerName || '',
      }));
      
      exportToExcel(exportData, 'Danh_sach_du_an', 'Dự án', false);
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting projects:', error);
      // Error is handled by instance.ts interceptor
      setIsExporting(false);
    }
  };

  // Only show full page loading if no data exists yet
  if (isLoading && projects.length === 0) {
    return <LinearProgress />;
  }

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
            onClick={handleExport}
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={handleAdd}
            sx={{ px: 2 }}
          >
            Thêm dự án
          </Button>
        </Box>
      </Box>

      <DataTable<Project>
        columns={[
          {
            label: 'Tên dự án',
            field: 'name',
            width: 250,
            minWidth: 200,
            sortable: true,
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
            sortable: true,
          },
          {
            label: 'Đầu mối',
            field: 'contactPerson',
            width: 150,
            minWidth: 120,
            sortable: true,
          },
          {
            label: 'Địa điểm',
            field: 'location',
            width: 200,
            minWidth: 150,
            sortable: true,
          },
          {
            label: 'Tiến độ',
            field: 'progress',
            width: 180,
            minWidth: 150,
            sortable: true,
            render: (value) => (
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 100 }}>
                  <LinearProgress
                    variant="determinate"
                    value={value}
                    sx={{
                      height: 16,
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: '8px',
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
            sortable: true,
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
            sortable: true,
            render: (value) => {
              return (
                <Chip
                  label={getStatusLabel(value)}
                  color={getStatusColor(value) as any}
                  size="small"
                  sx={{
                    '& .MuiChip-label': {
                      padding: '0 12px',
                    },
                  }}
                />
              );
            },
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
        sortable={true}
        onSort={handleSort}
        sortField={sortBy ? getReverseFieldMap('project')[sortBy] || sortBy : undefined}
        sortOrder={sortOrder}
        loading={showSkeleton}
        loadingRows={rowsPerPage}
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

