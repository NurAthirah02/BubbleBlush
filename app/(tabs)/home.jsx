import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Platform,
  TextInput,
  FlatList,
} from 'react-native';
import * as Font from 'expo-font';
import Carousel from 'react-native-reanimated-carousel';
import { fetchProductByType } from '../lib/services/productService';
import { searchProducts } from '../lib/services/search';
import { Ionicons } from '@expo/vector-icons';
import authService from '../lib/services/auth';
import { CartContext } from '../lib/services/cartContext'; // Import CartContext

const { width } = Dimensions.get('window');
const circleSize = Math.max(Math.min(width * 0.3, 200), 120);
const imageSize = circleSize * 0.75;
const bannerHeight = (width * 9) / 16;

const bannerImages = [
  require('../assets/home/1.jpg'),
  require('../assets/home/2.jpg'),
  require('../assets/home/3.jpg'),
  require('../assets/home/4.jpg'),
];

const HomeScreen = ({ navigation }) => {
  const { cartItems } = useContext(CartContext); // Access cartItems from CartContext
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState(null);

  // Calculate total cart items
  const totalItems = Array.isArray(cartItems) ? cartItems.length : 0;

  useEffect(() => {
    async function loadResources() {
      try {
        await Font.loadAsync({
          'MyFont-Regular': require('../assets/font/PTSerif-Regular.ttf'),
        });
        setFontLoaded(true);

        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        const data = await fetchProductByType('featured');
        setFeaturedProducts(data);
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadResources();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchProducts(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const specialOffers = [
    { id: '1', image: require('../assets/makeup/a.jpg') },
    { id: '2', image: require('../assets/haircare/b.jpg') },
    { id: '3', image: require('../assets/bodycare/c.jpg') },
  ];

  if (!fontLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.searchImage} />
      <View style={styles.searchTextContainer}>
        <Text style={styles.searchName}>{item.name}</Text>
        <Text style={styles.searchPrice}>RM{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const CategoryTouchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

  const RegularContent = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.bannerContainer}>
        <Carousel
          loop
          width={width}
          height={bannerHeight}
          autoPlay
          data={bannerImages}
          scrollAnimationDuration={1000}
          renderItem={({ item }) => (
            <Image source={item} style={styles.bannerImage} resizeMode="cover" />
          )}
        />
      </View>

      <Text style={styles.sectionTitle}>Shop by Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollContainer}>
        <CategoryTouchable
          onPress={() => navigation.navigate('Skincare')}
          background={Platform.OS === 'android' ? TouchableNativeFeedback.Ripple('#ccc', false) : undefined}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <View style={styles.categoryItem}>
            <View style={styles.circleBackground}>
              <Image source={require('../assets/skincare.png')} style={styles.categoryImage} />
            </View>
            <Text style={styles.categoryText}>Skincare</Text>
          </View>
        </CategoryTouchable>

        <CategoryTouchable
          onPress={() => navigation.navigate('Makeup')}
          background={Platform.OS === 'android' ? TouchableNativeFeedback.Ripple('#ccc', false) : undefined}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <View style={styles.categoryItem}>
            <View style={styles.circleBackground}>
              <Image source={require('../assets/makeup.png')} style={styles.categoryImage} />
            </View>
            <Text style={styles.categoryText}>Makeup</Text>
          </View>
        </CategoryTouchable>

        <CategoryTouchable
          onPress={() => navigation.navigate('Haircare')}
          background={Platform.OS === 'android' ? TouchableNativeFeedback.Ripple('#ccc', false) : undefined}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <View style={styles.categoryItem}>
            <View style={styles.circleBackground}>
              <Image source={require('../assets/haircare.png')} style={styles.categoryImage} />
            </View>
            <Text style={styles.categoryText}>Haircare</Text>
          </View>
        </CategoryTouchable>

        <CategoryTouchable
          onPress={() => navigation.navigate('Bodycare')}
          background={Platform.OS === 'android' ? TouchableNativeFeedback.Ripple('#ccc', false) : undefined}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <View style={styles.categoryItem}>
            <View style={styles.circleBackground}>
              <Image source={require('../assets/bodyCare.png')} style={styles.categoryImage} />
            </View>
            <Text style={styles.categoryText}>Body Care</Text>
          </View>
        </CategoryTouchable>

        <CategoryTouchable
          onPress={() => navigation.navigate('Fragrance')}
          background={Platform.OS === 'android' ? TouchableNativeFeedback.Ripple('#ccc', false) : undefined}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <View style={styles.categoryItem}>
            <View style={styles.circleBackground}>
              <Image source={require('../assets/fragrance.png')} style={styles.categoryImage} />
            </View>
            <Text style={styles.categoryText}>Fragrance</Text>
          </View>
        </CategoryTouchable>
      </ScrollView>

      <Text style={styles.sectionTitle}>Featured Products</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : featuredProducts.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScrollContainer}>
          {featuredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.featuredItem}
              onPress={() => navigation.navigate('ProductDetail', { product })}
            >
              <Image source={{ uri: product.imageUrl }} style={styles.featuredImage} />
              <Text style={styles.featuredName}>{product.name}</Text>
              <Text style={styles.searchPrice}>RM{product.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noProductsText}>No featured products available.</Text>
      )}

      <Text style={styles.sectionTitle}>Special Offers</Text>
      <View style={styles.carouselContainer}>
        <Carousel
          loop
          width={width}
          height={200}
          autoPlay
          data={specialOffers}
          scrollAnimationDuration={1000}
          renderItem={({ item }) => (
            <View style={styles.carouselItem}>
              <Image source={item.image} style={styles.carouselImage} resizeMode="cover" />
            </View>
          )}
        />
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.headerSearchContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          <Ionicons name="search-outline" size={24} color="#333" style={styles.searchIcon} />
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => {
            if (user) {
              navigation.navigate('Cart');
            } else {
              navigation.navigate('Login');
            }
          }}
        >
          <View style={styles.cartContainer}>
            <Ionicons name="cart-outline" size={30} color="#333" />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {isSearching && searchQuery.trim() ? (
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.searchResultsContent}
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No search results found</Text>
          </View>
        )
      ) : (
        <RegularContent />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8d7d6',
  },
  headerSearchContainer: {
    width: '100%',
    height: Platform.OS === 'ios' ? (StatusBar.currentHeight || 44) + 60 : 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
    fontFamily: 'MyFont-Regular',
  },
  searchIcon: {
    marginLeft: 10,
  },
  cartButton: {
    padding: 5,
  },
  cartContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#AD1457',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 100,
  },
  searchResultsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 100,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  searchTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  searchName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    fontFamily: 'MyFont-Regular',
  },
  searchPrice: {
    fontSize: 14,
    color: '#AD1457',
    fontFamily: 'MyFont-Regular',
  },
  bannerContainer: {
    width: '100%',
    height: bannerHeight,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: bannerHeight,
    borderBottomLeftRadius: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    color: '#000000',
    fontFamily: 'MyFont-Regular',
  },
  categoryScrollContainer: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 10,
    borderRadius: 15,
  },
  circleBackground: {
    width: circleSize,
    height: circleSize,
    backgroundColor: '#fff',
    borderRadius: circleSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  categoryImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'MyFont-Regular',
  },
  featuredScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  featuredItem: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  featuredName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    width: '100%',
    fontFamily: 'MyFont-Regular',
  },
  featuredPrice: {
    fontSize: 14,
    color: '#AD1457',
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  carouselContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  carouselItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  noProductsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 10,
    fontFamily: 'MyFont-Regular',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
});

export default HomeScreen;