import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Button,
  Card,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";

interface Pet {
  id: number;
  user_id: string;
  name: string;
  species: "dog" | "cat" | "fish";
  gender: "male" | "female" | "unknown";
  birth_date?: string;
  image_url?: string;
}

const EditPetScreen = () => {
  const [petData, setPetData] = useState<Pet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const { id } = useLocalSearchParams();
  const { session } = useAuth();

  console.log({ id });

  // Fetch pet data
  useEffect(() => {
    let mounted = true;

    const fetchPetById = async () => {
      if (!session?.user.id || !id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pets")
          .select("*")
          .eq("id", id)
          .single();

        if (mounted) {
          if (error) throw error;
          setPetData(data);
        }
      } catch (error) {
        console.error("Error fetching pet data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPetById();

    return () => {
      mounted = false;
    };
  }, [id, session]);

  // Handle save changes
  const handleSave = async () => {
    if (!petData) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("pets")
        .update({
          name: petData.name,
          species: petData.species,
          gender: petData.gender,
          birth_date: petData.birth_date,
          image_url: petData.image_url,
        })
        .eq("id", petData.id);

      if (error) throw error;

      // Navigate back to pet profile
      router.back();
    } catch (error) {
      console.error("Error updating pet:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !petData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {loading ? "Loading pet..." : "Pet not found"}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `Edit ${petData.name}`,
          headerRight: () => (
            <Button
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              compact
            >
              Save
            </Button>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            {/* Name Input */}
            <TextInput
              label="Pet Name"
              value={petData.name}
              onChangeText={(text) => setPetData({ ...petData, name: text })}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="pencil" />}
            />

            {/* Species Selection */}
            <Text style={styles.label}>Species</Text>
            <SegmentedButtons
              value={petData.species}
              onValueChange={(value) =>
                setPetData({ ...petData, species: value as "dog" | "cat" })
              }
              buttons={[
                {
                  value: "dog",
                  label: "Dog",
                  icon: "dog",
                },
                {
                  value: "cat",
                  label: "Cat",
                  icon: "cat",
                },
                {
                  value: "fish",
                  label: "Fish",
                  icon: "fish",
                },
              ]}
              style={styles.segmentedButtons}
            />

            {/* Gender Selection */}
            <Text style={styles.label}>Gender</Text>
            <SegmentedButtons
              value={petData.gender}
              onValueChange={(value) =>
                setPetData({ ...petData, gender: value as "male" | "female" })
              }
              buttons={[
                {
                  value: "male",
                  label: "Male",
                  icon: "gender-male",
                },
                {
                  value: "female",
                  label: "Female",
                  icon: "gender-female",
                },
                {
                  value: "unknown",
                  label: "Unknown",
                  icon: "help-circle-outline",
                },
              ]}
              style={styles.segmentedButtons}
            />

            {/* Birth Date Picker */}
            <Text style={styles.label}>Birth Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              <TextInput
                label="Birth Date"
                value={petData.birth_date || "Not set"}
                mode="outlined"
                editable={false}
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={
                  petData.birth_date ? new Date(petData.birth_date) : new Date()
                }
                mode="date"
                display="default"
                maximumDate={new Date()} // Can't be born in the future
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setPetData({
                      ...petData,
                      birth_date: date.toISOString().split("T")[0],
                    });
                  }
                }}
              />
            )}

            {/* Image URL Input */}
            <TextInput
              label="Image URL (optional)"
              value={petData.image_url || ""}
              onChangeText={(text) =>
                setPetData({ ...petData, image_url: text })
              }
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="image" />}
            />
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
          loading={saving}
          disabled={saving}
          icon="content-save"
        >
          Save Changes
        </Button>
      </ScrollView>
    </>
  );
};

export default EditPetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: "white",
  },
  input: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginVertical: 8,
  },
  dateButton: {
    marginVertical: 8,
  },
  saveButton: {
    margin: 16,
    borderRadius: 8,
    backgroundColor: "#6200ee",
    paddingVertical: 4,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
