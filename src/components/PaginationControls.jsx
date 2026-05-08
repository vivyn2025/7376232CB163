import { Button, Stack, Typography } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function PaginationControls({ page, onPageChange, hasMore, loading }) {
  return (
    <Stack className="pagination-row" direction="row" spacing={1.5} alignItems="center">
      <Button
        variant="outlined"
        startIcon={<NavigateBeforeIcon />}
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>

      <Typography variant="body2" className="page-pill">
        Page {page}
      </Typography>

      <Button
        variant="contained"
        endIcon={<NavigateNextIcon />}
        disabled={!hasMore || loading}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </Stack>
  );
}

export default PaginationControls;
