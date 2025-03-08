import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const scrollViewRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleNext = async () => {
    if (step < 3) {
      setIsScrolling(true);
      scrollViewRef.current.scrollTo({ x: width * step, animated: true });
      // Delay state update until scroll animation is likely complete
      setTimeout(() => {
        setStep(step + 1);
        setIsScrolling(false);
      }, 300); // Match this with your animation duration
    } else {
      setLoading(true);
      try {
        await AsyncStorage.setItem("hasCompletedOnboarding", "true");

        setTimeout(() => {
          setLoading(false);
          router.push(`/sign-in`);
        }, 1000);
      } catch (error) {
        console.error("Error saving onboarding status:", error);
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setIsScrolling(true);
      scrollViewRef.current.scrollTo({ x: width * (step - 2), animated: true });
      setTimeout(() => {
        setStep(step - 1);
        setIsScrolling(false);
      }, 300);
    }
  };

  const handleScroll = (event) => {
    if (isScrolling) return; // Prevent manual scroll interference during button animation
    const offsetX = event.nativeEvent.contentOffset.x;
    const newStep = Math.round(offsetX / width) + 1;
    setStep(newStep);
  };

  const renderContent = (title, subtitle) => (
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.gradient}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          scrollEnabled={!isScrolling} // Disable manual scrolling during button animation
        >
          {/* Step 1 */}
          <View style={styles.page}>
            {renderContent(
              "Welcome to PetPal",
              "Your all-in-one companion for keeping your pets happy and healthy"
            )}
          </View>

          {/* Step 2 */}
          <View style={styles.page}>
            {renderContent(
              "Add Your Pet and Forget",
              "Let the AI handle daily reminders"
            )}
          </View>

          {/* Step 3 */}
          <View style={styles.page}>
            {renderContent(
              "Never Miss a Moment",
              "Set reminders for feeding, walks, and vet appointments with ease"
            )}
          </View>
        </ScrollView>

        <View style={styles.controlsContainer}>
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <Button
                mode="outlined"
                onPress={handleBack}
                style={styles.secondaryButton}
                labelStyle={styles.secondaryButtonLabel}
                contentStyle={styles.buttonContent}
                disabled={isScrolling} // Disable button during animation
              >
                Back
              </Button>
            )}
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
              disabled={isScrolling} // Disable button during animation
            >
              {step === 3 ? "Get Started" : "Next"}
            </Button>
          </View>

          <View style={styles.stepIndicator}>
            {[1, 2, 3].map((num) => (
              <View
                key={num}
                style={[styles.stepDot, step === num && styles.activeStepDot]}
              />
            ))}
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: width,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  controlsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 36,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "PlayfairDisplay-Bold",
  },
  subtitle: {
    fontSize: 18,
    color: "#E0E0E0",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    fontFamily: "NotoSans-Regular",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  button: {
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 4,
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
  },
  secondaryButton: {
    borderRadius: 8,
    borderColor: "#fff",
    flex: 1,
  },
  secondaryButtonLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  activeStepDot: {
    backgroundColor: "#fff",
    transform: [{ scale: 1.2 }],
  },
});
