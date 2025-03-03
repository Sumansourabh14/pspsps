import { supabase } from "@/lib/supabase";
import React, { ComponentProps, useEffect, useState } from "react";
import { Image, StyleSheet } from "react-native";

type RemoteImageProps = {
  path: string;
} & Omit<ComponentProps<typeof Image>, "source">;

const RemoteImage = ({ path, ...imageProps }: RemoteImageProps) => {
  const [image, setImage] = useState("");

  useEffect(() => {
    if (!path) return;

    (async () => {
      setImage("");

      const { data, error } = await supabase.storage
        .from("pet-images")
        .download(path);

      if (data) {
        const fr = new FileReader();
        fr.readAsDataURL(data);
        fr.onload = () => {
          setImage(fr.result as string);
        };
      }
    })();
  }, [path]);

  if (!image) {
  }

  return <Image source={{ uri: image }} style={styles.petImage} />;
};

export default RemoteImage;

const styles = StyleSheet.create({
  petImage: {
    width: "100%",
    height: "100%",
  },
});
