import AddButton from "@/components/buttons/AddButton";
import { View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

interface Pet {
  id: number;
  user_id: string;
  name: string;
  species: string;
}

const PetCard = ({ pet }: { pet: Pet }) => {
  return (
    <Link
      href={{
        pathname: "/pets/[pet]",
        params: { id: pet.id },
      }}
      asChild
    >
      <Pressable style={{ flex: 1 }}>
        <Card style={[styles.card]}>
          <Card.Content style={{ padding: 10 }}>
            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
              {pet.name}
            </Text>
            <Text variant="titleSmall">{pet.species}</Text>
          </Card.Content>
        </Card>
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
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Loading pets...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ marginVertical: 10 }}>
        <Text style={{ fontWeight: "700" }}>My Pets</Text>
        <AddButton title={"Add new pet"} destination={`/add-a-pet`} />
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PetCard pet={item} />}
          numColumns={2}
          ListEmptyComponent={<Text>No pets to display</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 12,
    elevation: 4,
    borderWidth: 0,
  },
});
