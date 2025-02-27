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

export default function ProfileScreen() {
  const { session, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return <Redirect href={"/"} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={[styles.btn, styles.logoutBtn]}
          onPress={() => supabase.auth.signOut()}
        >
          <Ionicons name="log-out" size={22} color={"#fff"} />
          <Text style={{ color: "#fff" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  wrapper: {
    paddingHorizontal: 24,
  },
  btn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "gray",
    borderStyle: "solid",
    borderRadius: 25,
    padding: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  logoutBtn: {
    backgroundColor: "indianred",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
