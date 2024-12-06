import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { auth, db } from "./db/firebase"; // Import auth and db from firebase.js
import { signInWithEmailAndPassword } from "firebase/auth"; // Import the sign-in function
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Extract document ID dynamically from the user's email
      const emailPrefix = email.split("@")[0]; // Use the email prefix as the document ID
      const userDocRef = doc(db, "users", emailPrefix);
  
      // Fetch user data from Firestore
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role; // Assuming the role is stored in Firestore
  
        // Show success alert and navigate based on the user's role
        Alert.alert("Login Successful", `Welcome ${userData.name || email}!`, [
          {
            text: "OK",
            onPress: () => {
              // Navigate to the appropriate screen based on role
              navigation.navigate("Home", { role });
            },
          },
        ]);
      } else {
        // Handle case where the user document is not found in Firestore
        Alert.alert("Error", "User document not found.");
      }
    } catch (error) {
      Alert.alert("Login Failed", "Invalid username or password.");
    }
  };
  

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.title}>Log in</Text>
          <Text style={styles.subtitle}>Welcome back, you've been missed!</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  scrollViewContainer: {
    padding: 10,
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#DBC078",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000000",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
  },
  logo: {
    width: 295,
    height: 60,
    borderRadius: 10,
    marginBottom: 50,
    resizeMode: "cover",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#DBC078",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
