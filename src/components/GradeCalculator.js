import React, { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useGradeCalculations } from "../hooks/useGradeCalculations";

export const GradeCalculator = ({
  id,
  name,
  onDelete,
  onNameChange,
  initialAssignments,
  initialDesiredGrade,
  onDataChange,
}) => {
  const [assignments, setAssignments] = useState(initialAssignments || []);
  const [desiredGrade, setDesiredGrade] = useState(initialDesiredGrade || "");
  const { getCurrentGrade, getRequiredGrade } = useGradeCalculations(
    assignments,
    desiredGrade
  );

  useEffect(() => {
    setAssignments(initialAssignments || []);
    setDesiredGrade(initialDesiredGrade || "");
  }, [initialAssignments, initialDesiredGrade]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onDataChange?.(id, {
        assignments,
        desiredGrade,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [assignments, desiredGrade, id, onDataChange]);

  const handleInputChange = (index, field, value) => {
    setAssignments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDesiredGradeChange = (e) => {
    const value = e.target.value;
    setDesiredGrade(Math.min(100, Math.max(0, Number(value))).toString());
  };

  const addRow = () => {
    setAssignments([...assignments, { name: "", grade: "", weight: "" }]);
  };

  const removeRow = (index) => {
    const updatedAssignments = assignments.filter((_, i) => i !== index);
    setAssignments(updatedAssignments);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedAssignments = Array.from(assignments);
    const [removed] = reorderedAssignments.splice(result.source.index, 1);
    reorderedAssignments.splice(result.destination.index, 0, removed);
    setAssignments(reorderedAssignments);
  };

  return (
    <Card className="h-full bg-white dark:bg-gray-800 shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="flex justify-between items-center gap-4">
          <Input
            type="text"
            value={name}
            onChange={(e) => onNameChange(id, e.target.value)}
            placeholder="Subject Name"
            className="flex-1 font-bold text-lg bg-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <Button
            variant="destructive"
            size="icon"
            className="flex-shrink-0 dark:text-white"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`droppable-${id}`} type="ASSIGNMENT">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 dark:scrollbar-track-gray-800 scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600"
                style={{
                  minHeight: assignments.length > 0 ? "auto" : "100px",
                }}
              >
                {assignments.map((assignment, index) => (
                  <Draggable
                    key={index}
                    draggableId={`draggable-${id}-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700/50 group"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="p-2 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <Input
                          type="text"
                          value={assignment.name}
                          onChange={(e) =>
                            handleInputChange(index, "name", e.target.value)
                          }
                          placeholder="Name"
                          className="w-[40%] dark:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                        />
                        <Input
                          type="text"
                          value={assignment.grade}
                          onChange={(e) =>
                            handleInputChange(index, "grade", e.target.value)
                          }
                          placeholder="Grade"
                          className="w-[30%] dark:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                        />
                        <Input
                          type="number"
                          value={assignment.weight}
                          onChange={(e) =>
                            handleInputChange(index, "weight", e.target.value)
                          }
                          placeholder="Weight"
                          min="0"
                          max="100"
                          className="w-[30%] dark:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="dark:text-white"
                          onClick={() => removeRow(index)}
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

        <div className="space-y-4">
          <Button
            onClick={addRow}
            variant="outline"
            className="w-full border-dashed border-2 dark:text-white hover:border-solid hover:bg-teal-50 dark:hover:bg-teal-900/50"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Assignment
          </Button>

          <div className="space-y-2">
            <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20">
              <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100">
                {`Current Grade: ${getCurrentGrade}`}
              </h3>
            </div>
            <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20">
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={desiredGrade}
                  onChange={handleDesiredGradeChange}
                  placeholder="Desired Grade"
                  min="0"
                  max="100"
                  className="w-[50%] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100">
                  {`Required: ${getRequiredGrade}`}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
