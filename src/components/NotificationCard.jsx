import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import { formatNotificationDate, getNotificationId, getNotificationType } from '../utils/priorityUtils';

function pickTitle(notification) {
  return notification?.title || notification?.subject || notification?.heading || 'Campus notification';
}

function pickMessage(notification) {
  return notification?.message || notification?.description || notification?.body || 'No message provided.';
}

function NotificationCard({ notification, index, viewed, onOpen, compact = false }) {
  const type = getNotificationType(notification) || 'General';

  return (
    <Card className={`notification-card ${viewed ? 'is-viewed' : 'is-unviewed'}`} variant="outlined">
      <CardActionArea onClick={() => onOpen(getNotificationId(notification, index))}>
        <CardContent className={compact ? 'card-content compact' : 'card-content'}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Chip size="small" label={type} className={`type-chip ${type.toLowerCase()}`} />
            <Stack direction="row" spacing={0.75} alignItems="center" className="state-label">
              {viewed ? <DraftsOutlinedIcon fontSize="small" /> : <MarkEmailUnreadOutlinedIcon fontSize="small" />}
              <Typography variant="caption">{viewed ? 'Viewed' : 'Unviewed'}</Typography>
            </Stack>
          </Stack>

          <Typography variant={compact ? 'subtitle1' : 'h6'} className="notification-title">
            {pickTitle(notification)}
          </Typography>

          <Typography variant="body2" color="text.secondary" className="notification-message">
            {pickMessage(notification)}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {formatNotificationDate(notification)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default NotificationCard;
