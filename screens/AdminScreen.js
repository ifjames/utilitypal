import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { getFirestore, collection, onSnapshot, setDoc, doc, getDocs, query, where } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "./db/firebase"; 
import { useNavigation } from "@react-navigation/native";

const AdminScreen = () => {
  const [boarderName, setBoarderName] = useState(""); // Input for the boarder's name
  const [newRoom, setNewRoom] = useState(""); // Input for the new room number
  const [role, setRole] = useState(""); // Input for role (Boarder or Landlord)
  const [email, setEmail] = useState(""); // Input for email (e.g., boarder1@gmail.com)
  const [password, setPassword] = useState(""); // Input for password
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
      Alert.alert("Success", "Boarder's room has been updated successfully.");

      // Clear the inputs
      setBoarderName("");
      setNewRoom("");
    } catch (error) {
      console.error("Error updating room:", error);
      Alert.alert("Error", "Failed to update the boarder's room.");
    }
  };

  // Handle creating a new boarder
  const handleCreateBoarder = async () => {
    if (!boarderName || !role || !email || !password) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }
  
    try {
      // Check if an account with the same email already exists in Firestore
      const emailQuery = query(collection(db, "users"), where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);
  
      if (!emailSnapshot.empty) {
        Alert.alert("Error", "An account with this email already exists.");
        return;
      }
  
      // Check if a boarder with the same name already exists
      const nameQuery = query(collection(db, "users"), where("name", "==", boarderName));
      const nameSnapshot = await getDocs(nameQuery);
  
      if (!nameSnapshot.empty) {
        Alert.alert("Error", "A boarder with this name already exists.");
        return;
      }
  
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Generate custom document ID for the boarder (e.g., "boarder1", "boarder10")
      const boarderDocumentId = `boarder${user.email.split('@')[0].replace('boarder', '')}`;
  
      // Add the new user to Firestore under "users" collection with the custom ID
      await setDoc(doc(db, "users", boarderDocumentId), {
        name: boarderName,
        role: role,
        room: "None", // Default value for room
        billSent: false, // Default billSent status
        billsdue: 0, // Default bills due
        billstatus: 0, // Default bill status
        email: email, // Store email as well
      });
  
      Alert.alert("Success", "New boarder account created successfully.");
  
      // Clear the inputs
      setBoarderName("");
      setRole("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error creating boarder:", error);
      Alert.alert("Error", "Failed to create boarder account.");
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
          placeholder="Enter new room number"
          value={newRoom}
          onChangeText={setNewRoom}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleRoomChange}>
          <Text style={styles.submitButtonText}>Change Room</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Boarder Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter boarder's name"
          value={boarderName}
          onChangeText={setBoarderName}
        />

        <Text style={styles.label}>Role</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter role (Boarder or Landlord)"
          value={role}
          onChangeText={setRole}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email (e.g., boarder1@gmail.com)"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleCreateBoarder}>
          <Text style={styles.submitButtonText}>Create Account</Text>
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
