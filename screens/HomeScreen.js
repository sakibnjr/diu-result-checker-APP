import { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { styled } from "nativewind";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [captchaImage, setCaptchaImage] = useState(null);
  const [captchaRaw, setCaptchaRaw] = useState("");
  const [studentId, setStudentId] = useState("");
  const [semesterType, setSemesterType] = useState("");
  const [semesterYear, setSemesterYear] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef(null);

  const semesterTypes = ["Spring", "Summer", "Fall"];
  const years = Array.from({ length: 6 }, (_, i) => (2020 + i).toString());

  useEffect(() => {
    fetchCaptcha();
  }, []);

  useEffect(() => {
    if (semesterType && semesterYear) {
      const year = semesterYear.slice(-2);
      let typeNumber;
      switch (semesterType.toLowerCase()) {
        case "spring":
          typeNumber = "1";
          break;
        case "summer":
          typeNumber = "2";
          break;
        case "fall":
          typeNumber = "3";
          break;
        default:
          typeNumber = "";
      }
      setSemesterId(year + typeNumber);
    }
  }, [semesterType, semesterYear]);

  const fetchCaptcha = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://gateway7.diu.edu.bd/api/student/portal/check/result/captcha",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.status) {
        const imageBase64 = response.data.data.image;
        setCaptchaImage(`data:image/png;base64,${imageBase64}`);
        setCaptchaRaw(imageBase64);
      } else {
        Alert.alert("Error", "Failed to fetch captcha.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitCaptcha = async () => {
    if (!studentId || !semesterId || !captchaInput) {
      Alert.alert(
        "Required Fields",
        "Please fill in all fields to check your result.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        image: captchaRaw,
        hidden: captchaInput,
        data: {
          studentId: studentId,
          semesterId: semesterId,
        },
      };

      const response = await axios.post(
        "https://gateway7.diu.edu.bd/api/student/portal/check/result",
        payload,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {
        try {
          navigation.navigate("Result", { result: response.data });
        } catch (navError) {
          Alert.alert(
            "Navigation Error",
            "Unable to show result. Please try again.",
            [{ text: "OK" }]
          );
          console.error("Navigation error:", navError);
        }
      } else {
        if (response.data.message?.toLowerCase().includes("captcha")) {
          Alert.alert(
            "Captcha Error",
            "Captcha expired or maybe you have entered wrong captcha!",
            [
              {
                text: "Refresh Captcha",
                onPress: () => {
                  fetchCaptcha();
                  setCaptchaInput("");
                },
              },
            ]
          );
        } else if (response.data.message === "Data not Found!!") {
          Alert.alert(
            "No Result Found",
            "No result found for the provided student ID and semester. Please verify your information and try again.",
            [
              {
                text: "Try Again",
                onPress: () => {
                  fetchCaptcha();
                  setCaptchaInput("");
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "Error",
            response.data.message ||
              "Failed to fetch result. Please try again.",
            [
              {
                text: "Try Again",
                onPress: () => {
                  fetchCaptcha();
                  setCaptchaInput("");
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      if (error.response?.data?.message?.toLowerCase().includes("captcha")) {
        Alert.alert(
          "Captcha Error",
          "Captcha expired or maybe you have entered wrong captcha!",
          [
            {
              text: "Refresh Captcha",
              onPress: () => {
                fetchCaptcha();
                setCaptchaInput("");
              },
            },
          ]
        );
      } else if (error.response?.data?.message === "Data not Found!!") {
        Alert.alert(
          "No Result Found",
          "No result found for the provided student ID and semester. Please verify your information and try again.",
          [
            {
              text: "Try Again",
              onPress: () => {
                fetchCaptcha();
                setCaptchaInput("");
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check your internet connection and try again.",
          [
            {
              text: "Try Again",
              onPress: () => {
                fetchCaptcha();
                setCaptchaInput("");
              },
            },
          ]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView className="flex-1">
        {/* Header Section */}
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-6 pb-8 rounded-b-[32px] shadow-lg"
        >
          <StyledView className="px-5">
            <StyledText className="text-3xl font-bold text-white mb-2">
              DIU Result
            </StyledText>
            <StyledText className="text-base text-white/90">
              Check your semester results instantly
            </StyledText>
          </StyledView>
        </LinearGradient>

        <View className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          >
            <StyledScrollView
              className="flex-1"
              contentContainerStyle={{
                padding: 16,
                paddingBottom: Math.max(20, insets.bottom + 16),
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ref={scrollViewRef}
              keyboardDismissMode="on-drag"
            >
              {/* Main Card */}
              <StyledView className="bg-white rounded-[24px] p-5 shadow-xl">
                {/* Student ID Input */}
                <StyledView className="mb-5">
                  <StyledText className="text-base font-semibold text-gray-800 mb-2">
                    Student ID
                  </StyledText>
                  <StyledView className="relative">
                    <MaterialIcons
                      name="person"
                      size={22}
                      color="#3B82F6"
                      style={{
                        position: "absolute",
                        left: 14,
                        top: 14,
                        zIndex: 1,
                      }}
                    />
                    <StyledTextInput
                      className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 text-base bg-gray-50/50 text-gray-800"
                      placeholder="Enter your student ID"
                      value={studentId}
                      onChangeText={setStudentId}
                      keyboardType="numeric"
                      placeholderTextColor="#94A3B8"
                      returnKeyType="next"
                    />
                  </StyledView>
                </StyledView>

                {/* Semester Selection */}
                <StyledView className="flex-row justify-between mb-5">
                  <StyledView className="flex-1 mr-2">
                    <StyledText className="text-base font-semibold text-gray-800 mb-2">
                      Semester Type
                    </StyledText>
                    <StyledTouchableOpacity
                      className="bg-gray-50/50 border-2 border-gray-100 rounded-xl p-3 flex-row items-center justify-between"
                      onPress={() => setShowTypeDropdown(true)}
                      disabled={isSubmitting}
                    >
                      <StyledText className="text-base text-gray-800">
                        {semesterType || "Select Type"}
                      </StyledText>
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={24}
                        color="#3B82F6"
                      />
                    </StyledTouchableOpacity>
                  </StyledView>

                  <StyledView className="flex-1 ml-2">
                    <StyledText className="text-base font-semibold text-gray-800 mb-2">
                      Year
                    </StyledText>
                    <StyledTouchableOpacity
                      className="bg-gray-50/50 border-2 border-gray-100 rounded-xl p-3 flex-row items-center justify-between"
                      onPress={() => setShowYearDropdown(true)}
                      disabled={isSubmitting}
                    >
                      <StyledText className="text-base text-gray-800">
                        {semesterYear || "Select Year"}
                      </StyledText>
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={24}
                        color="#3B82F6"
                      />
                    </StyledTouchableOpacity>
                  </StyledView>
                </StyledView>

                {/* Captcha Section */}
                {captchaImage && (
                  <StyledView className="mb-5">
                    <StyledText className="text-base font-semibold text-gray-800 mb-2">
                      Verification Code
                    </StyledText>
                    <StyledView className="bg-gray-50/50 rounded-xl p-4 border-2 border-gray-100">
                      <StyledView className="flex-row items-center justify-between mb-4">
                        <StyledImage
                          source={{ uri: captchaImage }}
                          className="w-[180px] h-[50px]"
                          resizeMode="contain"
                        />
                        <StyledTouchableOpacity
                          onPress={fetchCaptcha}
                          className="w-10 h-10 justify-center items-center bg-white rounded-full shadow-sm"
                          disabled={isSubmitting}
                        >
                          <MaterialIcons
                            name="refresh"
                            size={24}
                            color="#3B82F6"
                          />
                        </StyledTouchableOpacity>
                      </StyledView>
                      <StyledView className="relative">
                        <MaterialIcons
                          name="security"
                          size={22}
                          color="#3B82F6"
                          style={{
                            position: "absolute",
                            left: 14,
                            top: 14,
                            zIndex: 1,
                          }}
                        />
                        <StyledTextInput
                          className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 text-base bg-white text-gray-800"
                          placeholder="Enter the code"
                          value={captchaInput}
                          onChangeText={setCaptchaInput}
                          placeholderTextColor="#94A3B8"
                          onFocus={() => {
                            setTimeout(() => {
                              scrollViewRef.current?.scrollToEnd({
                                animated: true,
                              });
                            }, 100);
                          }}
                          editable={!isSubmitting}
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>
                )}

                {/* Submit Button */}
                <StyledTouchableOpacity
                  className="w-full bg-[#3B82F6] rounded-xl p-4 items-center flex-row justify-center shadow-lg"
                  onPress={submitCaptcha}
                  disabled={isSubmitting}
                  style={{
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <MaterialIcons
                        name="search"
                        size={24}
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                      <StyledText className="text-white text-base font-semibold">
                        Check Result
                      </StyledText>
                    </>
                  )}
                </StyledTouchableOpacity>
              </StyledView>
            </StyledScrollView>
          </KeyboardAvoidingView>

          {(showTypeDropdown || showYearDropdown) && (
            <BlurView
              intensity={100}
              className="absolute inset-0 z-10"
              tint="light"
              style={{ elevation: 5 }}
            />
          )}
        </View>

        {/* Semester Type Modal */}
        <Modal
          visible={showTypeDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTypeDropdown(false)}
        >
          <View className="flex-1 justify-center items-center">
            <StyledTouchableOpacity
              className="absolute inset-0"
              activeOpacity={1}
              onPress={() => setShowTypeDropdown(false)}
            />
            <StyledView className="bg-white rounded-2xl p-5 w-[80%] max-h-[70%] shadow-2xl z-20">
              <StyledText className="text-lg font-bold text-gray-800 mb-4 px-2">
                Select Semester Type
              </StyledText>
              {semesterTypes.map((type) => (
                <StyledTouchableOpacity
                  key={type}
                  className="p-4 border-b border-gray-100 active:bg-gray-50"
                  onPress={() => {
                    setSemesterType(type);
                    setShowTypeDropdown(false);
                  }}
                >
                  <StyledText className="text-base text-gray-800">
                    {type}
                  </StyledText>
                </StyledTouchableOpacity>
              ))}
            </StyledView>
          </View>
        </Modal>

        {/* Year Modal */}
        <Modal
          visible={showYearDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowYearDropdown(false)}
        >
          <View className="flex-1 justify-center items-center">
            <StyledTouchableOpacity
              className="absolute inset-0"
              activeOpacity={1}
              onPress={() => setShowYearDropdown(false)}
            />
            <StyledView className="bg-white rounded-2xl p-5 w-[80%] max-h-[70%] shadow-2xl z-20">
              <StyledText className="text-lg font-bold text-gray-800 mb-4 px-2">
                Select Year
              </StyledText>
              {years.map((year) => (
                <StyledTouchableOpacity
                  key={year}
                  className="p-4 border-b border-gray-100 active:bg-gray-50"
                  onPress={() => {
                    setSemesterYear(year);
                    setShowYearDropdown(false);
                  }}
                >
                  <StyledText className="text-base text-gray-800">
                    {year}
                  </StyledText>
                </StyledTouchableOpacity>
              ))}
            </StyledView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
