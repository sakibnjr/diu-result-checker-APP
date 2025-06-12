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
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
      setLoading(true);
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
        navigation.navigate("Result", { result: response.data });
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to fetch result. Please try again.",
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
    } catch (error) {
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
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStudentId("");
    setSemesterType("");
    setSemesterYear("");
    setSemesterId("");
    setCaptchaInput("");
    fetchCaptcha();
  };

  return (
    <LinearGradient
      colors={["#4A90E2", "#357ABD", "#2C3E50"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1" style={{ paddingTop: insets.top }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={["rgba(74, 144, 226, 0.95)", "rgba(53, 122, 189, 0.95)"]}
          className="pt-4 pb-6 rounded-b-[30px] shadow-lg"
        >
          <StyledView className="items-center px-5">
            <StyledText className="text-3xl font-bold text-white mb-2">
              DIU Result Checker
            </StyledText>
            <StyledText className="text-base text-white opacity-90">
              Check your semester results
            </StyledText>
          </StyledView>
        </LinearGradient>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <StyledScrollView
            className="flex-1"
            contentContainerStyle={{
              padding: 20,
              paddingBottom: Math.max(40, insets.bottom + 20),
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            automaticallyAdjustKeyboardInsets={true}
            extraScrollHeight={Platform.OS === "android" ? 100 : 0}
            ref={scrollViewRef}
          >
            <StyledView className="bg-white rounded-[20px] p-6 min-h-[500px] shadow-lg">
              <StyledView className="mb-6">
                <StyledView className="mb-5">
                  <StyledText className="text-sm text-gray-700 font-semibold mb-2">
                    Student ID
                  </StyledText>
                  <StyledTextInput
                    className="w-full border border-gray-200 rounded-xl p-4 text-base bg-gray-50 text-gray-800 placeholder-gray-400"
                    placeholder="Enter your student ID"
                    value={studentId}
                    onChangeText={setStudentId}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="next"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </StyledView>

                <StyledView className="flex-row justify-between mb-5">
                  <StyledView className="flex-1 mx-1">
                    <StyledText className="text-sm text-gray-700 font-semibold mb-2">
                      Semester Type
                    </StyledText>
                    <StyledTouchableOpacity
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[50px] justify-center"
                      onPress={() => setShowTypeDropdown(true)}
                      activeOpacity={0.7}
                    >
                      <StyledText className="text-base text-gray-800">
                        {semesterType || "Select Type"}
                      </StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>

                  <StyledView className="flex-1 mx-1">
                    <StyledText className="text-sm text-gray-700 font-semibold mb-2">
                      Year
                    </StyledText>
                    <StyledTouchableOpacity
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[50px] justify-center"
                      onPress={() => setShowYearDropdown(true)}
                      activeOpacity={0.7}
                    >
                      <StyledText className="text-base text-gray-800">
                        {semesterYear || "Select Year"}
                      </StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>
                </StyledView>

                {captchaImage && (
                  <StyledView className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-5">
                    <StyledView className="flex-row items-center justify-between mb-4">
                      <StyledImage
                        source={{ uri: captchaImage }}
                        className="w-[200px] h-[60px]"
                        resizeMode="contain"
                      />
                      <StyledTouchableOpacity
                        onPress={fetchCaptcha}
                        className="w-10 h-10 justify-center items-center bg-gray-100 rounded-full"
                        activeOpacity={0.7}
                      >
                        <MaterialIcons
                          name="refresh"
                          size={24}
                          color="#4A90E2"
                        />
                      </StyledTouchableOpacity>
                    </StyledView>
                    <StyledView>
                      <StyledText className="text-sm text-gray-700 font-semibold mb-2">
                        Captcha
                      </StyledText>
                      <StyledTextInput
                        className="w-full border border-gray-200 rounded-xl p-4 text-base bg-gray-50 text-gray-800 placeholder-gray-400"
                        placeholder="Enter the captcha code"
                        value={captchaInput}
                        onChangeText={setCaptchaInput}
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="done"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={() => {
                          setTimeout(() => {
                            scrollViewRef.current?.scrollToEnd({
                              animated: true,
                            });
                          }, 100);
                        }}
                      />
                    </StyledView>
                  </StyledView>
                )}
              </StyledView>

              <StyledView className="flex-row justify-center">
                <StyledTouchableOpacity
                  className="w-full bg-[#4A90E2] rounded-xl p-4 items-center flex-row justify-center"
                  onPress={submitCaptcha}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
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
            </StyledView>
          </StyledScrollView>
        </KeyboardAvoidingView>

        {/* Semester Type Dropdown Modal */}
        <Modal
          visible={showTypeDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTypeDropdown(false)}
        >
          <StyledView className="flex-1 justify-center items-center bg-black/50">
            <StyledTouchableOpacity
              className="absolute inset-0"
              activeOpacity={1}
              onPress={() => setShowTypeDropdown(false)}
            />
            <StyledView className="bg-white rounded-xl p-3 w-4/5 max-h-[80%] shadow-lg">
              <StyledText className="text-lg font-semibold text-gray-800 mb-3 px-4">
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
                  activeOpacity={0.7}
                >
                  <StyledText className="text-base text-gray-800">
                    {type}
                  </StyledText>
                </StyledTouchableOpacity>
              ))}
            </StyledView>
          </StyledView>
        </Modal>

        {/* Year Dropdown Modal */}
        <Modal
          visible={showYearDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowYearDropdown(false)}
        >
          <StyledView className="flex-1 justify-center items-center bg-black/50">
            <StyledTouchableOpacity
              className="absolute inset-0"
              activeOpacity={1}
              onPress={() => setShowYearDropdown(false)}
            />
            <StyledView className="bg-white rounded-xl p-3 w-4/5 max-h-[80%] shadow-lg">
              <StyledText className="text-lg font-semibold text-gray-800 mb-3 px-4">
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
                  activeOpacity={0.7}
                >
                  <StyledText className="text-base text-gray-800">
                    {year}
                  </StyledText>
                </StyledTouchableOpacity>
              ))}
            </StyledView>
          </StyledView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
