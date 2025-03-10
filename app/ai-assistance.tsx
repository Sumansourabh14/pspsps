import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

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

interface Reminder {
  id: number;
  created_at: Date;
  title: string;
  type: string;
  frequency: string;
  start_date: Date;
  next_due: Date;
  end_date: Date;
  is_active: boolean;
  notes?: string;
  last_completed?: Date;
  interval?: number;
  user_id: string;
  pet_id: string;
  time: string;
}

const AiAssistance = () => {
  const [reminders, setReminders] = useState<Reminder[] | null>(null);
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
    Use the id and attach it to every reminder object that you create inside the JSON as pet_id. type is int8
    For a 'fish' pet, do not include reminder of these types: nail_cutting, litter_cleaning, vaccination, playtime
    
    Only respond in JSON format. No textual information.`;

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

        if (error) {
          console.error(error.message);
        }

        setReminders(data);
      } else {
        console.log("Reminders - else-", parsedResponses[0].reminders);

        const { data, error } = await supabase
          .from("reminders")
          .insert(parsedResponses[0].reminders)
          .select();

        console.log(`supabase bulk insert`, data, error);

        if (error) {
          console.error(error.message);
        }

        setReminders(data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error generating content:", error);
      setLoading(false);
    }
  };

  const findPetNameById = async (petId: string) => {
    if (!petId) return;

    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    return data.name || `Species: ${data.species}`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Suggestions for your pet",
          headerTitleStyle: {
            fontFamily: "NotoSans-Black",
          },
        }}
      />
      <View style={styles.container}>
        {!!reminders ? (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Automatic Reminders</Text>
            <Text style={styles.headerSubtitle}>
              You can always edit them later on the Reminders screen.
            </Text>
          </View>
        ) : (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Do you want to set automatic reminders?
            </Text>
            <Text style={styles.headerSubtitle}>
              Get AI-powered suggestions for your pet
            </Text>
          </View>
        )}

        {!!reminders ? (
          <View style={styles.buttonContainer}>
            <Link href={`/reminders`} asChild>
              <Button
                mode="contained"
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Reminders
              </Button>
            </Link>
            {!loading && (
              <Link href={`/`} asChild>
                <Button
                  mode="outlined"
                  style={styles.button}
                  labelStyle={{ fontFamily: "NotoSans-Bold" }}
                >
                  Home
                </Button>
              </Link>
            )}
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={getAIResponse}
              style={[styles.button, styles.yesButton]}
              labelStyle={styles.buttonLabel}
              loading={loading}
              disabled={loading}
              contentStyle={styles.buttonContent}
            >
              Yes
            </Button>

            {!loading && (
              <Link href={`/`} asChild>
                <Button
                  mode="outlined"
                  style={styles.button}
                  labelStyle={{
                    fontFamily: "NotoSans-Bold",
                  }}
                >
                  No
                </Button>
              </Link>
            )}
          </View>
        )}

        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Ionicons
                  name={item.is_active ? "alarm" : "alarm-outline"}
                  size={24}
                  color={item.is_active ? "#4CAF50" : "#666"}
                  style={styles.cardIcon}
                />
                <View style={styles.cardTextContainer}>
                  {!!item.title && (
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      {item.title}
                    </Text>
                  )}
                  <Text
                    variant="bodyMedium"
                    style={styles.cardNotes}
                    numberOfLines={2}
                  >
                    {item.notes || "No notes"}
                  </Text>
                  <Text variant="bodyMedium" style={styles.cardNotes}>
                    {findPetNameById(item.pet_id)}
                  </Text>
                  <Text variant="bodySmall" style={styles.cardFrequency}>
                    {item.frequency}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
          numColumns={1}
        />
      </View>
    </>
  );
};

export default AiAssistance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "NotoSans-Bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: "NotoSans-Regular",
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 6,
    backgroundColor: "#4CAF50",
  },
  yesButton: {
    backgroundColor: "#10B981",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noButton: {
    borderColor: "#D1D5DB",
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  buttonContent: {},
  buttonLabel: {
    fontFamily: "NotoSans-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  noButtonLabel: {
    color: "#4B5563",
    fontFamily: "NotoSans-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    elevation: 6,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 0,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: "bold",
    color: "#333",
  },
  cardNotes: {
    color: "#666",
    marginTop: 4,
  },
  cardFrequency: {
    color: "#4CAF50",
    marginTop: 4,
  },
});
