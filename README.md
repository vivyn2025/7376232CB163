# Campus Notification Dashboard

Stage 2 React implementation for the campus notification platform. The app fetches notifications from the evaluation API, shows all notifications with pagination, and keeps a separate priority inbox for the most important updates.

The Stage 1 backend files are still in the repo, but the default `npm start` command now runs the React app on `http://localhost:3000`, as required for Stage 2.

## Setup

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

If the evaluator provides an API token, create a `.env` file:

```text
REACT_APP_NOTIFICATION_TOKEN=your_token_here
```

Then restart `npm start`.

Backend Stage 1 can still be run separately with:

```bash
npm run server
```

## API Usage

The frontend calls:

```text
GET http://4.224.186.213/evaluation-service/notifications
```

Supported query params used by the app:

```text
limit
page
notification_type
```

Example:

```text
http://4.224.186.213/evaluation-service/notifications?page=1&limit=10&notification_type=Placement
```

If the API returns an error like `401`, the app shows an error message and a retry button instead of breaking the page. A direct check from this machine returned:

```json
{
  "message": "An authorization header is required"
}
```

## Features

- all notifications dashboard
- separate priority notifications panel
- filtering by `All`, `Event`, `Result`, `Placement`
- pagination with previous/next controls
- loading states
- empty states
- API error state with retry
- viewed/unviewed visual styling
- mobile responsive layout

## Priority Logic

Priority notifications are ranked with this order:

```text
Placement = 3
Result    = 2
Event     = 1
```

If two notifications have the same priority, the newer timestamp comes first. The user can choose how many priority notifications to show, such as top 3, 5, 10, or 15.

The priority panel fetches a larger first page of notifications and ranks them on the frontend. This keeps the Stage 2 implementation simple and practical without adding a database or backend persistence.

## Viewed and Unviewed Handling

Viewed state is frontend-only. When a user clicks a notification card, its ID is stored in `localStorage`.

Unread notifications have a stronger left border and full opacity. Viewed notifications are slightly faded so the dashboard is easier to scan.

## Filtering Logic

The filter dropdown sends `notification_type` only when the selected type is not `All`.

Changing the filter resets the list back to page 1 because the old page number may not make sense for the new filtered result.

## Pagination Logic

The dashboard sends `page` and `limit` to the API. The Next button is enabled when the API returns at least as many items as the selected limit. Previous is disabled on page 1.

This is intentionally lightweight because the provided API details do not mention a total count field.

## Material UI Usage

Material UI is used for the main building blocks:

- cards
- buttons
- dropdowns
- chips
- alerts
- loading indicators
- typography

The rest of the layout uses normal CSS in `src/styles/dashboard.css`.

## Responsive Design

Desktop uses a two-column layout with the priority inbox on the left and all notifications on the right. On smaller screens it becomes a single column, with controls wrapping naturally and cards staying readable.

## Example Terminal Output

```text
$ npm start

> campus-priority-inbox@1.0.0 start
> set PORT=3000 && react-scripts start

Compiled successfully!

You can now view campus-priority-inbox in the browser.

Local:            http://localhost:3000
```

## Screenshot

Sample output image:

```text
screenshots/stage2-dashboard.png
```
