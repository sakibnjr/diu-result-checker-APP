import React from "react";
import { View, Text } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);

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
        return "bg-[#2ECC71]";
      case "A":
        return "bg-[#27AE60]";
      case "A-":
        return "bg-[#27AE60]";
      case "B+":
        return "bg-[#3498DB]";
      case "B":
        return "bg-[#2980B9]";
      case "B-":
        return "bg-[#2980B9]";
      case "C+":
        return "bg-[#F1C40F]";
      case "C":
        return "bg-[#F39C12]";
      case "C-":
        return "bg-[#F39C12]";
      default:
        return "bg-[#E74C3C]";
    }
  };

  return (
    <StyledView className="w-full">
      <StyledView className="flex-row bg-[#F8F9FA] p-3 rounded-t-xl border-b border-[#E0E0E0]">
        <StyledText className="w-[50%] text-[#7F8C8D] font-semibold text-xs uppercase">
          Course
        </StyledText>
        <StyledText className="w-[25%] text-center text-[#7F8C8D] font-semibold text-xs uppercase">
          Grade
        </StyledText>
        <StyledText className="w-[25%] text-center text-[#7F8C8D] font-semibold text-xs uppercase">
          Point
        </StyledText>
      </StyledView>

      <StyledView className="bg-white rounded-b-xl">
        {courses.map((course, index) => (
          <StyledView
            className={`flex-row p-3 border-b border-[#E0E0E0] ${
              index === courses.length - 1 ? "border-b-0" : ""
            }`}
            key={index}
          >
            <StyledView className="w-[50%] pr-2">
              <StyledText
                className="text-sm text-[#2C3E50] mb-1"
                style={{ flexWrap: "wrap" }}
              >
                {course.courseTitle}
              </StyledText>
              <StyledText className="text-xs text-[#7F8C8D]">
                {course.customCourseId}
              </StyledText>
            </StyledView>
            <StyledView className="w-[25%] items-center justify-center">
              <StyledView
                className={`px-3 py-1.5 rounded-xl min-w-[50px] items-center ${getGradeColor(
                  course.gradeLetter
                )}`}
              >
                <StyledText className="text-white font-semibold text-sm">
                  {course.gradeLetter}
                </StyledText>
              </StyledView>
            </StyledView>
            <StyledView className="w-[25%] items-center justify-center">
              <StyledText className="text-sm font-semibold text-[#2C3E50] mb-0.5">
                {course.pointEquivalent}
              </StyledText>
              <StyledText className="text-xs text-[#7F8C8D]">
                {course.totalCredit} Cr
              </StyledText>
            </StyledView>
          </StyledView>
        ))}
      </StyledView>
    </StyledView>
  );
}
