import React, { useState } from "react";
import { Button } from "./ui/button";
import { parseSyllabus } from "../utils/syllabusParser";

export function SyllabusParseModal({ isOpen, onClose, onParse }) {
  const [syllabus, setSyllabus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (syllabus.trim()) {
      const parsedData = parseSyllabus(syllabus);
      onParse(parsedData);
      setSyllabus("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="p-4">
          <textarea
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            className="w-full h-64 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Paste your syllabus here"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              Note: Syllabus parsing may not be 100% accurate
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Parse Syllabus
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
