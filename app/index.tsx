import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Redirect, Stack } from "expo-router";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const WelcomeScreen = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!!session) {
    return <Redirect href={"/(tabs)/home"} />;
  }

  return (
    <>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <ImageBackground
        source={require("@/assets/images/dog-with-flower.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <LinearGradient
            colors={[
              "transparent",
              "rgba(255,255,255,0.7)",
              "rgba(255,255,255,1)",
            ]}
            style={styles.background}
          >
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <View style={styles.wrapper}>
                <Text style={styles.title}>pspsps</Text>
                <Text style={styles.description}>
                  Your pet's 2nd best friend
                </Text>
                <View style={styles.socialLoginButtons}>
                  <Link href={"/onboarding"} asChild>
                    <TouchableOpacity style={styles.btn}>
                      <Text style={styles.btnText}>Onboarding</Text>
                    </TouchableOpacity>
                  </Link>
                  <Link href={"/sign-up"} asChild>
                    <TouchableOpacity style={styles.btn}>
                      <Ionicons name="mail-outline" size={20} />
                      <Text style={styles.btnText}>Continue with email</Text>
                    </TouchableOpacity>
                  </Link>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <Text>Already have an account? </Text>
                    <Link href={"/sign-in"} style={{ fontWeight: "bold" }}>
                      Sign in
                    </Link>
                  </View>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  background: {
    flex: 1,
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "flex-end",
  },
  wrapper: {
    paddingBottom: 40,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 60,
    fontWeight: "100",
    marginBottom: 10,
    color: "darkblue",
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  socialLoginButtons: {
    alignSelf: "stretch",
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
  btnText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
