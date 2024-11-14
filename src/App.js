import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "./components/ui/button";
import { GradeCalculator } from "./components/GradeCalculator";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const App = () => {
  const [calculators, setCalculators] = useState([]);
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    document.body.classList.add(
      "min-h-screen",
      "dark:bg-gray-900"
    );
  }, []);

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
    calculators.length > 0
      ? localStorage.setItem("calculators", JSON.stringify(calculators))
      : localStorage.removeItem("calculators");
  }, [calculators]);

  const addCalculator = () => {
    setCalculators((prev) => {
      const newId = Math.max(...prev.map((calc) => calc.id), 0) + 1;
      return [
        {
          id: newId,
          name: `Subject ${newId}`,
          assignments: [{ name: "", grade: "", weight: "" }],
          desiredGrade: "",
        },
        ...prev,
      ];
    });
  };

  const removeCalculator = (id) => {
    setCalculators((prev) => prev.filter((calc) => calc.id !== id));
    localStorage.removeItem(`gradeCalculator-${id}`);
  };

  const updateCalculatorName = (id, newName) => {
    setCalculators((prev) =>
      prev.map((calc) => (calc.id === id ? { ...calc, name: newName } : calc))
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="space-y-6 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto flex flex-row items-stretch gap-4">
              <div className="flex-1 p-3 min-h-[60px] flex items-center text-xs text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-gray-800 rounded-lg shadow-sm">
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

              <div className="flex-1 p-3 min-h-[60px] flex items-center text-xs text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9V5h2v4h4v2h-4v4H9v-4H5V9h4z" />
                  </svg>
                  <span>
                    Coming soon: letter grades (A-F), grade points (4.0), and
                    GPA calculator!
                  </span>
                </div>
              </div>

              <div className="flex-1 p-3 min-h-[60px] flex items-center text-xs text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>
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
                  </span>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="flex-shrink-0 p-3 min-h-[60px] flex items-center rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>
            </div>
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
