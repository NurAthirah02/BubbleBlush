import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const FAQScreen = () => {
  const faqs = [
    {
      question: "How can I update my address?",
      answer: "Please visit the Profile screen and select the 'Edit' button to modify your address details."
    },
    {
      question: "Where can I view my purchase history?",
      answer: "You can check your past purchases by navigating to the Profile screen and clicking on 'Purchase History'."
    },
    {
      question: "How do I remove an item from my wishlist?",
      answer: "To remove an item, go to the Profile screen, tap the 'Wishlist' button, and then click the trash icon next to the item you'd like to delete."
    },
    {
      question: "Where do I find my account settings?",
      answer: "You can access your account settings by visiting the Settings screen from the main navigation menu or simply find a gear icon on the bottom tab screen "
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.question}>{faq.question}</Text>
            <Text style={styles.answer}>{faq.answer}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8d7d6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#AD1457',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#AD1457',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AD1457',
    marginBottom: 8,
    fontFamily: 'MyFont-Regular',
  },
  answer: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    fontFamily: 'MyFont-Regular',
  },
});

export default FAQScreen;