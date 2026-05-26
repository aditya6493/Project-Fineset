import "@testing-library/jest-dom/vitest";

process.env.SKIP_ENV_VALIDATION = "true";
process.env.ENCRYPTION_KEY = "a".repeat(64);
