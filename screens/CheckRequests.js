import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const CheckRequests = ({ schedules }) => {
  const renderScheduleItem = ({ item }) => (
    <View style={styles.scheduleItem}>
      <Text>Date: {item.date}</Text>
      <Text>Description: {item.description}</Text>
      <Text>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
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
  scheduleItem: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default CheckRequests;
