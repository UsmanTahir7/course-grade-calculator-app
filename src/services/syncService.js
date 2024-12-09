import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const syncService = {
  async saveToCloud(userId, data) {
    if (!userId) return;
    try {
      await setDoc(doc(db, "calculators", userId), {
        calculators: data.calculators,
        theme: data.theme,
        gpaGrades: data.gpaGrades,
      });
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
        const data = docSnap.data();
        return this.validateData(data);
      }
      return null;
    } catch (error) {
      console.error("Error loading from cloud:", error);
      return null;
    }
  },

  mergeData(localData, cloudData) {
    const mergedData = {
      calculators: this.mergeCalculators(
        localData.calculators,
        cloudData?.calculators
      ),
      theme: localData.theme || cloudData?.theme || "light",
      gpaGrades: this.mergeGpaGrades(localData.gpaGrades, cloudData?.gpaGrades),
    };
    return mergedData;
  },

  mergeCalculators(localCalculators, cloudCalculators) {
    const localArray = Array.isArray(localCalculators) ? localCalculators : [];
    const cloudArray = Array.isArray(cloudCalculators) ? cloudCalculators : [];

    const mergedMap = new Map();

    cloudArray.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    localArray.forEach((item) => {
      if (!mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    return Array.from(mergedMap.values()).sort((a, b) => b.id - a.id);
  },

  areGpaGradesDifferent(grades1, grades2) {
    if (!Array.isArray(grades1) || !Array.isArray(grades2)) return true;
    if (grades1.length !== grades2.length) return true;

    const sorted1 = [...grades1].sort((a, b) => (b.min || 0) - (a.min || 0));
    const sorted2 = [...grades2].sort((a, b) => (b.min || 0) - (a.min || 0));

    return sorted1.some((grade1, index) => {
      const grade2 = sorted2[index];
      return (
        grade1.min !== grade2.min ||
        grade1.grade !== grade2.grade ||
        grade1.points !== grade2.points
      );
    });
  },

  mergeGpaGrades(localGrades, cloudGrades) {
    const localArray = Array.isArray(localGrades) ? localGrades : [];
    const cloudArray = Array.isArray(cloudGrades) ? cloudGrades : [];

    if (
      localArray.length > 0 &&
      this.areGpaGradesDifferent(localArray, cloudArray)
    ) {
      return localArray;
    }

    return cloudArray.length > 0 ? cloudArray : localArray;
  },

  validateData(data) {
    return {
      calculators: Array.isArray(data?.calculators) ? data.calculators : [],
      theme: typeof data?.theme === "string" ? data.theme : "light",
      gpaGrades: Array.isArray(data?.gpaGrades) ? data.gpaGrades : [],
    };
  },
};
