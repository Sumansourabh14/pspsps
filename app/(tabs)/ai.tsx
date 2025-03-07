import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "react-native-paper";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const AI = () => {
  const [loading, setLoading] = useState(false);

  const getResponse = async () => {
    setLoading(true);

    const prompt =
      "I have a new cat. I don't know the age of it. Not sure if it is male/female. How should I take care of it? When to give him food, play with him, etc.?";

    const result = await model.generateContent(prompt);
    console.log({ result });
    console.log(`result.response.text() --------`, result.response.text());
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text>Need help?</Text>
      <Button
        mode="contained"
        onPress={getResponse}
        //   style={styles.saveButton}
        //   labelStyle={styles.saveButtonLabel}
        icon="content-save"
        loading={loading}
      >
        {loading ? "Generating response..." : "Send"}
      </Button>
    </View>
  );
};

export default AI;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
