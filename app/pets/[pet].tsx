import RemoteImage from "@/components/images/RemoteImage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";

interface Pet {
  id: number;
  user_id: string;
  name: string;
  species: "dog" | "cat" | "fish";
  gender: "male" | "female" | "unknown";
  birth_date?: string; // ISO date string (e.g., "2020-05-15")
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
          .single(); // Use single() since we're expecting one record

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

  // Calculate age from DOB
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
        {/* Pet Image Header */}
        <View style={styles.imageContainer}>
          {petData.avatar ? (
            <RemoteImage path={petData.avatar} resizeMode="cover" />
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
          {petData.name && (
            <View style={styles.nameOverlay}>
              <Text style={styles.petName} variant="headlineLarge">
                {petData.name}
              </Text>
            </View>
          )}
        </View>

        {/* Pet Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <FontAwesome5
                name={
                  petData.species === "dog"
                    ? "dog"
                    : petData.species === "cat"
                    ? "cat"
                    : petData.species === "fish" && "fish"
                }
                size={24}
                color="#666"
              />
              <Text style={styles.infoText}>
                {petData.species.charAt(0).toUpperCase() +
                  petData.species.slice(1)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name={
                  petData.gender === "male"
                    ? "male"
                    : petData.gender === "female"
                    ? "female"
                    : petData.gender === "unknown" && "help"
                }
                size={24}
                color="#666"
              />
              <Text style={styles.infoText}>
                {petData.gender.charAt(0).toUpperCase() +
                  petData.gender.slice(1)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={24} color="#666" />
              <Text style={styles.infoText}>
                {petData.birth_date
                  ? `${calculateAge(petData.birth_date)} old`
                  : "Age unknown"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-number" size={24} color="#666" />
              <Text style={styles.infoText}>
                {petData.birth_date ? `${petData.birth_date}` : "DOB unknown"}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Edit Button */}
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
  imageContainer: {
    position: "relative",
    height: 300,
    backgroundColor: "#e0e0e0",
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
  },
  nameOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 8,
  },
  petName: {
    color: "white",
    fontWeight: "bold",
  },
  infoCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: "white",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  editButton: {
    margin: 16,
    borderRadius: 8,
    backgroundColor: "#6200ee",
    paddingVertical: 4,
  },
  editButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "darkred",
    paddingVertical: 4,
  },
});
