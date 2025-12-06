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
} from '@mui/material';

interface TableProps {
  children: ReactNode;
  minWidth?: number;
}

export function Table({ children, minWidth = 800 }: TableProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
        overflowX: 'auto',
        overflowY: 'hidden',
        borderRadius: 0,
      }}
    >
      <MuiTable sx={{ minWidth }}>
        {children}
      </MuiTable>
    </TableContainer>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <TableHead>
      <TableRow
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f8fafc' : '#1e293b',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'text.primary',
            borderBottom: '2px solid',
            borderColor: 'divider',
            py: 2,
            whiteSpace: 'nowrap',
          },
        }}
      >
        {children}
      </TableRow>
    </TableHead>
  );
}

interface TableHeaderCellProps {
  children: ReactNode;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
}

export function TableHeaderCell({ children, width, minWidth, align = 'left' }: TableHeaderCellProps) {
  return (
    <TableCell align={align} sx={{ width, minWidth }}>
      {children}
    </TableCell>
  );
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBodyWrapper({ children }: TableBodyProps) {
  return (
    <TableBody>
      {children}
    </TableBody>
  );
}

interface TableRowProps {
  children: ReactNode;
  hover?: boolean;
}

export function TableRowWrapper({ children, hover = true }: TableRowProps) {
  return (
    <TableRow
      hover={hover}
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(220, 38, 38, 0.04)',
        },
        '& .MuiTableCell-body': {
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          whiteSpace: 'nowrap',
        },
      }}
    >
      {children}
    </TableRow>
  );
}

interface TableCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
  sx?: any;
}

export function TableCellWrapper({ children, align = 'left', colSpan, sx }: TableCellProps) {
  return (
    <TableCell align={align} colSpan={colSpan} sx={sx}>
      {children}
    </TableCell>
  );
}

interface TablePaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TablePaginationWrapper({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: TablePaginationProps) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      labelRowsPerPage="Số dòng mỗi trang:"
    />
  );
}

