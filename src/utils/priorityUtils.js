const scoreMap = {
  placement: 3,
  result: 2,
  event: 1
};

export function getNotificationType(item) {
  return String(item?.type || item?.category || item?.notificationType || '').trim();
}

export function getNotificationDate(item) {
  const rawDate = item?.timestamp || item?.createdAt || item?.created_at || item?.date;
  const value = new Date(rawDate).getTime();
  return Number.isFinite(value) ? value : 0;
}

export function getPriorityScore(item) {
  return scoreMap[getNotificationType(item).toLowerCase()] || 0;
}

export function getNotificationId(item, fallback = 0) {
  return String(item?.id || item?._id || item?.notificationId || `${getNotificationDate(item)}-${fallback}`);
}

export function rankPriorityNotifications(list, topCount = 10) {
  return [...list]
    .filter((item) => getPriorityScore(item) > 0)
    .sort((a, b) => {
      const scoreDiff = getPriorityScore(b) - getPriorityScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return getNotificationDate(b) - getNotificationDate(a);
    })
    .slice(0, topCount);
}

export function formatNotificationDate(item) {
  const dateValue = getNotificationDate(item);
  if (!dateValue) return 'No date';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(dateValue));
}
