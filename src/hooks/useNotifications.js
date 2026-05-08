import { useCallback, useEffect, useState } from 'react';
import { fetchNotifications } from '../services/api';

function getFriendlyError(err) {
  const status = err?.response?.status;

  if (status === 401) {
    return 'API access required. Add the provided token in .env and restart the app.';
  }

  if (status) {
    return `Notification API returned ${status}`;
  }

  if (err?.code === 'ECONNABORTED') {
    return 'Notification API timed out';
  }

  return 'Unable to load notifications. Check API access.';
}

export default function useNotifications({ page, limit, filter }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      setLoading(true);
      setError('');

      try {
        const result = await fetchNotifications({
          page,
          limit,
          notificationType: filter
        });

        if (!ignore) {
          setNotifications(result.notifications);
          setHasMore(result.hasMore);
        }
      } catch (err) {
        if (!ignore) {
          setNotifications([]);
          setHasMore(false);
          setError(getFriendlyError(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      ignore = true;
    };
  }, [page, limit, filter, reloadKey]);

  return {
    notifications,
    loading,
    error,
    hasMore,
    retry
  };
}
