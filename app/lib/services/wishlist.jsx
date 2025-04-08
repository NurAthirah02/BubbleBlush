// app/lib/services/wishlist.js
import pb from '../pocketbase';
import authService from './auth';
import { Alert } from 'react-native';

const wishlistService = {
  async fetchWishlist() {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        Alert.alert('Error', 'Please log in to view your wishlist');
        return [];
      }

      const records = await pb.collection('wishlist').getList(1, 50, {
        filter: `userID = "${currentUser.id}"`,
        expand: 'productID',
      });

      const items = records.items.map(item => ({
        id: item.id,
        product: {
          id: item.expand.productID.id,
          name: item.expand.productID.name,
          price: item.expand.productID.price,
          description: item.expand.productID.description || 'No description available',
          imageUrl: item.expand.productID.image
            ? pb.files.getURL(item.expand.productID, item.expand.productID.image)
            : null,
        },
      }));

      return items;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      Alert.alert('Error', 'Failed to fetch wishlist');
      return [];
    }
  },

  async removeFromWishlist(itemId) {
    try {
      await pb.collection('wishlist').delete(itemId);
      Alert.alert('Success', 'Item removed from wishlist');
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Alert.alert('Error', 'Failed to remove item from wishlist');
      return false;
    }
  },

  async isProductInWishlist(productId) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) return { isWishlisted: false, itemId: null };

      const records = await pb.collection('wishlist').getList(1, 1, {
        filter: `userID = "${currentUser.id}" && productID = "${productId}"`,
      });

      return {
        isWishlisted: records.items.length > 0,
        itemId: records.items.length > 0 ? records.items[0].id : null,
      };
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return { isWishlisted: false, itemId: null };
    }
  },

  async toggleWishlist(productId) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not logged in');
      }

      const { isWishlisted, itemId } = await this.isProductInWishlist(productId);

      if (isWishlisted) {
        await pb.collection('wishlist').delete(itemId);
        return { isWishlisted: false, itemId: null, message: 'Item removed from wishlist' };
      } else {
        const newRecord = await pb.collection('wishlist').create({
          userID: currentUser.id,
          productID: productId,
        });
        return { isWishlisted: true, itemId: newRecord.id, message: 'Item added to wishlist' };
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      throw new Error(`Failed to update wishlist: ${error.message}`);
    }
  },
};

export default wishlistService;