import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { getFirestore, collection, doc, setDoc, onSnapshot, query, where, getDocs} from "firebase/firestore";
import { firebaseApp } from "./db/firebase"; 
import { useNavigation } from "@react-navigation/native"; 

const BillCalcuScreen = () => {
  const [usage, setUsage] = useState(""); // Input for current reading (kWh)
  const [previousReading, setPreviousReading] = useState(""); // Input for previous reading (kWh)
  const [ratePerKWh, setRatePerKWh] = useState(""); // Rate per kWh
  //water
    const [prevWaterReading, setPrevWaterReading] = useState("");
    const [currWaterReading, setCurrWaterReading] = useState("");
    const [waterBillDetails, setWaterBillDetails] = useState(null);
  const [roomNumber, setRoomNumber] = useState(""); // Room number input
  const [dueDate, setDueDate] = useState(""); // Store due date
  const [billDetails, setBillDetails] = useState(null); // Store bill details for display
  const [rooms, setRooms] = useState([]); // Store rooms with Pax information
  const [boarders, setBoarders] = useState([]); // Store boarders in each room
  const db = getFirestore(firebaseApp); // Firestore instance
  const navigation = useNavigation(); // For back navigation

  // Fetch room details and boarders from Firestore when the component mounts
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), async (snapshot) => {
      const fetchedRooms = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const roomData = { id: doc.id, ...doc.data() };
  
          // Query users collection to count boarders in this room
          const q = query(collection(db, "users"), where("room", "==", doc.id));
          const userSnapshot = await getDocs(q);
          roomData.pax = userSnapshot.size; // Number of boarders in this room
  
          return roomData;
        })
      );
  
      setRooms(fetchedRooms); // Update the rooms state with dynamic pax
    });
  
    return () => unsubscribe();
  }, []);
  

  // Fetch boarders associated with the room number
  useEffect(() => {
    if (roomNumber) {
        const q = query(
            collection(db, "users"),
            where("room", "==", roomNumber.trim()) // Ensure no extra spaces
          );
          
      const unsubscribe = onSnapshot(q, (snapshot) => {

        snapshot.forEach((doc) => console.log("Fetched boarder:", doc.data()));
        if (!snapshot.empty) {
            const fetchedBoarders = snapshot.docs.map((doc) => doc.id); // Get boarder IDs
           // console.log("Fetched Boarders:", fetchedBoarders); // Debugging line
            setBoarders(fetchedBoarders); // Set the fetched boarders
        } else {
           // console.warn(`No boarders found for room ${roomNumber}`);
            setBoarders([]); // Clear boarders when no matches
        }
        
      });
  
      return () => unsubscribe(); // Clean up on unmount
    } 
  }, [roomNumber]);
  
  const calculateWaterBill = () => {
    if (!prevWaterReading || !currWaterReading || !dueDate) {
      Alert.alert("Validation Error", "Please fill in all water bill fields.");
      return;
    }
  
    const consumedWater = parseFloat(currWaterReading) - parseFloat(prevWaterReading);
    if (consumedWater < 0) {
      Alert.alert("Error", "Current reading must be greater than or equal to previous reading.");
      return;
    }
  
    // Define the rate tiers
    const firstTierRate = 187.00; // First 10 m³
    const secondTierRate = 23.25; // Next 10 m³
    const thirdTierRate = 29.25; // Next 10 m³
    const fourthTierRate = 35.75; // Next 10 m³
    const fifthTierRate = 43.00; // Over 50 m³
  
    // Compute the total charge based on consumption
    let totalCharge = 0;
  
    // First 10 m³ (fixed rate)
    const firstTier = Math.min(consumedWater, 10);
    totalCharge += firstTier > 0 ? firstTierRate : 0;
  
    // Second 10 m³ (per m³ rate)
    const secondTier = Math.min(consumedWater - 10, 10);
    totalCharge += secondTier > 0 ? secondTier * secondTierRate : 0;
  
    // Third 10 m³ (per m³ rate)
    const thirdTier = Math.min(consumedWater - 20, 10);
    totalCharge += thirdTier > 0 ? thirdTier * thirdTierRate : 0;
  
    // Fourth 10 m³ (per m³ rate)
    const fourthTier = Math.min(consumedWater - 30, 10);
    totalCharge += fourthTier > 0 ? fourthTier * fourthTierRate : 0;
  
    // Fifth 10 m³ (per m³ rate)
    const fifthTier = Math.max(consumedWater - 40, 0);
    totalCharge += fifthTier > 0 ? fifthTier * fifthTierRate : 0;
  
    // Calculate VAT
    const vat = totalCharge * 0.12;
  
    // Calculate total bill with VAT
    const totalWaterBill = totalCharge + vat;
  
    // Update water bill state
    const waterData = {
      prevReading: prevWaterReading,
      currReading: currWaterReading,
      consumed: consumedWater.toFixed(2),
      waterCharge: totalCharge.toFixed(2),
      vat: vat.toFixed(2),
      totalBill: totalWaterBill.toFixed(2),
    };
  
    setWaterBillDetails(waterData);
  };
  


  
  // Calculate the bill based on room number, previous reading, current reading, and rate per kWh
  const calculateBill = () => {
    if (!previousReading || !usage || !ratePerKWh || !roomNumber || !dueDate) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }
    if (!boarders.length) {
        Alert.alert("Error", "No boarders found in the selected room.");
        return;
      }
      
   
    // Find the room using the room number
    const normalizedRoomNumber = roomNumber.trim().toLowerCase();
    const room = rooms.find(
    (room) => room.id.toLowerCase() === normalizedRoomNumber
    );

  
    if (!room) {
      Alert.alert("Room Not Found", "Please enter a valid room number.");
      return;
    }
  
    // Calculate pax dynamically based on boarders length
    const pax = boarders.length; // Count the number of users in the room
  
    const totalKWhConsumed = parseFloat(usage) - parseFloat(previousReading); // Calculate total kWh consumed
    const totalBill = totalKWhConsumed * parseFloat(ratePerKWh); // Calculate total bill
  
    // Store bill details
    const billData = {
      roomNumber: roomNumber,
      previousReading: previousReading,
      currentReading: usage,
      totalKWhConsumed: totalKWhConsumed.toFixed(2),
      ratePerKWh: parseFloat(ratePerKWh).toFixed(2),
      totalBill: totalBill.toFixed(2), // Total bill
      pax: pax, // Use dynamic pax
      sharePerPax: (totalBill / pax).toFixed(2), // Share per pax
    };
  
    setBillDetails(billData); // Set bill details
  };
  

  // Send the bill to Firestore
  const sendBill = async () => {
    if (!billDetails || !waterBillDetails) {
      Alert.alert("Error", "Both electric and water bill details are required.");
      return;
    }
  
    const billRef = doc(collection(db, "bills"), roomNumber + "_" + new Date().toISOString());
  
    try {
      // Combine electric and water bill details
      const combinedBillDetails = {
        roomNumber: billDetails.roomNumber,
        dueDate: dueDate,
        createdAt: new Date().toISOString(), // Add created date
        electricBill: billDetails, // Store electric bill details
        waterBill: waterBillDetails, // Store water bill details
      };
  
      // Add combined bill data to Firestore
      await setDoc(billRef, combinedBillDetails);
  
      // Send the bill to each boarder in the room
      for (const boarderId of boarders) {
        const boarderRef = doc(db, "users", boarderId);
        await setDoc(boarderRef, { billSent: true }, { merge: true }); // Mark that the bill has been sent
      }
  
      Alert.alert("Success", "Bill has been sent successfully.");
    } catch (error) {
      console.error("Error sending bill: ", error);
      Alert.alert("Error", "There was an error sending the bill.");
    }
  };
  

  const handleCalculateBoth = () => {
    calculateWaterBill();
    calculateBill();
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Your Bills</Text>
                    <Image source={require("../assets/profileicon.png")} style={styles.profileIcon} />
                </View>
            </View>

      <View style={styles.form}>
        <Text style={styles.label}>Room Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter room number (e.g., room1)"
          value={roomNumber}
          onChangeText={setRoomNumber}
        />

        <Text style={styles.label}>Previous Reading (kWh)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter previous reading"
          value={previousReading}
          onChangeText={setPreviousReading}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Current Reading (kWh)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter current reading"
          value={usage}
          onChangeText={setUsage}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Rate per kWh (₱)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter rate per kWh"
          value={ratePerKWh}
          onChangeText={setRatePerKWh}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Due Date</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter due date (YYYY-MM-DD)"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <Text style={styles.label}>Previous Water Reading</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter previous water reading"
        value={prevWaterReading}
        onChangeText={setPrevWaterReading}
        keyboardType="numeric"
        />

        <Text style={styles.label}>Current Water Reading</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter current water reading"
        value={currWaterReading}
        onChangeText={setCurrWaterReading}
        keyboardType="numeric"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleCalculateBoth}>
          <Text style={styles.submitButtonText}>Calculate Bill</Text>
        </TouchableOpacity>
      </View>

      {billDetails && (
        <View style={styles.receiptSection}>
          <Text style={styles.receiptTitle}>Electric Bill Receipt</Text>
          <Text style={styles.receiptText}>Room: {billDetails.roomNumber}</Text>
          <Text style={styles.receiptText}>Previous Reading: {billDetails.previousReading} kWh</Text>
          <Text style={styles.receiptText}>Current Reading: {billDetails.currentReading} kWh</Text>
          <Text style={styles.receiptText}>Total kWh Consumed: {billDetails.totalKWhConsumed} kWh</Text>
          <Text style={styles.receiptText}>Rate per kWh: {billDetails.ratePerKWh} ₱</Text>
          <Text style={styles.receiptText}>Total Bill: ₱{billDetails.totalBill}</Text>
          <Text style={styles.receiptText}>Pax: {billDetails.pax}</Text>
          <Text style={styles.receiptText}>Share per Pax: ₱{billDetails.sharePerPax}</Text>
          <Text style={styles.receiptText}>Due Date: {dueDate}</Text>
        </View>
      )}

      {waterBillDetails && (
          <View style={styles.receiptSection}>
              <Text style={styles.receiptTitle}>Water Bill Receipt</Text>
              <Text style={styles.receiptText}>Previous Reading: {waterBillDetails.prevReading}</Text>
              <Text style={styles.receiptText}>Current Reading: {waterBillDetails.currReading}</Text>
              <Text style={styles.receiptText}>Consumed: {waterBillDetails.consumed} m³</Text>
              <Text style={styles.receiptText}>Water Charge: ₱{waterBillDetails.waterCharge}</Text>
              <Text style={styles.receiptText}>VAT (12%): ₱{waterBillDetails.vat}</Text>
              <Text style={styles.receiptText}>Total Water Bill: ₱{waterBillDetails.totalBill}</Text>
          </View>
      )}


      {billDetails && (
        <TouchableOpacity style={styles.sendButton} onPress={sendBill}>
          <Text style={styles.sendButtonText}>Send Bill</Text>
        </TouchableOpacity>
      )}

      <View style={styles.roomsListSection}>
  <Text style={styles.listTitle}>Rooms List</Text>
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    {rooms.map((room, index) => (
      <View key={index} style={styles.roomCard}>
        <Text style={styles.roomName}>{room.id}</Text>
        <Text style={styles.roomPax}>Pax: {room.pax}</Text>
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
        top: "20%", 
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
    headerTitle: {
        fontSize: 20,
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
  receiptSection: {
    padding: 20,
    backgroundColor: "#FBF4DB",
    borderRadius: 15,
    margin: 20,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  receiptText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#666",
  },
  sendButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    margin: 20,
  },
  sendButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  roomsListSection: {
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
  roomCard: {
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
  roomName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  roomPax: {
    fontSize: 14,
    color: "#666",
  },
});

export default BillCalcuScreen;