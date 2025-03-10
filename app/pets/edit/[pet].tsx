import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, SegmentedButtons, Text, TextInput } from "react-native-paper";

interface Pet {
  id: number;
  user_id: string;
  name: string;
  species: "Dog" | "Cat" | "Fish";
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

  const handleSave = async () => {
    if (!petData) return;

    setSaving(true);
    try {
      const { status, error } = await supabase
        .from("pets")
        .update({
          name: petData.name,
          species: petData.species,
          gender: petData.gender,
          birth_date: petData.birth_date,
        })
        .eq("id", petData.id);

      if (status === 201 || status === 204) {
        router.push({ pathname: `/pets/[pet]`, params: { id: petData.id } });
      }
    } catch (error) {
      console.error("Error updating pet:", error);
      Alert.alert("Failed to save changes. Please try again.");
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
          headerTitle: `Edit ${petData.name ? petData.name : "NA"}`,
          headerTitleStyle: {
            fontFamily: "NotoSans-Bold",
          },
          headerRight: () => (
            <Button
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              compact
              style={styles.headerSaveButton}
              labelStyle={styles.headerSaveLabel}
              icon="content-save"
            >
              Save
            </Button>
          ),
        }}
      />
      <View style={styles.outerContainer}>
        <ScrollView style={styles.container}>
          <View style={styles.card}>
            <View>
              {/* Name Input */}
              <Text style={styles.label}>Pet Name</Text>
              <TextInput
                placeholder="Type your beloved pet's name"
                value={petData.name}
                onChangeText={(text) => setPetData({ ...petData, name: text })}
                mode="outlined"
                style={styles.input}
                theme={{ roundness: 8 }}
                outlineColor="#e0e0e0"
                activeOutlineColor="#4CAF50"
                left={<TextInput.Icon icon="pencil" color="#666" />}
              />

              {/* Species Selection */}
              <Text style={styles.label}>Species</Text>
              <SegmentedButtons
                value={petData.species}
                onValueChange={(value) =>
                  setPetData({
                    ...petData,
                    species: value as "Dog" | "Cat" | "Fish",
                  })
                }
                buttons={[
                  {
                    value: "Dog",
                    label: "Dog",
                    style: {
                      backgroundColor:
                        petData.species === "Dog" ? "#4CAF50" : "#FFF",
                    },
                    labelStyle: {
                      color: petData.species === "Dog" ? "#FFF" : "#000",
                    },
                  },
                  {
                    value: "Cat",
                    label: "Cat",
                    style: {
                      backgroundColor:
                        petData.species === "Cat" ? "#4CAF50" : "#FFF",
                    },
                    labelStyle: {
                      color: petData.species === "Cat" ? "#FFF" : "#000",
                    },
                  },
                  {
                    value: "Fish",
                    label: "Fish",
                    style: {
                      backgroundColor:
                        petData.species === "Fish" ? "#4CAF50" : "#FFF",
                    },
                    labelStyle: {
                      color: petData.species === "Fish" ? "#FFF" : "#000",
                    },
                  },
                ]}
                style={styles.segmentedButtons}
                theme={{ roundness: 1 }}
              />

              {/* Gender Selection */}
              <Text style={styles.label}>Gender</Text>
              <SegmentedButtons
                value={petData.gender}
                onValueChange={(value) =>
                  setPetData({
                    ...petData,
                    gender: value as "male" | "female" | "unknown",
                  })
                }
                buttons={[
                  {
                    value: "male",
                    label: "Male",
                    style: {
                      backgroundColor:
                        petData.gender === "male" ? "#4CAF50" : "#FFF",
                    },
                    labelStyle: {
                      color: petData.gender === "male" ? "#FFF" : "#000",
                    },
                  },
                  {
                    value: "female",
                    label: "Female",
                    style: {
                      backgroundColor:
                        petData.gender === "female" ? "#4CAF50" : "#FFF",
                    },
                    labelStyle: {
                      color: petData.gender === "female" ? "#FFF" : "#000",
                    },
                  },
                  {
                    value: "unknown",
                    label: "Unknown",
                    style: {
                      backgroundColor:
                        petData.gender === "unknown" ? "#4CAF50" : "#FFF",
                    },
                    labelStyle: {
                      color: petData.gender === "unknown" ? "#FFF" : "#000",
                    },
                  },
                ]}
                style={styles.segmentedButtons}
                theme={{ roundness: 1 }}
              />

              {/* Birth Date Picker */}
              <Text style={styles.label}>Birth Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                <TextInput
                  placeholder="Birth Date"
                  value={petData.birth_date || "Not set"}
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
                  value={
                    petData.birth_date
                      ? new Date(petData.birth_date)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
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
            </View>
          </View>
        </ScrollView>

        {/* Save Button at Bottom Edge */}
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
      </View>
    </>
  );
};

export default EditPetScreen;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    position: "relative", // Allow absolute positioning of the button
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    fontFamily: "NotoSans-SemiBold",
  },
  card: {
    padding: 12,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginTop: 12,
    paddingHorizontal: 8,
    fontFamily: "NotoSans-Bold",
  },
  input: {
    marginVertical: 8,
    backgroundColor: "#fff",
    fontFamily: "NotoSans-Bold",
  },
  segmentedButtons: {
    marginVertical: 8,
  },
  dateButton: {
    marginBottom: 8,
  },
  headerSaveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  headerSaveLabel: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "NotoSans-Bold",
  },
  saveButton: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    marginVertical: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
  },
  saveButtonLabel: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "NotoSans-Bold",
  },
});
