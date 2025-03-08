import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Redirect, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const WelcomeScreen = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const { session, loading } = useAuth();

  console.log({ isFirstLaunch, loading, session });

  // Check AsyncStorage for onboarding status
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem("hasCompletedOnboarding");
        setIsFirstLaunch(value === null || value === "false");
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setIsFirstLaunch(true); // Default to onboarding on error
      }
    };
    checkFirstLaunch();
  }, []);

  // Handle navigation with a guard to prevent redundant calls
  useEffect(() => {
    if (isFirstLaunch === null || loading) return; // Wait until both are resolved

    if (isFirstLaunch === true) {
      router.replace("/onboarding"); // Use replace to avoid stacking
    } else if (isFirstLaunch === false && session) {
      router.replace("/(tabs)/home"); // Use replace for home too
    }
  }, [isFirstLaunch, loading, session]);

  // Show loading state while checking AsyncStorage or session
  if (isFirstLaunch === null || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80",
        }}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)"]}
          style={styles.gradientOverlay}
        >
          <View style={styles.container}>
            {/* Header Section */}
            <Animated.View entering={FadeInUp.delay(200).duration(600)}>
              <View style={styles.header}>
                <Ionicons
                  name="paw"
                  size={80}
                  color="#fff"
                  style={styles.pawIcon}
                />
                <Text style={styles.title}>PetPal</Text>
                <Text style={styles.subtitle}>
                  Your Pet's Ultimate Companion
                </Text>
              </View>
            </Animated.View>

            {/* Action Section */}
            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <View style={styles.actionContainer}>
                <Link href={"/onboarding"} asChild>
                  <TouchableOpacity style={styles.primaryButton}>
                    <Text style={styles.buttonText}>Get Started</Text>
                  </TouchableOpacity>
                </Link>

                <Link href={"/sign-up"} asChild>
                  <TouchableOpacity style={styles.secondaryButton}>
                    <Ionicons name="mail-outline" size={20} color="#4CAF50" />
                    <Text style={styles.secondaryButtonText}>
                      Sign Up with Email
                    </Text>
                  </TouchableOpacity>
                </Link>

                <View style={styles.signinContainer}>
                  <Text style={styles.signinText}>Already a member? </Text>
                  <Link href={"/sign-in"} style={styles.signinLink}>
                    Sign In
                  </Link>
                </View>
              </View>
            </Animated.View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  pawIcon: {
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    opacity: 0.9,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "300",
  },
  actionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinText: {
    fontSize: 14,
    color: "#666",
  },
  signinLink: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
