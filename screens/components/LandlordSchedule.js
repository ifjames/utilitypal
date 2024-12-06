// LandlordSchedule.js or inside ProfileScreen.js/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, FlatList, StyleSheet } from 'react-native';

// Dummy schedules (this could be fetched from storage or a database)
const schedules = [
  { id: '1', date: '2024-12-05', description: 'Check water leak in room 3' },
  { id: '2', date: '2024-12-06', description: 'Inspect AC in room 2' },
];

const LandlordSchedule = () => {
  const [pendingSchedules, setPendingSchedules] = useState(schedules);

  const handleApprove = (scheduleId) => {
    Alert.alert('Schedule Approved', `You have approved the schedule for ${scheduleId}`);
    // Remove or mark the schedule as approved
    setPendingSchedules(pendingSchedules.filter(schedule => schedule.id !== scheduleId));
  };

  const handleDecline = (scheduleId) => {
    Alert.alert('Schedule Declined', `You have declined the schedule for ${scheduleId}`);
    // Remove or mark the schedule as declined
    setPendingSchedules(pendingSchedules.filter(schedule => schedule.id !== scheduleId));
  };

  const renderScheduleItem = ({ item }) => (
    <View style={styles.scheduleItem}>
      <Text style={styles.scheduleText}>Date: {item.date}</Text>
      <Text style={styles.scheduleText}>Description: {item.description}</Text>
      <Button title="Approve" onPress={() => handleApprove(item.id)} />
      <Button title="Decline" onPress={() => handleDecline(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Schedules</Text>
      <FlatList
        data={pendingSchedules}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scheduleItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  scheduleText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default LandlordSchedule;
