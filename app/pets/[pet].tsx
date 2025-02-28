import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Pet {
  id: number;
  user_id: string;
  name: string;
  species: string;
}

const PetScreen = () => {
  const [petData, setPetData] = useState<Pet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useLocalSearchParams();
  const { session } = useAuth();

  useEffect(() => {
    let mounted = true;

    const fetchPetById = async () => {
      if (!session?.user.id) return;

      setLoading(true);

      const { data, error, status } = await supabase
        .from("pets")
        .select("*")
        .eq("id", id);

      console.log({ data });

      if (mounted) {
        if (error) {
          console.error("Error fetching pet data:", error);
        } else {
          setPetData(data[0]);
        }
        setLoading(false);
      }
    };

    fetchPetById();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Loading pet...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        name="[pet]"
        options={{ headerTitle: `${petData?.name ? petData?.name : "NA"}` }}
      />
      {petData && (
        <View style={styles.container}>
          <Text>{petData.name}</Text>
        </View>
      )}
    </>
  );
};

export default PetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
