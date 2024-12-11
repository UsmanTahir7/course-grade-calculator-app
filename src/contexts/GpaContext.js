import React, { createContext, useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./AuthContext";
import { syncService } from "../services/syncService";

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

const GpaContext = createContext();

export function GpaProvider({ children }) {
  const { user } = useAuth();
  const [grades, setGrades] = useState(() => {
    const savedGrades = localStorage.getItem("gpaGrades");
    const initialGrades = savedGrades
      ? JSON.parse(savedGrades)
      : DEFAULT_SCALE.grades;
    return initialGrades.map((grade) => ({
      ...grade,
      id: grade.id,
    }));
  });

  useEffect(() => {
    if (user) {
      const loadCloudGrades = async () => {
        const cloudData = await syncService.loadFromCloud(user.uid);
        if (cloudData?.gpaGrades) {
          setGrades(
            cloudData.gpaGrades.map((grade) => ({
              ...grade,
              id: grade.id || uuidv4(),
            }))
          );
        }
      };
      loadCloudGrades();
    } else {
      const savedGrades = localStorage.getItem("gpaGrades");
      const localGrades = savedGrades
        ? JSON.parse(savedGrades)
        : DEFAULT_SCALE.grades;
      setGrades(
        localGrades.map((grade) => ({
          ...grade,
          id: grade.id || uuidv4(),
        }))
      );
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("gpaGrades", JSON.stringify(grades));
    } else {
      const timeoutId = setTimeout(async () => {
        const cloudData = await syncService.loadFromCloud(user.uid);
        syncService.saveToCloud(user.uid, {
          ...cloudData,
          gpaGrades: grades,
        });
      }, 400);
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
        const completedAssignments = calc.assignments.filter(
          (a) =>
            a.grade &&
            a.weight &&
            !isNaN(parseFloat(a.grade)) &&
            !isNaN(parseFloat(a.weight))
        );

        const totalWeight = completedAssignments.reduce(
          (sum, a) => sum + (parseFloat(a.weight) || 0),
          0
        );

        if (totalWeight > 0) {
          const weightedSum = completedAssignments.reduce((sum, a) => {
            const grade = parseFloat(a.grade);
            const weight = parseFloat(a.weight);
            const normalizedGrade = a.grade.includes("/")
              ? (parseFloat(a.grade.split("/")[0]) /
                  parseFloat(a.grade.split("/")[1])) *
                100
              : grade;
            return sum + normalizedGrade * weight;
          }, 0);

          const currentGrade = weightedSum / totalWeight;
          const gradeInfo = getGradeInfo(currentGrade);

          if (gradeInfo && gradeInfo.points !== "N/A") {
            totalPoints += parseFloat(gradeInfo.points);
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
