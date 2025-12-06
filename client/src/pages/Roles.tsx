import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Button, DataTable, SearchInput } from '../components/common';
import type { SearchInputRef } from '../components/common/SearchInput';
import { rolesAPI, Role } from '../services/api';
import { showSuccess, showError } from '../utils/notifications';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const PERMISSION_LABELS: Record<string, string> = {
  view_drawing: 'Xem hồ sơ bản vẽ',
  view_contract: 'Xem hợp đồng',
  view_report: 'Xem báo cáo',
  view_daily_report: 'Xem báo cáo ngày',
  view_project_report: 'Xem báo cáo dự án',
};

export default function Roles() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const searchInputRef = useRef<SearchInputRef>(null);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await rolesAPI.getAll({
        search: search.trim() || undefined,
        sortBy,
        sortOrder,
      });
      setRoles(data);
      setPage(0); // Reset to first page when search/sort changes
    } catch (error: any) {
      showError(error.response?.data?.error || 'Không thể tải danh sách vai trò');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy, sortOrder]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    try {
      await rolesAPI.delete(selectedRole.id);
      showSuccess('Xóa vai trò thành công');
      setDeleteOpen(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Không thể xóa vai trò');
    }
  };

  if (isLoading && roles.length === 0) {
    return <LinearProgress />;
  }

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
        <Box sx={{ flex: { xs: 'none', md: 1 }, maxWidth: { xs: '100%', md: 280 }, width: { xs: '100%', md: 'auto' }, order: { xs: 1, md: 0 } }}>
          <SearchInput
            ref={searchInputRef}
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm"
            debounceMs={1000}
          />
        </Box>
        <Box sx={{ order: { xs: 2, md: 0 } }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/roles/add')}
            sx={{
              px: 2,
            boxShadow: '0px 4px 12px rgba(220, 38, 38, 0.3)',
            '&:hover': {
              boxShadow: '0px 6px 16px rgba(220, 38, 38, 0.4)',
            },
            }}
          >
            Thêm vai trò
          </Button>
        </Box>
      </Box>

      <DataTable<Role>
        columns={[
          {
            label: 'Tên vai trò',
            field: 'name',
            width: 200,
            minWidth: 150,
            sortable: true,
            render: (value) => (
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {value}
              </Typography>
            ),
          },
          {
            label: 'Mô tả',
            field: 'description',
            width: 250,
            minWidth: 200,
            sortable: true,
            render: (value) => (
              <Typography variant="body2" color="text.secondary">
                {value || '-'}
              </Typography>
            ),
          },
          {
            label: 'Quyền truy cập',
            field: 'permissions',
            width: 400,
            minWidth: 300,
            sortable: false,
            render: (value, row) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {Object.entries(row.permissions || {}).map(([key, val]) =>
                  val ? (
                    <Chip
                      key={key}
                      label={PERMISSION_LABELS[key] || key}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  ) : null
                )}
              </Box>
            ),
          },
        ]}
        data={roles}
        actions={{
          onEdit: (role) => navigate(`/roles/edit/${role.id}`),
          onDelete: (role) => handleDeleteClick(role),
        }}
        pagination={{
          count: roles.length,
          page,
          rowsPerPage,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleChangeRowsPerPage,
        }}
        minWidth={900}
        emptyMessage="Không có vai trò nào"
        sortable={true}
        onSort={handleSort}
        sortField={sortBy}
        sortOrder={sortOrder}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedRole(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={selectedRole?.name}
      />
    </Box>
  );
}

