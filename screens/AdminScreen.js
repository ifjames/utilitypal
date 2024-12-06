import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { getFirestore, collection, getDocs, doc, setDoc, onSnapshot } from "firebase/firestore";
import { firebaseApp } from "./db/firebase"; 
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const AdminScreen = () => {
  const [boarderName, setBoarderName] = useState(""); // Input for the boarder's name
  const [newRoom, setNewRoom] = useState(""); // Input for the new room number
  const [accounts, setAccounts] = useState([]); // Store all accounts
  const navigation = useNavigation(); // Initialize navigation
  const db = getFirestore(firebaseApp); // Firestore instance
  const auth = getAuth(firebaseApp); // Firebase Auth instance

  // Fetch accounts when the component mounts
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const fetchedAccounts = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.role === "Boarder"); // Filter boarders only
      setAccounts(fetchedAccounts);
    }, (error) => {
      console.error("Error fetching accounts in real-time:", error);
      Alert.alert("Error", "Failed to fetch accounts. Please try again.");
    });
  
    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);
  

  // Handle room change for a boarder
  const handleRoomChange = async () => {
    if (!boarderName || !newRoom) {
      Alert.alert("Validation Error", "Please fill in both fields.");
      return;
    }
  
    // Find the boarder by name
    const boarder = accounts.find(
      (account) => account.name.toLowerCase() === boarderName.toLowerCase()
    );
  
    if (!boarder) {
      Alert.alert("Not Found", "Boarder not found.");
      return;
    }
  
    try {
      const boarderRef = doc(db, "users", boarder.id); // Reference to the specific user document
      await setDoc(boarderRef, { room: newRoom }, { merge: true }); // Update the room in the users collection
  
      // Find and update all reports for this boarder
      const reportsRef = collection(db, "reports");
      const querySnapshot = await getDocs(reportsRef);
      const reportsToUpdate = querySnapshot.docs.filter(
        (doc) => doc.data().boarderName.toLowerCase() === boarderName.toLowerCase()
      );
  
      const updatePromises = reportsToUpdate.map((report) =>
        setDoc(report.ref, { room: newRoom }, { merge: true }) // Update the room in each matching report
      );
  
      await Promise.all(updatePromises); // Wait for all updates to complete
  
      Alert.alert("Success", "Boarder's room and related reports have been updated successfully.");
  
      // Clear the inputs
      setBoarderName("");
      setNewRoom("");
    } catch (error) {
      console.error("Error updating room:", error);
      Alert.alert("Error", "Failed to update the boarder's room.");
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Boarder Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter boarder's name"
          value={boarderName}
          onChangeText={setBoarderName}
        />

        <Text style={styles.label}>New Room</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new room number (e.g., Room1, Room2)"
          value={newRoom}
          onChangeText={setNewRoom}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleRoomChange}>
          <Text style={styles.submitButtonText}>Apply Changes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.boardersListSection}>
        <Text style={styles.listTitle}>Boarders List</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {accounts.map((boarder, index) => (
            <View key={index} style={styles.boarderCard}>
              <Text style={styles.boarderName}>{boarder.name}</Text>
              <Text style={styles.boarderRoom}>Room: {boarder.room}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
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
  form: {
    padding: 20,
    backgroundColor: "#FBF4DB",
    borderRadius: 15,
    margin: 20,
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
  boardersListSection: {
    padding: 20,
    backgroundColor: "#FBF4DB",
    borderRadius: 15,
    margin: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  boarderCard: {
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  boarderName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  boarderRoom: {
    fontSize: 14,
    color: "#666",
  },
});

export default AdminScreen;
