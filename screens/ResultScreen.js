import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
  Platform,
} from "react-native";
import ResultTable from "../components/ResultTable";
import { LinearGradient } from "expo-linear-gradient";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

export default function ResultScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  // Check if route.params exists
  if (!route?.params?.result) {
    Alert.alert("Error", "No data found. Please try again.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
    return null;
  }

  const { result } = route.params;

  // Safely access the data with optional chaining and default values
  const studentInfo = result?.data?.data?.data?.[0] || {};
  const courses = result?.data?.data?.data || [];

  // Calculate total credits with safe access
  const totalCredits = courses.reduce(
    (sum, course) => sum + parseFloat(course?.totalCredit || 0),
    0
  );

  // If no data is available, show a message
  if (!studentInfo || Object.keys(studentInfo).length === 0) {
    Alert.alert("No Data", "No result data available. Please try again.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
    return null;
  }

  const handleShare = async () => {
    try {
      // Format course results using the same data structure as ResultTable
      const courseResults = courses
        .map((course) => {
          const courseTitle = course.courseTitle || "N/A";
          const courseId = course.customCourseId || "N/A";
          const grade = course.gradeLetter || "N/A";
          const point = course.pointEquivalent || "0.00";
          const credit = course.totalCredit || "0";

          return `📚 ${courseId}
📖 ${courseTitle}
📊 Grade: ${grade} | Points: ${point} | Credits: ${credit}`;
        })
        .join("\n\n");

      const shareMessage = `
🎓 DIU Result Checker
━━━━━━━━━━━━━━━━━━━━━━━━

👤 STUDENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${studentInfo.studentName || "N/A"}
ID: ${studentInfo.studentId || "N/A"}
Program: ${studentInfo.program || "N/A"}
Semester: ${studentInfo.semesterName || "N/A"} ${studentInfo.semesterYear || ""}

📈 ACADEMIC PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━
CGPA: ${(studentInfo.cgpa || 0).toFixed(2)}
Total Courses: ${courses.length}
Total Credits: ${totalCredits.toFixed(1)}

📝 COURSE RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━
${courseResults}

━━━━━━━━━━━━━━━━━━━━━━━━
📱 Download DIU Result Checker app to check your results!
      `;

      await Share.share({
        message: shareMessage,
        title: "My DIU Result",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share result");
    }
  };

  const generatePDF = async () => {
    try {
      // Create a sanitized filename
      const sanitizeString = (str) => {
        return (str || "N/A").replace(/[^a-zA-Z0-9]/g, "_");
      };

      const studentId = sanitizeString(studentInfo.studentId);
      const semesterName = sanitizeString(studentInfo.semesterName);
      const semesterYear = studentInfo.semesterYear || "N/A";
      const fileName = `DIU_Result_${studentId}_${semesterName}_${semesterYear}.pdf`;

      // Create HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${fileName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #4A90E2;
              padding-bottom: 10px;
            }
            .header h1 {
              color: #4A90E2;
              margin: 0;
            }
            .section { 
              margin-bottom: 25px;
              background: #fff;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 15px; 
              color: #4A90E2;
              border-bottom: 1px solid #eee;
              padding-bottom: 8px;
            }
            .info-row { 
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .course-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 14px;
            }
            .course-table th, .course-table td { 
              border: 1px solid #ddd; 
              padding: 12px 8px; 
              text-align: left; 
            }
            .course-table th { 
              background-color: #f8f9fa;
              color: #4A90E2;
              font-weight: bold;
            }
            .course-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 12px; 
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 15px;
            }
            .grade {
              font-weight: bold;
              color: #4A90E2;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DIU Result Checker</h1>
          </div>
          
          <div class="section">
            <div class="section-title">Student Information</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span>${studentInfo.studentName || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID:</span>
              <span>${studentInfo.studentId || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Program:</span>
              <span>${studentInfo.program || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Semester:</span>
              <span>${studentInfo.semesterName || "N/A"} ${
        studentInfo.semesterYear || ""
      }</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Academic Performance</div>
            <div class="info-row">
              <span class="info-label">CGPA:</span>
              <span class="grade">${(studentInfo.cgpa || 0).toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Courses:</span>
              <span>${courses.length}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Credits:</span>
              <span>${totalCredits.toFixed(1)}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Course Results</div>
            <table class="course-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Grade</th>
                  <th>Points</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                ${courses
                  .map(
                    (course) => `
                  <tr>
                    <td>${course.customCourseId || "N/A"}</td>
                    <td>${course.courseTitle || "N/A"}</td>
                    <td class="grade">${course.gradeLetter || "N/A"}</td>
                    <td>${course.pointEquivalent || "0.00"}</td>
                    <td>${course.totalCredit || "0"}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="footer">
            Generated by DIU Result Checker App
          </div>
        </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 612,
        height: 792,
        base64: false,
      });

      // Create a new file with our custom name
      const newUri = FileSystem.documentDirectory + fileName;
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, {
          mimeType: "application/pdf",
          dialogTitle: fileName,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF");
      console.error("PDF generation error:", error);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F5F6FA]"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        className="pt-5 pb-5 rounded-b-[30px] shadow-lg"
      >
        <StyledView className="flex-row items-center px-5">
          <StyledTouchableOpacity
            className="p-2 mr-2.5"
            onPress={() => navigation.goBack()}
          >
            <StyledText className="text-white text-2xl font-semibold">
              ←
            </StyledText>
          </StyledTouchableOpacity>
          <StyledText className="text-2xl font-bold text-white">
            Result Summary
          </StyledText>
        </StyledView>
      </LinearGradient>

      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(40, insets.bottom + 20),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Info Section */}
        <StyledView className="bg-white rounded-[20px] p-5 mb-5 shadow-md">
          <StyledView className="flex-row justify-between items-center mb-2.5">
            <StyledView className="flex-1">
              <StyledText className="text-[22px] font-semibold text-[#2C3E50] mb-1">
                {studentInfo.studentName || "N/A"}
              </StyledText>
              <StyledText className="text-sm text-[#7F8C8D]">
                ID: {studentInfo.studentId || "N/A"}
              </StyledText>
            </StyledView>
            <StyledView className="bg-[#4A90E2] px-4 py-2 rounded-[20px]">
              <StyledText className="text-sm text-white font-semibold">
                {studentInfo.semesterName || "N/A"}{" "}
                {studentInfo.semesterYear || ""}
              </StyledText>
            </StyledView>
          </StyledView>
          <StyledText className="text-sm text-[#7F8C8D] leading-5">
            {studentInfo.program || "N/A"}
          </StyledText>
        </StyledView>

        {/* Quick Stats Section */}
        <StyledView className="flex-row justify-between mb-5">
          <StyledView className="flex-1 bg-white rounded-[15px] p-4 mx-1 items-center shadow-md">
            <StyledText className="text-2xl font-bold text-[#4A90E2] mb-1">
              {(studentInfo.cgpa || 0).toFixed(2)}
            </StyledText>
            <StyledText className="text-xs text-[#7F8C8D] font-medium">
              CGPA
            </StyledText>
          </StyledView>
          <StyledView className="flex-1 bg-white rounded-[15px] p-4 mx-1 items-center shadow-md">
            <StyledText className="text-2xl font-bold text-[#4A90E2] mb-1">
              {courses.length}
            </StyledText>
            <StyledText className="text-xs text-[#7F8C8D] font-medium">
              Courses
            </StyledText>
          </StyledView>
          <StyledView className="flex-1 bg-white rounded-[15px] p-4 mx-1 items-center shadow-md">
            <StyledText className="text-2xl font-bold text-[#4A90E2] mb-1">
              {totalCredits.toFixed(1)}
            </StyledText>
            <StyledText className="text-xs text-[#7F8C8D] font-medium">
              Credits
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Course Results Section */}
        <StyledView className="bg-white rounded-[20px] p-5 shadow-md">
          <StyledText className="text-lg font-semibold text-[#2C3E50] mb-4">
            Course Results
          </StyledText>
          <ResultTable result={result} />
        </StyledView>

        <StyledView className="flex-row justify-between mt-4 space-x-3">
          <StyledTouchableOpacity
            onPress={handleShare}
            className="flex-1 bg-blue-500 rounded-lg py-3"
          >
            <StyledText className="text-white text-center font-semibold">
              Share Result
            </StyledText>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity
            onPress={generatePDF}
            className="flex-1 bg-green-500 rounded-lg py-3"
          >
            <StyledText className="text-white text-center font-semibold">
              Generate PDF
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledScrollView>
    </SafeAreaView>
  );
}
