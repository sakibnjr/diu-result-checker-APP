import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import ResultTable from "../components/ResultTable";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params;
  const studentInfo = result.data.data.data[0];
  const courses = result.data.data.data;

  // Calculate total credits once
  const totalCredits = courses.reduce(
    (sum, course) => sum + parseFloat(course.totalCredit || 0),
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Result Summary</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Info Section */}
        <View style={styles.studentInfoCard}>
          <View style={styles.studentHeader}>
            <View style={styles.studentNameContainer}>
              <Text style={styles.studentName}>{studentInfo.studentName}</Text>
              <Text style={styles.studentId}>ID: {studentInfo.studentId}</Text>
            </View>
            <View style={styles.semesterBadge}>
              <Text style={styles.semester}>
                {studentInfo.semesterName} {studentInfo.semesterYear}
              </Text>
            </View>
          </View>
          <Text style={styles.program}>{studentInfo.program}</Text>
        </View>

        {/* Quick Stats Section */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{studentInfo.cgpa.toFixed(2)}</Text>
            <Text style={styles.statLabel}>CGPA</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{courses.length}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCredits.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
        </View>

        {/* Course Results Section */}
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Course Results</Text>
          <ResultTable result={result} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  studentInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  studentNameContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  program: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  semesterBadge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  semester: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4A90E2",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  resultsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 15,
  },
});
