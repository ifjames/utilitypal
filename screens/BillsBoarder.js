import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from "react-native";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { firebaseApp } from "./db/firebase";
import { useNavigation } from "@react-navigation/native";

const BillsBoarderScreen = ({ route }) => {
    const { userId } = route.params;
    const [bills, setBills] = useState([]);
    const [roomNumber, setRoomNumber] = useState(null);
    const db = getFirestore(firebaseApp);
    const navigation = useNavigation();

    // Fetch boarder's room number
    useEffect(() => {
        if (userId) {
            const userRef = doc(db, "users", userId);
            const fetchUserData = async () => {
                try {
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        const boarderData = docSnap.data();
                        setRoomNumber(boarderData.room);
                    } else {
                        Alert.alert("Error", "User information not found.");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    Alert.alert("Error", "Failed to fetch user data.");
                }
            };
            fetchUserData();
        }
    }, [userId]);

    // Fetch bills for the room
    useEffect(() => {
        if (roomNumber) {
            const billsQuery = query(collection(db, "bills"), where("roomNumber", "==", roomNumber.trim()));
            const unsubscribe = onSnapshot(billsQuery, async (snapshot) => {
                const fetchedBills = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setBills(fetchedBills);
    
                // Update the user's bill status
                try {
                    const userRef = doc(db, "users", userId);
                    await getDoc(userRef); // Ensure user exists before updating
                    await updateDoc(userRef, { billstatus: fetchedBills.length }); // Update bill count
                } catch (error) {
                    console.error("Error updating bill status:", error);
                }
            });
    
            return () => unsubscribe();
        }
    }, [roomNumber]);
    

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

            <View style={styles.billsSection}>
                {bills.length > 0 ? (
                    bills.map((bill) => (
                        <View key={bill.id} style={styles.billCard}>
                            <Text style={styles.billTitle}>Bill for Room {bill.roomNumber}</Text>
                            <Text style={styles.billDetail}>Issued At: {new Date(bill.createdAt).toLocaleDateString()}</Text>
                            <Text style={styles.billDetail}>Due Date: {bill.dueDate}</Text>

                            {bill.electricBill && (
                                <>
                                    <Text style={styles.billSubTitle}>Electric Bill:</Text>
                                    <Text style={styles.billDetail}>Previous Reading: {bill.electricBill.previousReading} kWh</Text>
                                    <Text style={styles.billDetail}>Current Reading: {bill.electricBill.currentReading} kWh</Text>
                                    <Text style={styles.billDetail}>Total Consumed: {bill.electricBill.totalKWhConsumed} kWh</Text>
                                    <Text style={styles.billDetail}>Rate per kWh: ₱{bill.electricBill.ratePerKWh}</Text>
                                    <Text style={styles.billDetail}>Total Bill: ₱{bill.electricBill.totalBill}</Text>
                                    <Text style={styles.billDetail}>Share per Pax: ₱{bill.electricBill.sharePerPax}</Text>
                                </>
                            )}

                            {bill.waterBill && (
                                <>
                                    <Text style={styles.billSubTitle}>Water Bill:</Text>
                                    <Text style={styles.billDetail}>Previous Reading: {bill.waterBill.prevReading} m³</Text>
                                    <Text style={styles.billDetail}>Current Reading: {bill.waterBill.currReading} m³</Text>
                                    <Text style={styles.billDetail}>Consumed: {bill.waterBill.consumed} m³</Text>
                                    <Text style={styles.billDetail}>Basic Charge: ₱{bill.waterBill.basicCharge}</Text>
                                    <Text style={styles.billDetail}>Environmental Fee: ₱{bill.waterBill.environmentalFee}</Text>
                                    <Text style={styles.billDetail}>VAT: ₱{bill.waterBill.vat}</Text>
                                    <Text style={styles.billDetail}>Total Bill: ₱{bill.waterBill.totalBill}</Text>
                                </>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={styles.noBillsText}>No bills available at the moment.</Text>
                )}
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
    billsSection: {
        padding: 20,
        backgroundColor: "#FBF4DB",
        borderRadius: 15,
        margin: 20,
    },
    billCard: {
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
    billTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    billSubTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 10,
        color: "#444",
    },
    billDetail: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    noBillsText: {
        textAlign: "center",
        fontSize: 16,
        color: "#999",
    },
});

export default BillsBoarderScreen;
