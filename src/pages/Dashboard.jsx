import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterBar from '../components/FilterBar';
import NotificationCard from '../components/NotificationCard';
import PaginationControls from '../components/PaginationControls';
import PriorityPanel from '../components/PriorityPanel';
import useNotifications from '../hooks/useNotifications';
import { getNotificationId } from '../utils/priorityUtils';

const storageKey = 'campus-viewed-notifications';

function readViewedItems() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (err) {
    return [];
  }
}

function Dashboard() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState('All');
  const [viewedIds, setViewedIds] = useState(readViewedItems);

  const { notifications, loading, error, hasMore, retry } = useNotifications({
    page,
    limit,
    filter
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(viewedIds));
  }, [viewedIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((item, index) => !viewedIds.includes(getNotificationId(item, index))).length;
  }, [notifications, viewedIds]);

  function updateFilter(nextFilter) {
    setFilter(nextFilter);
    setPage(1);
  }

  function updateLimit(nextLimit) {
    setLimit(nextLimit);
    setPage(1);
  }

  function markViewed(id) {
    setViewedIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  return (
    <Box className="dashboard-shell">
      <Container maxWidth="xl" className="dashboard-container">
        <header className="dashboard-header">
          <Typography variant="overline" color="text.secondary">
            Campus notification platform
          </Typography>
          <Typography variant="h4">Notifications Dashboard</Typography>
        </header>

        <div className="simple-summary">
          Page {page} - {unreadCount} unviewed on this page - Filter: {filter}
        </div>

        <main className="dashboard-grid">
          <PriorityPanel viewedIds={viewedIds} onOpen={markViewed} />

          <section className="notifications-panel">
            <FilterBar
              filter={filter}
              onFilterChange={updateFilter}
              limit={limit}
              onLimitChange={updateLimit}
            />

            {loading && (
              <div className="center-box large">
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">Loading notifications...</Typography>
              </div>
            )}

            {!loading && error && (
              <Alert
                severity="info"
                className="api-notice"
                action={
                  <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={retry}>
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="empty-box">No notifications found for this filter.</div>
            )}

            {!loading && !error && notifications.length > 0 && (
              <Stack spacing={1.5}>
                {notifications.map((item, index) => {
                  const id = getNotificationId(item, index);
                  return (
                    <NotificationCard
                      key={id}
                      notification={item}
                      index={index}
                      viewed={viewedIds.includes(id)}
                      onOpen={markViewed}
                    />
                  );
                })}
              </Stack>
            )}

            <PaginationControls
              page={page}
              onPageChange={setPage}
              hasMore={hasMore}
              loading={loading}
            />
          </section>
        </main>
      </Container>
    </Box>
  );
}

export default Dashboard;
