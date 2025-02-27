import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export default function OnboardingScreen() {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const updateUser = async () => {
    console.log({ session });
    const updates = {
      id: session?.user.id,
      full_name: name,
      updated_at: new Date(),
    };

    const { status } = await supabase.from("profiles").upsert(updates);

    if (status === 200 || status === 201) {
      router.push("/add-a-pet");
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return <Redirect href={"/"} />;
  }

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 36 }}>
          Welcome
        </Text>
      </View>
      <TextInput
        label="Your name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={{ marginBottom: 15 }}
        keyboardType="default"
        left={<TextInput.Icon icon="email-outline" />}
      />
      <Button
        mode="contained"
        onPress={updateUser}
        style={{
          marginTop: 16,
          paddingVertical: 8,
          borderRadius: 50,
          backgroundColor: "#000",
        }}
        labelStyle={{ fontSize: 18, fontWeight: "bold" }}
      >
        {loading ? "Hold on..." : "Continue"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});
