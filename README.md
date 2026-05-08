# Campus Priority Inbox

Stage 1 backend implementation for ranking unread campus notifications by importance and recency.

The service fetches notifications from the provided API, filters unread items, scores them by type, and returns the top important notifications.

## Run

```bash
npm install
npm start
```

Default server:

```text
http://localhost:3000
```

## Endpoints

```http
GET /health
GET /notifications/priority
GET /notifications/priority?limit=10
```

## Configuration

Optional environment variables:

```text
PORT=3000
NOTIFICATION_API_URL=http://4.224.186.213/evaluation-service/notifications
API_TIMEOUT_MS=6000
API_RETRIES=2
LOG_LEVEL=info
```

## Example Response

```json
{
  "count": 10,
  "notifications": [
    {
      "id": "p-109",
      "type": "Placement",
      "title": "Campus drive update",
      "priorityScore": 3,
      "priorityType": "placement",
      "timestampValue": 1767256200000
    }
  ]
}
```

## Terminal Output

```text
$ npm start

> campus-priority-inbox@1.0.0 start
> node index.js

info: priority inbox server started on port 3000
info: incoming request {"type":"request","method":"GET","url":"/notifications/priority","ip":"::1"}
info: fetching notifications from source api {"attempt":1,"timeoutMs":6000}
info: notification api responded {"attempt":1,"status":200,"tookMs":184}
info: processing notification payload {"received":47,"limit":10}
info: priority ranking finished {"inputCount":47,"outputCount":10,"tookMs":192}
info: request finished {"type":"response","method":"GET","url":"/notifications/priority","status":200,"responseTimeMs":198}
```

## Example Log Lines

`logs/app.log`

```json
{"level":"info","message":"incoming request","method":"GET","timestamp":"2026-05-08T10:15:11.104Z","type":"request","url":"/notifications/priority"}
{"level":"warn","message":"notification api request failed","attempt":1,"reason":"request timeout","timestamp":"2026-05-08T10:16:02.300Z","tookMs":6003}
{"level":"info","message":"priority ranking finished","inputCount":47,"outputCount":10,"timestamp":"2026-05-08T10:16:05.720Z","tookMs":208}
```

## API Failure Handling

If the upstream notification API fails, the service retries with a small delay. If all attempts fail, the endpoint returns:

```json
{
  "error": "Could not fetch notifications right now"
}
```

with HTTP status `502`.
