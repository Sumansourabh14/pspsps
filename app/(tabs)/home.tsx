import { View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Pet {
  id: number;
  user_id: string;
  name: string;
  species: string;
  avatar?: string; // Optional avatar field
}

const PetCard = ({ pet, index }: { pet: Pet; index: number }) => {
  return (
    <Link
      href={{
        pathname: "/pets/[pet]",
        params: { id: pet.id },
      }}
      asChild
    >
      <Pressable style={{ flex: 1 }}>
        <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardText}>
                <Text variant="titleMedium" style={styles.petName}>
                  {pet.name}
                </Text>
                <Text variant="bodyMedium" style={styles.petSpecies}>
                  {pet.species}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      </Pressable>
    </Link>
  );
};

export default function HomeScreen() {
  const [pets, setPets] = useState<Pet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { session } = useAuth();

  useEffect(() => {
    let mounted = true;

    const fetchUserPets = async () => {
      if (!session?.user.id) return;

      setLoading(true);
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
        setLoading(false);
      }
    };

    fetchUserPets();

    return () => {
      mounted = false;
    };
  }, [session]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Fetching your pets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Pets</Text>
      </View>

      <FlatList
        data={pets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => <PetCard pet={item} index={index} />}
        numColumns={2}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pets yet? Add one now!</Text>
        }
        contentContainerStyle={styles.listContent}
      />

      <Link href="/add-a-pet" asChild>
        <TouchableOpacity style={styles.floatingButton}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add Pet</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
    fontStyle: "italic",
  },
  listContent: {
    paddingBottom: 80, // Space for floating button
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    elevation: 6,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#e0e0e0", // Fallback color
  },
  cardText: {
    flex: 1,
  },
  petName: {
    fontWeight: "bold",
    color: "#333",
  },
  petSpecies: {
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});
