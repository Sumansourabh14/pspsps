import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

interface User {
  full_name: string;
}

export default function ProfileScreen() {
  const { session, loading } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchLoggedInUser = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user.id)
        .single();

      if (mounted) {
        if (error) {
          console.error("Error fetching pets:", error);
        } else {
          setUser(data);
        }
      }
    };

    fetchLoggedInUser();

    return () => {
      mounted = false;
    };
  }, [session]);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
    );
  }

  if (!session) {
    return <Redirect href={"/"} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {!!user && (
          <View style={styles.profileHeader}>
            <Ionicons
              name="person-circle"
              size={100}
              color="#4CAF50"
              style={styles.avatar}
            />
            <Text style={styles.fullName}>{user.full_name}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.btn, styles.logoutBtn]}
          onPress={() => supabase.auth.signOut()}
        >
          <Ionicons name="log-out" size={22} color="#fff" />
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F5", // Light pet-friendly background
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
    justifyContent: "space-between",
    alignItems: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6F5",
  },
  profileHeader: {
    alignItems: "center",
  },
  avatar: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  fullName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  btn: {
    borderWidth: 0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  logoutBtn: {
    backgroundColor: "#D32F2F", // Softer red for logout
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
