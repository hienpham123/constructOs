import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useProjectReportStore } from '../stores/projectReportStore';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { DataTable, Button, SearchInput } from '../components/common';
import type { SearchInputRef } from '../components/common/SearchInput';
import { mapSortField } from '../utils/sortFieldMapper';
import ProjectReportDialog from '../components/ProjectReportDialog';
import { formatDate } from '../utils/dateFormat';

export default function ProjectReports() {
  const { reports, reportsTotal, isLoading, fetchReports, deleteReport } = useProjectReportStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('report_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const searchInputRef = useRef<SearchInputRef>(null);

  useEffect(() => {
    fetchReports(rowsPerPage, page, search.trim() || undefined, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy, sortOrder, rowsPerPage, page]);

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    const backendField = mapSortField(field, 'project-report');
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

  const handleView = (row: any) => {
    setSelectedReport(row);
    setViewOpen(true);
  };

  const handleEdit = (row: any) => {
    setSelectedReport(row);
    setEditOpen(true);
  };

  const handleDelete = (row: any) => {
    setSelectedReport(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedReport) {
      await deleteReport(selectedReport.id);
      setDeleteOpen(false);
      setSelectedReport(null);
    }
  };

  const handleAdd = () => {
    setSelectedReport(null);
    setEditOpen(true);
  };

  const handleDialogClose = () => {
    setViewOpen(false);
    setEditOpen(false);
    setSelectedReport(null);
    fetchReports(rowsPerPage, page, search.trim() || undefined, sortBy, sortOrder);
  };

  const columns = [
    {
      label: 'STT',
      field: 'index',
      width: 60,
      align: 'center' as const,
      render: (_value: any, _row: any, index: number) => page * rowsPerPage + index + 1,
    },
    {
      label: 'Tên dự án',
      field: 'project_name',
      minWidth: 200,
      sortable: true,
    },
    {
      label: 'Tình trạng',
      field: 'project_status',
      width: 120,
      render: (value: string) => (
        <Chip
          label={getStatusLabel(value)}
          color={getStatusColor(value) as any}
          size="small"
        />
      ),
    },
    {
      label: 'Tiến độ',
      field: 'project_progress',
      width: 100,
      align: 'center' as const,
      render: (value: number) => `${value || 0}%`,
    },
    {
      label: 'Báo cáo',
      field: 'content',
      minWidth: 300,
      render: (value: string) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value || '-'}
        </Typography>
      ),
    },
    {
      label: 'Comment',
      field: 'comment',
      minWidth: 200,
      render: (value: string) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          color={value ? 'text.primary' : 'text.secondary'}
        >
          {value || '-'}
        </Typography>
      ),
    },
    {
      label: 'Ngày báo cáo',
      field: 'report_date',
      width: 120,
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      label: 'Người tạo',
      field: 'created_by_name',
      width: 150,
    },
    {
      label: 'Thao tác',
      field: 'actions',
      width: 150,
      align: 'center' as const,
      render: (_value: any, row: any) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" onClick={() => handleView(row)} color="info">
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" onClick={() => handleEdit(row)} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton size="small" onClick={() => handleDelete(row)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (isLoading && reports.length === 0) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Báo cáo dự án
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Tạo báo cáo
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <SearchInput
          ref={searchInputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tên dự án, nội dung báo cáo..."
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <DataTable
        columns={columns}
        data={reports}
        total={reportsTotal}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSort={handleSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedReport(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xóa báo cáo dự án"
        message={`Bạn có chắc chắn muốn xóa báo cáo này?`}
      />

      <ProjectReportDialog
        open={viewOpen || editOpen}
        onClose={handleDialogClose}
        report={selectedReport}
        mode={viewOpen ? 'view' : 'edit'}
      />
    </Box>
  );
}

