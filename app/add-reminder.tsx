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
import { supabase } from "../lib/supabase"; // Adjust path to your Supabase client setup
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, TextInput } from "react-native-paper";
import { router, Stack } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

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
  Once = "once",
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
  // {
  //   id: 2,
  //   label: "Weekly",
  //   value: "weekly",
  // },
  // {
  //   id: 3,
  //   label: "Monthly",
  //   value: "monthly",
  // },
  // {
  //   id: 4,
  //   label: "Yearly",
  //   value: "yearly",
  // },
  {
    id: 5,
    label: "Once",
    value: "once",
  },
  // {
  //   id: 6,
  //   label: "Custom",
  //   value: "custom",
  // },
];

const AddReminderScreen = () => {
  // Separate state variables
  const [petId, setPetId] = useState(null);
  const [type, setType] = useState<ReminderType>(ReminderType.FeedingWet);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<Frequency>(Frequency.Daily);
  const [interval, setInterval] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [pets, setPets] = useState<Pet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { session } = useAuth();

  const formatTimeForSupabase = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}:00`; // Always include seconds for time type
  };

  const handleSave = async () => {
    setLoading(true);

    // Combine startDate and time into a single Date object in local time
    const combinedDateTime = new Date(startDate);
    combinedDateTime.setHours(
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      0
    );

    const reminder = {
      pet_id: petId,
      type,
      title:
        title ||
        `${type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}`,
      frequency,
      interval: frequency === Frequency.Custom ? interval : null,
      start_date: combinedDateTime.toISOString(), // Store full datetime
      end_date: frequency === Frequency.Once ? null : endDate.toISOString(),
      time: formatTimeForSupabase(time), // Still store time separately if needed
      last_completed: null,
      next_due: combinedDateTime.toISOString(), // Align with start_date
      notes: notes || null,
      is_active: true,
      user_id: session?.user.id,
    };

    console.log({ reminder });

    const { status, error } = await supabase
      .from("reminders")
      .insert([reminder]);

    if (error) {
      console.log({ error });
      Alert.alert("Reminder could not be created. Please try again.");
    }

    if (status === 201) {
      Alert.alert(
        "Success",
        "Reminder added successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.push(`/reminders`);
            },
          },
        ],
        { cancelable: false }
      );
    }

    setLoading(false);
  };

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
      <Stack.Screen
        options={{
          title: "Add Reminder",
          headerTitleStyle: {
            fontFamily: "NotoSans-Black",
          },
        }}
      />
      <ScrollView style={styles.container}>
        <Text style={styles.label}>For which pet?</Text>
        {pets && (
          <Picker
            selectedValue={petId}
            onValueChange={(value) => setPetId(value)}
            style={styles.picker}
          >
            {pets.map((pet) => (
              <Picker.Item
                key={pet.id}
                label={pet.name ? pet.name : `${pet.species} (No name set)`}
                value={pet.id}
              />
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
          theme={{ roundness: 8 }}
          outlineColor="#e0e0e0"
          activeOutlineColor="#4CAF50"
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
              theme={{ roundness: 8 }}
              outlineColor="#e0e0e0"
              activeOutlineColor="#4CAF50"
            />
          </>
        )}

        <Text style={styles.label}>{`${
          frequency === Frequency.Once ? `Date` : `Start Date`
        }`}</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            placeholder="Start Date"
            value={startDate.toLocaleDateString() || "Not set"}
            mode="outlined"
            editable={false}
            style={styles.input}
            left={<TextInput.Icon icon="calendar" />}
            theme={{ roundness: 8 }}
            outlineColor="#e0e0e0"
            activeOutlineColor="#4CAF50"
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={startDate}
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

        {frequency !== Frequency.Once && (
          <>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
              <TextInput
                placeholder="End Date"
                value={endDate.toLocaleDateString() || "Not set"}
                mode="outlined"
                editable={false}
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
                theme={{ roundness: 8 }}
                outlineColor="#e0e0e0"
                activeOutlineColor="#4CAF50"
              />
            </TouchableOpacity>

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEndDatePicker(false);
                  if (date) {
                    setEndDate(date);
                  }
                }}
                minimumDate={startDate}
              />
            )}
          </>
        )}

        <Text style={styles.label}>Set Time</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
          <TextInput
            placeholder="Set time"
            value={time.toLocaleTimeString()}
            mode="outlined"
            editable={false}
            style={styles.input}
            left={<TextInput.Icon icon="calendar" />}
            theme={{ roundness: 8 }}
            outlineColor="#e0e0e0"
            activeOutlineColor="#4CAF50"
          />
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) {
                setTime(selectedDate);
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
          theme={{ roundness: 8 }}
          outlineColor="#e0e0e0"
          activeOutlineColor="#4CAF50"
          left={<TextInput.Icon icon="note" color="#666" />}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
          icon="content-save"
          disabled={loading}
          loading={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
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
    fontFamily: "NotoSans-Bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
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

export default AddReminderScreen;
