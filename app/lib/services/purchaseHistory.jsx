// app/services/purchaseHistory.js
import pb from '../pocketbase';
import authService from '../services/auth';
import { Alert } from 'react-native';

const purchaseHistoryService = {
  async fetchReceiptCart(receiptId, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const carts = await pb.collection('receiptCart').getList(1, 50, {
          filter: `receiptID = "${receiptId}"`,
          expand: 'cartID.productID',
        });
        return carts.items;
      } catch (error) {
        if (attempt === retries) {
          return [];
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return [];
  },

  async fetchPurchaseHistory() {
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

      const receiptIds = receipts.items.map((r) => r.id);
      const receiptCartPromises = receiptIds.map((id) =>
        this.fetchReceiptCart(id)
      );
      const receiptCartsArray = await Promise.all(receiptCartPromises);
      const receiptCarts = { items: receiptCartsArray.flat() };

      // Replace the original mapping with this debug-enabled version
      const purchaseHistory = receipts.items.map((receipt) => {
        const relatedCarts = receiptCarts.items.filter(
          (rc) => rc.receiptID === receipt.id
        );
        console.log(`Receipt ${receipt.id} has ${relatedCarts.length} related carts`);

        const products = relatedCarts.map((rc) => {
          const cart = rc.expand?.cartID;
          const product = cart?.expand?.productID;
          console.log(`ReceiptCart ${rc.id}: cartID=${cart?.id}, productID=${product?.id}`);
          if (!cart || !product) return null;
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.image ? pb.files.getURL(product, product.image) : null,
            quantity: cart.quantity,
          };
        }).filter(Boolean);

        console.log(`Receipt ${receipt.id} products:`, products);
        return {
          id: receipt.id,
          userID: receipt.userID,
          totalAmount: receipt.totalAmount,
          courier: receipt.courier,
          paymentOption: receipt.paymentOption,
          created: receipt.created,
          products: products.length > 0 ? products : [],
        };
      });

      return purchaseHistory;
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch purchase history');
      return [];
    }
  },
};

export default purchaseHistoryService;