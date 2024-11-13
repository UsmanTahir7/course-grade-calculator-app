import React, { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const GradeCalculator = ({
  id,
  name,
  onDelete,
  onNameChange,
  initialAssignments,
  initialDesiredGrade,
}) => {
  const [assignments, setAssignments] = useState(initialAssignments || []);
  const [desiredGrade, setDesiredGrade] = useState(initialDesiredGrade || 0);

  const getRequiredGrade = () => {
    if (!desiredGrade || isNaN(desiredGrade)) return "-";

    const gradedAssignments = assignments.filter(
      (assignment) => assignment.grade !== ""
    );

    const remainingAssignments = assignments.filter(
      (assignment) => assignment.grade === ""
    );

    const totalWeight = assignments.reduce(
      (sum, assignment) => sum + Number(assignment.weight || 0),
      0
    );

    const currentWeightedSum = gradedAssignments.reduce((sum, assignment) => {
      let grade = Number(assignment.grade);
      if (assignment.grade.includes("/")) {
        const [numerator, denominator] = assignment.grade
          .split("/")
          .map(Number);
        grade = (numerator / denominator) * 100;
      }
      return sum + grade * Number(assignment.weight);
    }, 0);

    const remainingWeight = remainingAssignments.reduce(
      (sum, assignment) => sum + Number(assignment.weight || 0),
      0
    );

    if (remainingWeight === 0) return "-";

    const requiredGrade = (
      (Number(desiredGrade) * totalWeight - currentWeightedSum) /
      remainingWeight
    ).toFixed(2);

    return Math.max(0, Math.min(requiredGrade, 100));
  };

  const getCurrentGrade = () => {
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
    return Math.max(0, Math.min(average, 100));
  };

  useEffect(() => {
    localStorage.setItem(
      `gradeCalculator-${id}`,
      JSON.stringify({ assignments, desiredGrade })
    );
  }, [assignments, desiredGrade, id]);

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
    <Card className="h-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200">
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
                          className="w-[30%] dark:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
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
                Current Grade: {getCurrentGrade()}
              </h3>
            </div>
            <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20">
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={desiredGrade}
                  onChange={(e) => setDesiredGrade(e.target.value)}
                  placeholder="Desired Grade"
                  className="w-[50%] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 dark:text-white"
                />
                <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100">
                  Required: {getRequiredGrade()}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const App = () => {
  const [calculators, setCalculators] = useState([]);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    document.body.classList.add(
      "min-h-screen",
      "transition-colors",
      "duration-200",
      "dark:bg-gray-900"
    );
  }, []);

  useEffect(() => {
    const savedCalculators = localStorage.getItem("calculators");
    if (savedCalculators) {
      const parsedCalculators = JSON.parse(savedCalculators);
      const loadedCalculators = parsedCalculators.map((calc) => {
        const savedData = localStorage.getItem(`gradeCalculator-${calc.id}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          return {
            ...calc,
            assignments: parsed.assignments || [],
            desiredGrade: parsed.desiredGrade || 0,
          };
        }
        return calc;
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
          desiredGrade: 0,
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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto p-4 text-sm text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span>
                  Tip: You can enter grades as fractions (e.g. 28/35 = 80%)
                </span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
          <Button
            onClick={addCalculator}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Subject
          </Button>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc) => (
            <GradeCalculator
              key={calc.id}
              id={calc.id}
              name={calc.name}
              initialAssignments={calc.assignments}
              initialDesiredGrade={calc.desiredGrade}
              onDelete={removeCalculator}
              onNameChange={updateCalculatorName}
            />
          ))}
        </main>
        <Analytics />
        <SpeedInsights />
      </div>
    </div>
  );
};

export default App;
