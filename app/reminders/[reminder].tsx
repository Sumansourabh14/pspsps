import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button } from "react-native-paper";

interface Reminder {
  id: number; // Unique identifier for the reminder
  pet_id: number;
  title: string; // Short description of the reminder
  type: string; // The task value (e.g., "deworming", "feeding_wet")
  frequency: string; // Frequency value (e.g., "daily", "weekly")
  start_date: string; // When the reminder starts
  end_date: string; // When the reminder starts
  time: string;
  next_due: string; // When the next instance occurs
  is_active: boolean; // Whether the reminder is currently active
  notes?: string; // Optional additional notes
  last_completed?: string; // When it was last completed (optional)
  interval?: number; // For custom frequency, interval in days (optional)
  user_id: string;
}

interface Pet {
  id: number;
  user_id: string;
  name: string;
  species: "dog" | "cat" | "fish";
  gender: "male" | "female" | "unknown";
  birth_date?: string; // ISO date string (e.g., "2020-05-15")
  age?: number;
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

    fetchPet();
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
        <Text style={styles.loadingText}>Loading pet...</Text>
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
      <ScrollView style={styles.container}>
        <Text style={styles.label}>For which pet?</Text>
        {!!pet && <Text>{pet.name}</Text>}

        <Text style={styles.label}>Reminder Type</Text>
        {!!reminder && <Text>{reminder.type}</Text>}

        <Text style={styles.label}>Title</Text>
        {!!reminder && <Text>{reminder.title}</Text>}

        <Text style={styles.label}>Frequency</Text>
        {!!reminder && reminder.frequency === "custom" ? (
          <Text>Interval: {reminder.interval} days</Text>
        ) : (
          <Text>{reminder.frequency}</Text>
        )}

        <Text style={styles.label}>{`${
          reminder.frequency === "once" ? `Date` : `Start Date`
        }`}</Text>
        {!!reminder && <Text>{reminder.start_date}</Text>}

        {reminder.frequency !== "once" && (
          <>
            <Text style={styles.label}>End Date</Text>
            {!!reminder && <Text>{reminder.end_date}</Text>}
          </>
        )}

        <Text style={styles.label}>Notes</Text>
        {!!reminder && <Text>{reminder.notes}</Text>}

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
            labelStyle={styles.editButtonLabel}
            icon="pencil"
          >
            Edit Reminder
          </Button>
        </Link>

        <Button
          onPress={handleRemoveReminder}
          mode="contained"
          style={styles.deleteButton}
          labelStyle={styles.editButtonLabel}
          icon="delete"
        >
          Remove
        </Button>
      </ScrollView>
    </>
  );
};

export default ReminderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "700",
  },
  editButton: {
    marginVertical: 16,
    borderRadius: 8,
    backgroundColor: "#6200ee",
    paddingVertical: 4,
  },
  editButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    borderRadius: 8,
    backgroundColor: "darkred",
    paddingVertical: 4,
  },
});
