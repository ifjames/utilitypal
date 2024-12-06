import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Animated, Dimensions, TouchableWithoutFeedback, ActivityIndicator, Alert } from "react-native";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { firebaseApp } from './db/firebase'; 

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation, route }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth(firebaseApp);
      const db = getFirestore(firebaseApp);
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Extract document ID dynamically from email
        const emailPrefix = currentUser.email.split("@")[0];
        const userDocRef = doc(db, "users", emailPrefix);

        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUser(userDoc.data()); // Set user data
          } else {
            //console.log("No such document!");
          }
        } catch (error) {
          //console.error("Error fetching user document:", error);
        }
      }
    };

    fetchUser();
  }, []);
  

  const [menuVisible, setMenuVisible] = useState(false); // Track menu visibility
  const menuAnimation = useRef(new Animated.Value(-screenWidth)).current; // Initial position off-screen
  const isAnimating = useRef(false); // To track if an animation is in progress

  const toggleMenu = () => {
    if (isAnimating.current) return; // Prevent toggle if animation is in progress

    isAnimating.current = true; // Start animation

    if (menuVisible) {
      // Close menu
      Animated.timing(menuAnimation, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setMenuVisible(false); // Update state after animation completes
        isAnimating.current = false; // Reset animation flag
      });
    } else {
      // Open menu
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setMenuVisible(true); // Update state after animation completes
        isAnimating.current = false; // Reset animation flag
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth()); // Signs out the user from Firebase
      navigation.replace("LoginRegister"); // Navigate back to login screen
    } catch (error) {
      //console.error("Error signing out:", error);
      // You can show an error message to the user if needed
    }
  };

  const handleOutsideTap = () => {
    if (menuVisible) {
      toggleMenu(); // Close the menu if open
    }
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
    <TouchableWithoutFeedback onPress={handleOutsideTap}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuIcon} onPress={toggleMenu}>
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile", { role: user.role })}>
            <Image
              source={require("../assets/profileicon.png")}
              style={styles.profileIcon}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>
              <Text style={styles.userName}>{user.name}!</Text>
            </Text>
          </View>
          <View style={styles.campusNavigation}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.campusImage}
            />
          </View>
          <View style={styles.needSection}>
            <Text style={styles.needTitle}>What do you need?</Text>
            <View style={styles.options}>
              <TouchableOpacity 
              style={styles.option}
              onPress={() => {
                const auth = getAuth(firebaseApp);
                const currentUser = auth.currentUser;
              
                if (currentUser && currentUser.email) {
                  const userId = currentUser.email.split('@')[0]; // Use email prefix as document ID
                  if (user && user.role === "Boarder") {
                    navigation.navigate("BoarderBills", { userId: userId, role: user.role });
                  } else if (user && user.role === "Landlord") {
                    navigation.navigate("BillCalculator", { role: user.role });
                  }
                } else {
                  Alert.alert("Error", "User is not authenticated or email is unavailable.");
                }
              }}
                  
              >
                <Image
                  source={require("../assets/news.png")}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Bills</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  if (user.role === "Boarder") {
                    navigation.navigate("Room", { role: user.role });
                  } else if (user.role === "Landlord") {
                    navigation.navigate("Admin", { role: user.role });
                  }
                }}
              >
                <Image
                  source={require("../assets/events.png")}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>{user.role === "Landlord" ? "Admin" : "Room"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  if (user.role === "Boarder") {
                    navigation.navigate("BoarderSchedule", { role: user.role });
                  } else if (user.role === "Landlord") {
                    navigation.navigate("LandlordSchedule", { role: user.role });
                  } else if (user.role === "Visitor") {
                    alert("You are a visitor only");
                  }
                }}
              >
                <Image
                  source={require("../assets/schedule.png")}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Animated.View
          style={[styles.menu, { transform: [{ translateX: menuAnimation }] }]}
        >
          <TouchableOpacity style={styles.closeMenu} onPress={toggleMenu}>
            <Text style={styles.closeMenuText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.menuHeader}>

            <View style={styles.profileSection}>
              <Image source={require("../assets/profileicon.png")} style={styles.menuProfileIcon} />
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileRole}>{user.role}</Text>
              </View>

              <TouchableOpacity onPress={() => navigation.navigate("Profile", { role: user.role })}>
                <Text style={styles.arrowButton}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>General</Text>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Language</Text>
              <Text style={styles.menuItemValue}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("FAQ")}
            >
              <Text style={styles.menuItemText}>FAQ</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  menuIcon: {
    width: 30,
    height: 20,
    marginTop: 20,
    justifyContent: "space-between",
  },
  menuBar: {
    width: "100%",
    height: 3,
    backgroundColor: "#DBC078",
    borderRadius: 2,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 20,
    backgroundColor: "#DBC078",
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: "#DBC078",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 18,
    color: "#fff",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  campusNavigation: {
    margin: 20,
    backgroundColor: "#FBF4DB",
    borderRadius: 15,
    padding: 20,
  },
  campusImage: {
    width: "100%",        
    height: 200,          
    resizeMode: "cover",  
    borderRadius: 10,     
  },
  
  needSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  needTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  option: {
    alignItems: "center",
    backgroundColor: "#FBF4DB",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: "30%",
  },
  optionIcon: {
    width: 45,
    height: 45,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#626262",
  },
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: screenWidth * 0.8,
    backgroundColor: "#FFF",
    zIndex: 10,
    padding: 20,
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
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  menuSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  menuItemValue: {
    fontSize: 16,
    color: "#666",
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
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
