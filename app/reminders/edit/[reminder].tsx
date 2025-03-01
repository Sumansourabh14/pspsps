import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, TextInput } from "react-native-paper";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

interface Reminder {
  id: number; // Unique identifier for the reminder
  pet_id: number;
  title: string; // Short description of the reminder
  type: string; // The task value (e.g., "deworming", "feeding_wet")
  frequency: string; // Frequency value (e.g., "daily", "weekly")
  start_date: Date; // When the reminder starts
  next_due: Date; // When the next instance occurs
  is_active: boolean; // Whether the reminder is currently active
  notes?: string; // Optional additional notes
  last_completed?: Date; // When it was last completed (optional)
  interval?: number; // For custom frequency, interval in days (optional)
  user_id: string;
}

// Enums from your schema
enum ReminderType {
  Deworming = "deworming",
  FeedingWet = "feeding_wet",
  FeedingDry = "feeding_dry",
  NailCutting = "nail_cutting",
  LitterCleaning = "litter_cleaning",
  Vaccination = "vaccination",
  VetCheckup = "vet_checkup",
  Playtime = "playtime",
}

enum Frequency {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
  Custom = "custom",
}

interface Pet {
  id: number;
  user_id: string;
  name: string;
  species: string;
}

const petCareTasks = [
  {
    id: 1,
    label: "Deworming",
    value: "deworming",
  },
  {
    id: 2,
    label: "Feeding Wet",
    value: "feeding_wet",
  },
  {
    id: 3,
    label: "Feeding Dry",
    value: "feeding_dry",
  },
  {
    id: 4,
    label: "Nail Cutting",
    value: "nail_cutting",
  },
  {
    id: 5,
    label: "Litter Cleaning",
    value: "litter_cleaning",
  },
  {
    id: 6,
    label: "Vaccination",
    value: "vaccination",
  },
  {
    id: 7,
    label: "Vet Checkup",
    value: "vet_checkup",
  },
  {
    id: 8,
    label: "Playtime",
    value: "playtime",
  },
];

const frequencyOptions = [
  {
    id: 1,
    label: "Daily",
    value: "daily",
  },
  {
    id: 2,
    label: "Weekly",
    value: "weekly",
  },
  {
    id: 3,
    label: "Monthly",
    value: "monthly",
  },
  {
    id: 4,
    label: "Yearly",
    value: "yearly",
  },
  {
    id: 5,
    label: "Custom",
    value: "custom",
  },
];

const EditReminderScreen = () => {
  const [reminderData, setReminderData] = useState<Reminder | null>(null);
  const [petId, setPetId] = useState(null);
  const [type, setType] = useState<ReminderType>(ReminderType.FeedingWet);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<Frequency>(Frequency.Daily);
  const [interval, setInterval] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [pets, setPets] = useState<Pet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const { id } = useLocalSearchParams();
  const { session } = useAuth();

  const handleUpdate = async () => {
    setSaving(true);

    const updatedReminder = {
      pet_id: petId,
      type,
      title: title || `${type.replace("_", " ")} for pet`, // Default title
      frequency,
      interval: frequency === Frequency.Custom ? interval : null,
      start_date: startDate,
      last_completed: null, // Initially null
      next_due: startDate, // Starts at startDate
      notes: notes || null,
      is_active: true,
      user_id: session?.user.id,
    };

    const { data, status, error } = await supabase
      .from("reminders")
      .update(updatedReminder)
      .eq("id", id);

    if (error) {
      Alert.alert("Reminder could not be updated. Please try again.");
    }

    if (status === 204) {
      Alert.alert("Success", "Reminder updated successfully!");
    }

    setSaving(false);
  };

  // Fetch reminder data
  useEffect(() => {
    let mounted = true;

    const fetchReminderById = async () => {
      if (!session?.user.id || !id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("reminders")
          .select("*")
          .eq("id", id)
          .single();

        if (mounted) {
          if (error) throw error;
          setReminderData(data);
        }
      } catch (error) {
        console.error("Error fetching reminder data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReminderById();

    return () => {
      mounted = false;
    };
  }, [id, session]);

  useEffect(() => {
    if (!!reminderData) {
      setType(reminderData.type);
      setTitle(reminderData.title);
      setFrequency(reminderData.frequency);
      setInterval(reminderData.interval);
      setStartDate(reminderData.start_date);
      setNotes(reminderData.notes);
      setPetId(reminderData.pet_id);
    }
  }, [reminderData]);

  // fetch user pets
  useEffect(() => {
    let mounted = true;

    const fetchUserPets = async () => {
      if (!session?.user.id) return;

      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", session.user.id);

      if (mounted) {
        if (error) {
          console.error("Error fetching pets:", error);
        } else {
          setPets(data);
        }
      }
    };

    fetchUserPets();

    return () => {
      mounted = false;
    };
  }, [session]);

  return (
    <>
      <Stack.Screen options={{ title: "Edit Reminder" }} />
      <ScrollView style={styles.container}>
        <Text style={styles.label}>For which pet?</Text>
        {pets && (
          <Picker
            selectedValue={petId}
            onValueChange={(value) => setPetId(value)}
            style={styles.picker}
          >
            {pets.map((pet) => (
              <Picker.Item key={pet.id} label={pet.name} value={pet.id} />
            ))}
          </Picker>
        )}

        <Text style={styles.label}>Reminder Type</Text>
        <Picker
          selectedValue={type}
          onValueChange={(value) => setType(value)}
          style={styles.picker}
        >
          {petCareTasks.map((task) => (
            <Picker.Item key={task.id} label={task.label} value={task.value} />
          ))}
        </Picker>

        <Text style={styles.label}>Title</Text>
        <TextInput
          placeholder="e.g., Feed Fluffy wet food"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />

        <Text style={styles.label}>Frequency</Text>
        <Picker
          selectedValue={frequency}
          onValueChange={(value) => setFrequency(value)}
          style={styles.picker}
        >
          {frequencyOptions.map((freq) => (
            <Picker.Item key={freq.id} label={freq.label} value={freq.value} />
          ))}
        </Picker>

        {frequency === Frequency.Custom && (
          <>
            <Text style={styles.label}>Interval (days)</Text>
            <TextInput
              style={styles.input}
              value={interval?.toString() || ""}
              onChangeText={(text) => setInterval(parseInt(text) || undefined)}
              keyboardType="numeric"
              placeholder="e.g., 90"
            />
          </>
        )}

        <Text style={styles.label}>Start Date & Time</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            placeholder="Start Date"
            value={startDate.toLocaleString() || "Not set"}
            mode="outlined"
            editable={false}
            style={styles.input}
            left={<TextInput.Icon icon="calendar" />}
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(startDate)}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                setStartDate(date);
              }
            }}
          />
        )}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          placeholder="e.g., Use brand X dewormer"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleUpdate}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
          icon="content-save"
          disabled={saving}
          loading={saving}
        >
          {saving ? "Updating..." : "Update Changes"}
        </Button>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "700",
  },
  input: {
    marginVertical: 8,
  },
  picker: {
    width: "100%", // Adjust width as needed
    backgroundColor: "#fff", // White background
    borderRadius: 8,
    marginVertical: 4,

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Elevation for Android
    elevation: 3,
  },
  saveButton: {
    marginVertical: 20,
    borderRadius: 8,
    backgroundColor: "#6200ee",
    paddingVertical: 4,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditReminderScreen;
