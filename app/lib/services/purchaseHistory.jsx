import pb from '../pocketbase';
import authService from '../services/auth';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const purchaseHistoryService = {
  async fetchReceiptCart(receiptId, retries = 5) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const carts = await pb.collection('receiptCart').getList(1, 50, {
          filter: `receiptID = "${receiptId}"`,
          expand: 'cartID, cartID.productID',
        });
        return carts.items;
      } catch (error) {
        if (attempt === retries) {
          return [];
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }
    }
    return [];
  },

  async fetchPurchaseHistory(maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          Alert.alert('Error', 'Please log in to view your purchase history');
          return [];
        }

        const receipts = await pb.collection('receipt').getList(1, 50, {
          filter: `userID = "${currentUser.id}"`,
          sort: '-created',
        });

        if (receipts.items.length === 0) {
          return [];
        }

        const receiptIds = receipts.items.map(r => r.id);
        const receiptCartPromises = receiptIds.map(id => this.fetchReceiptCart(id));
        let receiptCartsArray = await Promise.all(receiptCartPromises);
        let receiptCarts = { items: receiptCartsArray.flat() };

        const receiptsWithCarts = new Set(receiptCarts.items.map(rc => rc.receiptID));
        if (receiptsWithCarts.size < receiptIds.length) {
          const allCarts = await pb.collection('receiptCart').getList(1, 500, {
            filter: receiptIds.map(id => `receiptID = "${id}"`).join(' || '),
            expand: 'cartID, cartID.productID',
          });
          receiptCarts.items = allCarts.items;
        }

        const purchaseHistory = receipts.items.map(receipt => {
          const relatedCarts = receiptCarts.items.filter(
            rc => rc.receiptID === receipt.id
          );

          const products = relatedCarts.map(rc => {
            const cart = rc.expand?.cartID;
            const product = cart?.expand?.productID;
            if (!cart || !product) {
              return null;
            }
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.image ? pb.files.getURL(product, product.image) : null,
              quantity: cart.quantity,
            };
          }).filter(Boolean);

          return {
            id: receipt.id,
            userID: receipt.userID,
            totalAmount: receipt.totalAmount,
            courier: receipt.courier,
            paymentOption: receipt.paymentOption,
            created: receipt.created,
            products,
          };
        });

        await AsyncStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
        return purchaseHistory;
      } catch (error) {
        if (attempt === maxRetries) {
          const cached = await AsyncStorage.getItem('purchaseHistory');
          if (cached) {
            return JSON.parse(cached);
          }
          Alert.alert(
            'Error',
            'Failed to fetch purchase history. Please check your network connection and try again.'
          );
          return [];
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }
    }
  },

  async getCachedPurchaseHistory() {
    const cached = await AsyncStorage.getItem('purchaseHistory');
    return cached ? JSON.parse(cached) : null;
  },
};

export default purchaseHistoryService;