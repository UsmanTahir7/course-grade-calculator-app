import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useGpa } from "../contexts/GpaContext";
import { Settings, X, Plus, Trash2, GripVertical } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { syncService } from "../services/syncService";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
  const { grades, setGrades } = useGpa();
  const { user } = useAuth();
  const [showImportButton, setShowImportButton] = useState(false);

  useEffect(() => {
    const checkLocalGrades = async () => {
      try {
        if (!user) return;

        const localGrades = JSON.parse(
          localStorage.getItem("gpaGrades") || "[]"
        );
        const cloudData = await syncService.loadFromCloud(user.uid);

        const isDifferentFromDefault = await syncService.areGpaGradesDifferent(
          localGrades,
          DEFAULT_SCALE.grades
        );
        const isDifferentFromCloud = await syncService.areGpaGradesDifferent(
          localGrades,
          cloudData?.gpaGrades || []
        );

        setShowImportButton(isDifferentFromDefault && isDifferentFromCloud);
      } catch (error) {
        console.error("Error checking local grades:", error);
      }
    };

    checkLocalGrades().catch(console.error);
  }, [user]);

  const importLocalGrades = async () => {
    try {
      if (!user) return;

      const localGrades = JSON.parse(localStorage.getItem("gpaGrades") || "[]");
      const cloudData = await syncService.loadFromCloud(user.uid);

      await syncService.saveToCloud(user.uid, {
        ...cloudData,
        gpaGrades: localGrades,
      });

      setGrades(localGrades);
      setShowImportButton(false);
    } catch (error) {
      console.error("Error importing local grades:", error);
    }
  };

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
    setGrades([...grades, { min: "", grade: "", points: "" }]);
  };

  const removeGrade = (index) => {
    setGrades(grades.filter((_, i) => i !== index));
  };

  const resetGrades = () => {
    setGrades(DEFAULT_SCALE.grades);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedGrades = Array.from(grades);
    const [removed] = reorderedGrades.splice(result.source.index, 1);
    reorderedGrades.splice(result.destination.index, 0, removed);
    setGrades(reorderedGrades);
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
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold dark:text-white">
                    GPA Settings
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {showImportButton && (
                    <Button
                      onClick={importLocalGrades}
                      className="bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-white"
                    >
                      Import Local
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={resetGrades}
                    className="bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-white"
                  >
                    Reset
                  </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="dark:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable-grades" type="GRADE">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 dark:scrollbar-track-gray-800 scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600"
                    >
                      <div className="flex items-center gap-1 w-full bg-gray-50 dark:bg-gray-700 px-2 py-2 sticky top-0">
                        <div className="w-[42px]"></div>
                        <div className="w-1/3 font-semibold text-gray-700 dark:text-gray-300 px-2">
                          Minimum Percent
                        </div>
                        <div className="w-1/3 font-semibold text-gray-700 dark:text-gray-300 px-2">
                          Letter Grade
                        </div>
                        <div className="w-1/3 font-semibold text-gray-700 dark:text-gray-300 px-2">
                          GPA Point
                        </div>
                        <div className="w-[42px]"></div>
                      </div>
                      {grades.map((grade, index) => (
                        <Draggable
                          key={index}
                          draggableId={`grade-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-2 w-full bg-gray-50 dark:bg-gray-700 p-2"
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="p-2 cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              </div>
                              <Input
                                type="number"
                                value={grade.min === "" ? "" : grade.min}
                                onChange={(e) =>
                                  handleGradeChange(
                                    index,
                                    "min",
                                    e.target.value
                                  )
                                }
                                placeholder="Min %"
                                className="w-full dark:text-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                onWheel={(e) => e.target.blur()}
                              />
                              <Input
                                type="text"
                                value={grade.grade}
                                onChange={(e) =>
                                  handleGradeChange(
                                    index,
                                    "grade",
                                    e.target.value
                                  )
                                }
                                placeholder="Letter Grade"
                                className="dark:text-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                              />
                              <Input
                                type="number"
                                step="0.1"
                                value={grade.points === "" ? "" : grade.points}
                                onChange={(e) =>
                                  handleGradeChange(
                                    index,
                                    "points",
                                    e.target.value
                                  )
                                }
                                placeholder="GPA Point"
                                className="dark:text-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
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
      )}
    </>
  );
}
