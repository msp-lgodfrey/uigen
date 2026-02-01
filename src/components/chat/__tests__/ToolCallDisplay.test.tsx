import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay, getToolCallMessage } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

// Tests for getToolCallMessage function
test("getToolCallMessage returns 'Creating' message for str_replace_editor create command", () => {
  const message = getToolCallMessage("str_replace_editor", {
    command: "create",
    path: "/components/Card.tsx",
  });
  expect(message).toBe("Creating /components/Card.tsx");
});

test("getToolCallMessage returns 'Editing' message for str_replace_editor str_replace command", () => {
  const message = getToolCallMessage("str_replace_editor", {
    command: "str_replace",
    path: "/App.jsx",
  });
  expect(message).toBe("Editing /App.jsx");
});

test("getToolCallMessage returns 'Editing' message for str_replace_editor insert command", () => {
  const message = getToolCallMessage("str_replace_editor", {
    command: "insert",
    path: "/utils/helpers.ts",
  });
  expect(message).toBe("Editing /utils/helpers.ts");
});

test("getToolCallMessage returns 'Viewing' message for str_replace_editor view command", () => {
  const message = getToolCallMessage("str_replace_editor", {
    command: "view",
    path: "/index.tsx",
  });
  expect(message).toBe("Viewing /index.tsx");
});

test("getToolCallMessage returns 'Undoing edit' message for str_replace_editor undo_edit command", () => {
  const message = getToolCallMessage("str_replace_editor", {
    command: "undo_edit",
    path: "/Button.tsx",
  });
  expect(message).toBe("Undoing edit on /Button.tsx");
});

test("getToolCallMessage returns 'Renaming' message for file_manager rename command", () => {
  const message = getToolCallMessage("file_manager", {
    command: "rename",
    path: "/old-file.tsx",
    new_path: "/new-file.tsx",
  });
  expect(message).toBe("Renaming /old-file.tsx");
});

test("getToolCallMessage returns 'Deleting' message for file_manager delete command", () => {
  const message = getToolCallMessage("file_manager", {
    command: "delete",
    path: "/temp-file.tsx",
  });
  expect(message).toBe("Deleting /temp-file.tsx");
});

test("getToolCallMessage falls back to tool name for unknown tool", () => {
  const message = getToolCallMessage("unknown_tool", {
    command: "something",
    path: "/file.txt",
  });
  expect(message).toBe("unknown_tool");
});

test("getToolCallMessage falls back to tool name when path is missing", () => {
  const message = getToolCallMessage("str_replace_editor", {
    command: "create",
  });
  expect(message).toBe("str_replace_editor");
});

test("getToolCallMessage falls back to tool name for unknown command", () => {
  const message = getToolCallMessage("str_replace_editor", {
    command: "unknown_command",
    path: "/file.txt",
  });
  expect(message).toBe("str_replace_editor");
});

test("getToolCallMessage handles empty args", () => {
  const message = getToolCallMessage("str_replace_editor", {});
  expect(message).toBe("str_replace_editor");
});

// Tests for ToolCallDisplay component
test("ToolCallDisplay renders friendly message for str_replace_editor create", () => {
  render(
    <ToolCallDisplay
      toolPart={{
        type: "str_replace_editor",
        toolCallId: "1",
        state: "result",
        input: { command: "create", path: "/components/Button.tsx" },
        output: "Success",
      }}
    />
  );
  expect(screen.getByText("Creating /components/Button.tsx")).toBeDefined();
});

test("ToolCallDisplay renders friendly message for str_replace_editor str_replace", () => {
  render(
    <ToolCallDisplay
      toolPart={{
        type: "str_replace_editor",
        toolCallId: "2",
        state: "result",
        input: { command: "str_replace", path: "/App.jsx" },
        output: "Success",
      }}
    />
  );
  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("ToolCallDisplay renders friendly message for file_manager delete", () => {
  render(
    <ToolCallDisplay
      toolPart={{
        type: "file_manager",
        toolCallId: "3",
        state: "result",
        input: { command: "delete", path: "/temp.txt" },
        output: { success: true },
      }}
    />
  );
  expect(screen.getByText("Deleting /temp.txt")).toBeDefined();
});

test("ToolCallDisplay shows green dot for completed state", () => {
  const { container } = render(
    <ToolCallDisplay
      toolPart={{
        type: "str_replace_editor",
        toolCallId: "4",
        state: "result",
        input: { command: "create", path: "/file.tsx" },
        output: "Success",
      }}
    />
  );
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();
  expect(greenDot).not.toBeNull();
});

test("ToolCallDisplay shows spinner for loading state", () => {
  const { container } = render(
    <ToolCallDisplay
      toolPart={{
        type: "str_replace_editor",
        toolCallId: "5",
        state: "partial-call",
        input: { command: "create", path: "/file.tsx" },
      }}
    />
  );
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
  expect(spinner).not.toBeNull();
});

test("ToolCallDisplay shows spinner when state is result but no result value", () => {
  const { container } = render(
    <ToolCallDisplay
      toolPart={{
        type: "str_replace_editor",
        toolCallId: "6",
        state: "result",
        input: { command: "create", path: "/file.tsx" },
      }}
    />
  );
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
  expect(spinner).not.toBeNull();
});

test("ToolCallDisplay falls back to tool name for unknown tool", () => {
  render(
    <ToolCallDisplay
      toolPart={{
        type: "custom_tool",
        toolCallId: "7",
        state: "result",
        input: {},
        output: "done",
      }}
    />
  );
  expect(screen.getByText("custom_tool")).toBeDefined();
});

test("ToolCallDisplay has correct styling classes", () => {
  const { container } = render(
    <ToolCallDisplay
      toolPart={{
        type: "str_replace_editor",
        toolCallId: "8",
        state: "result",
        input: { command: "create", path: "/file.tsx" },
        output: "Success",
      }}
    />
  );
  const element = container.firstChild as HTMLElement;
  expect(element.className).toContain("bg-neutral-50");
  expect(element.className).toContain("rounded-lg");
  expect(element.className).toContain("font-mono");
});
