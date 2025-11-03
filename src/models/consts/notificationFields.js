const SOURCES = Object.freeze({
  TELEGRAM_BOT: "telegramBot",
  DISCOUNTS_SCR: "discountsScr",
  URGENT_EXTERNAL: "urgentExternal",
  NEW_ROUTE: "newRoute",
  BACKUP_SCRIPT: "backup_script",
});

const CHANNELS = Object.freeze({
  TELEGRAM: "telegram",
  LOGFILE: "logfile",
  CONSOLE: "console",
  EMAIL: "email",
});

const PRIORITIES = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
});

const STATUSES = Object.freeze({
    RECEIVED: "received",
    AWAITING_DELIVERY: "awaitingDelivery",
    DELIVERED: "delivered",
    DELIVERY_ERROR: "deliveryError",
})

export { SOURCES, CHANNELS, PRIORITIES, STATUSES };
