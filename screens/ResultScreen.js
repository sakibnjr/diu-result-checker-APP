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
  ActivityIndicator,
} from "react-native";
import ResultTable from "../components/ResultTable";
import { LinearGradient } from "expo-linear-gradient";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

export default function ResultScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState("");

  // Initialize Gemini with error handling
  const genAI = new GoogleGenerativeAI(
    process.env.EXPO_PUBLIC_GEMINI_API_KEY || ""
  );

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
    Alert.alert(
      "No Data",
      "Result has not been published yet. Please try again later.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
    return null;
  }

  const analyzeResult = async () => {
    try {
      setIsAnalyzing(true);

      // Check if API key is available
      if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        setAnalysis(
          "Analysis feature is currently unavailable. Please try again later."
        );
        return;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Generate a direct, bullet-point analysis of this student's academic performance. Start directly with the bullet points, no introductory text:
        
        Student: ${studentInfo.studentName}
        Program: ${studentInfo.program}
        Semester: ${studentInfo.semesterName} ${studentInfo.semesterYear}
        CGPA: ${(studentInfo.cgpa || 0).toFixed(2)}
        Total Courses: ${courses.length}
        Total Credits: ${totalCredits.toFixed(1)}
        
        Course Results:
        ${courses
          .map(
            (course) =>
              `${course.customCourseId || "N/A"}: ${
                course.gradeLetter || "N/A"
              } (${course.totalCredit || "0"} credits) - ${
                course.courseTitle || "N/A"
              }`
          )
          .join("\n")}
        
        Format exactly as:
        Student: [Name] | [Program] | CGPA: [Score] 🏆

        Semester: [Semester] [Year] | [Total Courses] Courses 📚

        Performance: [One-line summary] 👍

        Achievement: [Key highlight] ✨

        Focus: [One area to improve] 🎯

        Note: [Short motivational point] 💪
        
        Keep each bullet point under 15 words. Start directly with the first bullet point, no introductory text.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();
      setAnalysis(analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysis(
        "Unable to analyze results at this time. Please try again later."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (result?.data) {
      analyzeResult(); // Automatically analyze when results are loaded
    }
  }, [result]);

  const shareResult = async () => {
    try {
      const message = `
🎓 DIU Result Checker
━━━━━━━━━━━━━━━━━━━━━━━━

${analysis ? `${analysis}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━
📱 Download DIU Result Checker app to check your results!
      `;

      await Share.share({
        message,
      });
    } catch (error) {
      Alert.alert("Error", "Could not share results");
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

        {/* Action Buttons */}
        <StyledView className="flex-row justify-between mt-4 space-x-3">
          <StyledTouchableOpacity
            className="flex-1 bg-[#4A90E2] rounded-xl p-4 items-center flex-row justify-center shadow-lg"
            onPress={shareResult}
            disabled={isAnalyzing}
            style={{
              shadowColor: "#4A90E2",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
              opacity: isAnalyzing ? 0.7 : 1,
            }}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialIcons
                  name="share"
                  size={24}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <StyledText className="text-white text-base font-semibold">
                  Share Result
                </StyledText>
              </>
            )}
          </StyledTouchableOpacity>

          <StyledTouchableOpacity
            className="flex-1 bg-green-500 rounded-xl p-4 items-center flex-row justify-center shadow-lg"
            onPress={generatePDF}
            style={{
              shadowColor: "#4CAF50",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <MaterialIcons
              name="picture-as-pdf"
              size={24}
              color="white"
              style={{ marginRight: 8 }}
            />
            <StyledText className="text-white text-base font-semibold">
              Generate PDF
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledScrollView>
    </SafeAreaView>
  );
}
