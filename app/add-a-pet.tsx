import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

const pets = [
  {
    id: "1",
    name: "Cat",
    type: "cat",
    icon: "cat",
  },
  {
    id: "2",
    name: "Dog",
    type: "dog",
    icon: "dog",
  },
  {
    id: "3",
    name: "Fish",
    type: "fish",
    icon: "fish",
  },
];

const genderItems = [
  {
    id: "1",
    name: "Female",
    type: "female",
    icon: "female",
  },
  {
    id: "2",
    name: "Male",
    type: "male",
    icon: "male",
  },
  {
    id: "3",
    name: "Unknown",
    type: "unknown",
    icon: "help-circle-outline",
  },
];

const yesOrNoItems = [
  {
    id: "1",
    name: "Yes",
    type: "yes",
  },
  {
    id: "2",
    name: "No",
    type: "no",
  },
];

const PetCard = ({
  pet,
  handlePress,
  isSelected,
  isIonicons,
}: {
  pet: { name: string; type: string; icon: string };
  handlePress: () => void;
  isSelected: boolean;
  isIonicons: boolean;
}) => {
  return (
    <Pressable onPress={handlePress} style={{ flex: 1 }}>
      <Card
        style={[
          styles.card,
          isSelected && styles.selectedBorder, // Apply border if selected
        ]}
      >
        <View style={{ alignItems: "center", padding: 20 }}>
          {isIonicons ? (
            <Ionicons name={pet.icon} size={60} color="black" />
          ) : (
            <FontAwesome5 name={pet.icon} size={60} color="black" />
          )}
        </View>
        <Card.Content style={{ padding: 10 }}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            {pet.name}
          </Text>
        </Card.Content>
      </Card>
    </Pressable>
  );
};

const YesOrNoCard = ({
  item,
  handlePress,
  isSelected,
}: {
  item: { name: string; type: string };
  handlePress: () => void;
  isSelected: boolean;
}) => {
  return (
    <Pressable onPress={handlePress} style={{ flex: 1 }}>
      <Card
        style={[
          styles.card,
          isSelected && styles.selectedBorder, // Apply border if selected
        ]}
      >
        <Card.Content style={{ padding: 10 }}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            {item.name}
          </Text>
        </Card.Content>
      </Card>
    </Pressable>
  );
};

