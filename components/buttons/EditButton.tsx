import { Link } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";

const EditButton = ({ title, destination }) => {
  return (
    <Link href={destination} asChild>
      <Button
        mode="contained"
        style={styles.editButton}
        labelStyle={styles.editButtonLabel}
        icon="pencil"
      >
        {title}
      </Button>
    </Link>
  );
};

export default EditButton;

const styles = StyleSheet.create({
  editButton: {
    margin: 16,
    borderRadius: 8,
    backgroundColor: "#6200ee",
    paddingVertical: 4,
  },
  editButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
