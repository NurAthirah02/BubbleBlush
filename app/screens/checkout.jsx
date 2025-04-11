import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFonts } from 'expo-font';
import Icon from 'react-native-vector-icons/FontAwesome5';
import authService from '../lib/services/auth';
import pb from '../lib/pocketbase';
import { placeOrder } from '../lib/services/receipt';

const Checkout = ({ route, navigation }) => {
  const [fontsLoaded] = useFonts({
    'MyFont-Regular': require('../assets/font/PTSerif-Regular.ttf'),
  });

  const { selectedItems } = route.params || { selectedItems: [] };
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); 

  const paymentOptions = [
    { label: 'Credit Card', value: 'credit', icon: 'credit-card' },
    { label: 'Debit Card', value: 'debit', icon: 'credit-card' },
    { label: 'Digital Wallet', value: 'wallet', icon: 'wallet' },
    { label: 'Cash on Delivery', value: 'cod', icon: 'money-bill' },
  ];

  const [selectedPayment, setSelectedPayment] = useState(paymentOptions[0].value);

  const courierOptions = [
    { label: 'Ninja Van (RM 6.50)', value: 'ninjavan', price: 6.50 },
    { label: 'Pos Laju (RM 6.00)', value: 'poslaju', price: 6.00 },
    { label: 'Flash Express (RM 5.27)', value: 'flash', price: 5.27 },
    { label: 'J&T Express (RM 5.00)', value: 'jnt', price: 5.00 },
    { label: 'GDEX (RM 7.00)', value: 'gdex', price: 7.00 },
  ];

  const [openCourier, setOpenCourier] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(courierOptions[0].value);

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        console.log('Checkout useEffect - Current user:', currentUser);
        if (currentUser) {
          console.log('User found, setting isLoggedIn to true');
          setIsLoggedIn(true);
          const userRecord = await pb.collection('users').getOne(currentUser.id);
          console.log('User record from PocketBase:', userRecord);
          setUserData({
            name: userRecord.name || 'No Name Provided',
            address: userRecord.address || 'No Address Provided',
            phoneNo: userRecord.phoneNo || 'No Phone Provided',
          });
        } else {
          console.log('No user found, setting isLoggedIn to false');
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (error) {
        console.error('Checkout useEffect error:', error);
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    checkAuthAndFetchUser();
  }, []);

  const subtotal = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const taxRate = 0.06;
  const tax = subtotal * taxRate;
  const courierPrice = courierOptions.find(option => option.value === selectedCourier).price;
  const totalWithTaxAndCourier = subtotal + tax + courierPrice;

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.product.imageUrl || 'https://via.placeholder.com/60' }} 
          style={styles.itemImage} 
        />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemPrice}>RM {(item.product.price * item.quantity).toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>CHECKOUT</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        {isLoggedIn && userData ? (
          <>
            <Text style={styles.userText}>Name: {userData.name}</Text>
            <Text style={styles.userText}>Address: {userData.address}</Text>
            <Text style={styles.userText}>Phone: {userData.phoneNo}</Text>
          </>
        ) : (
          <Text style={styles.noUserText}>Please log in to view shipping details</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {selectedItems.length === 0 ? (
          <Text style={styles.noItemsText}>No items selected for checkout.</Text>
        ) : (
          <FlatList
            data={selectedItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.product.id}
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />
        )}
      </View>
    </>
  );

  const handlePlaceOrder = async () => {
    console.log('handlePlaceOrder - isLoggedIn:', isLoggedIn);
    if (!isLoggedIn) {
      Alert.alert(
        "Login Required",
        "Please log in to place an order",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
  
    if (!userData || userData.address === 'No Address Provided' || userData.phoneNo === 'No Phone Provided') {
      console.log('Missing user data, showing modal');
      setModalVisible(true);
      return;
    }
  
    try {
      console.log('Attempting to place order...');
      const paymentLabel = paymentOptions.find(option => option.value === selectedPayment).label;
      await placeOrder(selectedItems, totalWithTaxAndCourier, selectedCourier, paymentLabel);
      console.log('Order placed successfully, showing alert');
      Alert.alert(
        "Success",
        "Order placed successfully!",
        [
          { text: "OK", onPress: () => {
            console.log('OK pressed, navigating to Cart');
            navigation.navigate('Cart');
          }}
        ]
      );
    } catch (error) {
      console.error('Error in handlePlaceOrder:', error.message);
      Alert.alert("Error", error.message);
    }
  };

  const renderFooter = () => (
    <>
      <View style={[styles.section, styles.dropdownSection]}>
        <Text style={styles.sectionTitle}>Delivery</Text>
        <DropDownPicker
          open={openCourier}
          value={selectedCourier}
          items={courierOptions}
          setOpen={setOpenCourier}
          setValue={setSelectedCourier}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          placeholder="Select a courier service"
          zIndex={10000}
          zIndexInverse={1000}
          dropDownDirection="BOTTOM"
          containerStyle={{ zIndex: 10000 }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.paymentScroll}
        >
          {paymentOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.paymentCard,
                selectedPayment === option.value && styles.paymentCardSelected,
              ]}
              onPress={() => setSelectedPayment(option.value)}
            >
              <Icon
                name={option.icon}
                size={30}
                color={selectedPayment === option.value ? '#AD1457' : '#333'}
                style={styles.paymentIcon}
              />
              <Text style={styles.paymentText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>RM {subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax (6%)</Text>
          <Text style={styles.totalValue}>RM {tax.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Courier Fee</Text>
          <Text style={styles.totalValue}>RM {courierPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>RM {totalWithTaxAndCourier.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.placeOrderButton, { opacity: isLoggedIn && selectedItems.length > 0 ? 1 : 0.5 }]}
        onPress={handlePlaceOrder}
        disabled={!isLoggedIn || selectedItems.length === 0}
      >
        <Text style={styles.placeOrderText}>Place Order</Text>
      </TouchableOpacity>
    </>
  );

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7d6" />
      {isLoggedIn ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.noAuthContainer}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={styles.noAuthText}>Please log in to proceed with checkout</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Custom Modal for Missing Information */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Missing Information</Text>
            <Text style={styles.modalMessage}>
              Please update your address and phone number in your profile to proceed with checkout.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('Profile');
                }}
              >
                <Text style={styles.modalActionText}>Update Profile</Text>
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
    backgroundColor: '#f8d7d6',
  },
  listContent: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  titleContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#AD1457',
    letterSpacing: 0.5,
    fontFamily: 'MyFont-Regular',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10000,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 10,
    fontFamily: 'MyFont-Regular',
  },
  userText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'MyFont-Regular',
  },
  noUserText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  imageContainer: {
    backgroundColor: '#f8d7d6',
    borderRadius: 8,
    padding: 5,
    marginRight: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'MyFont-Regular',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'MyFont-Regular',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    color: '#AD1457',
    fontWeight: '600',
    fontFamily: 'MyFont-Regular',
    marginTop: 2,
  },
  noItemsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#AD1457',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#AD1457',
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 10000,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'MyFont-Regular',
  },
  paymentScroll: {
    flexDirection: 'row',
  },
  paymentCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8d7d6',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    width: 100,
    height: 80,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  paymentCardSelected: {
    borderColor: '#AD1457',
    backgroundColor: '#ffe6e6',
  },
  paymentIcon: {
    marginBottom: 5,
  },
  paymentText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'MyFont-Regular',
  },
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 16,
    color: "#2D2D2D",
    fontWeight: "500",
    fontFamily: "MyFont-Regular",
  },
  totalValue: {
    fontSize: 16,
    color: "#333",
    fontFamily: "MyFont-Regular",
  },
  totalAmount: {
    fontSize: 18,
    color: "#AD1457",
    fontWeight: "600",
    fontFamily: "MyFont-Regular",
  },
  placeOrderButton: {
    backgroundColor: "#AD1457",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#AD1457",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  placeOrderText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "MyFont-Regular",
  },
  noAuthContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noAuthText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "MyFont-Regular",
  },
  loginButton: {
    backgroundColor: "#AD1457",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  loginButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "MyFont-Regular",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#AD1457",
    fontFamily: "MyFont-Regular",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    fontFamily: "MyFont-Regular",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#f8d7d6",
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    marginRight: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
    fontFamily: "MyFont-Regular",
  },
  modalActionButton: {
    flex: 1,
    backgroundColor: "#AD1457",
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
  },
  modalActionText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "MyFont-Regular",
  },
});

export default Checkout;