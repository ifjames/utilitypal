// ScheduleForm.js or inside ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, DatePickerAndroid } from 'react-native';

const ScheduleForm = ({ onSubmit }) => {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!date || !description) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }
    // Trigger the onSubmit callback
    onSubmit({ date, description });
  };

  const showDatePicker = async () => {
    try {
      const { action, year, month, day } = await DatePickerAndroid.open({
        date: new Date(),
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        setDate(`${year}-${month + 1}-${day}`); // Format as yyyy-mm-dd
      }
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Schedule for Landlord</Text>
      <Button title="Select Date" onPress={showDatePicker} />
      <Text style={styles.text}>{date}</Text>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe the issue"
        value={description}
        onChangeText={setDescription}
      />

      <Button title="Submit" onPress={handleSubmit} />
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
  label: {
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default ScheduleForm;
