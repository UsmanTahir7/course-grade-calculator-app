import React, { createContext, useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./AuthContext";
import { syncService } from "../services/syncService";

const DEFAULT_SCALE = {
  name: "4.0 Scale",
  max: 4.0,
  grades: [
    { id: uuidv4(), min: 93, grade: "A", points: 4.0 },
    { id: uuidv4(), min: 90, grade: "A-", points: 3.7 },
    { id: uuidv4(), min: 87, grade: "B+", points: 3.3 },
    { id: uuidv4(), min: 83, grade: "B", points: 3.0 },
    { id: uuidv4(), min: 80, grade: "B-", points: 2.7 },
    { id: uuidv4(), min: 77, grade: "C+", points: 2.3 },
    { id: uuidv4(), min: 73, grade: "C", points: 2.0 },
    { id: uuidv4(), min: 70, grade: "C-", points: 1.7 },
    { id: uuidv4(), min: 67, grade: "D+", points: 1.3 },
    { id: uuidv4(), min: 63, grade: "D", points: 1.0 },
    { id: uuidv4(), min: 60, grade: "D-", points: 0.7 },
    { id: uuidv4(), min: 0, grade: "F", points: 0.0 },
  ],
};

const GpaContext = createContext();

export function GpaProvider({ children }) {
  const { user } = useAuth();
  const [grades, setGrades] = useState(() => {
    const savedGrades = localStorage.getItem("gpaGrades");
    const initialGrades = savedGrades ? JSON.parse(savedGrades) : DEFAULT_SCALE.grades;
    return initialGrades.map(grade => ({ ...grade, id: grade.id || uuidv4() }));
  });

  // Update cloud data without affecting local storage
  useEffect(() => {
    if (user) {
      const loadCloudGrades = async () => {
        const cloudData = await syncService.loadFromCloud(user.uid);
        if (cloudData?.gpaGrades) {
          setGrades(cloudData.gpaGrades.map(grade => ({
            ...grade,
            id: grade.id || uuidv4()
          })));
        }
      };
      loadCloudGrades();
    } else {
      // Restore local storage data when user logs out
      const savedGrades = localStorage.getItem("gpaGrades");
      const localGrades = savedGrades ? JSON.parse(savedGrades) : DEFAULT_SCALE.grades;
      setGrades(localGrades.map(grade => ({
        ...grade,
        id: grade.id || uuidv4()
      })));
    }
  }, [user]);

  // Save to appropriate storage based on auth state
  useEffect(() => {
    if (!user) {
      localStorage.setItem("gpaGrades", JSON.stringify(grades));
    } else {
      const timeoutId = setTimeout(() => {
        syncService.saveToCloud(user.uid, {
          calculators: JSON.parse(localStorage.getItem("calculators") || "[]"),
          theme: localStorage.getItem("theme") || "light",
          gpaGrades: grades,
        });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [grades, user]);

  const [currentScale] = useState(DEFAULT_SCALE.max);

  const getGradeInfo = (percentage) => {
    if (typeof percentage !== "number" || isNaN(percentage)) {
      return { grade: "N/A", points: "N/A", min: 0 };
    }
    const gradeInfo = grades.find((g) => percentage >= g.min);
    return gradeInfo || { grade: "N/A", points: "N/A", min: 0 };
  };

  const calculateOverallGPA = (calculators) => {
    let totalPoints = 0;
    let totalCredits = 0;

    calculators.forEach((calc) => {
      if (calc.assignments && calc.assignments.length > 0) {
        const totalWeight = calc.assignments.reduce(
          (sum, a) => sum + (parseFloat(a.weight) || 0),
          0
        );
        if (totalWeight > 0) {
          const weightedSum = calc.assignments.reduce((sum, a) => {
            return (
              sum + (parseFloat(a.grade) || 0) * (parseFloat(a.weight) || 0)
            );
          }, 0);
          const currentGrade = weightedSum / totalWeight;
          const gradeInfo = getGradeInfo(currentGrade);
          if (gradeInfo) {
            totalPoints += gradeInfo.points;
            totalCredits += 1;
          }
        }
      }
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const value = {
    grades,
    setGrades,
    getGradeInfo,
    calculateOverallGPA,
    currentScale,
  };

  return <GpaContext.Provider value={value}>{children}</GpaContext.Provider>;
}

export const useGpa = () => useContext(GpaContext);
