import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Analytics } from "@vercel/analytics/react";

const GradeCalculator = ({
  id,
  name,
  onDelete,
  onNameChange,
  initialData,
  onUpdate,
}) => {
  const [assignments, setAssignments] = useState(initialData.assignments || []);
  const [currentGrade, setCurrentGrade] = useState(
    initialData.currentGrade || 0
  );

  const calculateCurrentGrade = useCallback(() => {
    const gradedAssignments = assignments.filter(
      (assignment) => assignment.grade !== ""
    );

    const totalWeight = gradedAssignments.reduce(
      (sum, assignment) => sum + Number(assignment.weight),
      0
    );

    const weightedSum = gradedAssignments.reduce((sum, assignment) => {
      let grade = Number(assignment.grade);
      if (assignment.grade.includes("/")) {
        const [numerator, denominator] = assignment.grade
          .split("/")
          .map(Number);
        grade = (numerator / denominator) * 100;
      }
      return sum + grade * Number(assignment.weight);
    }, 0);

    let average = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : 0;
    average = Math.min(average, 100);
    setCurrentGrade(average);
  }, [assignments]);

  useEffect(() => {
    calculateCurrentGrade();
    localStorage.setItem(
      `gradeCalculator-${id}`,
      JSON.stringify({ assignments, currentGrade })
    );
    onUpdate(id, { assignments, currentGrade });
  }, [assignments, id, calculateCurrentGrade, currentGrade, onUpdate]);

  const handleInputChange = (index, field, value) => {
    const updatedAssignments = [...assignments];
    updatedAssignments[index][field] = value;
    setAssignments(updatedAssignments);
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
    <Card className="w-96 mx-2 my-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <Input
            type="text"
            value={name}
            onChange={(e) => onNameChange(id, e.target.value)}
            placeholder="Subject Name"
            className="font-bold text-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`droppable-${id}`} type="ASSIGNMENT">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
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
                        className="flex items-center space-x-2 mb-2"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <Input
                          type="text"
                          value={assignment.name}
                          onChange={(e) =>
                            handleInputChange(index, "name", e.target.value)
                          }
                          placeholder="Row name"
                          className="flex-grow-0 w-1/2"
                        />
                        <Input
                          type="text"
                          value={assignment.grade}
                          onChange={(e) =>
                            handleInputChange(index, "grade", e.target.value)
                          }
                          placeholder="Grade"
                          className="flex-grow-0 w-1/4"
                        />
                        <Input
                          type="number"
                          value={assignment.weight}
                          onChange={(e) =>
                            handleInputChange(index, "weight", e.target.value)
                          }
                          placeholder="Weight"
                          className="flex-grow-0 w-1/4"
                        />
                        <Button
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
        <Button onClick={addRow} className="mt-2">
          <Plus className="mr-2 h-4 w-4" /> Add New Row
        </Button>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">
            Current Grade: {currentGrade}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

const GradeCalculatorApp = () => {
  const [calculators, setCalculators] = useState([]);

  useEffect(() => {
    const savedCalculators = localStorage.getItem("calculators");
    if (savedCalculators) {
      const parsedCalculators = JSON.parse(savedCalculators);
      const loadedCalculators = parsedCalculators.map((calc) => {
        const savedData = localStorage.getItem(`gradeCalculator-${calc.id}`);
        return savedData ? { ...calc, ...JSON.parse(savedData) } : calc;
      });
      setCalculators(loadedCalculators);
    }
  }, []);

  useEffect(() => {
    if (calculators.length > 0) {
      localStorage.setItem("calculators", JSON.stringify(calculators));
    }
  }, [calculators]);

  const addCalculator = () => {
    setCalculators((prevCalculators) => {
      const newId = Math.max(...prevCalculators.map((calc) => calc.id), 0) + 1;
      return [
        {
          id: newId,
          name: `Subject ${newId}`,
          assignments: [],
          currentGrade: 0,
        },
        ...prevCalculators,
      ];
    });
  };

  const removeCalculator = (id) => {
    setCalculators((prevCalculators) =>
      prevCalculators.filter((calc) => calc.id !== id)
    );
    localStorage.removeItem(`gradeCalculator-${id}`);
  };

  const updateCalculatorName = (id, newName) => {
    setCalculators((prevCalculators) =>
      prevCalculators.map((calc) =>
        calc.id === id ? { ...calc, name: newName } : calc
      )
    );
  };

  const updateCalculatorData = (id, data) => {
    setCalculators((prevCalculators) =>
      prevCalculators.map((calc) =>
        calc.id === id ? { ...calc, ...data } : calc
      )
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Grade Calculator App</h1>
      <Button onClick={addCalculator} className="mt-4">
        <Plus className="mr-2 h-4 w-4" /> Add New Subject
      </Button>
      <div className="flex flex-wrap justify-start">
        {calculators.map((calc) => (
          <GradeCalculator
            key={calc.id}
            id={calc.id}
            name={calc.name}
            onDelete={removeCalculator}
            onNameChange={updateCalculatorName}
            initialData={{
              assignments: calc.assignments,
              currentGrade: calc.currentGrade,
            }}
            onUpdate={updateCalculatorData}
          />
        ))}
      </div>
      <Analytics />
    </div>
  );
};

export default GradeCalculatorApp;
