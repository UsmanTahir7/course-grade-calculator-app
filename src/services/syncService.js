import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const syncService = {
  async saveToCloud(userId, data) {
    if (!userId) return;
    try {
      await setDoc(doc(db, "calculators", userId), data);
    } catch (error) {
      console.error("Error saving to cloud:", error);
    }
  },

  async loadFromCloud(userId) {
    if (!userId) return null;
    try {
      const docRef = doc(db, "calculators", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return this.validateData(docSnap.data());
      }
      return null;
    } catch (error) {
      console.error("Error loading from cloud:", error);
      return null;
    }
  },

  areCalculatorsDifferent(calc1, calc2) {
    if (!calc1 || !calc2) return true;
    if (calc1.name !== calc2.name) return true;
    if (calc1.desiredGrade !== calc2.desiredGrade) return true;
    if (!calc1.assignments || !calc2.assignments) return true;
    if (calc1.assignments.length !== calc2.assignments.length) return true;

    return calc1.assignments.some((assignment1, index) => {
      const assignment2 = calc2.assignments[index];
      return (
        assignment1.name !== assignment2.name ||
        assignment1.grade !== assignment2.grade ||
        assignment1.weight !== assignment2.weight
      );
    });
  },

  hasCalculatorChanges(localCalcs, cloudCalcs) {
    if (!Array.isArray(localCalcs) || !Array.isArray(cloudCalcs)) return true;
    return localCalcs.some(
      (localCalc) =>
        !cloudCalcs.some(
          (cloudCalc) => !this.areCalculatorsDifferent(localCalc, cloudCalc)
        )
    );
  },

  mergeCalculators(localCalcs, cloudCalcs) {
    const localArray = Array.isArray(localCalcs) ? localCalcs : [];
    const cloudArray = Array.isArray(cloudCalcs) ? cloudCalcs : [];

    const mergedMap = new Map();
    let maxId = 0;

    cloudArray.forEach((calc) => {
      mergedMap.set(calc.id, calc);
      maxId = Math.max(maxId, calc.id);
    });

    localArray.forEach((calc) => {
      if (!mergedMap.has(calc.id)) {
        maxId++;
        mergedMap.set(maxId, { ...calc, id: maxId });
      } else {
        if (this.areCalculatorsDifferent(mergedMap.get(calc.id), calc)) {
          maxId++;
          mergedMap.set(maxId, { ...calc, id: maxId });
        }
      }
    });

    return Array.from(mergedMap.values());
  },

  areGpaGradesDifferent(grades1, grades2) {
    if (!Array.isArray(grades1) || !Array.isArray(grades2)) return true;
    if (grades1.length !== grades2.length) return true;

    const sorted1 = [...grades1].sort((a, b) => b.min - a.min);
    const sorted2 = [...grades2].sort((a, b) => b.min - a.min);

    return sorted1.some((grade1, index) => {
      const grade2 = sorted2[index];
      return (
        grade1.min !== grade2.min ||
        grade1.grade !== grade2.grade ||
        grade1.points !== grade2.points
      );
    });
  },

  validateData(data) {
    return {
      calculators: Array.isArray(data?.calculators) ? data.calculators : [],
      theme: typeof data?.theme === "string" ? data.theme : "light",
      gpaGrades: Array.isArray(data?.gpaGrades) ? data.gpaGrades : [],
    };
  },
};
