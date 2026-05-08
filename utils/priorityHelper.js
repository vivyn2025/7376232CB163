const PRIORITY_SCORE = {
  placement: 3,
  placements: 3,
  result: 2,
  results: 2,
  event: 1,
  events: 1
};

function pickNotificationList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.notifications)) {
    return payload.notifications;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  const err = new Error('Invalid notification API response');
  err.status = 502;
  err.publicMessage = 'Notification service returned an invalid response';
  throw err;
}

function getTypeValue(notification) {
  const rawType =
    notification.type ||
    notification.category ||
    notification.notificationType ||
    '';

  return String(rawType).trim().toLowerCase();
}

function getPriorityScore(notification) {
  return PRIORITY_SCORE[getTypeValue(notification)] || 0;
}

function getTimestampValue(notification) {
  const possibleDate =
    notification.timestamp ||
    notification.createdAt ||
    notification.created_at ||
    notification.date;

  const dateMs = new Date(possibleDate).getTime();
  return Number.isFinite(dateMs) ? dateMs : 0;
}

function isUnread(notification) {
  if (typeof notification.read === 'boolean') return !notification.read;
  if (typeof notification.isRead === 'boolean') return !notification.isRead;
  if (typeof notification.seen === 'boolean') return !notification.seen;

  const status = String(notification.status || '').toLowerCase();
  if (status === 'read' || status === 'seen') return false;

  return true;
}

function compareForRanking(a, b) {
  if (a.priorityScore !== b.priorityScore) {
    return a.priorityScore - b.priorityScore;
  }

  return a.timestampValue - b.timestampValue;
}

class MinHeap {
  constructor(compare) {
    this.items = [];
    this.compare = compare;
  }

  size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  push(item) {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  replaceTop(item) {
    this.items[0] = item;
    this.bubbleDown(0);
  }

  toArray() {
    return [...this.items];
  }

  bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.items[index], this.items[parent]) >= 0) break;

      [this.items[index], this.items[parent]] = [this.items[parent], this.items[index]];
      index = parent;
    }
  }

  bubbleDown(index) {
    const length = this.items.length;

    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (left < length && this.compare(this.items[left], this.items[smallest]) < 0) {
        smallest = left;
      }

      if (right < length && this.compare(this.items[right], this.items[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}

function cleanNotification(notification, priorityScore, timestampMs) {
  return {
    ...notification,
    priorityScore,
    priorityType: getTypeValue(notification) || 'unknown',
    rankedAt: new Date().toISOString(),
    timestampValue: timestampMs
  };
}

function buildTopNotifications(notifications, limit = 10) {
  const heap = new MinHeap(compareForRanking);

  for (const notification of notifications) {
    if (!notification || !isUnread(notification)) continue;

    const priorityScore = getPriorityScore(notification);
    if (priorityScore === 0) continue;

    const timestampMs = getTimestampValue(notification);
    const ranked = cleanNotification(notification, priorityScore, timestampMs);

    if (heap.size() < limit) {
      heap.push(ranked);
      continue;
    }

    if (compareForRanking(ranked, heap.peek()) > 0) {
      heap.replaceTop(ranked);
    }
  }

  return heap.toArray().sort((a, b) => compareForRanking(b, a));
}

module.exports = {
  pickNotificationList,
  getPriorityScore,
  getTimestampValue,
  buildTopNotifications
};
