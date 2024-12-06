import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "./screens/SplashScreen";
import LoginRegister from "./screens/LoginRegister";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LandlordSchedule from "./screens/LandlordScheduleScreen";
import BoarderSchedule from "./screens/ScheduleFormScreen";
import AdminScreen from "./screens/AdminScreen";
import BillCalculatorScreen from "./screens/BillCalculator";
import BillsBoarderScreen from "./screens/BillsBoarder";
import RoommatesList from "./screens/RoomScreen";
import FAQScreen from "./screens/FAQ";
import { getData, saveData } from "./screens/db/storage";

const Stack = createStackNavigator();
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    // Show splash screen for a duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  const addSchedule = async (newSchedule) => {
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);

    // Save to Firestore
    await saveData("schedules", updatedSchedules);
  };

  const updateScheduleStatus = async (scheduleId, status) => {
    const updatedSchedules = schedules.map((schedule) =>
      schedule.id === scheduleId ? { ...schedule, status } : schedule
    );
    setSchedules(updatedSchedules);

    // Persist changes to Firestore
    await saveData("schedules", updatedSchedules);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : (
          <>
            <Stack.Screen name="LoginRegister" component={LoginRegister} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="BillCalculator" component={BillCalculatorScreen} />
            <Stack.Screen name="BoarderBills" component={BillsBoarderScreen} />
            <Stack.Screen name="Room" component={RoommatesList} />
            <Stack.Screen name="LandlordSchedule">
          {() => (
            <LandlordSchedule
              schedules={schedules}
              updateScheduleStatus={updateScheduleStatus}
            />
          )}
        </Stack.Screen>

            <Stack.Screen name="BoarderSchedule">
          {() => <BoarderSchedule addSchedule={addSchedule} />}
        </Stack.Screen>
            <Stack.Screen name="Admin" component={AdminScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
