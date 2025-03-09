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
import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Button } from "react-native-paper";

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

        <View style={{ width: "100%" }}>
          <Link href={"/update-user"} asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="pencil-outline" size={20} color="#fff" />
              <Text style={styles.secondaryButtonText}>Update Profile</Text>
            </TouchableOpacity>
          </Link>
          <Button
            mode="outlined"
            style={[styles.btn, styles.logoutBtn]}
            onPress={() => supabase.auth.signOut()}
            icon="arrow-right"
          >
            <Text style={styles.btnText}>Logout</Text>
          </Button>
        </View>
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
    fontFamily: "NotoSans-Bold",
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
    borderWidth: 2,
    borderColor: "#D32F2F",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 24,
  },
  logoutBtn: {
    backgroundColor: "#FFF", // Softer red for logout
  },
  btnText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "NotoSans-Bold",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "NotoSans-SemiBold",
  },
  secondaryButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
});
