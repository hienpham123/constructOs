import { ReactNode } from 'react';
import {
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TablePagination,
  Typography,
} from '@mui/material';
import ActionMenu from './ActionMenu';
import ActionMenuWithCustomActions from './ActionMenuWithCustomActions';

export interface Column<T = any> {
  label: string;
  field: keyof T | string;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => ReactNode;
}

export interface TableAction<T = any> {
  onView?: (row: T) => void;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  customActions?: Array<{
    label: string;
    icon: ReactNode;
    onClick: (row: T) => void;
    color?: 'default' | 'success' | 'error' | 'warning' | 'info';
  }> | ((row: T) => Array<{
    label: string;
    icon: ReactNode;
    onClick: (row: T) => void;
    color?: 'default' | 'success' | 'error' | 'warning' | 'info';
  }>);
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  actions?: TableAction<T>;
  pagination?: {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  minWidth?: number;
  emptyMessage?: string;
  getRowId?: (row: T) => string | number;
}

export default function DataTable<T = any>({
  columns,
  data,
  actions,
  pagination,
  minWidth = 800,
  emptyMessage = 'Không có dữ liệu',
  getRowId = (row: any) => row.id,
}: DataTableProps<T>) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        overflowX: 'auto',
        overflowY: 'hidden',
        borderRadius: 0,
        border: '1px solid #e5e7eb',
      }}
    >
      <MuiTable sx={{ minWidth }}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: '#f9fafb',
              '& .MuiTableCell-head': {
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                py: 1.5,
                whiteSpace: 'nowrap',
              },
            }}
          >
            {actions && (
              <TableCell sx={{ width: 60, minWidth: 60 }}>Thao tác</TableCell>
            )}
            {columns.map((column, index) => (
              <TableCell
                key={index}
                align={column.align || 'left'}
                sx={{ width: column.width, minWidth: column.minWidth }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                align="center"
                sx={{ py: 4 }}
              >
                <Typography variant="body2" color="textSecondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={getRowId(row)}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                  },
                  '& .MuiTableCell-body': {
                    borderBottom: '1px solid #f3f4f6',
                    py: 1.5,
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                {actions && (
                  <TableCell>
                    {(() => {
                      const customActions = typeof actions.customActions === 'function'
                        ? actions.customActions(row)
                        : actions.customActions;
                      
                      return customActions && customActions.length > 0 ? (
                        <ActionMenuWithCustomActions
                          customActions={customActions.map((action) => ({
                            ...action,
                            onClick: () => action.onClick(row),
                          }))}
                          onView={actions.onView ? () => actions.onView!(row) : undefined}
                          onEdit={() => actions.onEdit(row)}
                          onDelete={() => actions.onDelete(row)}
                          viewLabel={actions.viewLabel}
                          editLabel={actions.editLabel}
                          deleteLabel={actions.deleteLabel}
                        />
                      ) : (
                        <ActionMenu
                          onView={actions.onView ? () => actions.onView!(row) : undefined}
                          onEdit={() => actions.onEdit(row)}
                          onDelete={() => actions.onDelete(row)}
                          viewLabel={actions.viewLabel}
                          editLabel={actions.editLabel}
                          deleteLabel={actions.deleteLabel}
                        />
                      );
                    })()}
                  </TableCell>
                )}
                {columns.map((column, index) => {
                  const value = column.field ? (row as any)[column.field] : null;
                  return (
                    <TableCell key={index} align={column.align || 'left'}>
                      {column.render ? column.render(value, row) : value ?? '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </MuiTable>
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.count}
          page={pagination.page}
          onPageChange={pagination.onPageChange}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={pagination.onRowsPerPageChange}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      )}
    </TableContainer>
  );
}

