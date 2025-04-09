import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { useFonts } from 'expo-font';
import purchaseHistoryService from '../lib/services/purchaseHistory';
import { insertComment } from '../lib/services/comment';
import pb from '../lib/pocketbase';

const PurchaseHistory = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'MyFont-Regular': require('../assets/font/PTSerif-Regular.ttf'),
  });
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewedPurchases, setReviewedPurchases] = useState(new Set());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedRecords = await purchaseHistoryService.getCachedPurchaseHistory();
        if (cachedRecords) {
          setReceipts(cachedRecords);
          setLoading(false);
        } else {
          setLoading(true);
        }

        const records = await purchaseHistoryService.fetchPurchaseHistory();
        setReceipts(records);

        const user = pb.authStore.model;
        if (user) {
          const allReviews = await pb.collection('review').getList(1, 50, {
            filter: `userID = "${user.id}"`,
          });
          const reviewedIds = new Set(
            allReviews.items.map(review => `${review.receiptID}:${review.productID}`)
          );
          setReviewedPurchases(reviewedIds);
        }
      } catch (error) {
        // Silent error handling; rely on Alert from service
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshTrigger(Date.now());
    });
    return unsubscribe;
  }, [navigation]);

  const handleReviewSubmit = async () => {
    if (!reviewText.trim() || !selectedProductId || !selectedReceiptId) return;

    try {
      const user = pb.authStore.model;
      if (!user) throw new Error('User not authenticated');

      await insertComment(user.id, selectedProductId, selectedReceiptId, reviewText);
      setReviewedPurchases(prev => new Set([...prev, `${selectedReceiptId}:${selectedProductId}`]));
      setModalVisible(false);
      setReviewText('');
      setSelectedProductId(null);
      setSelectedReceiptId(null);
    } catch (error) {
      alert('Failed to submit review');
    }
  };

  const renderReceipt = ({ item }) => {
    const unreviewedProduct = item.products.find(
      product => !reviewedPurchases.has(`${item.id}:${product.id}`)
    );
    const allReviewed = item.products.every(
      product => reviewedPurchases.has(`${item.id}:${product.id}`)
    );

    return (
      <View style={styles.receiptCard}>
        <View style={styles.productsContainer}>
          <Text style={styles.productsTitle}>Products</Text>
          {item.products.map((product) => (
            <View key={product.id} style={styles.productRow}>
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.productImage}
              />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>RM {product.price.toFixed(2)}</Text>
                <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.receiptDetails}>
          <Text style={styles.receiptId}>Order #{item.id}</Text>
          <Text style={styles.receiptText}>Courier: {item.courier || 'Not specified'}</Text>
          <Text style={styles.receiptText}>Payment: {item.paymentOption || 'Not specified'}</Text>
          <Text style={styles.receiptText}>Total: RM {item.totalAmount.toFixed(2)}</Text>
          <Text style={styles.receiptDate}>
            Date: {new Date(item.created).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.reviewButton, allReviewed && styles.reviewButtonDisabled]}
          onPress={() => {
            if (!allReviewed && unreviewedProduct) {
              setSelectedProductId(unreviewedProduct.id);
              setSelectedReceiptId(item.id);
              setModalVisible(true);
            }
          }}
          disabled={allReviewed}
        >
          <Text style={styles.reviewButtonText}>
            {allReviewed ? 'Reviewed' : 'Review'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AD1457" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#AD1457" />
        </View>
      ) : receipts.length === 0 ? (
        <Text style={styles.noHistoryText}>No purchase history found.</Text>
      ) : (
        <FlatList
          data={receipts}
          renderItem={renderReceipt}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Enter your review..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#666" />
              <Button title="Submit" onPress={handleReviewSubmit} color="#AD1457" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8d7d6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 15,
    paddingBottom: 100,
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  productsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 10,
    fontFamily: 'MyFont-Regular',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D2D2D',
    fontFamily: 'MyFont-Regular',
  },
  productPrice: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'MyFont-Regular',
    marginTop: 2,
  },
  productQuantity: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'MyFont-Regular',
    marginTop: 2,
  },
  receiptDetails: {
    paddingVertical: 5,
  },
  receiptId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AD1457',
    fontFamily: 'MyFont-Regular',
    marginBottom: 5,
  },
  receiptText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'MyFont-Regular',
  },
  receiptDate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'MyFont-Regular',
    marginTop: 5,
  },
  reviewButton: {
    backgroundColor: '#AD1457',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  reviewButtonDisabled: {
    backgroundColor: '#ccc',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'MyFont-Regular',
  },
  noHistoryText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    fontFamily: 'MyFont-Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 15,
    fontFamily: 'MyFont-Regular',
  },
  reviewInput: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontFamily: 'MyFont-Regular',
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default PurchaseHistory;