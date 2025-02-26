import { View } from "@/components/Themed";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";

const index = () => {
  return (
    <View style={styles.container}>
      <Link href={"/sign-in"} asChild>
        <Button
          style={{
            paddingVertical: 8, // Bigger Button
            borderRadius: 50, // Rounded Button
            backgroundColor: "#000", // Swiggy/Zomato Orange
          }}
          labelStyle={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}
        >
          Sign in
        </Button>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});

export default index;
