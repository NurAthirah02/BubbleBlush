import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Text,
  StatusBar,
  Animated,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { fetchProductByTypeCategory, fetchProductByCategory } from '../lib/services/productService';
import wishlistService from '../lib/services/wishlist';
import authService from '../lib/services/auth';
import { useFonts } from 'expo-font';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = width - 40;
const VIDEO_HEIGHT = VIDEO_WIDTH * (9 / 16); 

const Haircare = ({ navigation }) => {
  const [hotSaleProducts, setHotSaleProducts] = useState([]);
  const [additionalProducts, setAdditionalProducts] = useState([]);
  const [isHotSaleLoading, setIsHotSaleLoading] = useState(true);
  const [hotSaleError, setHotSaleError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [wishlistStatus, setWishlistStatus] = useState({});

  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Load custom font
  const [fontsLoaded] = useFonts({
    'MyFont-Regular': require('../assets/font/PTSerif-Regular.ttf'),
  });

  // Mock data for special offers
  const specialOffers = [
    { id: 1, image: require('../assets/haircare/a.jpg') },
    { id: 2, image: require('../assets/haircare/b.jpg') },
    { id: 3, image: require('../assets/haircare/c.jpg') },
  ];

  const fetchHotSaleHaircareProducts = async () => {
    setIsHotSaleLoading(true);
    setHotSaleError(null);
    try {
      const data = await fetchProductByTypeCategory('hotSale', 'haircare');
      setHotSaleProducts(data);
      await updateWishlistStatus(data);
    } catch (err) {
      const errorMessage = err.message || 'Unknown error';
      setHotSaleError(`Failed to load hot sale products: ${errorMessage}`);
    } finally {
      setIsHotSaleLoading(false);
    }
  };

  const fetchAdditionalHaircareProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProductByCategory('haircare');
      setAdditionalProducts(data);
      await updateWishlistStatus(data);
    } catch (err) {
      const errorMessage = err.message || 'Unknown error';
      setError(`Failed to load additional products: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWishlistStatus = async (products) => {
    const user = await authService.getCurrentUser();
    if (!user) return;

    const newStatus = { ...wishlistStatus };
    for (const product of products) {
      const { isWishlisted, itemId } = await wishlistService.isProductInWishlist(product.id);
      newStatus[product.id] = { isWishlisted, itemId };
    }
    setWishlistStatus(newStatus);
  };

  useEffect(() => {
    const initializeFetches = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchHotSaleHaircareProducts();
      await fetchAdditionalHaircareProducts();
    };

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    initializeFetches();
  }, [fadeAnim, slideAnim]);

  const handleWishlistToggle = async (productId) => {
    const user = await authService.getCurrentUser();
    if (!user) {
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
      const { isWishlisted: newStatus, itemId, message } = await wishlistService.toggleWishlist(productId);
      setWishlistStatus(prev => ({
        ...prev,
        [productId]: { isWishlisted: newStatus, itemId },
      }));
      Alert.alert(newStatus ? 'Added' : 'Removed', message);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const itemWidth = width * 0.6;

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.whiteBackground} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Animated.Text
            style={[
              styles.pageTitle,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            HAIRCARE
          </Animated.Text>
        </View>
        <View style={styles.videoFrameContainer}>
          <View style={styles.videoInnerContainer}>
            {videoError ? (
              <Text style={styles.errorText}>{videoError}</Text>
            ) : (
              <Video
                source={require('../assets/haircare/haircare.mp4')}
                style={[styles.video, { width: VIDEO_WIDTH, height: VIDEO_HEIGHT }]}
                resizeMode="cover"
                shouldPlay
                isLooping
                isMuted
                onError={(e) => setVideoError(`Video error: ${e.error || 'Unknown error'}`)}
              />
            )}
          </View>
        </View>

        <View style={styles.whiteContentContainer}>
          <Text style={styles.hotSaleText}>Hot Sale</Text>

          {isHotSaleLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : hotSaleError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{hotSaleError}</Text>
              <TouchableOpacity onPress={fetchHotSaleHaircareProducts} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : hotSaleProducts.length === 0 ? (
            <Text style={styles.errorText}>No hot sale products available.</Text>
          ) : (
            <Carousel
              loop
              width={itemWidth}
              height={340}
              autoPlay={false}
              data={hotSaleProducts}
              scrollAnimationDuration={1000}
              renderItem={({ item }) => (
                <View style={styles.carouselItemContainer}>
                  <TouchableOpacity
                    style={[styles.carouselItem, styles.carouselItemSpacing]}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.squareImage}
                      onError={(e) => console.log('Hot Sale Image error:', item.id, e.nativeEvent.error)}
                    />
                    <TouchableOpacity
                      style={styles.heartButton}
                      onPress={() => handleWishlistToggle(item.id)}
                    >
                      <Ionicons
                        name={wishlistStatus[item.id]?.isWishlisted ? 'heart' : 'heart-outline'}
                        size={24}
                        color={wishlistStatus[item.id]?.isWishlisted ? '#AD1457' : '#333'}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  <Text style={styles.carouselProductName}>{item.name}</Text>
                </View>
              )}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 1.0,
                parallaxScrollingOffset: width * 0.2,
                parallaxAdjacentItemScale: 0.8,
                parallaxAdjacentItemOpacity: 0.5,
              }}
              panGestureHandlerProps={{
                activeOffsetX: [-10, 10],
              }}
              style={styles.carousel}
              defaultIndex={1}
            />
          )}

          <View style={styles.additionalContent}>
            <Text style={styles.additionalText}>More Products</Text>
            {isLoading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : additionalProducts.length === 0 ? (
              <Text style={styles.errorText}>No products available.</Text>
            ) : (
              <View style={styles.productGrid}>
                {additionalProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productItem}
                    onPress={() => navigation.navigate('ProductDetail', { product })}
                  >
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImage}
                      onError={(e) => console.log('Additional Product Image error:', product.id, e.nativeEvent.error)}
                    />
                    <TouchableOpacity
                      style={styles.heartButton}
                      onPress={() => handleWishlistToggle(product.id)}
                    >
                      <Ionicons
                        name={wishlistStatus[product.id]?.isWishlisted ? 'heart' : 'heart-outline'}
                        size={24}
                        color={wishlistStatus[product.id]?.isWishlisted ? '#AD1457' : '#333'}
                      />
                    </TouchableOpacity>
                    <Text style={styles.productName}>{product.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.additionalText}>Special Offers</Text>
            <View style={styles.carouselContainer}>
              <Carousel
                loop
                width={width - 40}
                height={200}
                autoPlay
                data={specialOffers}
                scrollAnimationDuration={1000}
                renderItem={({ item }) => (
                  <View style={styles.carouselItemSpecial}>
                    <Image source={item.image} style={styles.carouselImage} resizeMode="cover" />
                  </View>
                )}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8d7d6',
  },
  whiteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  titleContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight / 2 : 20,
    paddingBottom: 20,
    backgroundColor: '#f8d7d6',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'MyFont-Regular',
  },
  whiteContentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  hotSaleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    paddingTop: 20,
    fontFamily: 'MyFont-Regular',
  },
  carousel: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselItemContainer: {
    alignItems: 'center',
  },
  carouselItem: {
    width: width * 0.6,
    height: 280,
    backgroundColor: '#f8d7d6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
  },
  carouselItemSpacing: {
    marginHorizontal: 10,
  },
  squareImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  carouselProductName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'MyFont-Regular',
  },
  additionalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  additionalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'MyFont-Regular',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItem: {
    width: (width - 60) / 2,
    height: (width - 60) / 1.5,
    borderWidth: 2,
    borderColor: '#f8d7d6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  productImage: {
    width: '80%',
    height: '70%',
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'MyFont-Regular',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  errorContainer: {
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8d7d6',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'MyFont-Regular',
  },
  videoFrameContainer: {
    backgroundColor: '#f8d7d6',
    padding: 10,
  },
  videoInnerContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },

  carouselContainer: {
    width: '100%',
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  carouselItemSpecial: {
    width: '100%',
    height: '100%',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default Haircare;