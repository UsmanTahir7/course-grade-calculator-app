import { useMemo } from "react";

export function useGradeCalculations(assignments, desiredGrade) {
  const parseGrade = (grade) => {
    if (typeof grade !== "string") return Number(grade);
    if (!grade.includes("/")) return Number(grade);

    const [num, den] = grade.split("/").map(Number);
    if (isNaN(num) || isNaN(den) || den === 0) return 0;
    return Math.max(0, Math.min(100, (num / den) * 100));
  };

  const parseWeight = (weight) => Number(weight || 0);

  const getCurrentGrade = useMemo(() => {
    const gradedAssignments = assignments.filter(
      (a) => a.grade !== "" && a.weight !== ""
    );

    const totalWeight = gradedAssignments.reduce(
      (sum, a) => sum + parseWeight(a.weight),
      0
    );

    if (totalWeight === 0) return 0;

    const weightedSum = gradedAssignments.reduce(
      (sum, a) => sum + parseGrade(a.grade) * parseWeight(a.weight),
      0
    );

    const grade = weightedSum / totalWeight;
    return Number(Math.max(0, Math.min(100, grade)).toFixed(2));
  }, [assignments]);

  const getRequiredGrade = useMemo(() => {
    if (!desiredGrade || isNaN(desiredGrade)) return "-";

    const gradedAssignments = assignments.filter(
      (a) => a.grade !== "" && a.weight !== ""
    );

    const completedWeight = gradedAssignments.reduce(
      (sum, a) => sum + parseWeight(a.weight),
      0
    );

    const remainingWeight = 100 - completedWeight;
    if (remainingWeight <= 0) return "-";

    const currentWeightedSum = gradedAssignments.reduce(
      (sum, a) => sum + parseGrade(a.grade) * parseWeight(a.weight),
      0
    );

    const requiredGrade =
      (Number(desiredGrade) * 100 - currentWeightedSum) / remainingWeight;
    return requiredGrade > 100
      ? "-"
      : Number(Math.max(0, requiredGrade).toFixed(2));
  }, [assignments, desiredGrade]);

  return { getCurrentGrade, getRequiredGrade };
}
