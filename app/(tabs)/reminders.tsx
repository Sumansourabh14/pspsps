import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { View } from "@/components/Themed";
import { useAuth } from "@/providers/AuthProvider";
import { Link, Redirect } from "expo-router";
import AddButton from "@/components/buttons/AddButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, Text } from "react-native-paper";

interface Reminder {
  id: number; // Unique identifier for the reminder
  title: string; // Short description of the reminder
  task: string; // The task value (e.g., "deworming", "feeding_wet")
  frequency: string; // Frequency value (e.g., "daily", "weekly")
  startDate: Date; // When the reminder starts
  nextOccurrence: Date; // When the next instance occurs
  isActive: boolean; // Whether the reminder is currently active
  notes?: string; // Optional additional notes
  lastCompleted?: Date; // When it was last completed (optional)
  customInterval?: number; // For custom frequency, interval in days (optional)
  user_id: string;
}

const ReminderCard = ({ reminder }: { reminder: Reminder }) => {
  return (
    <Link
      href={{
        pathname: "/reminders/[reminder]",
        params: { id: reminder.id },
      }}
      asChild
    >
      <Pressable style={{ flex: 1 }}>
        <Card style={[styles.card]}>
          <Card.Content style={{ padding: 10 }}>
            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
              {reminder.title}
            </Text>
            <Text variant="titleSmall">{reminder.notes}</Text>
          </Card.Content>
        </Card>
      </Pressable>
    </Link>
  );
};

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { session } = useAuth();

  useEffect(() => {
    let mounted = true;

    const fetchUserReminders = async () => {
      if (!session?.user.id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", session.user.id);

      if (mounted) {
        if (error) {
          console.error("Error fetching reminders:", error);
        } else {
          setReminders(data);
        }
        setLoading(false);
      }
    };

    fetchUserReminders();

    return () => {
      mounted = false;
    };
  }, [session]);

  console.log({ reminders });

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return <Redirect href={"/"} />;
  }

  return (
    <View style={styles.container}>
      <AddButton title={"Add new reminder"} destination={`/add-reminder`} />
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ReminderCard reminder={item} />}
        numColumns={2}
        ListEmptyComponent={<Text>No reminders to display</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
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
  logoutBtn: {
    backgroundColor: "indianred",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 12,
    elevation: 4,
    borderWidth: 0,
  },
});
