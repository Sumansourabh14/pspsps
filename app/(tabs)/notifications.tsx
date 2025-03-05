import { Text, View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

// Sample notification data type
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const { session, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      const now = Date.now(); // Current time in milliseconds

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session?.user.id)
        .lte("time", now); // time <= now (past or current notifications)

      if (mounted) {
        if (error) {
          console.error("some error");
        }
        setNotifications(data);
      }
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, [session]);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
    );
  }

  if (!session) {
    return <Redirect href={"/"} />;
  }

  function getRelativeTime(timestamps) {
    const now = Date.now(); // Current time in milliseconds
    const diffMs = now - timestamps; // Difference in milliseconds

    console.log({ now, timestamps });

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30); // Approximate
    const years = Math.floor(days / 365); // Approximate

    if (seconds < 60) {
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
    <View style={[styles.notificationItem, !item.read && styles.unread]}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
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
    backgroundColor: "#F5F6F5",
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
    backgroundColor: "#F5F6F5",
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
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
  },
  // Keeping your original styles
  profileHeader: {
    alignItems: "center",
  },
  avatar: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  fullName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  btn: {
    borderWidth: 0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  logoutBtn: {
    backgroundColor: "#D32F2F",
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
