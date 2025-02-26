import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

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
    icon: "a",
  },
];

const PetCard = ({
  pet,
  handlePress,
  isIonicons,
}: {
  pet: { name: string; type: string; icon: string };
}) => (
  <Pressable onPress={handlePress} style={{ flex: 1 }}>
    <Card style={{ flex: 1, margin: 10, borderRadius: 12, elevation: 4 }}>
      <View style={{ alignItems: "center", padding: 20 }}>
        {isIonicons ? (
          <Ionicons name={pet.icon} size={60} color="black" />
        ) : (
          <FontAwesome5 name={pet.icon} size={60} color="black" />
        )}
      </View>
      <Card.Content style={{ padding: 10 }}>
        <Text variant="titleMedium" style={{ color: "bold" }}>
          {pet.name}
        </Text>
      </Card.Content>
    </Card>
  </Pressable>
);

export default function AddPetScreen() {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  useEffect(() => {
    console.log({ species });
  }, [species]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
    console.log({ currentDate });
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const handleSubmit = async () => {
    const updates = {
      user_id: session?.user.id,
      species,
      birth_date: date,
      age,
      gender,
    };

    const { status } = await supabase.from("pets").upsert(updates);

    if (status === 200 || status === 201) {
      Alert.alert("Pet added successfully!");
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
                <PetCard pet={item} handlePress={() => setSpecies(item.type)} />
              )}
            />
          </View>
          <Button
            onPress={() => setCurrent(2)}
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
              Add your pet
            </Text>
          </View>
          <TextInput
            label="Your pet's name"
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
              backgroundColor: "#000",
            }}
            labelStyle={{ fontSize: 18, fontWeight: "bold" }}
          >
            Continue
          </Button>
        </View>
      )}
      {current === 2 && (
        <>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginTop: 10, fontSize: 24 }}>
              What is the gender of your {species}?
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
                  handlePress={() => setGender(item.type)}
                  isIonicons={true}
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
              What is the age or date of birth of your {species}?
            </Text>
          </View>
          <View>
            <Button onPress={showDatepicker}>Show date picker!</Button>
            {show && (
              <RNDateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                onChange={onChange}
              />
            )}
          </View>
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
          <Button
            onPress={handleSubmit}
            mode="contained"
            style={{
              marginTop: 16,
              paddingVertical: 8,
              borderRadius: 50,
            }}
            labelStyle={{ fontSize: 18, fontWeight: "bold" }}
            disabled={!species}
          >
            Submit
          </Button>
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
});
