import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ResultTable({ result }) {
  const courses = result.data.data.data;
  const studentInfo = courses[0];

  let totalCredits = 0;
  let totalPoints = 0;

  courses.forEach((course) => {
    const credit = parseFloat(course.totalCredit || 0);
    const point = parseFloat(course.pointEquivalent || 0);
    totalCredits += credit;
    totalPoints += credit * point;
  });

  const sgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A+":
        return "#2ECC71";
      case "A":
        return "#27AE60";
      case "A-":
        return "#27AE60";
      case "B+":
        return "#3498DB";
      case "B":
        return "#2980B9";
      case "B-":
        return "#2980B9";
      case "C+":
        return "#F1C40F";
      case "C":
        return "#F39C12";
      case "C-":
        return "#F39C12";
      default:
        return "#E74C3C";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tableHeader}>
        <Text style={[styles.cellHeader, styles.courseCell]}>Course</Text>
        <Text style={[styles.cellHeader, styles.gradeCell]}>Grade</Text>
        <Text style={[styles.cellHeader, styles.pointCell]}>Point</Text>
      </View>

      <View style={styles.tableBody}>
        {courses.map((course, index) => (
          <View
            style={[styles.row, index === courses.length - 1 && styles.lastRow]}
            key={index}
          >
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.courseTitle}</Text>
              <Text style={styles.courseCode}>{course.customCourseId}</Text>
            </View>
            <View
              style={[
                styles.gradeBadge,
                { backgroundColor: getGradeColor(course.gradeLetter) },
              ]}
            >
              <Text style={styles.gradeText}>{course.gradeLetter}</Text>
            </View>
            <View style={styles.pointContainer}>
              <Text style={styles.pointText}>{course.pointEquivalent}</Text>
              <Text style={styles.creditText}>{course.totalCredit} Cr</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  cellHeader: {
    color: "#7F8C8D",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
  },
  tableBody: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  row: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  courseInfo: {
    flex: 3,
  },
  courseTitle: {
    fontSize: 14,
    color: "#2C3E50",
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  courseCell: {
    flex: 3,
  },
  gradeCell: {
    flex: 1,
    textAlign: "center",
  },
  pointCell: {
    flex: 1,
    textAlign: "center",
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 50,
    alignItems: "center",
  },
  gradeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  pointContainer: {
    flex: 1,
    alignItems: "center",
  },
  pointText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  creditText: {
    fontSize: 12,
    color: "#7F8C8D",
  },
});
