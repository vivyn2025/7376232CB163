import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationCard from './NotificationCard';
import { fetchNotifications } from '../services/api';
import { getNotificationId, rankPriorityNotifications } from '../utils/priorityUtils';

const typeOptions = ['All', 'Placement', 'Result', 'Event'];

function getPriorityError(err) {
  const status = err?.response?.status;
  if (status === 401) return 'API access required for priority notifications.';
  if (status) return `Priority API failed with ${status}`;
  return 'Could not load priority notifications.';
}

function PriorityPanel({ viewedIds, onOpen }) {
  const [topCount, setTopCount] = useState(10);
  const [filter, setFilter] = useState('All');
  const [sourceItems, setSourceItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPrioritySource() {
      setLoading(true);
      setError('');

      try {
        const result = await fetchNotifications({
          page: 1,
          limit: 100,
          notificationType: filter
        });

        if (!cancelled) {
          setSourceItems(result.notifications);
        }
      } catch (err) {
        if (!cancelled) {
          setSourceItems([]);
          setError(getPriorityError(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPrioritySource();

    return () => {
      cancelled = true;
    };
  }, [filter, reloadKey]);

  const priorityItems = useMemo(
    () => rankPriorityNotifications(sourceItems, topCount),
    [sourceItems, topCount]
  );

  return (
    <section className="priority-panel">
      <div className="section-title-row">
        <Typography variant="h6">Priority inbox</Typography>
        <Typography variant="caption" color="text.secondary">
          Placement > Result > Event
        </Typography>
      </div>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className="filter-controls priority-controls">
          <FormControl size="small" fullWidth>
            <InputLabel>Top</InputLabel>
            <Select
              label="Top"
              value={topCount}
              onChange={(event) => setTopCount(Number(event.target.value))}
            >
              {[3, 5, 10, 15].map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              {typeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
      </Stack>

      {loading && (
        <div className="center-box">
          <CircularProgress size={28} />
        </div>
      )}

      {!loading && error && (
        <Alert
          severity="info"
          className="api-notice"
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={() => setReloadKey((v) => v + 1)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && priorityItems.length === 0 && (
        <div className="empty-box">No priority notifications found.</div>
      )}

      {!loading && !error && priorityItems.length > 0 && (
        <Stack spacing={1.25}>
          {priorityItems.map((item, index) => {
            const id = getNotificationId(item, index);
            return (
              <NotificationCard
                key={id}
                notification={item}
                index={index}
                compact
                viewed={viewedIds.includes(id)}
                onOpen={onOpen}
              />
            );
          })}
        </Stack>
      )}
    </section>
  );
}

export default PriorityPanel;
