import { View } from "@/components/Themed";
import { StyleSheet } from "react-native";

export default function TabOneScreen() {
  return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});
