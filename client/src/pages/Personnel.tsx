import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  LinearProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { usePersonnelStore } from '../stores/personnelStore';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { DataTable, Button, SearchInput } from '../components/common';
import type { SearchInputRef } from '../components/common/SearchInput';
import { mapSortField, getReverseFieldMap } from '../utils/sortFieldMapper';
import { rolesAPI, Role } from '../services/api';

export default function Personnel() {
  const navigate = useNavigate();
  const { personnel, personnelTotal, isLoading, fetchPersonnel, deletePersonnel } = usePersonnelStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [roles, setRoles] = useState<Role[]>([]);
  
  const searchInputRef = useRef<SearchInputRef>(null);
  const prevSearchRef = useRef(search);
  const prevPageRef = useRef(page);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isSearchChanging, setIsSearchChanging] = useState(false);
  const [isPageChanging, setIsPageChanging] = useState(false);

  useEffect(() => {
    fetchPersonnel(rowsPerPage, page, search.trim() || undefined, sortBy, sortOrder);
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
    const isInitialLoad = personnel.length === 0 && isLoading;
    
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
  }, [isLoading, personnel.length, isSearchChanging, isPageChanging]);

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    const backendField = mapSortField(field, 'personnel');
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

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await rolesAPI.getAll();
        setRoles(data);
      } catch (error: any) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const getPositionLabel = (position: string, positionDescription?: string) => {
    if (!position) return '-';
    // Use description from API if available
    if (positionDescription) {
      return positionDescription;
    }
    // Fallback to roles list
    const role = roles.find((r) => r.id === position);
    return role ? (role.description || role.name) : position;
  };


  // Only show full page loading if no data exists yet
  if (isLoading && personnel.length === 0) {
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
        <Box sx={{ order: { xs: 2, md: 0 } }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={() => navigate('/personnel/add')}
            sx={{
              px: 2,
            boxShadow: '0px 4px 12px rgba(220, 38, 38, 0.3)',
            '&:hover': {
              boxShadow: '0px 6px 16px rgba(220, 38, 38, 0.4)',
            },
            }}
          >
            Thêm nhân sự
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={[
          {
            label: 'Họ tên',
            field: 'name',
            width: 200,
            minWidth: 150,
            sortable: true,
            render: (value) => (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {value}
              </Typography>
            ),
          },
          {
            label: 'Số điện thoại',
            field: 'phone',
            width: 150,
            minWidth: 120,
            sortable: true,
          },
          {
            label: 'Vị trí',
            field: 'position',
            width: 150,
            minWidth: 120,
            sortable: true,
            render: (value, row) => getPositionLabel(value, (row as any).position_description),
          },
          {
            label: 'Dự án',
            field: 'projectName',
            width: 200,
            minWidth: 150,
            sortable: true,
            render: (value) => value || '-',
          },
        ]}
        data={personnel}
        actions={{
          onEdit: (person) => {
            navigate(`/personnel/edit/${person.id}`);
          },
          onDelete: (person) => {
            setSelectedPersonnel(person);
            setDeleteOpen(true);
          },
        }}
        pagination={{
          count: personnelTotal,
          page,
          rowsPerPage,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleChangeRowsPerPage,
        }}
        minWidth={1000}
        emptyMessage="Không có nhân sự nào"
        sortable={true}
        onSort={handleSort}
        sortField={sortBy ? getReverseFieldMap('personnel')[sortBy] || sortBy : undefined}
        sortOrder={sortOrder}
        loading={showSkeleton}
        loadingRows={rowsPerPage}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedPersonnel(null);
        }}
        onConfirm={async () => {
          if (selectedPersonnel) {
            await deletePersonnel(selectedPersonnel.id);
          }
        }}
        itemName={selectedPersonnel?.name}
      />
    </Box>
  );
}

