import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { addToCart } from '../lib/services/cart';
import { fetchComment } from '../lib/services/comment';
import authService from '../lib/services/auth';
import wishlistService from '../lib/services/wishlist';
import { useFonts } from 'expo-font';

const { height } = Dimensions.get('window');

const ProductDetail = ({ route, navigation }) => {
  const { product } = route.params;
  const scaleValue = new Animated.Value(1);
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    'MyFont-Regular': require('../assets/font/PTSerif-Regular.ttf'),
  });

  useEffect(() => {
    const checkAuthAndWishlist = async () => {
      const user = await authService.getCurrentUser();
      setIsLoggedIn(!!user);

      if (user) {
        const { isWishlisted, itemId } = await wishlistService.isProductInWishlist(product.id);
        setIsWishlisted(isWishlisted);
        setWishlistItemId(itemId);
      }
    };
    checkAuthAndWishlist();
  }, [product.id]);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const fetchedComments = await fetchComment(product.id);
        setComments(fetchedComments);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoadingComments(false);
      }
    };
    loadComments();
  }, [product.id]);

  const onPressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => quantity > 1 && setQuantity(prev => prev - 1);

  const total = product.price * quantity;

  const handleAddToBag = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to add items to your cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    try {
      console.log('Adding to cart:', { productId: product.id, quantity });
      const updatedCart = await addToCart(product, quantity);
      console.log('Cart updated:', updatedCart);
      setModalVisible(true); 
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', `Failed to add to cart: ${error.message}`, [{ text: 'OK' }]);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to manage your wishlist',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    try {
      const { isWishlisted: newStatus, itemId, message } = await wishlistService.toggleWishlist(product.id);
      setIsWishlisted(newStatus);
      setWishlistItemId(itemId);
      Alert.alert(newStatus ? 'Added' : 'Removed', message);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Text style={styles.commentUser}>{item.userName}</Text>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  if (!fontsLoaded) {
    console.log('Fonts not loaded yet');
    return null;
  }

  console.log('Rendering ProductDetail', { productId: product.id, isWishlisted });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageShadowContainer}>
          <View style={styles.imageWrapper}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
            </View>
            <TouchableOpacity onPress={handleWishlistToggle} style={styles.heartButton}>
              {console.log('Rendering heart icon', isWishlisted)}
              <Icon
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={32}
                color={isWishlisted ? '#AD1457' : '#AD1457'}
                style={styles.heartIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>RM {product.price}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>
            {loadingComments ? (
              <Text style={styles.loadingText}>Loading comments...</Text>
            ) : comments.length === 0 ? (
              <Text style={styles.noCommentsText}>No comments yet.</Text>
            ) : (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <View style={styles.quantityTotalRow}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decreaseQuantity}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <Text style={styles.quantityButtonText}>−</Text>
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={increaseQuantity}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <Text style={styles.quantityButtonText}>+</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
          <Text style={styles.totalText}>Total: RM {total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.addToBagButton}
          onPress={handleAddToBag}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Text style={styles.addToBagText}>Add to Bag</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Modal for "Added to Bag" */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Added to Bag</Text>
            <Text style={styles.modalText}>
              {quantity} {product.name}(s) added to your bag!
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setModalVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Continue Shopping</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('Cart');
                }}
              >
                <Text style={styles.modalButtonTextConfirm}>View Bag</Text>
              </TouchableOpacity>
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
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 250,
    marginTop: 20,
  },
  imageShadowContainer: {
    marginTop: 20,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: '#f8d7d6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  imageWrapper: {
    position: 'relative',
  },
  imageContainer: {
    height: height * 0.5,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f8d7d6',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  heartIcon: {
    fontSize: 32,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 20,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 10,
    letterSpacing: 0.5,
    fontFamily: 'MyFont-Regular',
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '600',
    color: '#AD1457',
    marginBottom: 20,
    fontFamily: 'MyFont-Regular',
  },
  productDescription: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 26,
    fontWeight: '400',
    fontFamily: 'MyFont-Regular',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    paddingBottom: 115,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  quantityTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#AD1457',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8E8EE',
    borderRadius: 8,
  },
  quantityButtonText: {
    fontSize: 22,
    color: '#AD1457',
    fontWeight: 'bold',
    fontFamily: 'MyFont-Regular',
  },
  quantityText: {
    fontSize: 18,
    color: '#2D2D2D',
    fontWeight: '600',
    paddingHorizontal: 15,
    fontFamily: 'MyFont-Regular',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'MyFont-Regular',
  },
  addToBagButton: {
    backgroundColor: '#AD1457',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F06292',
    alignItems: 'center',
    shadowColor: '#AD1457',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addToBagText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'MyFont-Regular',
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 10,
    fontFamily: 'MyFont-Regular',
  },
  commentContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  commentUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AD1457',
    marginBottom: 5,
    fontFamily: 'MyFont-Regular',
  },
  commentText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    fontFamily: 'MyFont-Regular',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  noCommentsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2D2D',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'MyFont-Regular',
  },
  modalText: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    fontFamily: 'MyFont-Regular',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#F8E8EE',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#AD1457',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    color: '#AD1457',
    fontWeight: '600',
    fontFamily: 'MyFont-Regular',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'MyFont-Regular',
  },
});

export default ProductDetail;