import { Breadcrumbs, Link, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <Breadcrumbs sx={{ mb: 2 }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        if (isLast) {
          return (
            <Typography key={index} color="text.primary">
              {item.label}
            </Typography>
          );
        }

        const handleClick = (e: React.MouseEvent) => {
          e.preventDefault();
          if (item.onClick) {
            item.onClick();
          } else if (item.path) {
            navigate(item.path);
          }
        };

        return (
          <Link
            key={index}
            component="button"
            variant="body1"
            onClick={handleClick}
            sx={{ 
              textDecoration: 'none', 
              color: 'text.primary', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {isFirst && <FontAwesomeIcon icon={faHome} style={{ fontSize: 20 }} />}
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}

