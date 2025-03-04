import RemoteImage from "@/components/images/RemoteImage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";

interface Pet {
  id: number;
  user_id: string;
  name: string;
  species: "dog" | "cat" | "fish";
  gender: "male" | "female" | "unknown";
  birth_date?: string;
  age?: number;
  avatar?: string;
}

const PetScreen = () => {
  const [petData, setPetData] = useState<Pet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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
          console.log("Pet data:", data);
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

  const calculateAge = (dob?: string): string => {
    if (!dob) return "Unknown age";
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      return `${years - 1} years`;
    }
    return `${years} years`;
  };

  const handleRemovePet = async () => {
    const { error, status } = await supabase.from("pets").delete().eq("id", id);

    if (error) {
      Alert.alert("Not able to delete this pet profile. Please try again.");
    }

    if (status === 204) {
      Alert.alert(
        "Pet removed successfully!",
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

  if (!petData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Pet not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ headerTitle: petData.name ? petData.name : "NA" }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          {petData.avatar ? (
            <RemoteImage
              path={petData.avatar}
              resizeMode="cover"
              style={styles.petImage}
            />
          ) : (
            <Avatar.Icon
              size={150}
              icon={
                petData.species === "dog"
                  ? "dog"
                  : petData.species === "cat"
                  ? "cat"
                  : petData.species === "fish" && "fish"
              }
              style={styles.avatar}
            />
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <FontAwesome5
                name={
                  petData.species === "dog"
                    ? "dog"
                    : petData.species === "cat"
                    ? "cat"
                    : petData.species === "fish" && "fish"
                }
                size={24}
                color="#4CAF50"
              />
              <Text style={styles.infoLabel}>Species</Text>
              <Text style={styles.infoValue}>
                {petData.species.charAt(0).toUpperCase() +
                  petData.species.slice(1)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name={
                  petData.gender === "male"
                    ? "male"
                    : petData.gender === "female"
                    ? "female"
                    : petData.gender === "unknown" && "help"
                }
                size={24}
                color="#4CAF50"
              />
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>
                {petData.gender.charAt(0).toUpperCase() +
                  petData.gender.slice(1)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={24} color="#4CAF50" />
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>
                {petData.birth_date
                  ? calculateAge(petData.birth_date)
                  : "Unknown"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="calendar-number" size={24} color="#4CAF50" />
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {petData.birth_date ? petData.birth_date : "Unknown"}
              </Text>
            </View>
          </View>
        </View>

        <Link
          href={{
            pathname: "/pets/edit/[pet]",
            params: { id: petData.id },
          }}
          asChild
        >
          <Button
            mode="contained"
            style={styles.editButton}
            labelStyle={styles.editButtonLabel}
            icon="pencil"
          >
            Edit Profile
          </Button>
        </Link>

        <Button
          onPress={handleRemovePet}
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

export default PetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F5",
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
  imageContainer: {
    position: "relative",
    height: 300,
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  avatar: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -75 }, { translateY: -75 }],
    backgroundColor: "#ddd",
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  nameOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  petName: {
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoItem: {
    width: "48%", // Two columns with slight spacing
    alignItems: "center",
    marginVertical: 12,
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    fontWeight: "700",
    textAlign: "center",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
    fontWeight: "600",
    textAlign: "center",
  },
  editButton: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  editButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  deleteButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: "#D32F2F",
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
