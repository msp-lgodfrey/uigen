import { Loader2 } from "lucide-react";

interface ToolCallDisplayProps {
  toolPart: {
    type: string;
    toolCallId: string;
    state: string;
    input?: Record<string, unknown>;
    output?: unknown;
    errorText?: string;
  };
}

export function getToolCallMessage(
  toolType: string,
  input: Record<string, unknown>
): string {
  const toolName = toolType.replace(/^tool-/, "");
  const command = input.command as string | undefined;
  const path = input.path as string | undefined;

  if (toolName === "str_replace_editor" && path) {
    switch (command) {
      case "create":
        return `Creating ${path}`;
      case "str_replace":
        return `Editing ${path}`;
      case "insert":
        return `Editing ${path}`;
      case "view":
        return `Viewing ${path}`;
      case "undo_edit":
        return `Undoing edit on ${path}`;
      default:
        return toolName;
    }
  }

  if (toolName === "file_manager" && path) {
    switch (command) {
      case "rename":
        return `Renaming ${path}`;
      case "delete":
        return `Deleting ${path}`;
      default:
        return toolName;
    }
  }

  return toolName;
}

export function ToolCallDisplay({ toolPart }: ToolCallDisplayProps) {
  const { type, state, input, output } = toolPart;
  const message = getToolCallMessage(type, input || {});
  const isComplete = (state === "output-available" || state === "result") && output !== undefined;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
