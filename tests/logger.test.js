import { test, expect, vi } from "vitest";
import winston from "winston";

test("logger.level filters out debug logs", () => {
  const mockWrite = vi.fn(); // перехватываем все записи

  const mockTransport = new winston.transports.Stream({
    stream: { write: mockWrite },
    level: "debug",
  });

  const logger = winston.createLogger({
    level: "info", // фильтруем всё ниже info
    transports: [mockTransport],
  });

  logger.debug("hidden");
  logger.info("visible");

  // assert: debug отфильтрован логгером
  expect(mockWrite).toHaveBeenCalledTimes(1);
  expect(mockWrite).toHaveBeenCalledWith(expect.stringContaining("visible"));
});
