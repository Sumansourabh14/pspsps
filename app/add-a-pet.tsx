import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { decode } from "base64-arraybuffer";
import { randomUUID } from "expo-crypto";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, Stack } from "expo-router";
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

const pets = [
  { id: "1", name: "Cat", type: "cat", icon: "cat" },
  { id: "2", name: "Dog", type: "dog", icon: "dog" },
  { id: "3", name: "Fish", type: "fish", icon: "fish" },
];

const genderItems = [
  { id: "1", name: "Female", type: "female", icon: "female" },
  { id: "2", name: "Male", type: "male", icon: "male" },
  {
    id: "3",
    name: "Hmm not sure",
    type: "unknown",
    icon: "help-circle-outline",
  },
];

const yesOrNoItems = [
  { id: "1", name: "Yes", type: "yes" },
  { id: "2", name: "No", type: "no" },
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
    <Pressable onPress={handlePress} style={styles.cardContainer}>
      <Card style={[styles.card, isSelected && styles.selectedBorder]}>
        <View style={styles.cardContent}>
          {isIonicons ? (
            <Ionicons
              name={pet.icon}
              size={60}
              color={isSelected ? "#4CAF50" : "#666"}
            />
          ) : (
            <FontAwesome5
              name={pet.icon}
              size={60}
              color={isSelected ? "#4CAF50" : "#666"}
            />
          )}
          <Text
            style={[styles.cardText, isSelected && styles.selectedText]}
            variant="titleMedium"
          >
            {pet.name}
          </Text>
        </View>
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
    <Pressable onPress={handlePress} style={styles.cardContainer}>
      <Card style={[styles.card, isSelected && styles.selectedBorder]}>
        <Card.Content style={styles.cardContent}>
          <Text
            style={[styles.cardText, isSelected && styles.selectedText]}
            variant="titleMedium"
          >
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
  const [avatar, setAvatar] = useState("");
  const [age, setAge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [date, setDate] = useState(null);
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || null;
    setShow(false);
    setDate(currentDate);

    if (currentDate) {
      const today = new Date();
      const birthDate = new Date(currentDate);

      // Calculate the difference in months
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      // Convert years to months and add to the month difference
      let totalMonths = years * 12 + months;

      // Adjust if the day of the month hasn't been reached yet
      if (days < 0) {
        totalMonths--;
      }

      // Ensure totalMonths is not negative (e.g., future date selected)
      const calculatedAgeInMonths = Math.max(0, totalMonths);
      setAge(calculatedAgeInMonths);

      console.log({ calculatedAgeInMonths });
    }

    console.log(
      currentDate ? currentDate.toLocaleDateString() : "No date selected"
    );
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    setShow(true);
    setMode("date");
  };

  const handleSubmit = async () => {
    setLoading(true);
    const updates = {
      name,
      user_id: session?.user.id,
      species,
      birth_date: date, // Will be null if not set
      age: age > 0 ? age : null, // Only include age if it’s meaningful
      gender,
      avatar,
    };
    const { data, status, error } = await supabase
      .from("pets")
      .insert(updates)
      .select()
      .single();
    if (status === 201) {
      console.log(data);
      Alert.alert("Pet added successfully!");
      router.push({
        pathname: "/ai-assistance",
        params: data,
      });
    }
    if (error) Alert.alert(error.message);
    setLoading(false);
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };

  const uploadImage = async () => {
    if (!selectedImage?.startsWith(`file://`)) return;
    setUploading(true);
    const base64 = await FileSystem.readAsStringAsync(selectedImage, {
      encoding: "base64",
    });
    const filePath = selectedImage?.endsWith(`jpeg`)
      ? `${randomUUID()}.jpeg`
      : selectedImage?.endsWith(`jpg`)
      ? `${randomUUID()}.jpg`
      : `${randomUUID()}.png`;
    const contentType = selectedImage?.endsWith(`jpeg`)
      ? `image/jpeg`
      : selectedImage?.endsWith(`jpg`)
      ? `image/jpg`
      : `image/png`;
    const { data, error } = await supabase.storage
      .from("pet-images")
      .upload(filePath, decode(base64), { contentType });
    if (data) {
      setUploading(false);
      setAvatar(data.path);
      return data.path;
    } else {
      setUploading(false);
      console.log(error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `Add a Pet`,
          headerTitleStyle: {
            fontFamily: "NotoSans-Black",
          },
        }}
      />
      <View style={styles.container}>
        {current === 0 && (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Which pet do you have?</Text>
              <Text style={styles.headerSubtitle}>Pick your new buddy!</Text>
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={pets}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item }) => (
                  <PetCard
                    pet={item}
                    handlePress={() => {
                      setSpecies(
                        item.type.charAt(0).toUpperCase() + item.type.slice(1)
                      );
                      setSelectedPet(item.type);
                    }}
                    isSelected={selectedPet === item.type}
                    isIonicons={false}
                  />
                )}
                contentContainerStyle={styles.flatListContent}
              />
            </View>
            <Button
              onPress={() => setCurrent(1)}
              mode="contained"
              style={styles.continueButton}
              labelStyle={styles.buttonLabel}
              disabled={!species}
              icon="arrow-right"
            >
              Continue
            </Button>
          </>
        )}
        {current === 1 && (
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                What’s your {species}’s name?
              </Text>
              <Text style={styles.headerSubtitle}>
                Give your pet a special name!
              </Text>
            </View>
            <TextInput
              label={`Your ${species}'s name`}
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              keyboardType="default"
              theme={{ roundness: 8 }}
              outlineColor="#e0e0e0"
              activeOutlineColor="#4CAF50"
              left={<TextInput.Icon icon="paw" color="#666" />}
            />
            <Button
              onPress={() => setCurrent(2)}
              mode="outlined"
              style={styles.skipButton}
              labelStyle={styles.skipButtonLabel}
              disabled={!!name}
            >
              Not decided yet
            </Button>
            <Button
              onPress={() => setCurrent(2)}
              mode="contained"
              style={styles.continueButton}
              labelStyle={styles.buttonLabel}
              disabled={!name}
              icon="arrow-right"
            >
              Continue
            </Button>
          </View>
        )}
        {current === 2 && (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                What’s {name || `your ${species}`}’s gender?
              </Text>
              <Text style={styles.headerSubtitle}>Tell us a bit more!</Text>
            </View>
            <View style={styles.listContainer}>
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
                contentContainerStyle={styles.flatListContent}
              />
            </View>
            <Button
              onPress={() => setCurrent(3)}
              mode="contained"
              style={styles.continueButton}
              labelStyle={styles.buttonLabel}
              disabled={!gender}
              icon="arrow-right"
            >
              Continue
            </Button>
          </>
        )}
        {current === 3 && (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                Add the profile picture of {name || `your ${species}`}
              </Text>
              <Text style={styles.headerSubtitle}>Show off your pet!</Text>
            </View>
            <View style={styles.imageContainer}>
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
              <Text style={styles.selectImageText}>Select Image</Text>
            </Pressable>
            <Button
              onPress={() => setCurrent(4)}
              mode="outlined"
              style={styles.skipButton}
              labelStyle={styles.skipButtonLabel}
            >
              Skip
            </Button>
            <Button
              onPress={() => {
                const res = uploadImage();
                if (!!res) setCurrent(4);
              }}
              mode="contained"
              style={[
                styles.continueButton,
                (!selectedImage || uploading) && styles.buttonDisabled,
              ]}
              labelStyle={styles.buttonLabel}
              disabled={!selectedImage || uploading}
              loading={uploading}
              icon="arrow-right"
            >
              Upload & Continue
            </Button>
          </>
        )}
        {current === 4 && (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                Know the age of {name || `your ${species}`}?
              </Text>
              <Text style={styles.headerSubtitle}>Let’s get the details!</Text>
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={yesOrNoItems}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item }) => (
                  <YesOrNoCard
                    item={item}
                    handlePress={() => {
                      setSelectedChoice(item.type);
                      if (item.type === "no") {
                        setDate(null); // Reset date
                        setAge(0); // Reset age to 0 instead of null
                      } else if (item.type === "yes") {
                        setAge(0); // Reset to 0 to avoid null issues
                      }
                    }}
                    isSelected={selectedChoice === item.type}
                  />
                )}
                contentContainerStyle={styles.flatListContent}
              />
            </View>
            {selectedChoice === "yes" && (
              <>
                <Text style={styles.subHeader}>Great! Add the age</Text>
                <TextInput
                  label="Age (in months)"
                  value={age !== null ? age.toString() : ""} // Fallback to empty string if null
                  onChangeText={(text) => setAge(parseInt(text) || 0)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  theme={{ roundness: 8 }}
                  outlineColor="#e0e0e0"
                  activeOutlineColor="#4CAF50"
                  left={<TextInput.Icon icon="calendar" color="#666" />}
                />
                <Button
                  onPress={showDatepicker}
                  mode="outlined"
                  style={styles.dateButton}
                  labelStyle={styles.dateButtonLabel}
                  icon="calendar"
                >
                  {!!date ? `${date.toDateString()}` : `Or pick DOB`}
                </Button>
                {show && (
                  <RNDateTimePicker
                    testID="dateTimePicker"
                    value={date || new Date()} // Fallback to today only for display, not submission
                    mode={mode}
                    onChange={onChange}
                    maximumDate={new Date()} // Prevent future dates
                  />
                )}
                <Button
                  onPress={handleSubmit}
                  mode="contained"
                  style={styles.submitButton}
                  labelStyle={styles.buttonLabel}
                  disabled={(!age && !date) || loading}
                  loading={loading}
                  icon="check"
                >
                  Submit
                </Button>
              </>
            )}
            {selectedChoice === "no" && (
              <Button
                onPress={handleSubmit}
                mode="contained"
                style={styles.submitButton}
                labelStyle={styles.buttonLabel}
                disabled={loading}
                loading={loading}
                icon="check"
              >
                Submit
              </Button>
            )}
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF", // Light pet-friendly background
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: "NotoSans-Black",
    fontSize: 28,
    color: "#333",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    fontFamily: "NotoSans-Regular",
    textAlign: "center",
  },
  listContainer: {
    paddingVertical: 10,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  cardContainer: {
    flex: 1,
    margin: 8,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  selectedBorder: {
    borderWidth: 3,
    borderColor: "#4CAF50", // Green for selection
  },
  cardContent: {
    alignItems: "center",
    padding: 20,
  },
  cardText: {
    fontFamily: "NotoSans-Bold",
    color: "#333",
    marginTop: 4,
  },
  selectedText: {
    color: "#4CAF50",
  },
  input: {
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  imageContainer: {
    alignItems: "center",
    padding: 10,
  },
  image: {
    height: 200,
    width: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignSelf: "center",
    backgroundColor: "#f0f0f0",
  },
  selectImageText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#4CAF50",
    alignSelf: "center",
    marginBottom: 20,
    textDecorationLine: "underline",
  },
  continueButton: {
    marginVertical: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  skipButton: {
    marginVertical: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  skipButtonLabel: {
    fontFamily: "NotoSans-Bold",
    fontSize: 16,
    color: "#4CAF50",
  },
  dateButton: {
    marginVertical: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  dateButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  subHeader: {
    fontFamily: "NotoSans-Bold",
    fontSize: 18,
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  submitButton: {
    marginVertical: 20,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonLabel: {
    fontSize: 18,
    fontFamily: "NotoSans-Bold",
    color: "#fff",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC", // Disabled state color
  },
});
