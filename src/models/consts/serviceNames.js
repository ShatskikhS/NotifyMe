/**
 * Enum for service names used in logging.
 * Ensures consistency across the application.
 * @readonly
 * @enum {string}
 */
export const SERVICE_NAMES = Object.freeze({
    SERVER: 'Server',
    REQUEST: 'Request',
    NOTIFICATION_CONTROLLER: 'NotificationController',
    NOTIFICATION_SERVICE: 'NotificationService',
    NOTIFICATION_SCHEDULER: 'NotificationScheduler',
    FILE_STORAGE: 'FileStorage',
    VALIDATION: 'Validation',
});
