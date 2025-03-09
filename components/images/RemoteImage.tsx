import { supabase } from "@/lib/supabase";
import React, { ComponentProps, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

type RemoteImageProps = {
  path: string;
  fallbackIcon?: string; // Optional fallback icon name
} & Omit<ComponentProps<typeof Image>, "source">;

const RemoteImage = ({
  path,
  fallbackIcon = "paw",
  ...imageProps
}: RemoteImageProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setImage(null);

      const { data, error } = await supabase.storage
        .from("pet-images")
        .download(path);

      if (error) {
        console.error("Error downloading image:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const fr = new FileReader();
        fr.readAsDataURL(data);
        fr.onload = () => {
          setImage(fr.result as string);
          setLoading(false);
        };
        fr.onerror = () => {
          setLoading(false);
        };
      }
    })();
  }, [path]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  }

  if (!image) {
    return (
      <View style={styles.fallbackContainer}>
        <Ionicons name={fallbackIcon} size={30} color="#4CAF50" />
      </View>
    );
  }

  return <Image source={{ uri: image }} {...imageProps} />;
};

export default RemoteImage;

const styles = StyleSheet.create({
  loadingContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
});
