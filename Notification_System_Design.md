# Notification System Design

## Stage 1

This stage is focused on one backend job: fetch campus notifications and return the top unread important ones. There is no database, no UI, and no login flow in this version.

## Problem Understanding

Students get a lot of messages during the semester. Some are useful but not urgent, while some need quick attention, especially placement updates and result announcements. When every notification is shown in the same flat list, the important ones get buried. That is the notification overload problem this stage is trying to reduce.

The Priority Inbox should always answer a simple question: “what are the most important unread notifications right now?”

## Priority Strategy

I used a small weighted score for notification type:

```text
Placement = 3
Result    = 2
Event     = 1
```

Placements are highest because students can miss interviews, deadlines, shortlisting updates, or company instructions. Results are next because they are important academically, but usually they do not expire in the same way placement opportunities can. Events are still useful, but they are lower priority than the other two.

When two notifications have the same type priority, the latest timestamp is ranked first. This matters because a new placement update is usually more useful than an older placement message.

## Approach Used

The backend exposes `GET /notifications/priority`. When the route is called:

1. The notification service fetches data from the provided API using axios.
2. The response is validated enough to handle common shapes like an array, `notifications`, or `data`.
3. Unread notifications are scored based on their type.
4. A min heap keeps only the best 10 items while scanning the list.
5. The final heap contents are sorted once before returning so the response order is clean.

I chose a min heap because it works well when new notifications keep arriving. Instead of sorting the whole list every time, the heap keeps the weakest item among the current top 10 at the root. If a new notification is better than that root, it replaces it. This keeps the memory small and avoids repeated full sorting.

## Time Complexity

Let `n` be the number of notifications and `k` be the inbox size, here `k = 10`.

The heap approach takes about:

```text
O(n log k)
```

Since `k` is very small, this is practical even if the notification list grows. The final sort is only on 10 items, so it is basically negligible.

## Logging Integration

Logging is added through middleware and service-level logs. The app logs:

- incoming requests
- response status and timing
- API fetch attempts
- API failures and retries
- processing count and ranking time

Logs are written to `logs/app.log` using Winston. Morgan is used for request/response style logging, but it is routed into Winston so the project does not depend on scattered `console.log` calls.

## Future Improvements

This stage intentionally stays small. Some practical next improvements would be:

- Redis caching so repeated requests do not always hit the external API
- WebSockets for pushing updated priority inbox items live
- user-specific preferences, like giving events higher priority for club coordinators
- Kafka or another event queue if notifications start arriving as a stream
- storing read state in a database once real users are added
