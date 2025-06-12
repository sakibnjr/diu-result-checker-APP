import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import ResultTable from "../components/ResultTable";
import { LinearGradient } from "expo-linear-gradient";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

export default function ResultScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
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

        <StyledView className="flex-1 justify-center items-center p-5">
          <StyledText className="text-lg text-[#2C3E50] text-center">
            No result data available. Please try again.
          </StyledText>
        </StyledView>
      </SafeAreaView>
    );
  }

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
      </StyledScrollView>
    </SafeAreaView>
  );
}
