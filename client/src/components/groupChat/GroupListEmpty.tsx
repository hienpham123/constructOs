import { Box, Typography, Button } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';

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
      <GroupIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {searchTerm ? 'Không tìm thấy nhóm nào' : 'Chưa có nhóm chat nào'}
      </Typography>
      {!searchTerm && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={onCreateGroup}
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Tạo nhóm mới
        </Button>
      )}
    </Box>
  );
}
