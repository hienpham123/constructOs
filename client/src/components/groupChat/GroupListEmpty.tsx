import { Box, Typography } from '@mui/material';
import { Button } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faPlus } from '@fortawesome/free-solid-svg-icons';

interface GroupListEmptyProps {
  searchTerm: string;
  onCreateGroup: () => void;
}

export default function GroupListEmpty({ searchTerm, onCreateGroup }: GroupListEmptyProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 3,
        textAlign: 'center',
      }}
    >
      <FontAwesomeIcon icon={faUsers} style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {searchTerm ? 'Không tìm thấy nhóm nào' : 'Chưa có nhóm chat nào'}
      </Typography>
      {!searchTerm && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={onCreateGroup}
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Tạo nhóm mới
        </Button>
      )}
    </Box>
  );
}
