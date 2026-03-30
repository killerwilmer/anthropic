import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getLabel } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- getLabel unit tests ---

test("getLabel: str_replace_editor create returns Creating with filename", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "src/Card.jsx" })).toBe("Creating Card.jsx");
});

test("getLabel: str_replace_editor str_replace returns Editing with filename", () => {
  expect(getLabel("str_replace_editor", { command: "str_replace", path: "src/Card.jsx" })).toBe("Editing Card.jsx");
});

test("getLabel: str_replace_editor insert returns Editing with filename", () => {
  expect(getLabel("str_replace_editor", { command: "insert", path: "src/Card.jsx" })).toBe("Editing Card.jsx");
});

test("getLabel: str_replace_editor view returns Reading with filename", () => {
  expect(getLabel("str_replace_editor", { command: "view", path: "src/Card.jsx" })).toBe("Reading Card.jsx");
});

test("getLabel: str_replace_editor undo_edit returns Reverting with filename", () => {
  expect(getLabel("str_replace_editor", { command: "undo_edit", path: "src/Card.jsx" })).toBe("Reverting Card.jsx");
});

test("getLabel: str_replace_editor unknown command returns Editing with filename", () => {
  expect(getLabel("str_replace_editor", { command: "unknown", path: "src/Card.jsx" })).toBe("Editing Card.jsx");
});

test("getLabel: file_manager rename returns Renaming with filename", () => {
  expect(getLabel("file_manager", { command: "rename", path: "src/Old.jsx" })).toBe("Renaming Old.jsx");
});

test("getLabel: file_manager delete returns Deleting with filename", () => {
  expect(getLabel("file_manager", { command: "delete", path: "src/Old.jsx" })).toBe("Deleting Old.jsx");
});

test("getLabel: file_manager unknown command returns Managing file", () => {
  expect(getLabel("file_manager", { command: "unknown", path: "src/Old.jsx" })).toBe("Managing file Old.jsx");
});

test("getLabel: unknown tool name is humanized", () => {
  expect(getLabel("some_custom_tool", {})).toBe("some custom tool");
});

test("getLabel: no path omits filename suffix", () => {
  expect(getLabel("str_replace_editor", { command: "create" })).toBe("Creating");
});

test("getLabel: uses only the last segment of a nested path", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "a/b/c/App.jsx" })).toBe("Creating App.jsx");
});

// --- Component render tests ---

test("ToolInvocationBadge shows spinner and label when pending", () => {
  render(
    <ToolInvocationBadge toolName="str_replace_editor" args={{ command: "create", path: "App.jsx" }} state="call" />
  );

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  // Spinner has animate-spin class
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
});

test("ToolInvocationBadge shows green dot and label when completed", () => {
  const { container } = render(
    <ToolInvocationBadge toolName="str_replace_editor" args={{ command: "create", path: "App.jsx" }} state="result" />
  );

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  // Green dot present, no spinner
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).not.toBeNull();
  expect(document.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationBadge handles partial-call state as pending", () => {
  render(
    <ToolInvocationBadge toolName="str_replace_editor" args={{ command: "str_replace", path: "Card.jsx" }} state="partial-call" />
  );

  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
  expect(document.querySelector(".animate-spin")).not.toBeNull();
});
