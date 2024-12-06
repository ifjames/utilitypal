import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, query, where, onSnapshot } from 'firebase/firestore';  
import { useNavigation } from '@react-navigation/native';  

const ScheduleForm = () => {
  const [issueDescription, setIssueDescription] = useState("");
  const [submitDate] = useState(new Date().toLocaleDateString());  // Automatically set the date
  const [user, setUser] = useState(null);  // To store the user data (Boarder’s info)
  const [loading, setLoading] = useState(true);  // For handling the loading state
  const [reports, setReports] = useState([]);  // Track all reports with their status
  const navigation = useNavigation();  // Initialize navigation
  
  // Fetch user data (name, room, role) from Firebase when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth();  // Get Firebase auth
      const userCredential = auth.currentUser;  // Get current authenticated user
  
      if (!userCredential) {
        Alert.alert("Error", "No user logged in.");
        return;
      }
  
      const user = userCredential;  // Current authenticated user
      const db = getFirestore();  // Initialize Firestore
  
      // Derive the user document name (e.g., 'boarder1', 'landlord1') based on email
      const emailPrefix = user.email.split("@")[0];  // Get the part before '@'
      const userDocRef = doc(db, "users", emailPrefix);  // Reference the user document by email prefix
  
      try {
        // Fetch user data from Firestore
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log("User Data: ", userData);  // Log to see if data is fetched properly
          setUser(userData);  
        } else {
          Alert.alert("Error", "No user data found.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data.");
        console.error("Error fetching user data: ", error);
      } finally {
        setLoading(false);  // Stop the loading once the data is fetched
      }
    };
    
    const fetchReports = async () => {
      if (!user || !user.name) return;  // Ensure user data is available
      
      try {
        const db = getFirestore();
        const reportsCollection = collection(db, "reports");
        
        // Query reports based on the boarder's name (matching boarderName field)
        const userReportsQuery = query(
          reportsCollection,
          where("boarderName", "==", user.name)  // Match reports by boarderName
        );
        
        const querySnapshot = await getDocs(userReportsQuery);
        
        // Map the results into an array
        const userReports = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
    
        console.log("Fetched User Reports: ", userReports);  // Debugging log
        setReports(userReports);  // Update state with the user's reports
      } catch (error) {
        console.error("Error fetching reports: ", error);
      }
    };

    fetchReports();
    fetchUser();  // Fetch user data
  }, []);
  
  useEffect(() => {
    const fetchReports = async () => {
      if (!user || !user.name) return; 
  
      try {
        const db = getFirestore();
        const reportsCollection = collection(db, "reports");
  
        const userReportsQuery = query(
          reportsCollection,
          where("boarderName", "==", user.name)  // Match reports by boarderName
        );
  
        // Use onSnapshot to listen for real-time updates
        const unsubscribe = onSnapshot(userReportsQuery, (querySnapshot) => {
          const userReports = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          console.log("Fetched User Reports: ", userReports);  // Debugging log
          setReports(userReports);  // Update state with the user's reports
        });

        return () => unsubscribe();
  
      } catch (error) {
        console.error("Error fetching reports: ", error);
      }
    };
  
    fetchReports();
  }, [user]);  // The effect will re-run when the user data changes
  

  // Function to store a new report
  const storeReport = async (report) => {
    try {
      const db = getFirestore();  // Initialize Firestore here
      console.log("Attempting to store report:", report);  // Log to check if the function is triggered
      const collectionRef = collection(db, "reports");  // Get the reports collection

      // Use addDoc to store the report with proper fields
      await addDoc(collectionRef, {
        boarderName: report.boarderName,
        date: report.date,
        description: report.description,
        room: report.room,
        status: report.status,
      });

      console.log("Report stored successfully:", report);  // Log if successfully stored
    } catch (error) {
      console.error("Error storing report:", error);  // Log the error if something fails
    }
  };

  const fetchReports = async () => {
    if (!user || !user.name) return;  // Ensure user data is available
    
    try {
      const db = getFirestore();
      const reportsCollection = collection(db, "reports");
      
      // Query reports based on the boarder's name (matching boarderName field)
      const userReportsQuery = query(
        reportsCollection,
        where("boarderName", "==", user.name)  // Match reports by boarderName
      );
      
      const querySnapshot = await getDocs(userReportsQuery);
      
      // Map the results into an array
      const userReports = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      console.log("Fetched User Reports: ", userReports);  // Debugging log
      setReports(userReports);  // Update state with the user's reports
    } catch (error) {
      console.error("Error fetching reports: ", error);
    }
  };
  
  

  // Handle form submission
  const handleSubmit = async () => {
    if (!issueDescription.trim()) {
      alert("Please describe the issue.");
      return;
    }
  
    if (user) {
      const newReport = {
        description: issueDescription,
        date: submitDate,
        status: "Pending",  // Status is initially Pending
        boarderName: user.name,
        room: user.room || "Not Assigned",
      };
  
      console.log("Submitting new report: ", newReport);  // Log to ensure data is correct
  
      try {
        await storeReport(newReport); 
        alert("Your issue has been submitted for review.");
        setIssueDescription("");  // Clear the input field after submission
  
        // Add a small delay before fetching reports again to ensure Firestore has time to sync
        setTimeout(() => {
          fetchReports();  // Update the list of reports after a short delay
        }, 1000);  // Adjust the delay time as needed (1000ms = 1 second)
      } catch (error) {
        alert("Error submitting your report.");
        console.error("Error submitting report:", error);
      }
    } else {
      alert("User data is not available.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F1D5A8" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Submit Issue</Text>
        <Image source={require("../assets/profileicon.png")} style={styles.profileIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text style={styles.label}>Issue Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe the issue"
            value={issueDescription}
            onChangeText={setIssueDescription}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.reportStatusSection}>
        <Text style={styles.statusTitle}>Your Report Status</Text>
        <ScrollView>
          {reports.length > 0 ? (
            reports.map((report, index) => (
              <View key={index} style={styles.reportCard}>
                <Text style={styles.reportDescription}>{report.description}</Text>
                <Text style={styles.reportDate}>Submitted on: {report.date}</Text>
                <Text style={styles.reportStatus}>Status: {report.status}</Text>
              </View>
            ))
          ) : (
            <Text>No reports found.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F1",
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
  header: {
    backgroundColor: "#F1D5A8",
    padding: 50,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    left: 20,
    color: "#000",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  reportStatusSection: {
    padding: 20,
    backgroundColor: "#FBF4DB",
    borderRadius: 15,
    margin: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
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
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ScheduleForm;
