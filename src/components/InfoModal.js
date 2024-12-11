import React from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "./ui/button";

export function InfoModal({ isOpen, onClose }) {
  return (
    <>
      <Button
        onClick={onClose}
        className="dark:text-white flex-shrink-0 p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 flex items-center gap-2"
      >
        <HelpCircle className="h-4 w-4" />
        Info
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-4 ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Information</h2>
              <Button
                size="icon"
                onClick={onClose}
                className="dark:text-white text-gray-500"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30">
                <svg
                  className="w-5 h-5 text-teal-800 dark:text-teal-400 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>

                <div className="flex-1">
                  <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300 mb-1">
                    Grade Entry
                  </h3>
                  <p className="text-sm text-teal-700 dark:text-teal-400">
                    You can enter grades as fractions (e.g.{" "}
                    <span className="font-mono">28/35 = 80%</span>)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30">
                <svg
                  className="w-5 h-5 text-teal-800 dark:text-teal-400 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300 mb-1">
                    Feedback & Support
                  </h3>
                  <p className="text-sm text-teal-700 dark:text-teal-400">
                    For feedback, suggestions and feature requests:{" "}
                    <a
                      href="mailto:coursegradecalculatorapp@gmail.com"
                      className="underline cursor-pointer hover:text-teal-600 inline-flex items-center gap-1"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href =
                          "mailto:coursegradecalculatorapp@gmail.com";
                      }}
                      aria-label="Send email for feedback"
                      title="Click to open email client"
                    >
                      coursegradecalculatorapp@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30">
                <svg
                  className="w-5 h-5 text-teal-800 dark:text-teal-400 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300 mb-1">
                    About Data Sync
                  </h3>
                  <p className="text-sm text-teal-700 dark:text-teal-400">
                    Sync buttons help merge your offline data with your cloud
                    account. If you see import/merge prompts after making
                    changes while logged in, you can safely ignore them. To
                    prevent these prompts, you can reset GPA settings or remove
                    calculators while logged out - this won't affect your cloud
                    data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
