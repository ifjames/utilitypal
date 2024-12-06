import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

const BillCalculatorScreen = () => {
  const [previousReading, setPreviousReading] = useState(0);
  const [currentReading, setCurrentReading] = useState(0);
  const [ratePerKwh, setRatePerKwh] = useState(0);
  const [numPeople, setNumPeople] = useState(0);
  const [peopleInputs, setPeopleInputs] = useState([]);
  const [billDetails, setBillDetails] = useState("");
  const [totalBill, setTotalBill] = useState(0);
  const navigation = useNavigation();

  const validateInputs = () => {
    if (previousReading === "" || currentReading === "" || ratePerKwh === "") {
      Alert.alert("Error", "Please fill in all the required fields before proceeding.");
      return false;
    }

    for (let i = 0; i < peopleInputs.length; i++) {
      const person = peopleInputs[i];
      if (person.name === "" || person.days === "" || person.days <= 0) {
        Alert.alert("Error", `Please enter valid information for Person ${i + 1}.`);
        return false;
      }
    }

    return true;
  };

  const calculateBill = () => {
    if (!validateInputs()) {
      return; 
    }

    const totalUsage = currentReading - previousReading; // Total kWh consumed
    const totalAmount = totalUsage * ratePerKwh; // Total bill amount based on total usage

    const totalDays = peopleInputs.reduce((sum, person) => sum + parseInt(person.days, 10), 0);

    let details = `Previous Reading: ${previousReading}\nCurrent Reading: ${currentReading}\n\n`;
    details += `Total kWh Consumed: ${totalUsage} kWh\nRate per kWh: ₱${parseFloat(ratePerKwh).toFixed(2)}\n\n`;

    const amountPerDay = totalAmount / totalDays;

    let totalPeopleAmount = 0;
    peopleInputs.forEach((person, index) => {
      const personName = person.name.trim() === "" ? `Person ${String.fromCharCode(65 + index)}` : person.name;
      

      const personAmount = amountPerDay * parseInt(person.days, 10);
      details += `${personName} (${person.days} days): ₱${personAmount.toFixed(2)}\n`;
      totalPeopleAmount += personAmount;
    });

    details += `\nTotal Bill: ₱${totalAmount.toFixed(2)}\n`; // Show total bill amount
    setBillDetails(details); // Set the details in the state
    setTotalBill(totalAmount); // Set the total bill in the state
  };

  useEffect(() => {
    if (numPeople > 15) {
      alert("The number of people cannot exceed 15.");
      setNumPeople(15);
    }
    const peopleArr = [];
    for (let i = 0; i < numPeople; i++) {
      peopleArr.push({ name: "", days: 0 });
    }
    setPeopleInputs(peopleArr);
  }, [numPeople]);

  const handlePeopleInputChange = (index, field, value) => {
    const updatedPeople = [...peopleInputs];
    updatedPeople[index][field] = value;
    setPeopleInputs(updatedPeople);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Bill Calculator</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text style={styles.label}>Previous Meter Reading</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter previous reading"
            keyboardType="numeric"
            value={String(previousReading)}
            onChangeText={setPreviousReading}
          />

          <Text style={styles.label}>Current Meter Reading</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter current reading"
            keyboardType="numeric"
            value={String(currentReading)}
            onChangeText={setCurrentReading}
          />

          <Text style={styles.label}>Rate per kWh</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter rate per kWh"
            keyboardType="numeric"
            value={String(ratePerKwh)}
            onChangeText={(value) => setRatePerKwh(value)} 
          />

          <Text style={styles.label}>Number of People</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of people"
            keyboardType="numeric"
            value={String(numPeople)}
            onChangeText={setNumPeople}
          />

          {peopleInputs.map((person, index) => (
            <View key={index} style={styles.peopleInput}>
              <Text style={styles.label}>Person {index + 1} Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter person's name"
                value={person.name}
                onChangeText={(value) => handlePeopleInputChange(index, "name", value)}
              />
              <Text style={styles.label}>Days</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number of days"
                keyboardType="numeric"
                value={String(person.days)}
                onChangeText={(value) => handlePeopleInputChange(index, "days", value)}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={calculateBill}>
            <Text style={styles.submitButtonText}>Calculate Bill</Text>
          </TouchableOpacity>

          {billDetails ? (
            <View style={styles.billDetailsContainer}>
              <Text style={styles.billDetails}>{billDetails}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F1",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: "3%",
    transform: [{ translateY: 12 }],
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  header: {
    backgroundColor: "#F1D5A8",
    padding: 50,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  form: {
    backgroundColor: "#FBF4DB",
    borderRadius: 15,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  peopleInput: {
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  billDetailsContainer: {
    marginTop: 20,
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  billDetails: {
    fontSize: 16,
    color: "#333",
  },
});

export default BillCalculatorScreen;
