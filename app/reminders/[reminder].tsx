import { Alert, ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button, Card, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

interface Reminder {
  id: number;
  pet_id: number;
  title: string;
  type: string;
  frequency: string;
  start_date: string;
  end_date: string;
  time: string;
  next_due: string;
  is_active: boolean;
  notes?: string;
  last_completed?: string;
  interval?: number;
  user_id: string;
}

interface Pet {
  id: number;
  user_id: string;
  name: string;
  species: "dog" | "cat" | "fish";
  gender: "male" | "female" | "unknown";
  birth_date?: string;
  image_url?: string;
}

const ReminderScreen = () => {
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const fetchReminder = async () => {
      setLoading(true);
      const { data, error, status } = await supabase
        .from("reminders")
        .select("*")
        .eq("id", id)
        .single();

      if (status === 200) {
        setReminder(data);
      }

      setLoading(false);
    };

    fetchReminder();
  }, [id]);

  useEffect(() => {
    const fetchPet = async () => {
      const { data, error, status } = await supabase
        .from("pets")
        .select("*")
        .eq("id", reminder?.pet_id)
        .single();

      if (status === 200) {
        setPet(data);
      }
    };

    if (reminder?.pet_id) fetchPet();
  }, [reminder?.pet_id]);

  const handleRemoveReminder = async () => {
    const { error, status } = await supabase
      .from("reminders")
      .delete()
      .eq("id", id);

    if (error) {
      Alert.alert("Not able to delete this reminder. Please try again.");
    }

    if (status === 204) {
      Alert.alert(
        "Reminder removed successfully!",
        "You can go back to the home screen",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading reminder...</Text>
      </View>
    );
  }

  if (!reminder) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Reminder not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: reminder.title ? reminder.title : reminder.type }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Ionicons
                name={reminder.is_active ? "alarm" : "alarm-outline"}
                size={32}
                color={reminder.is_active ? "#4CAF50" : "#666"}
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>
                {reminder.title || reminder.type}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>For Pet</Text>
              <Text style={styles.value}>{pet ? pet.name : "Loading..."}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Type</Text>
              <Text style={styles.value}>{reminder.type}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Frequency</Text>
              <Text style={styles.value}>
                {reminder.frequency === "custom"
                  ? `Every ${reminder.interval} days`
                  : reminder.frequency}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>
                {reminder.frequency === "once" ? "Date" : "Start Date"}
              </Text>
              <Text style={styles.value}>{reminder.start_date}</Text>
            </View>

            {reminder.frequency !== "once" && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>End Date</Text>
                <Text style={styles.value}>{reminder.end_date}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{reminder.time}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Next Due</Text>
              <Text style={styles.value}>{reminder.next_due}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Last Completed</Text>
              <Text style={styles.value}>
                {reminder.last_completed || "Not completed yet"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{reminder.notes || "No notes"}</Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Link
            href={{
              pathname: "/reminders/edit/[reminder]",
              params: { id: reminder.id },
            }}
            asChild
          >
            <Button
              mode="contained"
              style={styles.editButton}
              labelStyle={styles.buttonLabel}
              icon="pencil"
            >
              Edit Reminder
            </Button>
          </Link>

          <Button
            onPress={handleRemoveReminder}
            mode="contained"
            style={styles.deleteButton}
            labelStyle={styles.buttonLabel}
            icon="delete"
          >
            Remove
          </Button>
        </View>
      </ScrollView>
    </>
  );
};

export default ReminderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F5", // Light pet-friendly background
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6F5",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    fontStyle: "italic",
  },
  card: {
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: "#666",
    flex: 2,
    textAlign: "right",
  },
  buttonContainer: {
    paddingHorizontal: 0,
  },
  editButton: {
    marginVertical: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#4CAF50", // Pet-friendly green
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  deleteButton: {
    marginVertical: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#D32F2F", // Softer red
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
