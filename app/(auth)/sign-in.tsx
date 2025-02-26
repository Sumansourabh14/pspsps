import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";

export default function SignInScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Ionicons name="paw" size={64} color={theme.colors.primary} />
        <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 36 }}>
          Login
        </Text>
      </View>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={{ marginBottom: 15 }}
        keyboardType="email-address"
        left={<TextInput.Icon icon="email-outline" />}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry={secureText}
        left={<TextInput.Icon icon="lock-outline" />}
        right={
          <TextInput.Icon
            icon={secureText ? "eye-off-outline" : "eye-outline"}
            onPress={() => setSecureText(!secureText)}
          />
        }
      />

      <TouchableOpacity style={{ marginTop: 8, alignSelf: "flex-end" }}>
        <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <Button
        mode="contained"
        onPress={() => console.log("Logging in...")}
        style={{
          marginTop: 16,
          paddingVertical: 8, // Bigger Button
          borderRadius: 50, // Rounded Button
          backgroundColor: "#000", // Swiggy/Zomato Orange
        }}
        labelStyle={{ fontSize: 18, fontWeight: "bold" }}
      >
        Login
      </Button>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 15,
        }}
      >
        <Text>Don't have an account? </Text>
        <Link
          href={"/sign-up"}
          style={{ color: theme.colors.primary, fontWeight: "bold" }}
        >
          Sign up
        </Link>
      </View>
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
