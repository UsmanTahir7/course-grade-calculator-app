import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const syncService = {
  async saveToCloud(userId, data) {
    if (!userId) return;
    try {
      await setDoc(doc(db, "calculators", userId), {
        calculators: data,
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
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error loading from cloud:", error);
      return null;
    }
  },

  mergeData(localData, cloudData) {
    const localArray = Array.isArray(localData) ? localData : [];
    const cloudArray = cloudData?.calculators ? cloudData.calculators : [];
    
    const mergedMap = new Map();

    cloudArray.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    localArray.forEach((item) => {
      if (!mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    return Array.from(mergedMap.values())
      .sort((a, b) => b.id - a.id);
  },
};