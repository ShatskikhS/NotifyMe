# Logging Standard

This document outlines the standard for logging in the NotifyMe project. Adhering to this standard ensures consistency, readability, and ease of debugging across the application.

## Log Message Structure

All log messages must follow this structure:

```text
[ServiceName]: Event Description | key=value | key=value ...
```

### Components

1.  **[ServiceName]**: The name of the service or component generating the log. This must be one of the predefined values in `src/models/consts/serviceNames.js`. Enclosed in square brackets.
2.  **Event Description**: A concise, human-readable description of the event.
3.  **Context Data**: Key-value pairs separated by pipes (`|`). These provide specific details about the event (e.g., IDs, file paths, error messages).

### Examples

**Info Level:**
```text
[NotificationService]: Notification sent | id=12345 | channel=email
[FileStorage]: File saved | path=/data/notifications.json | size=1024
```

**Debug Level:**
```text
[Request]: Incoming request | method=POST | url=/notifications
[NotificationScheduler]: Task scheduled | id=12345 | time=2025-10-21T08:00:00Z
```

**Error Level:**
```text
[Validation]: Invalid request data | field=email | error=Required | errorType=ValidationError
[Server]: Unhandled exception | error=Connection refused | errorType=NetworkError
```

## Service Names

Service names are defined in `src/models/consts/serviceNames.js`. Always use the constants from this file instead of hardcoding strings.

-   **Server**: Application startup, shutdown, and global errors.
-   **Request**: HTTP request logging.
-   **NotificationController**: Logic within API controllers.
-   **NotificationService**: Business logic for sending notifications.
-   **NotificationScheduler**: Task scheduling logic.
-   **FileStorage**: File system operations.
-   **Validation**: Data validation logic.

## Implementation

Use the `logger.formatMessage` helper method to generate log messages:

```javascript
import { SERVICE_NAMES } from './models/consts/serviceNames.js';

logger.info(
  logger.formatMessage(SERVICE_NAMES.NOTIFICATION_SERVICE, 'Notification sent', {
    id: notification.id,
    channel: 'email'
  })
);
```
