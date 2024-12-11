export function parseSyllabus(text) {
  const subjectName = extractSubjectName(text);
  const lines = text.split("\n");
  const assignments = [];

  const weightPattern = /(\d{1,3})(?:\s*%|\s*percent|\s*marks?|\s*points?)/i;
  const datePattern =
    /(?:\d{4}[-/.]\d{2}[-/.]\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{2,4})/i;

  const tableHeaderPattern =
    /^(?:\s*type|\s*component|\s*description|\s*weight|\s*due|\s*date).*?(?:type|component|description|weight|due|date)/i;
  const tableRowPattern =
    /^(?:Assignment|Quiz|Lab|Project|Tutorial|Other|Term|Final|Group)/i;

  const invalidNameTokens = [
    "otherwise",
    "final mark",
    "pass",
    "course",
    "obtain",
    "achieve",
    "submit",
    "hand in",
    "total",
    "breakdown",
    "grade",
    "marking scheme",
    "worth",
    "may",
    "must",
    "will",
    "should",
    "can",
    "marks",
    "get",
    "required",
  ];

  let inTable = false;
  let lastValidWeight = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (tableHeaderPattern.test(line)) {
      inTable = true;
      continue;
    }

    if (line.toLowerCase().includes("total")) {
      inTable = false;
      continue;
    }

    const weightMatch = line.match(weightPattern);
    if (!weightMatch) continue;

    const weight = weightMatch[1];
    if (parseInt(weight) > 100 || parseInt(weight) < 1) continue;
    if (!inTable && weight === lastValidWeight) continue;
    lastValidWeight = weight;

    let name = "";
    const components = line.split(/\s+/);

    if (inTable && tableRowPattern.test(line)) {
      const typeIndex = components.findIndex((c) => tableRowPattern.test(c));
      const weightIndex = components.findIndex((c) => weightPattern.test(c));

      if (typeIndex !== -1 && weightIndex !== -1) {
        name = components.slice(typeIndex, weightIndex).join(" ");
      }
    }

    if (!name) {
      name = line
        .replace(weightPattern, "")
        .replace(datePattern, "")
        .replace(/^\W+|\W+$/g, "")
        .trim();
    }

    name = cleanAssignmentName(name);

    if (!isValidAssignmentName(name, invalidNameTokens)) continue;

    let dueDate = extractFormattedDate(line);

    if (isPolicyText(name)) continue;

    if (!isDuplicateAssignment(assignments, name, weight)) {
      assignments.push({
        name,
        weight,
        grade: "",
        dueDate: dueDate || "",
      });
    }
  }

  return {
    name: subjectName,
    assignments: assignments.sort(
      (a, b) => Number(a.weight) - Number(b.weight)
    ),
  };

  function cleanAssignmentName(name) {
    return name
      .replace(
        /^(?:Assignment|Quiz|Lab|Project|Tutorial|Other|Term|Final|Group)\s*(?:\d*:?\s*|-\s*)/i,
        ""
      )
      .replace(/\s*[-–—]\s*.*$/, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/\d{4}$/, "")
      .replace(/\s+/g, " ")
      .replace(/^\d+\s*[-:.)]?\s*/, "")
      .trim();
  }

  function extractSubjectName(text) {
    const lines = text.split("\n");

    const courseCodePattern = /([A-Z]{2,4})\s*[-]?\s*(\d{2,4}[A-Z]?\d*)/;

    const subjectPatterns = [
      /^Course(?:\s+Title)?[:|\s]+([^(\n]+)/i,
      /^Subject[:|\s]+([^(\n]+)/i,
      courseCodePattern,
    ];

    for (let line of lines) {
      line = line.trim();

      for (let pattern of subjectPatterns) {
        const match = line.match(pattern);
        if (match) {
          if (pattern === courseCodePattern) {
            return `${match[1]} ${match[2]}`;
          }
          return match[1].trim().replace(/\s+/g, " ");
        }
      }
    }

    return "";
  }

  function isValidAssignmentName(name, invalidTokens) {
    if (!name || name.length < 2 || name.length > 50) return false;
    if (/^\d+$/.test(name)) return false;
    if (invalidTokens.some((token) => name.toLowerCase().includes(token)))
      return false;
    if (!/[a-zA-Z]/.test(name)) return false;
    if (/^[a-z]$/i.test(name)) return false;
    return true;
  }

  function extractFormattedDate(line) {
    const dateMatch = line.match(
      /(?:\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{0,4})/i
    );
    if (!dateMatch) return null;

    let date = dateMatch[0].trim();
    if (!date.includes("202")) {
      date = date.replace(/\s*(?:st|nd|rd|th)/, "") + " 2024";
    }
    return date;
  }

  function isPolicyText(text) {
    const policyPatterns = [
      /penalty/i,
      /policy/i,
      /submit/i,
      /required/i,
      /late/i,
      /must/i,
      /minimum/i,
      /maximum/i,
      /guidelines?/i,
    ];
    return policyPatterns.some((pattern) => pattern.test(text));
  }

  function isDuplicateAssignment(assignments, name, weight) {
    return assignments.some((a) => {
      const normalize = (str) => str.toLowerCase().replace(/\W/g, "");
      return normalize(a.name) === normalize(name) && a.weight === weight;
    });
  }
}
