import React, { useState, useEffect, useCallback } from "react";
import { Plus, Menu, X } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { AuthButton } from "./components/AuthButton";
import { Button } from "./components/ui/button";
import { GradeCalculator } from "./components/GradeCalculator";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { syncService } from "./services/syncService";
import { AddSubjectModal } from "./components/AddSubjectModal";
import { InfoModal } from "./components/InfoModal";
import { GpaProvider, useGpa } from "./contexts/GpaContext";
import { GpaModal } from "./components/GpaModal";

const App = () => {
  const [calculators, setCalculators] = useState([]);
  const [theme, setTheme] = useState("light");
  const [gpaGrades, setGpaGrades] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState("local");
  const [isGpaModalOpen, setIsGpaModalOpen] = useState(false);
  const { user } = useAuth();
  const [showCalculatorMerge, setShowCalculatorMerge] = useState(false);

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    document.body.classList.add("min-h-screen", "dark:bg-gray-900");
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (user) {
          const cloudData = await syncService.loadFromCloud(user.uid);
          setCalculators(cloudData?.calculators || []);
          applyTheme(cloudData?.theme || "light");
          setGpaGrades(cloudData?.gpaGrades || []);
          setDataSource("cloud");

          const localCalculators = JSON.parse(
            localStorage.getItem("calculators") || "[]"
          );
          const hasCalculatorChanges = syncService.hasCalculatorChanges(
            localCalculators,
            cloudData?.calculators
          );

          setShowCalculatorMerge(hasCalculatorChanges);
        } else {
          const localCalculators = JSON.parse(
            localStorage.getItem("calculators") || "[]"
          );
          const localTheme = localStorage.getItem("theme") || "light";
          const localGpaGrades = JSON.parse(
            localStorage.getItem("gpaGrades") || "[]"
          );
          setCalculators(localCalculators);
          applyTheme(localTheme);
          setGpaGrades(localGpaGrades);
          setDataSource("local");
          setShowCalculatorMerge(false);
        }
      } catch (error) {
        console.error("Failed to initialize data:", error);
      }
    };
    initializeData();
  }, [user]);

  useEffect(() => {
    if (!user && dataSource === "local") {
      localStorage.setItem("theme", theme);
      localStorage.setItem("gpaGrades", JSON.stringify(gpaGrades));
      if (calculators.length > 0) {
        localStorage.setItem("calculators", JSON.stringify(calculators));
      }
    } else if (user && dataSource === "cloud") {
      const timeoutId = setTimeout(() => {
        syncService.saveToCloud(user.uid, {
          calculators,
          theme,
          gpaGrades,
        });
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [calculators, theme, gpaGrades, user, dataSource]);

  const addCalculator = (data) => {
    setCalculators((prev) => {
      const newId = Math.max(...prev.map((calc) => calc.id), 0) + 1;
      return [
        {
          id: newId,
          name: data.name,
          assignments: data.assignments,
          desiredGrade: "",
        },
        ...prev,
      ];
    });
  };

  const removeCalculator = useCallback(
    async (id) => {
      setCalculators((prev) => {
        const filtered = prev.filter((calc) => calc.id !== id);
        if (user) {
          syncService.saveToCloud(user.uid, filtered);
        } else {
          localStorage.setItem("calculators", JSON.stringify(filtered));
        }
        return filtered;
      });
    },
    [user]
  );

  const updateCalculatorName = (id, newName) => {
    setCalculators((prev) =>
      prev.map((calc) => (calc.id === id ? { ...calc, name: newName } : calc))
    );
  };

  const GpaDisplay = ({ calculators }) => {
    const { calculateOverallGPA } = useGpa();
    return (
      <div className="flex-1 flex justify-center">
        <div className="bg-teal-50 dark:bg-teal-900/30 px-6 py-2 rounded-lg">
          <span className="text-lg font-semibold text-teal-900 dark:text-teal-100">
            Overall GPA: {calculateOverallGPA(calculators)}
          </span>
        </div>
      </div>
    );
  };

  const handleCalculatorDataChange = useCallback((id, data) => {
    setCalculators((prev) =>
      prev.map((calc) =>
        calc.id === id
          ? {
              ...calc,
              assignments: data.assignments,
              desiredGrade: data.desiredGrade,
            }
          : calc
      )
    );
  }, []);

  const handleCalculatorMerge = async () => {
    if (!user) return;

    try {
      const localCalculators = JSON.parse(
        localStorage.getItem("calculators") || "[]"
      );
      const cloudData = await syncService.loadFromCloud(user.uid);
      const mergedCalculators = syncService.mergeCalculators(
        localCalculators,
        cloudData?.calculators
      );

      await syncService.saveToCloud(user.uid, {
        ...cloudData,
        calculators: mergedCalculators,
      });

      setCalculators(mergedCalculators);
      setShowCalculatorMerge(false);
    } catch (error) {
      console.error("Calculator merge failed:", error);
    }
  };

  return (
    <GpaProvider>
      <div className="min-h-screen w-full">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <header className="space-y-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 rounded-lg"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                  )}
                </Button>

                <div className="lg:hidden">
                  <GpaDisplay calculators={calculators} />
                </div>
              </div>

              <div className="hidden lg:flex flex-1 items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <InfoModal
                    isOpen={isInfoModalOpen}
                    onClose={() => setIsInfoModalOpen(!isInfoModalOpen)}
                  />
                  <GpaModal
                    isOpen={isGpaModalOpen}
                    onClose={() => setIsGpaModalOpen(!isGpaModalOpen)}
                    calculators={calculators}
                  />
                </div>
                <GpaDisplay calculators={calculators} />
                <div className="flex items-center gap-2">
                  <AuthButton />
                  <Button
                    onClick={toggleTheme}
                    className="flex-shrink-0 p-3 flex items-center rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                  >
                    {theme === "light" ? "🌙" : "☀️"}
                  </Button>
                </div>
              </div>

              {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 min-h-fit h-auto bg-white dark:bg-gray-900">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Button
                      size="icon"
                      onClick={() => setIsMenuOpen(false)}
                      className="dark:text-white text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                    <div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between items-center mt-2">
                        <div className="h-[42px] flex gap-2">
                          <InfoModal
                            isOpen={isInfoModalOpen}
                            onClose={() => setIsInfoModalOpen(!isInfoModalOpen)}
                          />
                          <GpaModal
                            isOpen={isGpaModalOpen}
                            onClose={() => setIsGpaModalOpen(!isGpaModalOpen)}
                            calculators={calculators}
                          />
                        </div>

                        <div className="flex gap-2 h-[42px]">
                          <AuthButton />
                          <Button
                            onClick={toggleTheme}
                            className="h-[42px] w-[42px] flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                          >
                            {theme === "light" ? "🌙" : "☀️"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsAddSubjectModalOpen(true)}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" /> Add New Subject
              </Button>
              {showCalculatorMerge && (
                <Button
                  onClick={handleCalculatorMerge}
                  className="bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-white"
                >
                  Merge Local Calculators
                </Button>
              )}
            </div>
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
                onDataChange={handleCalculatorDataChange}
              />
            ))}
          </main>
          <AddSubjectModal
            isOpen={isAddSubjectModalOpen}
            onClose={() => setIsAddSubjectModalOpen(false)}
            onAdd={addCalculator}
          />
          <Analytics />
          <SpeedInsights />
        </div>
      </div>
    </GpaProvider>
  );
};

export default App;
