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
  Box,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ActionMenu, { ActionItem } from './ActionMenu';
import ActionMenuWithCustomActions from './ActionMenuWithCustomActions';

export interface Column<T = any> {
  label: string;
  field: keyof T | string;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean; // Whether column can be sorted
}

export interface TableAction<T = any> {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
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
  // New format: array of actions with conditions
  actions?: ActionItem[] | ((row: T) => ActionItem[]);
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  actions?: TableAction<T> | ((row: T) => TableAction<T> | undefined) | ActionItem[] | ((row: T) => ActionItem[] | undefined);
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
  sortable?: boolean; // Enable sorting on all columns by default
  onSort?: (field: string, order: 'asc' | 'desc') => void; // Callback when column header is clicked
  sortField?: string; // Current sort field
  sortOrder?: 'asc' | 'desc'; // Current sort order
}

export default function DataTable<T = any>({
  columns,
  data,
  actions,
  pagination,
  minWidth = 800,
  emptyMessage = 'Không có dữ liệu',
  getRowId = (row: any) => row.id,
  sortable = true,
  onSort,
  sortField,
  sortOrder,
}: DataTableProps<T>) {
  const handleColumnClick = (column: Column<T>) => {
    if (!sortable || !onSort) return;
    // If column.sortable is explicitly false, don't sort
    if (column.sortable === false) return;
    
    const field = column.field as string;
    if (sortField === field) {
      // Toggle order if same field
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to asc
      onSort(field, 'asc');
    }
  };

  const getSortIcon = (column: Column<T>) => {
    if (!sortable || !onSort) return null;
    // If column.sortable is explicitly false, don't show icon
    if (column.sortable === false) return null;
    
    const field = column.field as string;
    if (sortField === field) {
      return sortOrder === 'asc' ? (
        <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5, color: 'primary.main' }} />
      ) : (
        <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5, color: 'primary.main' }} />
      );
    }
    return null;
  };
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
      <MuiTable sx={{ minWidth, borderCollapse: 'separate', borderSpacing: 0 }}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: '#f9fafb',
              '& .MuiTableCell-head': {
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                borderRight: '1px solid #e5e7eb',
                py: 1.5,
                whiteSpace: 'nowrap',
                '&:last-child': {
                  borderRight: 'none',
                },
              },
            }}
          >
            {actions && (
              <TableCell sx={{ width: 60, minWidth: 60 }}>Thao tác</TableCell>
            )}
            {columns.map((column, index) => {
              const isSortable = sortable && (column.sortable !== false) && onSort;
              return (
                <TableCell
                  key={index}
                  align={column.align || 'left'}
                  sx={{
                    width: column.width,
                    minWidth: column.minWidth,
                    cursor: isSortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    transition: 'background-color 0.2s',
                    '&:hover': isSortable ? {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    } : {},
                  }}
                  onClick={() => isSortable && handleColumnClick(column)}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {column.label}
                    {getSortIcon(column)}
                  </Box>
                </TableCell>
              );
            })}
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
            data.map((row, rowIndex) => {
              const isLastRow = rowIndex === data.length - 1;
              return (
                <TableRow
                  key={getRowId(row)}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                    },
                    '& .MuiTableCell-body': {
                      borderBottom: isLastRow ? '1px solid #e5e7eb !important' : '1px solid #e5e7eb',
                      borderRight: '1px solid #e5e7eb',
                      py: 1.5,
                      whiteSpace: 'nowrap',
                      '&:last-child': {
                        borderRight: 'none',
                      },
                    },
                  }}
                >
                {actions && (
                  <TableCell>
                    {(() => {
                      // Check if actions is the new format (array of ActionItem)
                      if (Array.isArray(actions)) {
                        const rowActions = actions.filter(action => {
                          if (typeof action.condition === 'function') {
                            return action.condition(row);
                          }
                          return action.condition !== false;
                        });
                        if (rowActions.length === 0) return null;
                        return <ActionMenu actions={rowActions} />;
                      }
                      
                      // Check if actions is a function that returns array
                      const actionsResult = typeof actions === 'function' ? actions(row) : actions;
                      
                      if (Array.isArray(actionsResult)) {
                        const rowActions = actionsResult.filter(action => {
                          if (typeof action.condition === 'function') {
                            return action.condition(row);
                          }
                          return action.condition !== false;
                        });
                        if (rowActions.length === 0) return null;
                        return <ActionMenu actions={rowActions} />;
                      }
                      
                      // Old format: TableAction object
                      const rowActions = actionsResult as TableAction<T>;
                      
                      // If rowActions is undefined, don't show action menu
                      if (!rowActions) {
                        return null;
                      }
                      
                      // Check if using new actions format in TableAction
                      if (rowActions.actions) {
                        const actionItems = typeof rowActions.actions === 'function' 
                          ? rowActions.actions(row) 
                          : rowActions.actions;
                        const filteredActions = (actionItems as ActionItem[]).filter(action => {
                          if (typeof action.condition === 'function') {
                            return action.condition(row);
                          }
                          return action.condition !== false;
                        });
                        if (filteredActions.length === 0) return null;
                        return <ActionMenu actions={filteredActions} />;
                      }
                      
                      const customActions = typeof rowActions.customActions === 'function'
                        ? rowActions.customActions(row)
                        : rowActions.customActions;
                      
                      // If customActions is provided, combine with standard actions
                      if (rowActions.customActions !== undefined) {
                        if (customActions && customActions.length > 0) {
                          return (
                            <ActionMenuWithCustomActions
                              customActions={customActions.map((action) => ({
                                ...action,
                                onClick: () => action.onClick(row),
                              }))}
                              onView={rowActions.onView ? () => rowActions.onView!(row) : undefined}
                              onEdit={rowActions.onEdit ? () => rowActions.onEdit!(row) : undefined}
                              onDelete={rowActions.onDelete ? () => rowActions.onDelete!(row) : undefined}
                              viewLabel={rowActions.viewLabel}
                              editLabel={rowActions.editLabel}
                              deleteLabel={rowActions.deleteLabel}
                            />
                          );
                        }
                        // If customActions is empty but we have standard actions, show them
                        if (rowActions.onView || rowActions.onEdit || rowActions.onDelete) {
                          // Convert to new format
                          const actionItems: ActionItem[] = [];
                          if (rowActions.onView) {
                            actionItems.push({
                              key: 'view',
                              text: rowActions.viewLabel || 'Xem chi tiết',
                              onClick: () => rowActions.onView!(row),
                              condition: true,
                            });
                          }
                          if (rowActions.onEdit) {
                            actionItems.push({
                              key: 'edit',
                              text: rowActions.editLabel || 'Chỉnh sửa',
                              onClick: () => rowActions.onEdit!(row),
                              condition: true,
                            });
                          }
                          if (rowActions.onDelete) {
                            actionItems.push({
                              key: 'delete',
                              text: rowActions.deleteLabel || 'Xóa',
                              onClick: () => rowActions.onDelete!(row),
                              condition: true,
                              color: 'error',
                            });
                          }
                          return <ActionMenu actions={actionItems} />;
                        }
                        // If customActions is empty and no standard actions, don't show menu
                        return null;
                      }
                      
                      // Fallback to default ActionMenu if no customActions
                      const actionItems: ActionItem[] = [];
                      if (rowActions.onView) {
                        actionItems.push({
                          key: 'view',
                          text: rowActions.viewLabel || 'Xem chi tiết',
                          onClick: () => rowActions.onView!(row),
                          condition: true,
                        });
                      }
                      if (rowActions.onEdit) {
                        actionItems.push({
                          key: 'edit',
                          text: rowActions.editLabel || 'Chỉnh sửa',
                          onClick: () => rowActions.onEdit!(row),
                          condition: true,
                        });
                      }
                      if (rowActions.onDelete) {
                        actionItems.push({
                          key: 'delete',
                          text: rowActions.deleteLabel || 'Xóa',
                          onClick: () => rowActions.onDelete!(row),
                          condition: true,
                          color: 'error',
                        });
                      }
                      if (actionItems.length === 0) return null;
                      return <ActionMenu actions={actionItems} />;
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
              );
            })
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

