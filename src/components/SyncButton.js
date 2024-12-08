
import React from "react";
import { Button } from "./ui/button";

export function SyncButton({ onSync, showMergeOption }) {
  if (!showMergeOption) return null;

  return (
    <Button
      onClick={onSync}
      className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
    >
      Merge Local Data
    </Button>
  );
}