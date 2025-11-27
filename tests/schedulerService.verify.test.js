import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NotificationScheduler from '../src/services/schedulerService.js';
import { NotificationSchedulingError } from '../src/errors.js';

describe('NotificationScheduler Verification', () => {
  let scheduler;
  let mockLogger;
  let mockFsManager;
  let mockDebugMode = false;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };
    mockFsManager = {
      findUnsent: vi.fn().mockReturnValue([]),
    };
    scheduler = new NotificationScheduler(mockLogger, mockFsManager, mockDebugMode);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize without errors', () => {
    expect(scheduler).toBeDefined();
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('NotificationScheduler initialized'));
  });

  it('should handle errors during initialization loop gracefully', () => {
    const badNotification = { id: 1, sendAt: new Date(Date.now() - 10000) };

    // Spy on the prototype to affect the new instance created below
    const scheduleSpy = vi.spyOn(NotificationScheduler.prototype, 'schedule').mockImplementationOnce(() => {
      throw new Error('Schedule failed');
    });

    mockFsManager.findUnsent.mockReturnValue([badNotification]);

    // Re-initialize to trigger the loop
    scheduler = new NotificationScheduler(mockLogger, mockFsManager, mockDebugMode);

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to schedule notification during init'));
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('NotificationScheduler initialized'));

    scheduleSpy.mockRestore();
  });

  it('should not crash when rescheduling a non-existent job', () => {
    const notification = { id: 999, sendAt: new Date() };

    expect(() => scheduler.reschedule(notification)).not.toThrow();
    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Attempted to reschedule non-existent job'));
  });

  it('should not crash when unscheduling a non-existent job', () => {
    const notification = { id: 999 };

    expect(() => scheduler.unschedule(notification)).not.toThrow();
    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Attempted to unschedule non-existent job'));
  });
});
