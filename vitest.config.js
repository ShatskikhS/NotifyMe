import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',      // среда выполнения — Node.js
    globals: true,            // чтобы можно было использовать test()/expect() без импортов
    include: ['tests/**/*.test.js'], // где искать тесты
    coverage: {
      provider: 'v8',         // используем быстрый движок для покрытия кода
      reporter: ['text', 'html'], // форматы отчёта
      reportsDirectory: './coverage',  // куда сохранять
      exclude: ['node_modules/', 'tests/', 'tmp.js'], // какие файлы не считать
    },
  },
});