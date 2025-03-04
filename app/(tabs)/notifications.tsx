import { View, Text } from "@/components/Themed";
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

interface User {
  full_name: string;
}

export default function NotificationsScreen() {
  const { session, loading } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  // Dummy notifications data
  const notifications: Notification[] = [
    {
      id: "1",
      title: "New Message",
      message: "John Doe sent you a new message",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      title: "Friend Request",
      message: "Jane Smith wants to connect",
      time: "4 hours ago",
      read: false,
    },
    {
      id: "3",
      title: "Event Reminder",
      message: "Pet Playdate tomorrow at 2 PM",
      time: "Yesterday",
      read: true,
    },
    {
      id: "4",
      title: "Profile Update",
      message: "Your profile photo was updated",
      time: "2 days ago",
      read: true,
    },
  ];

  useEffect(() => {
    let mounted = true;

    const fetchLoggedInUser = async () => {
      if (mounted) {
        // Add your user fetch logic here if needed
      }
    };

    fetchLoggedInUser();

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

  // Render individual notification item
  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={[styles.notificationItem, !item.read && styles.unread]}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>{item.time}</Text>
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
