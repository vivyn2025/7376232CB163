import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';

const notificationTypes = ['All', 'Event', 'Result', 'Placement'];

function FilterBar({ filter, onFilterChange, limit, onLimitChange }) {
  return (
    <div className="filter-bar">
      <div className="section-title-row">
        <Typography variant="h6">All notifications</Typography>
      </div>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className="filter-controls">
        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
          >
            {notificationTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Limit</InputLabel>
          <Select
            label="Limit"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {[5, 10, 15, 20].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </div>
  );
}

export default FilterBar;
