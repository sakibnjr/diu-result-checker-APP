import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ResultTable({ result }) {
  const courses = result.data.data.data;

  let totalCredits = 0;
  let totalPoints = 0;

  courses.forEach((course) => {
    const credit = parseFloat(course.totalCredit || 0);
    const point = parseFloat(course.pointEquivalent || 0);
    totalCredits += credit;
    totalPoints += credit * point;
  });

  const sgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Result Summary</Text>

      <View style={styles.tableHeader}>
        <Text style={styles.cellHeader}>Course</Text>
        <Text style={styles.cellHeader}>Grade</Text>
        <Text style={styles.cellHeader}>Point</Text>
      </View>

      {courses.map((course, index) => (
        <View style={styles.row} key={index}>
          <Text style={styles.cell}>{course.courseTitle}</Text>
          <Text style={styles.cell}>{course.gradeLetter}</Text>
          <Text style={styles.cell}>{course.pointEquivalent}</Text>
        </View>
      ))}

      <Text style={styles.summary}>
        Total Courses: {courses.length} | Total Credits:{" "}
        {totalCredits.toFixed(2)} | SGPA: {sgpa}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    padding: 5,
  },
  cellHeader: {
    flex: 1,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 5,
  },
  cell: {
    flex: 1,
  },
  summary: {
    marginTop: 10,
    fontWeight: "bold",
  },
});
