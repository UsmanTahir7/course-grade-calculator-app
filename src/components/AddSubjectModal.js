import React, { useState } from "react";
import { Plus, Trash2, GripVertical, FileText } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SyllabusParseModal } from "./SyllabusParseModal";

export function AddSubjectModal({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [assignments, setAssignments] = useState([
    { name: "", grade: "", weight: "" },
  ]);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [titleError, setTitleError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    onAdd({ name: title, assignments });
    setTitle("");
    setAssignments([{ name: "", grade: "", weight: "" }]);
    onClose();
  };

  const handleSyllabusParse = (parsedAssignments) => {
    if (Array.isArray(parsedAssignments) && parsedAssignments.length > 0) {
      const formattedAssignments = parsedAssignments.map((assignment) => {
        return {
          name: assignment.name || "",
          grade: assignment.grade || "",
          weight: assignment.weight || "",
        };
      });
      setAssignments(formattedAssignments);
    } else {
      setAssignments([{ name: "", grade: "", weight: "" }]);
    }
    setIsSyllabusModalOpen(false);
  };

  const addRow = () => {
    setAssignments([...assignments, { name: "", grade: "", weight: "" }]);
  };

  const removeRow = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...assignments];
    updated[index] = { ...updated[index], [field]: value };
    setAssignments(updated);
  };

  const clearForm = () => {
    setTitle("");
    setTitleError(false);
    setAssignments([{ name: "", grade: "", weight: "" }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">
                Add New Subject
              </h2>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={clearForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsSyllabusModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <FileText className="mr-2 h-4 w-4" /> Parse Syllabus
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleError(false);
                }}
                placeholder="Subject Title"
                className={`w-full ${
                  titleError ? "border-red-500" : ""
                } dark:bg-gray-700 dark:text-white`}
              />
              {titleError && (
                <p className="text-red-500 text-sm">Title is required</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold dark:text-white">
                Assignments
              </h3>
              <DragDropContext onDragEnd={() => {}}>
                <Droppable droppableId="new-subject-assignments">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="max-h-[280px] mb-2 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 dark:scrollbar-track-gray-800 scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600"
                      style={{
                        minHeight: assignments.length > 0 && "auto",
                      }}
                    >
                      {assignments.map((assignment, index) => (
                        <Draggable
                          key={index}
                          draggableId={`new-assignment-${index}`}
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
                                  handleInputChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="Name"
                                className="w-[40%] dark:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                              />
                              <Input
                                type="text"
                                value={assignment.grade}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "grade",
                                    e.target.value
                                  )
                                }
                                placeholder="Grade"
                                className="w-[30%] dark:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                              />
                              <Input
                                type="number"
                                value={assignment.weight}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "weight",
                                    e.target.value
                                  )
                                }
                                placeholder="Weight"
                                className="w-[30%] dark:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                type="button" 
                                className="dark:text-white"
                                variant="destructive"
                                size="icon"
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
            </div>
          </div>

          <div className="space-y-4">
  <Button
    type="button"
    onClick={addRow}
    variant="outline"
    className="w-full border-dashed border-2 dark:text-white hover:border-solid hover:bg-teal-50 dark:hover:bg-teal-900/50"
  >
    <Plus className="mr-2 h-4 w-4" /> Add Assignment
  </Button>
  
  <div className="flex justify-end gap-2">
    <Button
      type="button"
      onClick={onClose}
      className="bg-gray-500 hover:bg-gray-600 text-white"
    >
      Cancel
    </Button>
    <Button
      type="submit"
      className="bg-teal-600 hover:bg-teal-700 text-white"
    >
      Add Subject
    </Button>
  </div>
</div>
        </form>
      </div>

      <SyllabusParseModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        onParse={handleSyllabusParse}
      />
    </div>
  );
}
