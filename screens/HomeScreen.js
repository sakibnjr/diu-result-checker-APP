import { useEffect, useState } from "react";
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
      Alert.alert("Validation Error", "Please fill all fields.");
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
          response.data.message || "Failed to fetch result."
        );
        fetchCaptcha();
      }
    } catch (error) {
      Alert.alert("Error", error.message);
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
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
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
          keyboardDismissMode="on-drag"
        >
          <StyledView className="bg-surface rounded-[20px] p-5 shadow-md min-h-[500px]">
            <StyledView className="mb-5">
              <StyledView className="mb-4">
                <StyledText className="text-sm text-text-primary font-semibold mb-2">
                  Student ID
                </StyledText>
                <StyledTextInput
                  className="w-full border border-border rounded-xl p-4 text-base bg-background text-text-primary"
                  placeholder="Enter Student ID"
                  value={studentId}
                  onChangeText={setStudentId}
                  keyboardType="numeric"
                  placeholderTextColor="#95A5A6"
                  returnKeyType="next"
                />
              </StyledView>

              <StyledView className="flex-row justify-between mb-4">
                <StyledView className="flex-1 mx-1">
                  <StyledText className="text-sm text-text-primary font-semibold mb-2">
                    Semester Type
                  </StyledText>
                  <StyledTouchableOpacity
                    className="bg-background border border-border rounded-xl p-4 min-h-[50px] justify-center"
                    onPress={() => setShowTypeDropdown(true)}
                  >
                    <StyledText className="text-base text-text-primary">
                      {semesterType || "Select Type"}
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>

                <StyledView className="flex-1 mx-1">
                  <StyledText className="text-sm text-text-primary font-semibold mb-2">
                    Year
                  </StyledText>
                  <StyledTouchableOpacity
                    className="bg-background border border-border rounded-xl p-4 min-h-[50px] justify-center"
                    onPress={() => setShowYearDropdown(true)}
                  >
                    <StyledText className="text-base text-text-primary">
                      {semesterYear || "Select Year"}
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>

              {captchaImage && (
                <StyledView className="bg-background p-4 rounded-xl border border-border mb-4">
                  <StyledView className="flex-row items-center justify-between mb-4">
                    <StyledImage
                      source={{ uri: captchaImage }}
                      className="w-[200px] h-[60px]"
                      resizeMode="contain"
                    />
                    <StyledTouchableOpacity
                      onPress={fetchCaptcha}
                      className="w-10 h-10 justify-center items-center bg-primary rounded-full"
                    >
                      <StyledText className="text-white text-xl font-bold">
                        ↻
                      </StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>
                  <StyledView>
                    <StyledText className="text-sm text-text-primary font-semibold mb-2">
                      Captcha
                    </StyledText>
                    <StyledTextInput
                      className="w-full border border-border rounded-xl p-4 text-base bg-surface text-text-primary"
                      placeholder="Enter Captcha"
                      value={captchaInput}
                      onChangeText={setCaptchaInput}
                      placeholderTextColor="#95A5A6"
                      returnKeyType="done"
                    />
                  </StyledView>
                </StyledView>
              )}
            </StyledView>

            <StyledView className="flex-row justify-between">
              <StyledTouchableOpacity
                className="flex-1 mx-1 bg-primary rounded-xl p-4 items-center"
                onPress={submitCaptcha}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <StyledText className="text-white text-base font-semibold">
                    Check Result
                  </StyledText>
                )}
              </StyledTouchableOpacity>

              <StyledTouchableOpacity
                className="flex-1 mx-1 bg-danger rounded-xl p-4 items-center"
                onPress={resetForm}
                disabled={loading}
              >
                <StyledText className="text-white text-base font-semibold">
                  Reset
                </StyledText>
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
        <StyledTouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowTypeDropdown(false)}
        >
          <StyledView className="bg-surface rounded-xl p-3 w-4/5 max-h-[80%]">
            {semesterTypes.map((type) => (
              <StyledTouchableOpacity
                key={type}
                className="p-4 border-b border-border"
                onPress={() => {
                  setSemesterType(type);
                  setShowTypeDropdown(false);
                }}
              >
                <StyledText className="text-base text-text-primary">
                  {type}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </StyledTouchableOpacity>
      </Modal>

      {/* Year Dropdown Modal */}
      <Modal
        visible={showYearDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearDropdown(false)}
      >
        <StyledTouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowYearDropdown(false)}
        >
          <StyledView className="bg-surface rounded-xl p-3 w-4/5 max-h-[80%]">
            {years.map((year) => (
              <StyledTouchableOpacity
                key={year}
                className="p-4 border-b border-border"
                onPress={() => {
                  setSemesterYear(year);
                  setShowYearDropdown(false);
                }}
              >
                <StyledText className="text-base text-text-primary">
                  {year}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </StyledTouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
