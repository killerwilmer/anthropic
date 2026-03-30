"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
}

export function getLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path.split("/").pop() : undefined;
  const suffix = path ? ` ${path}` : "";

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":     return `Creating${suffix}`;
      case "str_replace":
      case "insert":     return `Editing${suffix}`;
      case "view":       return `Reading${suffix}`;
      case "undo_edit":  return `Reverting${suffix}`;
      default:           return `Editing${suffix}`;
    }
  }
  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename": return `Renaming${suffix}`;
      case "delete": return `Deleting${suffix}`;
      default:       return `Managing file${suffix}`;
    }
  }
  return toolName.replace(/_/g, " ");
}

export function ToolInvocationBadge({ toolName, args, state }: ToolInvocationBadgeProps) {
  const label = getLabel(toolName, args);
  const isDone = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
