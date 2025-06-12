import { useEffect, useState } from "react";
import {
  StyleSheet,
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

export default function HomeScreen({ navigation }) {
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>DIU Result Checker</Text>
          <Text style={styles.subHeader}>Check your semester results</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Student ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Student ID"
                  value={studentId}
                  onChangeText={setStudentId}
                  keyboardType="numeric"
                  placeholderTextColor="#95A5A6"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.semesterRow}>
                <View style={styles.semesterDropdownContainer}>
                  <Text style={styles.label}>Semester Type</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowTypeDropdown(true)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {semesterType || "Select Type"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.semesterDropdownContainer}>
                  <Text style={styles.label}>Year</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowYearDropdown(true)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {semesterYear || "Select Year"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {captchaImage && (
                <View style={styles.captchaContainer}>
                  <View style={styles.captchaImageRow}>
                    <Image
                      source={{ uri: captchaImage }}
                      style={styles.captchaImage}
                    />
                    <TouchableOpacity
                      onPress={fetchCaptcha}
                      style={styles.refreshButton}
                    >
                      <Text style={styles.refreshText}>↻</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.captchaInputWrapper}>
                    <Text style={styles.label}>Captcha</Text>
                    <TextInput
                      style={styles.captchaInput}
                      placeholder="Enter Captcha"
                      value={captchaInput}
                      onChangeText={setCaptchaInput}
                      placeholderTextColor="#95A5A6"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={submitCaptcha}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Check Result</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={resetForm}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Semester Type Dropdown Modal */}
      <Modal
        visible={showTypeDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypeDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeDropdown(false)}
        >
          <View style={styles.modalContent}>
            {semesterTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownItem}
                onPress={() => {
                  setSemesterType(type);
                  setShowTypeDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year Dropdown Modal */}
      <Modal
        visible={showYearDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearDropdown(false)}
        >
          <View style={styles.modalContent}>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={styles.dropdownItem}
                onPress={() => {
                  setSemesterYear(year);
                  setShowYearDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{year}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 30,
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
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subHeader: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
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
    minHeight: 500,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#2C3E50",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    color: "#2C3E50",
  },
  semesterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  semesterDropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdownButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 15,
    minHeight: 50,
    justifyContent: "center",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#2C3E50",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    width: "80%",
    maxHeight: "80%",
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#2C3E50",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: "#4A90E2",
  },
  resetButton: {
    backgroundColor: "#E74C3C",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  captchaContainer: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 15,
  },
  captchaImageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  captchaImage: {
    width: 200,
    height: 60,
    resizeMode: "contain",
  },
  captchaInputWrapper: {
    width: "100%",
  },
  captchaInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#2C3E50",
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    borderRadius: 20,
  },
  refreshText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});
