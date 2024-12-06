import { db } from "./firebase"; // Import Firestore instance
import { collection, getDocs, addDoc, setDoc, doc, deleteDoc, query, where, onSnapshot } from "firebase/firestore"; // Import Firestore functions

// Function to retrieve all reports
export const getReports = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "reports"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id, // Include the document ID
      ...doc.data(), // Include the rest of the report data
    }));
  } catch (error) {
    console.error("Error retrieving reports: ", error);
    return [];
  }
};


// Function to store a new report
export const storeReport = async (report) => {
  try {
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




// Function to update a report's status (approve/decline)
export const updateReportStatus = async (reportId, status) => {
  try {
    const reportRef = doc(db, "reports", reportId); // Get the reference to the report
    await setDoc(reportRef, { status }, { merge: true }); // Update the status of the report
    console.log(`Report status updated to ${status}`);
  } catch (error) {
    console.error("Error updating report status:", error);
  }
};

// Function to delete a report
export const deleteReport = async (reportId) => {
  try {
    const reportRef = doc(db, "reports", reportId); // Get the reference to the report
    await deleteDoc(reportRef); // Delete the report from Firestore
    console.log("Report deleted successfully");
  } catch (error) {
    console.error("Error deleting report:", error);
  }
};

// Function to retrieve user data (e.g., account details)
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, "users", userId); // Get the reference to the user
    const docSnap = await getDocs(userRef); // Retrieve user data
    if (docSnap.exists()) {
      return docSnap.data(); // Return user data if it exists
    } else {
      console.log("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving user data: ", error);
  }
};

// Function to save user data (e.g., account details)
export const saveUserData = async (userId, value) => {
  try {
    const userRef = doc(db, "users", userId); // Get the reference to the user
    await setDoc(userRef, value, { merge: true }); // Save or update user data
    console.log("User data saved successfully");
  } catch (error) {
    console.error("Error saving user data: ", error);
  }
};

// Function to save data to Firestore (e.g., schedules)
export const saveData = async (key, value) => {
  try {
    const collectionRef = collection(db, key); // Get the collection reference
    await addDoc(collectionRef, value); // Use addDoc to save data
    console.log(`${key} saved successfully`);
  } catch (error) {
    console.error("Error saving data: ", error);
  }
};

// Function to remove data (e.g., reports, user data)
export const removeData = async (key, documentId) => {
  try {
    const docRef = doc(db, key, documentId); // Get the document reference
    await deleteDoc(docRef); // Delete the document
    console.log(`${key} with ID ${documentId} removed successfully`);
  } catch (error) {
    console.error("Error removing data: ", error);
  }
};

// Function to retrieve rooms data from Firebase
export const getRoomsData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Rooms"));
    const rooms = querySnapshot.docs.map(doc => ({
      room: doc.id,  // Room number (e.g., Room 1)
      pax: doc.data().pax,  // Number of pax (people in the room)
    }));
    return rooms;  // Return the rooms data
  } catch (error) {
    console.error("Error retrieving rooms data: ", error);
    return [];
  }
};

// Function to update pax in a room (when a user is assigned or removed)
export const updateRoomPax = async (roomId, pax) => {
  try {
    const roomRef = doc(db, "Rooms", roomId);
    await setDoc(roomRef, { pax }, { merge: true });
    console.log(`Room ${roomId} pax updated to ${pax}`);
  } catch (error) {
    console.error("Error updating room pax: ", error);
  }
};

