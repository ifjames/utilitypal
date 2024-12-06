import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const RoommatesList = () => {
  const [user, setUser] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const userCredential = auth.currentUser;

      if (!userCredential) {
        Alert.alert("Error", "No user logged in.");
        return;
      }

      const emailPrefix = userCredential.email.split('@')[0];
      const userDocRef = doc(db, "users", emailPrefix);

      try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const currentUser = userDocSnap.data();
          setUser(currentUser);
          await fetchRoommates(currentUser.room);
        } else {
          Alert.alert("Error", "User not found.");
        }
      } catch (error) {
       // console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to fetch user data.");
      }
    };

    fetchUser();
  }, []);

  const fetchRoommates = (room) => {
    const roommatesQuery = query(
      collection(db, "users"),
      where("room", "==", room),
      where("role", "==", "Boarder") // Only boarders, not landlords
    );

    // Listen for real-time updates to roommates data
    const unsubscribe = onSnapshot(roommatesQuery, (querySnapshot) => {
      const fetchedRoommates = querySnapshot.docs
        .map(doc => doc.data())
        .filter(roommate => roommate.name && roommate.name !== user?.name); // Check that roommate has a name

      setRoommates(fetchedRoommates);
      setLoading(false);
    }, (error) => {
     // console.error("Error fetching roommates:", error);
      Alert.alert("Error", "Failed to fetch roommates.");
    });

    // Cleanup on component unmount
    return () => unsubscribe();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F1D5A8" />
        <Text style={styles.loadingText}>Loading Roommates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Roommates List</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {roommates.length === 0 ? (
          <Text style={styles.noRoommates}>No roommates yet.</Text>
        ) : (
          roommates.map((roommate, index) => (
            <View key={index} style={styles.roommateCard}>
              <Text style={styles.roommateName}>{roommate.name}</Text>
              <Text style={styles.roommateDetails}>Room: {roommate.room}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F1",
  },
  header: {
    backgroundColor: "#F1D5A8",
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 1,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: "3%",
    transform: [{ translateY: 12 }],
    padding: 12,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  scrollContainer: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  noRoommates: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 30,
  },
  roommateCard: {
    backgroundColor: "#FFF",
    padding: 20,
    marginTop: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#F1D5A8",
    marginBottom: 10,
  },
  roommateName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  roommateDetails: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8F1",
  },
  loadingText: {
    fontSize: 18,
    color: "#F1D5A8",
    marginTop: 10,
  },
});

export default RoommatesList;
