import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Кожен тест починає з порожнього документа: попередній рендер не заважає.
afterEach(() => cleanup());
