import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions, ScrollView, Alert, ActivityIndicator } from "react-native";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth"; // Firebase Authentication
import { getFirestore, doc, getDoc, collection, getDocs, onSnapshot } from "firebase/firestore"; // Firebase Firestore
import { firebaseApp } from './db/firebase'; // Import Firebase config

const screenWidth = Dimensions.get("window").width;

export default function ProfileScreen({ route, navigation }) {
  const [user, setUser] = useState(null); // State to store user details
  const { role } = route.params; // Determine role from navigation parameters
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-screenWidth)).current;
  const [accounts, setAccounts] = useState([]);

  // Fetch current date
  const getCurrentDate = () => {
    const date = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-GB", options); 
    const dateParts = formattedDate.split(" ");
    if (dateParts.length > 3) {
      return `${dateParts[0]}, ${dateParts[1]} ${dateParts[2]}, ${dateParts[3]}`;
    }
    return formattedDate;
  };

  const [currentDate, setCurrentDate] = useState(getCurrentDate());

  // Fetch user data from Firebase Firestore based on role
  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth(firebaseApp);
      const userCredential = auth.currentUser; // Get the current authenticated user
      if (!userCredential) {
        Alert.alert("Error", "No user is logged in.");
        return;
      }
  
      const user = userCredential; // Authenticated user
      const db = getFirestore(firebaseApp);
  
      try {
        // Derive the document ID based on the email prefix
        const emailPrefix = user.email.split("@")[0]; // e.g., "boarder1" or "landlord1"
        const documentId = emailPrefix; // Assuming document IDs match the email prefix
  
        const userDocRef = doc(db, "users", documentId); // Reference to the specific user document
  
        // Fetch user data from Firestore
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          //console.log("User Data:", userData); // Log for debugging
          setUser(userData); // Set user data to state
        } else {
          Alert.alert("Error", "User data not found in the database.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data.");
        //console.error("Error fetching user data:", error);
      }
    };
  
    fetchUser();
  }, []);
  
  

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

  // Handle logout
  const handleLogout = async () => {
    const auth = getAuth(firebaseApp);
    await signOut(auth); // Sign out user from Firebase
    navigation.replace("LoginRegister"); // Navigate to the login screen
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F1D5A8" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.menu, { transform: [{ translateX: menuAnimation }] }]}>
        <TouchableOpacity onPress={toggleMenu} style={styles.closeMenu}>
          <Text style={styles.closeMenuText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.profileSection}>
          <Image source={require("../assets/profileicon.png")} style={styles.menuProfileIcon} />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileRole}>{user.role}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.arrowButton}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.generalSection}>
          <Text style={styles.generalTitle}>General</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home", { role: user.role })}
            style={styles.menuItem}
          >
            <Text style={styles.menuText}>Home</Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <View style={styles.menuBar} />
          <View style={styles.menuBar} />
          <View style={styles.menuBar} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <Image source={require("../assets/profileicon.png")} style={styles.profileIcon} />
      </View>

      <ScrollView>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>{user.role}</Text>

          <View style={styles.detailsRow}>
            {user.role === "Boarder" && <Text style={styles.detailsText}>{user.room}</Text>}
          </View>
        </View>

        {user.role === "Boarder" && (
          <View style={styles.statisticsSection}>
            <Text style={styles.statisticsTitle}>Statistics</Text>
            <Text style={styles.date}>{currentDate}</Text>

            <View style={styles.statisticsRow}>
              <View style={styles.statItem}>
                <Image source={require("../assets/attendance.png")} style={styles.statIcon} />
                <Text style={styles.statLabel}>Bill Status</Text>
                <Text style={styles.statValue}>{user.billstatus}%</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: screenWidth * 0.8,
    backgroundColor: "#FFF",
    zIndex: 10,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  closeMenu: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: 30,
  },
  closeMenuText: {
    fontSize: 20,
    color: "#DBC078",
  },
  menuContent: {
    marginTop: 20,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  menuText: {
    fontSize: 18,
    color: "#333",
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
  menuButton: {
    width: 30,
    height: 20,
    justifyContent: "space-between",
  },
  menuBar: {
    width: "100%",
    height: 3,
    backgroundColor: "#DBC078",
    borderRadius: 2,
  },
  closeMenu: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: 20,
  },
  closeMenuText: {
    fontSize: 20,
    color: "#DBC078",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  menuProfileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  profileRole: {
    fontSize: 14,
    color: "#DBC078",
  },
  arrowButton: {
    fontSize: 24,
    color: "#DBC078",
  },
  generalSection: {
    marginTop: 20,
  },
  generalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  menuText: {
    fontSize: 18,
    color: "#333",
  },
  logoutButton: {
    marginTop: "auto",
    alignSelf: "center",
    backgroundColor: "#DBC078",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  role: {
    fontSize: 16,
    color: "#DBC078",
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  detailsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  statisticsSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#FFF2E5",
    borderRadius: 10,
    marginHorizontal: 20,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontWeight: "bold",
  },
  statisticsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    width: "45%",
  },
  statIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: "#333",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DBC078",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
});
