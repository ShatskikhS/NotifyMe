import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import sendNotificationAsync from '../src/services/notifyService.js';
import { STATUSES } from '../src/models/consts/notificationFields.js';

// Mock channels
vi.mock('../src/services/channels/console.js', () => ({ default: vi.fn() }));
vi.mock('../src/services/channels/email.js', () => ({ default: vi.fn() }));
vi.mock('../src/services/channels/logfile.js', () => ({ default: vi.fn() }));
vi.mock('../src/services/channels/telegram.js', () => ({ default: vi.fn() }));

import sendConsoleNotificationAsync from '../src/services/channels/console.js';

describe('notifyService Verification', () => {
  let mockLogger;
  let mockFsManager;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      formatMessage: vi.fn((service, message, params) => `[${service}]: ${message}`),
    };
    mockFsManager = {
      findByIdAsync: vi.fn(),
      updateAsync: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should send notification and update status to DELIVERED', async () => {
    const notification = {
      id: 1,
      channels: ['console'],
      message: 'test',
      status: STATUSES.RECEIVED
    };
    mockFsManager.findByIdAsync.mockResolvedValue(notification);

    await sendNotificationAsync(1, mockLogger, mockFsManager);

    expect(sendConsoleNotificationAsync).toHaveBeenCalledWith('test');
    expect(notification.status).toBe(STATUSES.DELIVERED);
    expect(mockFsManager.updateAsync).toHaveBeenCalledWith(notification);
  });

  it('should handle channel error and update status to DELIVERY_ERROR', async () => {
    const notification = {
      id: 1,
      channels: ['console'],
      message: 'test',
      status: STATUSES.RECEIVED
    };
    mockFsManager.findByIdAsync.mockResolvedValue(notification);

    // Mock failure
    vi.mocked(sendConsoleNotificationAsync).mockRejectedValueOnce(new Error('Failed'));

    await sendNotificationAsync(1, mockLogger, mockFsManager);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(notification.status).toBe(STATUSES.DELIVERY_ERROR);
    expect(mockFsManager.updateAsync).toHaveBeenCalledWith(notification);
  });
});
