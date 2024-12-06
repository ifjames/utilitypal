import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

const FAQScreen = () => {
  const [openQuestion, setOpenQuestion] = useState(null); // Track which question is open
    const navigation = useNavigation(); // Initialize navigation
  const toggleAnswer = (index) => {
    setOpenQuestion(openQuestion === index ? null : index); // Toggle between open and closed
  };

  const questions = [
    {
      question: "What is UtilityPal?",
      answer: "UtilityPal is an app created as a final project for the Mobile Computing subject. It helps landlords and boarders of a dormitory manage their utilities efficiently. It’s completely free and built with React Native, Expo Go, and Firebase.",
    },
    {
      question: "Who can use UtilityPal?",
      answer: "UtilityPal is designed for both landlords and boarders of a dormitory. Landlords can manage their property and communicate with boarders, while boarders can manage their personal information and utility payments.",
    },
    {
      question: "Who created UtilityPal?",
      answer: "UtilityPal was brought to life by the hard work and dedication of its creators: James, Cy, Meg, and Kristine. These talented individuals worked together to design, develop, and bring UtilityPal to fruition, making it the useful and innovative app it is today.",
    },
    {
      question: "What technologies were used to build UtilityPal?",
      answer: "UtilityPal was built using React Native for the app development, Expo Go for rapid development and testing, and Firebase for backend services, including authentication and real-time data storage.",
    },
    {
      question: "Is UtilityPal free to use?",
      answer: "Yes, UtilityPal is completely free to use for both landlords and boarders. There are no hidden fees or subscriptions.",
    },
    {
      question: "How do I contact support?",
      answer: "If you encounter any issues, you can contact support through the app's settings or email us at spicyjamesu@gmail.com for assistance.",
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>FAQs</Text>
      </View>

      <View style={styles.faqSection}>
        {questions.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <View style={styles.faqRow}>
              <Text style={styles.questionText}>{item.question}</Text>
              <TouchableOpacity onPress={() => toggleAnswer(index)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{openQuestion === index ? "−" : "+"}</Text>
              </TouchableOpacity>
            </View>
            {openQuestion === index && (
              <Animated.View style={styles.answerContainer}>
                <Text style={styles.answerText}>{item.answer}</Text>
              </Animated.View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F1",
    padding: 10,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: "4%",
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  header: {
    backgroundColor: "#F1D5A8",
    padding: 50,
    alignItems: "center",
    justifyContent: "center",
    flex: 0,
    marginTop: -20, 
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    top: "25%",
    color: "#000",
  },
  faqSection: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  faqItem: {
    marginBottom: 15,
    backgroundColor: "#FBF4DB",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  faqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    width: "85%",
  },
  dropdownButton: {
    backgroundColor: "#1e90ff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownButtonText: {
    color: "white",
    fontSize: 18,
  },
  answerContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  answerText: {
    fontSize: 16,
    color: "#666",
  },
});

export default FAQScreen;
