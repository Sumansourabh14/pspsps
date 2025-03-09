import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase"; // Assuming Supabase is set up
import { useState } from "react";
import { Stack } from "expo-router";

export default function FeedbackScreen() {
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Handle feedback submission
  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert("Oops!", "Please enter some feedback before submitting.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("feedback") // Assuming a 'feedback' table exists
      .insert([{ message: feedback.trim() }]);

    setLoading(false);

    if (error) {
      Alert.alert("Error", "Something went wrong. Try again!");
      console.error("Feedback submission error:", error);
    } else {
      Alert.alert("Thanks!", "Your feedback has been submitted.");
      setFeedback(""); // Clear input after submission
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Send Feedback",
          headerTitleStyle: { fontFamily: "NotoSans-Bold" },
        }}
      />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="chatbubble-outline" size={48} color="#333" />
          <Text style={styles.title}>Tell us how we can improve this app</Text>
        </View>

        {/* Input Field */}
        <TextInput
          mode="outlined"
          placeholder="Enter feedback"
          value={feedback}
          onChangeText={setFeedback}
          style={styles.input}
          theme={{ roundness: 8 }}
          outlineColor="#E0E0E0"
          activeOutlineColor="#4CAF50"
        />

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={[
            styles.button,
            (feedback.trim().length === 0 || loading) && styles.buttonDisabled,
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          disabled={feedback.trim().length === 0 || loading}
        >
          Submit
        </Button>

        <View style={{ marginTop: 12 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "NotoSans-Regular", // Use your preferred font
              color: "#333",
              textAlign: "left",
            }}
          >
            * Your feedback will be shared anonymously
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF", // Light gray for modern feel
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontFamily: "NotoSans-Bold", // Use your preferred font
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFF",
    fontFamily: "NotoSans-Regular",
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50", // Modern green
    borderRadius: 12,
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: 8,
    flexDirection: "row", // Icon after text
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: "NotoSans-Bold",
    color: "#FFF",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
});
