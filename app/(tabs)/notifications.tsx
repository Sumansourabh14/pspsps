import { Text, View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

interface Notification {
  id: string;
  pet_id: string;
  title: string;
  body: string;
  time: string;
}

export default function NotificationsScreen() {
  const { session, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session?.user.id)
        .lte("time", now)
        .order("time", { ascending: false }); // time <= now (past or current notifications)

      if (mounted) {
        if (error) {
          console.error(error.message);
        }
        setNotifications(data);
      }
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, [session]);

  const findPetById = async (petId: string) => {
    if (!petId) return;

    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    return data.name || `Species: ${data.species}`;
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
    );
  }

  if (!session) {
    return <Redirect href={"/"} />;
  }

  function getRelativeTime(timestamp: string) {
    const now = Date.now(); // Current time in milliseconds

    // Convert TIMESTAMPTZ string to milliseconds
    const timestampMs = new Date(timestamp).getTime();

    if (isNaN(timestampMs)) {
      console.error(`Invalid timestamp: ${timestamp}`);
      return "unknown time";
    }

    const diffMs = now - timestampMs; // Difference in milliseconds

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30); // Approximate
    const years = Math.floor(days / 365); // Approximate

    if (diffMs < 0) {
      return "in the future"; // Handle future timestamps
    } else if (seconds < 60) {
      return "just now";
    } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else if (days < 7) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (weeks < 4) {
      return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    } else if (months < 12) {
      return `${months} month${months === 1 ? "" : "s"} ago`;
    } else {
      return `${years} year${years === 1 ? "" : "s"} ago`;
    }
  }

  // Render individual notification item
  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={[styles.notificationItem, styles.unread]}>
      {!!item.title && (
        <Text style={styles.notificationTitle}>{item.title}</Text>
      )}
      {!!item.body && (
        <Text style={styles.notificationMessage}>{item.body}</Text>
      )}
      {!!item.pet_id && (
        <Text style={styles.notificationMessage}>
          {findPetById(item.pet_id)}
        </Text>
      )}
      <Text style={styles.notificationTime}>{getRelativeTime(item.time)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notifications yet</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  notificationItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unread: {
    // backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    borderRightWidth: 1,
    borderRightColor: "#4CAF50",
  },
  notificationTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
    fontFamily: "NotoSans-Bold",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontFamily: "NotoSans-Regular",
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
    fontFamily: "NotoSans-SemiBold",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
    fontFamily: "NotoSans-Regular",
  },
});
