import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "react-native-paper";
import { supabase } from "@/lib/supabase";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const reminder = {
  type: [
    "deworming",
    "feeding_wet",
    "feeding_dry",
    "nail_cutting",
    "litter_cleaning",
    "vaccination",
    "vet_checkup",
    "playtime",
  ],
  frequency: ["once", "daily"],
  start_date: "2025-03-07 15:49:00+00", // Store full datetime
  end_date: "2025-03-12 15:49:00+00",
  time: "HH:MM:00", // Still store time separately if needed
  last_completed: null,
  title: "",
  notes: "",
  is_active: true,
};

const AiAssistance = () => {
  const [loading, setLoading] = useState(false);

  const params = useLocalSearchParams();

  const getAIResponse = async () => {
    setLoading(true);

    const jsonString = JSON.stringify(params);

    const prompt = `Here's the information about this pet:

    ${jsonString}

    If the pet has no name, suggest a few names (Give a JSON output for names)

    Could you also list down any reminders that I need to setup to take utmost care of my pet? Based on this information:

    ${JSON.stringify(reminder)}

    Please include the date and time. I know I can consult a vet but you can set reminders, later I can edit them.

    For the reminders, generate a JSON with this schema (start_date and end_date is just for sample, you can write your own date values there). Write only one reminder JSON against one reminder type.

    ${JSON.stringify(reminder)}

    Note:
    Currently I can only set reminders that will be activated only once during the day, so consider that.
    If frequency is "daily", start_date and end_date must exist and they both should be of type timestamptz (format: 2025-03-07 15:41:00+00).
    Use the user_id and attach it to every reminder object that you create inside the JSON. type is uuid.
    Use the id and attach it to every reminder object that you create inside the JSON as pet_id. type is int8`;

    try {
      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      console.log("Raw response:", responseText);

      // Split the response into individual JSON strings
      const jsonStrings = responseText.split("```json\n");

      const parsedResponses = [];

      for (let jsonString of jsonStrings) {
        if (jsonString.trim() === "") {
          continue; // Skip empty strings
        }

        // Remove code block markers
        jsonString = jsonString.replace(/\n```/g, ""); // Remove closing ```

        try {
          const parsed = JSON.parse(jsonString);
          parsedResponses.push(parsed);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          console.error("Invalid JSON:", jsonString);
        }
      }

      console.log("Parsed responses:", parsedResponses);

      // Access individual parsed responses
      if (parsedResponses.length > 0) {
        if (parsedResponses[0].suggested_names) {
          console.log("Suggested names:", parsedResponses[0].suggested_names);
        }
      }

      if (parsedResponses.length > 1) {
        console.log("Reminders", parsedResponses[1].reminders);

        const { data, error } = await supabase
          .from("reminders")
          .insert(parsedResponses[1].reminders)
          .select();

        console.log(`supabase bulk insert`, data, error);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error generating content:", error);
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Ask AI" }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Do you want suggestions?</Text>
        </View>
        <Button
          mode="contained"
          onPress={getAIResponse}
          //   style={styles.saveButton}
          //   labelStyle={styles.saveButtonLabel}
          loading={loading}
        >
          {loading ? "Generating response..." : "Yes"}
        </Button>
      </View>
    </>
  );
};

export default AiAssistance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
});
