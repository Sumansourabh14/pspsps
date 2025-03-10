import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, ImageBackground, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80",
      }} // Same pet-themed background
      style={styles.background}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Ionicons name="paw" size={70} color="#ffffff" />
          <Text style={styles.title}>PetPal</Text>
          <Text style={styles.subtitle}>Join the pet care community</Text>
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
            label="Create Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={secureText}
            style={styles.input}
            theme={{ roundness: 8 }}
            outlineColor={
              password.length > 0 && password.length < 6 ? "#FF0000" : "#e0e0e0"
            }
            activeOutlineColor={password.length >= 6 ? "#4CAF50" : "#FF0000"}
            left={<TextInput.Icon icon="lock-outline" color="#666" />}
            right={
              <TextInput.Icon
                icon={secureText ? "eye-off-outline" : "eye-outline"}
                color="#666"
                onPress={() => setSecureText(!secureText)}
              />
            }
          />
          {password.length < 6 && (
            <Text style={styles.passwordHint}>
              Password must be at least 6 characters
            </Text>
          )}

          <Button
            mode="contained"
            onPress={signUpWithEmail}
            loading={loading}
            disabled={!email || !password || loading}
            style={[
              styles.button,
              (!email || password.length < 6 || loading) &&
                styles.buttonDisabled,
            ]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>

          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <Link href={"/sign-in"} style={styles.signinLink}>
              Sign In
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
    backgroundColor: "rgba(0,0,0,0.3)", // Subtle overlay for readability
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
    fontSize: 36,
    fontFamily: "PlayfairDisplay-Bold",
    color: "#ffffff",
    marginTop: 10,
  },
  subtitle: {
    fontFamily: "NotoSans-Regular",
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
  },
  button: {
    backgroundColor: "#4CAF50", // Pet-friendly green
    borderRadius: 8,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC", // Disabled state color
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 18,
    fontFamily: "NotoSans-Bold",
    color: "#fff",
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signinText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "NotoSans-Regular",
  },
  signinLink: {
    fontSize: 14,
    color: "#4CAF50",
    fontFamily: "NotoSans-Bold",
  },
  passwordHint: {
    fontFamily: "NotoSans-Regular",
    fontSize: 12,
    color: "#FF0000",
    marginTop: -8,
  },
});
