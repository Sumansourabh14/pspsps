import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";

interface Reminder {
  id: number;
  pet_id: number;
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
  time: string;
}

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
  { id: 1, label: "Deworming", value: "deworming" },
  { id: 2, label: "Feeding Wet Food", value: "feeding_wet" },
  { id: 3, label: "Feeding Dry Food", value: "feeding_dry" },
  { id: 4, label: "Nail Cutting", value: "nail_cutting" },
  { id: 5, label: "Litter Cleaning", value: "litter_cleaning" },
  { id: 6, label: "Vaccination", value: "vaccination" },
  { id: 7, label: "Vet Checkup", value: "vet_checkup" },
  { id: 8, label: "Playtime", value: "playtime" },
];

const frequencyOptions = [
  { id: 1, label: "Daily", value: "daily" },
  { id: 2, label: "Weekly", value: "weekly" },
  { id: 3, label: "Monthly", value: "monthly" },
  { id: 4, label: "Yearly", value: "yearly" },
  { id: 5, label: "Custom", value: "custom" },
  { id: 6, label: "Once", value: "once" },
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
      title: title || `${type.replace("_", " ")} for pet`,
      frequency,
      interval: frequency === Frequency.Custom ? interval : null,
      start_date: startDate,
      last_completed: null,
      next_due: startDate,
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.label}>For Which Pet?</Text>
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
              <Picker.Item
                key={task.id}
                label={task.label}
                value={task.value}
              />
            ))}
          </Picker>

          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="e.g., Feed Fluffy wet food"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            theme={{ roundness: 8 }}
            outlineColor="#e0e0e0"
            activeOutlineColor="#4CAF50"
            left={<TextInput.Icon icon="text" color="#666" />}
          />

          <Text style={styles.label}>Frequency</Text>
          <Picker
            selectedValue={frequency}
            onValueChange={(value) => setFrequency(value)}
            style={styles.picker}
          >
            {frequencyOptions.map((freq) => (
              <Picker.Item
                key={freq.id}
                label={freq.label}
                value={freq.value}
              />
            ))}
          </Picker>

          {frequency === Frequency.Custom && (
            <>
              <Text style={styles.label}>Interval (days)</Text>
              <TextInput
                style={styles.input}
                value={interval?.toString() || ""}
                onChangeText={(text) =>
                  setInterval(parseInt(text) || undefined)
                }
                keyboardType="numeric"
                placeholder="e.g., 90"
                mode="outlined"
                theme={{ roundness: 8 }}
                outlineColor="#e0e0e0"
                activeOutlineColor="#4CAF50"
                left={<TextInput.Icon icon="numeric" color="#666" />}
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
              theme={{ roundness: 8 }}
              outlineColor="#e0e0e0"
              activeOutlineColor="#4CAF50"
              left={<TextInput.Icon icon="calendar" color="#666" />}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(startDate)}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setStartDate(date);
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
            theme={{ roundness: 8 }}
            outlineColor="#e0e0e0"
            activeOutlineColor="#4CAF50"
            left={<TextInput.Icon icon="note" color="#666" />}
          />
        </View>

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
    backgroundColor: "#F5F6F5", // Light pet-friendly background
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 6,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    marginVertical: 8,
    backgroundColor: "#fff",
  },
  picker: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    marginVertical: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#4CAF50", // Pet-friendly green
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});

export default EditReminderScreen;
