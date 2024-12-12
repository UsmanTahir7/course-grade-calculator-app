import React, { createContext, useState, useContext, useEffect } from "react";
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
    return savedGrades ? JSON.parse(savedGrades) : DEFAULT_SCALE.grades;
  });
  const [dataSource, setDataSource] = useState("local");

  useEffect(() => {
    const initializeGrades = async () => {
      if (user) {
        try {
          const cloudData = await syncService.loadFromCloud(user.uid);
          if (cloudData?.gpaGrades) {
            setGrades(cloudData.gpaGrades);
            setDataSource("cloud");
          }
        } catch (error) {
          console.error("Error loading cloud grades:", error);
        }
      } else {
        const savedGrades = localStorage.getItem("gpaGrades");
        if (savedGrades) {
          setGrades(JSON.parse(savedGrades));
        }
        setDataSource("local");
      }
    };

    initializeGrades();
  }, [user]);

  useEffect(() => {
    if (!user && dataSource === "local") {
      localStorage.setItem("gpaGrades", JSON.stringify(grades));
    } else if (user && dataSource === "cloud") {
      const timeoutId = setTimeout(async () => {
        try {
          const cloudData = await syncService.loadFromCloud(user.uid);
          await syncService.saveToCloud(user.uid, {
            ...cloudData,
            gpaGrades: grades,
          });
        } catch (error) {
          console.error("Error syncing grades to cloud:", error);
        }
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [grades, user, dataSource]);

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
    dataSource,
  };

  return <GpaContext.Provider value={value}>{children}</GpaContext.Provider>;
}

export const useGpa = () => useContext(GpaContext);
