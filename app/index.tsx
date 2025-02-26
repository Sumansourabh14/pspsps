import { View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Link, Redirect } from "expo-router";
import { StyleSheet } from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";

const index = () => {
  const { session, user, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return <Redirect href={"/sign-in"} />;
  }

  return (
    <View style={styles.container}>
      <Link href={"/onboarding"} asChild>
        <Button
          style={{
            marginVertical: 20,
            paddingVertical: 8, // Bigger Button
            borderRadius: 50, // Rounded Button
            backgroundColor: "#000",
          }}
          labelStyle={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}
        >
          Onboarding
        </Button>
      </Link>
      <Button
        onPress={() => supabase.auth.signOut()}
        style={{
          marginVertical: 20,
          paddingVertical: 8, // Bigger Button
          borderRadius: 50, // Rounded Button
          backgroundColor: "darkred", // Swiggy/Zomato Orange
        }}
        labelStyle={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}
      >
        Sign out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});

export default index;
