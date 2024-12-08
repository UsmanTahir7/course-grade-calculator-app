import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { AuthButton } from "./components/AuthButton";
import { Button } from "./components/ui/button";
import { GradeCalculator } from "./components/GradeCalculator";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { SyncButton } from "./components/SyncButton";
import { syncService } from "./services/syncService";

const App = () => {
  const [calculators, setCalculators] = useState([]);
  const [theme, setTheme] = useState("light");
  const [showMergeOption, setShowMergeOption] = useState(false);
  const { user } = useAuth();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const isCalculatorDifferent = (calc1, calc2) => {
    if (!calc1 || !calc2) return true;
    if (calc1.name !== calc2.name) return true;
    if (calc1.desiredGrade !== calc2.desiredGrade) return true;
    if (calc1.assignments.length !== calc2.assignments.length) return true;

    return calc1.assignments.some((assignment1, index) => {
      const assignment2 = calc2.assignments[index];
      return (
        assignment1.name !== assignment2.name ||
        assignment1.grade !== assignment2.grade ||
        assignment1.weight !== assignment2.weight
      );
    });
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

          const localData = JSON.parse(
            localStorage.getItem("calculators") || "[]"
          );
          const hasDifferentLocal = localData.some((localCalc) => {
            return !cloudData?.calculators?.some(
              (cloudCalc) => !isCalculatorDifferent(localCalc, cloudCalc)
            );
          });
          setShowMergeOption(hasDifferentLocal);
        } else {
          const localData = JSON.parse(
            localStorage.getItem("calculators") || "[]"
          );
          setCalculators(localData);
          setShowMergeOption(false);
        }
      } catch (error) {
        console.error("Failed to initialize data:", error);
        setCalculators([]);
        setShowMergeOption(false);
      }
    };
    initializeData();
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (calculators.length > 0) {
        localStorage.setItem("calculators", JSON.stringify(calculators));
      }
    } else {
      const timeoutId = setTimeout(() => {
        syncService.saveToCloud(user.uid, calculators);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [calculators, user]);

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

  const handleSync = async () => {
    if (!user) return;

    try {
      const localData = JSON.parse(localStorage.getItem("calculators") || "[]");
      const cloudData = await syncService.loadFromCloud(user.uid);
      const cloudCalculators = cloudData?.calculators || [];
      const maxCloudId = Math.max(
        ...cloudCalculators.map((calc) => calc.id),
        0
      );
      let mergedCalculators = [...cloudCalculators];

      localData.forEach((localCalc) => {
        const hasMatchingContent = cloudCalculators.some(
          (cloudCalc) =>
            localCalc.name === cloudCalc.name &&
            localCalc.desiredGrade === cloudCalc.desiredGrade &&
            JSON.stringify(localCalc.assignments) ===
              JSON.stringify(cloudCalc.assignments)
        );

        if (!hasMatchingContent) {
          mergedCalculators.push({
            ...localCalc,
            id: maxCloudId + mergedCalculators.length + 1,
          });
        }
      });

      await syncService.saveToCloud(user.uid, mergedCalculators);
      setCalculators(mergedCalculators);
      setShowMergeOption(false);
    } catch (error) {
      console.error("Sync failed:", error);
    }
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

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="space-y-6 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto flex flex-row items-center justify-between gap-4">
              <div className="p-3 min-h-[60px] flex items-center text-xs text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-gray-800 rounded-lg shadow-sm">
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
              <div className="flex items-center gap-2">
                <AuthButton />
                <button
                  onClick={toggleTheme}
                  className="flex-shrink-0 p-3 min-h-[60px] flex items-center rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                >
                  {theme === "light" ? "🌙" : "☀️"}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              onClick={addCalculator}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Subject
            </Button>
            <SyncButton onSync={handleSync} showMergeOption={showMergeOption} />
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
        <Analytics />
        <SpeedInsights />
      </div>
    </div>
  );
};

export default App;
