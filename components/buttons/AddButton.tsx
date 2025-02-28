import { Link } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";

const AddButton = ({ title, destination }) => {
  return (
    <Link href={destination} asChild>
      <Button
        mode="contained"
        style={styles.addButton}
        labelStyle={styles.addButtonLabel}
        icon="plus"
      >
        {title}
      </Button>
    </Link>
  );
};

export default AddButton;

const styles = StyleSheet.create({
  addButton: {
    marginVertical: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#6200ee",
    paddingVertical: 4,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
