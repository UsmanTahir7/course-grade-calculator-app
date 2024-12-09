import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useGpa } from "../contexts/GpaContext";
import { Settings, X, Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_SCALE = {
  name: "4.0 Scale",
  max: 4.0,
  grades: [
    { min: 93, grade: "A", points: 4.0 },
    { min: 90, grade: "A-", points: 3.7 },
    { min: 87, grade: "B+", points: 3.3 },
    { min: 83, grade: "B", points: 3.0 },
    { min: 80, grade: "B-", points: 2.7 },
    { min: 77, grade: "C+", points: 2.3 },
    { min: 73, grade: "C", points: 2.0 },
    { min: 70, grade: "C-", points: 1.7 },
    { min: 67, grade: "D+", points: 1.3 },
    { min: 63, grade: "D", points: 1.0 },
    { min: 60, grade: "D-", points: 0.7 },
    { min: 0, grade: "F", points: 0.0 },
  ],
};

export function GpaModal({ isOpen, onClose, calculators }) {
  const { grades, setGrades, calculateOverallGPA } = useGpa();

  const handleGradeChange = (index, field, value) => {
    const updated = [...grades];

    if (field === "min") {
      value = value === "" ? "" : parseInt(value);
      if (isNaN(value) && value !== "") {
        value = "";
      }
    } else if (field === "points") {
      value = value === "" ? "" : parseFloat(value);
      if (isNaN(value) && value !== "") {
        value = "";
      }
    }

    updated[index] = { ...updated[index], [field]: value };
    setGrades(updated);
  };

  const addGrade = () => {
    setGrades([...grades, { id: uuidv4(), min: "", grade: "", points: "" }]);
  };

  const removeGrade = (index) => {
    setGrades(grades.filter((_, i) => i !== index));
  };

  const resetGrades = () => {
    setGrades(DEFAULT_SCALE.grades);
  };

  return (
    <>
      <Button
        onClick={onClose}
        className="dark:text-white flex-shrink-0 p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        GPA
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">
                GPA Settings
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="dark:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100">
                  Overall GPA: {calculateOverallGPA(calculators)}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold dark:text-white">
                    Grade Table
                  </h3>
                  <Button
                    type="button"
                    onClick={resetGrades}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Reset
                  </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 dark:scrollbar-track-gray-800 scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
                  {grades.map((grade, index) => (
                    <div
                      key={grade.id}
                      className="flex items-center gap-2 w-full bg-gray-50 dark:bg-gray-700/50 p-2"
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            value={grade.min === "" ? "" : grade.min}
                            onChange={(e) =>
                              handleGradeChange(index, "min", e.target.value)
                            }
                            placeholder="Min %"
                            className="w-full dark:text-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            onWheel={(e) => e.target.blur()}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            ≥
                          </span>
                        </div>
                        <Input
                          type="text"
                          value={grade.grade}
                          onChange={(e) =>
                            handleGradeChange(index, "grade", e.target.value)
                          }
                          placeholder="Letter Grade"
                          className="flex-1 dark:text-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                        />
                        <Input
                          type="number"
                          step="0.1"
                          value={grade.points === "" ? "" : grade.points}
                          onChange={(e) =>
                            handleGradeChange(index, "points", e.target.value)
                          }
                          placeholder="GPA Point"
                          className="flex-1 dark:text-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          onWheel={(e) => e.target.blur()}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGrade(index)}
                          className="dark:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={addGrade}
                  variant="outline"
                  className="w-full border-dashed border-2 dark:text-white hover:border-solid hover:bg-teal-50 dark:hover:bg-teal-900/50"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Grade
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
