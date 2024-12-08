import React from "react";
import { Button } from "./ui/button";

export function SyncButton({ onSync, showMergeOption }) {
  if (!showMergeOption) return null;

  return (
    <Button
      onClick={onSync}
      className="dark:text-white flex-shrink-0 p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 flex items-center gap-2"
    >
      Merge Local Data
    </Button>
  );
}