export default function AddPetScreen() {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const handleSubmit = async () => {
    setLoading(true);

    const updates = {
      name,
      user_id: session?.user.id,
      species,
      birth_date: date,
      age,
      gender,
    };

    const { status, error } = await supabase.from("pets").insert(updates);

    if (status === 201) {
      Alert.alert("Pet added successfully!");
      router.push("/");
    }

    if (error) {
      Alert.alert(error.message);
    }

    setLoading(false);
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result);
      setSelectedImage(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };

  return (
    <View style={styles.container}>
      {current === 0 && (
        <>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 24 }}>
              Which pet do you have?
            </Text>
          </View>
          <View style={{ padding: 10 }}>
            <FlatList
              data={pets}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item }) => (
                <PetCard
                  pet={item}
                  handlePress={() => {
                    setSpecies(item.type);
                    setSelectedPet(item.type);
                  }}
                  isSelected={selectedPet === item.type}
                  isIonicons={false}
                />
              )}
            />
          </View>
          <Button
            onPress={() => setCurrent(1)}
            mode="contained"
            style={{
              marginTop: 16,
              paddingVertical: 8,
              borderRadius: 50,
            }}
            labelStyle={{ fontSize: 18, fontWeight: "bold" }}
            disabled={!species}
          >
            Continue
          </Button>
        </>
      )}
      {current === 1 && (
        <View>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 24 }}>
              What is the name of your {species}?
            </Text>
          </View>
          <TextInput
            label={`Your ${species}'s name`}
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={{ marginBottom: 15 }}
            keyboardType="default"
            left={<TextInput.Icon icon="email-outline" />}
          />
          <Button
            onPress={() => setCurrent(2)}
            mode="contained"
            style={{
              marginTop: 16,
              paddingVertical: 8,
              borderRadius: 50,
            }}
            labelStyle={{ fontSize: 18, fontWeight: "bold" }}
            disabled={!!name}
          >
            Hmm not decided yet
          </Button>
          <Button
            onPress={() => setCurrent(2)}
            mode="contained"
            style={{
              marginTop: 16,
              paddingVertical: 8,
              borderRadius: 50,
            }}
            labelStyle={{ fontSize: 18, fontWeight: "bold" }}
            disabled={!name}
          >
            Continue
          </Button>
        </View>
      )}
      {current === 2 && (
        <>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 24 }}>
              What is the gender of {!!name ? name : `your ${species}`}?
            </Text>
          </View>
          <View style={{ padding: 10 }}>
            <FlatList
              data={genderItems}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item }) => (
                <PetCard
                  pet={item}
                  handlePress={() => {
                    setGender(item.type);
                    setSelectedGender(item.type);
                  }}
                  isIonicons={true}
                  isSelected={selectedGender === item.type}
                />
              )}
            />
          </View>
          <Button
            onPress={() => setCurrent(3)}
            mode="contained"
            style={{
              marginTop: 16,
              paddingVertical: 8,
              borderRadius: 50,
            }}
            labelStyle={{ fontSize: 18, fontWeight: "bold" }}
            disabled={!species}
          >
            Continue
          </Button>
        </>
      )}
      {current === 3 && (
        <>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 24 }}>
              Add an image of {!!name ? name : `your ${species}`}
            </Text>
          </View>
          <View style={{ padding: 10 }}>
            {!!selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.image} />
            ) : (
              <Image
                source={require("@/assets/images/dog-with-flower.jpg")}
                style={styles.image}
              />
            )}
          </View>
          <Pressable onPress={pickImageAsync}>
            <Text
              style={{
                fontWeight: "bold",
                marginVertical: 10,
                fontSize: 16,
                alignSelf: "center",
                color: Colors.light.tint,
              }}
            >
              Select image
            </Text>
          </Pressable>
          <Button
            onPress={() => setCurrent(4)}
            mode="contained"
            style={{
              marginTop: 16,
              paddingVertical: 8,
              borderRadius: 50,
            }}
            labelStyle={{ fontSize: 18, fontWeight: "bold" }}
          >
            Skip
          </Button>
          <Button
            onPress={() => setCurrent(4)}
            mode="contained"
            style={{
              marginTop: 16,
              paddingVertical: 8,
              borderRadius: 50,
            }}
            labelStyle={{ fontSize: 18, fontWeight: "bold" }}
            disabled={!species}
          >
            Continue
          </Button>
        </>
      )}
      {current === 4 && (
        <>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 24 }}>
              Do you know the age of {!!name ? name : `your ${species}`}?
            </Text>
          </View>
          <View style={{ padding: 10 }}>
            <FlatList
              data={yesOrNoItems}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item }) => (
                <YesOrNoCard
                  item={item}
                  handlePress={() => {
                    setSelectedChoice(item.type);
                  }}
                  isSelected={selectedChoice === item.type}
                />
              )}
            />
          </View>
          {selectedChoice === "yes" ? (
            <>
              <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 18 }}>
                Great! Type the age
              </Text>
              <View style={{ padding: 10 }}>
                <TextInput
                  label="Age"
                  value={age}
                  onChangeText={setAge}
                  mode="outlined"
                  style={{ marginBottom: 15 }}
                  keyboardType="default"
                  left={<TextInput.Icon icon="email-outline" />}
                />
              </View>
              <View>
                <Button
                  onPress={showDatepicker}
                  mode="contained"
                  style={{
                    marginTop: 16,
                    paddingVertical: 2,
                    borderRadius: 50,
                  }}
                  labelStyle={{ fontSize: 16, fontWeight: "bold" }}
                >
                  Or choose the date of birth
                </Button>
                {show && (
                  <RNDateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={mode}
                    onChange={onChange}
                  />
                )}
              </View>
              <Button
                onPress={handleSubmit}
                mode="contained"
                style={{
                  marginTop: 16,
                  paddingVertical: 8,
                  borderRadius: 50,
                }}
                labelStyle={{ fontSize: 18, fontWeight: "bold" }}
                disabled={!age || !date || loading}
              >
                {loading ? "Saving..." : "Submit"}
              </Button>
            </>
          ) : (
            selectedChoice === "no" && (
              <Button
                onPress={handleSubmit}
                mode="contained"
                style={{
                  marginTop: 16,
                  paddingVertical: 8,
                  borderRadius: 50,
                }}
                labelStyle={{ fontSize: 18, fontWeight: "bold" }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Submit"}
              </Button>
            )
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: "#000",
    padding: 10,
    margin: 5,
  },
  card: { flex: 1, margin: 10, borderRadius: 12, elevation: 4, borderWidth: 0 },
  image: {
    height: 200,
    aspectRatio: 1,
    alignSelf: "center",
  },
});
