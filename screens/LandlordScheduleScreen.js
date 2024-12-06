import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Dimensions, ScrollView, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, onSnapshot, getDocs, updateDoc } from 'firebase/firestore';
import { getReports, updateReportStatus, deleteReport } from "./db/storage"; 

const screenWidth = Dimensions.get("window").width;

const LandlordScheduleScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-screenWidth)).current;
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);
  const [joinedClasses, setJoinedClasses] = useState([]);

  // Toggle menu visibility
  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? -screenWidth : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(!menuVisible);
    });
  };

  // Fetch reports from AsyncStorage when component mounts
  useEffect(() => {
    const db = getFirestore();
  
    // Fetch users with role "Boarder"
    const fetchBoarders = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const boarders = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.role === "Boarder"); // Filter boarders
        return boarders;
      } catch (error) {
        console.error("Error fetching boarders:", error);
        return [];
      }
    };
  
    const updateReportRoom = async (reportId, room) => {
      try {
        const reportRef = doc(db, "reports", reportId);
        await updateDoc(reportRef, { room }); // Update the room field
      } catch (error) {
        console.error("Error updating room in report:", error);
      }
    };
  
    const reportsRef = collection(db, "reports");
  
    // Real-time listener for reports
    const unsubscribe = onSnapshot(
      reportsRef,
      async (querySnapshot) => {
        try {
          const boarders = await fetchBoarders(); // Fetch boarder data
          const updatedReports = querySnapshot.docs.map((doc) => {
            const reportData = doc.data();
            const boarder = boarders.find(
              (b) => b.name.toLowerCase() === reportData.boarderName.toLowerCase()
            ); // Match by name
            const room = boarder ? boarder.room : "Unknown";
  
            // Update room in the database if it's not up-to-date
            if (reportData.room !== room) {
              updateReportRoom(doc.id, room); // Call function to update Firestore
            }
  
            return {
              id: doc.id,
              ...reportData,
              room, // Use enriched room data
            };
          });
          setReports(updatedReports); // Update state with enriched data
        } catch (error) {
          console.error("Error processing reports:", error);
        }
      },
      (error) => {
        console.error("Error listening to reports:", error);
      }
    );
  
    return () => unsubscribe(); // Cleanup on unmount
  }, []);
  
  
  

  // Fetch user data from Firebase and Firestore
  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth();
      const userCredential = auth.currentUser;  // Get current authenticated user
      if (!userCredential) {
        Alert.alert("Error", "No user logged in.");
        return;
      }

      const user = userCredential;  // Current authenticated user
      const db = getFirestore();

      // Check the role based on the email or another field (here I assume 'role' is part of the user's document)
      const role = user.email.includes("boarder") ? "boarder1" : "landlord1";  // Example of determining role based on email

      const userDocRef = doc(db, "users", role);  // Use the role to get the correct document

      try {
        // Fetch user data from Firestore
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log("User Data: ", userData);  // Log to see if data is fetched properly
          setUser(userData);  // Set the user data to state
          setJoinedClasses(userData.joinedClasses || []);  // Set the joined classes or empty array if not present
        } else {
          Alert.alert("Error", "No user data found.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data.");
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUser();
  }, []);

  const handleApproval = async (index, status) => {
    const report = reports[index];
    if (!report || !report.id) {
      console.error("Invalid report or missing ID for approval");
      return;
    }
    try {
      await updateReportStatus(report.id, status); // Pass document ID
      const updatedReports = await getReports(); // Fetch updated reports
      setReports(updatedReports);
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };
  
  const handleDelete = async (index) => {
    const report = reports[index];
    if (!report || !report.id) {
      console.error("Invalid report or missing ID for deletion");
      return;
    }
    try {
      await deleteReport(report.id); // Pass document ID
      const updatedReports = await getReports(); // Fetch updated reports
      setReports(updatedReports);
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };
  

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Submitted Reports</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.reportsSection}>
          {reports.length === 0 ? (
            <Text>No reports submitted yet.</Text>
          ) : (
            reports.map((report, index) => (
              <View key={index} style={styles.reportCard}>

                <Text style={styles.reportSender}>Submitted by: {report.boarderName}</Text>
                <Text style={styles.reportRoom}>Room: {report.room}</Text>
  
                <Text style={styles.reportDescription}>{report.description}</Text>
                <Text style={styles.reportDate}>Submitted on: {report.date}</Text>
                <Text style={styles.reportStatus}>Status: {report.status}</Text>
  
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApproval(index, "Approved")}
                  >
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleApproval(index, "Declined")}
                  >
                    <Text style={styles.buttonText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(index)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
    paddingBottom: 20,
  },
  reportsSection: {
    padding: 20,
  },
  reportCard: {
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
  reportSender: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  reportRoom: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  reportDescription: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reportDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  reportStatus: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
  },
  declineButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#f0ad4e",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LandlordScheduleScreen;
