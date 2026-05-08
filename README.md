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


## API Failure Handling

If the upstream notification API fails, the service retries with a small delay. If all attempts fail, the endpoint returns:


with HTTP status `502`.

if there is an error present it will update the notifica
