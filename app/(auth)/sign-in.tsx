import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";

export default function SignInScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80",
      }}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Ionicons name="paw" size={70} color="#ffffff" />
          <Text style={styles.title}>PetPal</Text>
          <Text style={styles.subtitle}>Welcome back to your pet's home</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            theme={{ roundness: 8 }}
            outlineColor="#e0e0e0"
            activeOutlineColor="#4CAF50"
            left={<TextInput.Icon icon="email-outline" color="#666" />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={secureText}
            style={styles.input}
            theme={{ roundness: 8 }}
            outlineColor="#e0e0e0"
            activeOutlineColor="#4CAF50"
            left={<TextInput.Icon icon="lock-outline" color="#666" />}
            right={
              <TextInput.Icon
                icon={secureText ? "eye-off-outline" : "eye-outline"}
                color="#666"
                onPress={() => setSecureText(!secureText)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={signInWithEmail}
            loading={loading}
            disabled={loading}
            style={[
              styles.button,
              (!email || !password || loading) && styles.buttonDisabled,
            ]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New to PetPal? </Text>
            <Link href={"/sign-up"} style={styles.signupLink}>
              Sign Up
            </Link>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontFamily: "PlayfairDisplay-Bold", // Heading
    fontSize: 36,
    color: "#ffffff",
    marginTop: 10,
  },
  subtitle: {
    fontFamily: "NotoSans-Regular", // Regular text
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.9,
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
    fontFamily: "NotoSans-Regular", // Regular text
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontFamily: "NotoSans-Bold", // Regular text
    fontSize: 18,
    color: "#fff",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    fontFamily: "NotoSans-Regular", // Regular text
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    fontFamily: "NotoSans-Bold", // Regular text
    fontSize: 14,
    color: "#4CAF50",
  },
});
