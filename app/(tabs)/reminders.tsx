import { View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Card, Text } from "react-native-paper";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Reminder {
  id: number;
  created_at: Date;
  title: string;
  type: string;
  frequency: string;
  start_date: Date;
  next_due: Date;
  end_date: Date;
  is_active: boolean;
  notes?: string;
  last_completed?: Date;
  interval?: number;
  user_id: string;
  pet_id: string;
  time: string;
}

const ReminderCard = ({
  reminder,
  index,
}: {
  reminder: Reminder;
  index: number;
}) => {
  return (
    <Link
      href={{
        pathname: "/reminders/[reminder]",
        params: { id: reminder.id },
      }}
      asChild
    >
      <Pressable style={{ flex: 1 }}>
        <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Ionicons
                name={reminder.is_active ? "alarm" : "alarm-outline"}
                size={24}
                color={reminder.is_active ? "#4CAF50" : "#666"}
                style={styles.cardIcon}
              />
              <View style={styles.cardTextContainer}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {reminder.title}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={styles.cardNotes}
                  numberOfLines={2}
                >
                  {reminder.notes || "No notes"}
                </Text>
                <Text variant="bodySmall" style={styles.cardFrequency}>
                  {reminder.frequency}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading reminders...</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href={"/"} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <ReminderCard reminder={item} index={index} />
        )}
        numColumns={1}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No reminders yet. Add one!</Text>
        }
        contentContainerStyle={styles.listContent}
      />
      <Link href="/add-reminder" asChild>
        <TouchableOpacity style={styles.floatingButton}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add Reminder</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF", // Light pet-friendly background
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6F5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    fontStyle: "italic",
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 80, // Space for floating button
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    elevation: 6,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 0,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: "bold",
    color: "#333",
  },
  cardNotes: {
    color: "#666",
    marginTop: 4,
  },
  cardFrequency: {
    color: "#4CAF50",
    marginTop: 4,
    fontStyle: "italic",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#4CAF50", // Pet-friendly green
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
  },
});
