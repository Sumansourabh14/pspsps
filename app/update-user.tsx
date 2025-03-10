import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect, router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  id: string;
  full_name: string;
  email: string;
}

export default function UpdateUserScreen() {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const updateUser = async () => {
    setLoading(true);
    try {
      const updates = {
        id: session?.user.id,
        full_name: name,
        updated_at: new Date(),
      };

      const { data, status, error } = await supabase
        .from("profiles")
        .upsert(updates);

      if (status === 200) {
        Alert.alert("Your profile has been updated!");
        router.push("/profile");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user.id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setUserData(data);
      }
    };

    fetchUserProfile();
  }, [session]);

  useEffect(() => {
    if (!!userData) {
      setName(userData.full_name);
      setEmail(userData.email);
    }
  }, [userData]);

  if (!session) {
    return <Redirect href={"/"} />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Profile",
          headerTitleStyle: { fontFamily: "NotoSans-Bold" },
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>Updating...</Text>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.topContent}>
                <View style={styles.header}>
                  <Text style={styles.subtitle}>Email</Text>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Email"
                    value={email}
                    mode="outlined"
                    style={styles.input}
                    theme={{
                      roundness: 8,
                      colors: {
                        primary: "#000",
                        background: "#fff",
                      },
                    }}
                    outlineStyle={styles.inputOutline}
                    left={<TextInput.Icon icon="email-outline" color="#666" />}
                    autoCapitalize="words"
                    returnKeyType="done"
                    disabled
                  />
                </View>

                <View style={styles.header}>
                  <Text style={styles.subtitle}>Name</Text>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    theme={{
                      roundness: 8,
                      colors: {
                        primary: "#000",
                        background: "#fff",
                      },
                    }}
                    outlineStyle={styles.inputOutline}
                    left={
                      <TextInput.Icon icon="account-outline" color="#666" />
                    }
                    autoCapitalize="words"
                    returnKeyType="done"
                  />
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={updateUser}
                  style={[
                    styles.button,
                    (name?.length === 0 || loading) && styles.buttonDisabled,
                  ]}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  disabled={name?.length === 0 || loading}
                >
                  Update
                </Button>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  topContent: {
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontFamily: "NotoSans-Regular",
  },
  header: {
    alignItems: "flex-start",
  },
  title: {
    fontFamily: "NotoSans-Bold",
    fontSize: 32,
    color: "#000",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: "NotoSans-Bold",
    fontSize: 14,
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    fontSize: 16,
  },
  inputOutline: {
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonContainer: {
    paddingBottom: 24,
  },
  button: {
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    elevation: 2,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "NotoSans-Bold",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
});
