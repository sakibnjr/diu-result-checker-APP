import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";

export default function HomeScreen({ navigation }) {
  const [captchaImage, setCaptchaImage] = useState(null);
  const [captchaRaw, setCaptchaRaw] = useState("");
  const [studentId, setStudentId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCaptcha();
  }, []);

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
        // Navigate to Result screen and pass the result data
        navigation.navigate("Result", { result: response.data });
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to fetch result."
        );
        fetchCaptcha(); // Reload captcha on failure
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStudentId("");
    setSemesterId("");
    setCaptchaInput("");
    fetchCaptcha();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>DIU Student Result Portal</Text>

      {captchaImage && (
        <Image source={{ uri: captchaImage }} style={styles.captchaImage} />
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter Student ID"
        value={studentId}
        onChangeText={setStudentId}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Semester ID"
        value={semesterId}
        onChangeText={setSemesterId}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Captcha"
        value={captchaInput}
        onChangeText={setCaptchaInput}
      />

      <View style={styles.buttonContainer}>
        <Button title="Submit" onPress={submitCaptcha} disabled={loading} />
        <Button title="Reset" onPress={resetForm} />
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginVertical: 20 }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  captchaImage: {
    width: 200,
    height: 80,
    marginVertical: 10,
    resizeMode: "contain",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 10,
  },
});
