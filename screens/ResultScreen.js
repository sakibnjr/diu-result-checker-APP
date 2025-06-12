import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import ResultTable from "../components/ResultTable";

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Result Summary</Text>
      <ResultTable result={result} />
      <Button title="Back to Home" onPress={() => navigation.goBack()} />
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
});
