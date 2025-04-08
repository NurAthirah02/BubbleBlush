import homescreenImage from '../assets/manual/homescreen.png';
import homescreenSearchImage from '../assets/manual/homescreen_search.png';
import searchScreenImage from '../assets/manual/search_screen.png';
import homescreenCartImage from '../assets/manual/homescreen_cart.png';
import cartScreenImage from '../assets/manual/cart_screen.png';
import checkoutShippingImage from '../assets/manual/checkout_shipping.png';
import checkoutOrderSummaryImage from '../assets/manual/checkout_order_summary.png';
import checkoutDeliveryImage from '../assets/manual/checkout_delivery.png';
import checkoutPaymentImage from '../assets/manual/checkout_payment.png';
import checkoutSubtotalImage from '../assets/manual/checkout_subtotal.png';
import homescreenProfileImage from '../assets/manual/homescreen_profile.png';
import profileEditButtonImage from '../assets/manual/profile_edit_button.png';
import profileEditModalImage from '../assets/manual/profile_edit_modal.png';
import profilePurchaseHistoryImage from '../assets/manual/profile_purchase_history.png';
import purchaseHistoryScreenImage from '../assets/manual/purchase_history_screen.png';
import purchaseHistoryReviewModalImage from '../assets/manual/purchase_history_review_modal.png';
import productWishlistImage from '../assets/manual/product_wishlist.png';
import profileWishlistButtonImage from '../assets/manual/profile_wishlist_button.png';
import wishlistScreenImage from '../assets/manual/wishlist_screen.png';

// Base manual content
const baseManual = {
  title: "Welcome to BubbleBlush!",
  intro: "Take a quick tour of our app’s key features to start shopping for your favorite beauty products with ease!",
  steps: {
    homescreen: {
      title: "Home Screen",
      description: "This is your main hub to explore products, categories, and special offers all in one place.",
      image: homescreenImage,
    },
    searchBar: {
      title: "Search Bar",
      description: "Use the search bar at the top to find products quickly by typing their names or keywords.",
      image: homescreenSearchImage,
    },
    searchScreen: {
      title: "Search Results",
      description: "View search results here—tap any product to see details and add it to your cart.",
      image: searchScreenImage,
    },
    cartIcon: {
      title: "Cart Icon",
      description: "Tap the cart icon to view items you’ve added and proceed to checkout when ready.",
      image: homescreenCartImage,
    },
    cartScreen: {
      title: "Cart Screen",
      description: "Review your selected products here and tap checkout to finalize your purchase.",
      image: cartScreenImage,
    },
    shippingDetails: {
      title: "Shipping Details",
      description: "Enter your name, address, and phone number here for delivery.",
      image: checkoutShippingImage,
    },
    orderSummary: {
      title: "Order Summary",
      description: "See the products you’ve selected from your cart listed here.",
      image: checkoutOrderSummaryImage,
    },
    deliveryOptions: {
      title: "Delivery Options",
      description: "Choose your preferred courier type for shipping your order.",
      image: checkoutDeliveryImage,
    },
    paymentMethod: {
      title: "Payment Method",
      description: "Select your payment type—like credit card or e-wallet—to complete your purchase.",
      image: checkoutPaymentImage,
    },
    subtotalPlaceOrder: {
      title: "Subtotal & Place Order",
      description: "Review your subtotal, tax, courier fee, and total, then tap 'Place Order' to finish.",
      image: checkoutSubtotalImage,
    },
    profileIcon: {
      title: "Profile Icon",
      description: "Access your account details by tapping the profile icon on the home screen.",
      image: homescreenProfileImage,
    },
    editProfileButton: {
      title: "Edit Profile Button",
      description: "Update your personal info by tapping the edit profile button.",
      image: profileEditButtonImage,
    },
    editProfileModal: {
      title: "Edit Profile Form",
      description: "Fill out this form to update your account details and save your changes.",
      image: profileEditModalImage,
    },
    purchaseHistoryButton: {
      title: "Purchase History Button",
      description: "View your past orders by tapping the purchase history button.",
      image: profilePurchaseHistoryImage,
    },
    purchaseHistoryScreen: {
      title: "Purchase History",
      description: "See a list of all your previous purchases here.",
      image: purchaseHistoryScreenImage,
    },
    reviewModal: {
      title: "Submit a Review",
      description: "Rate and review your purchased products through this modal.",
      image: purchaseHistoryReviewModalImage,
    },
    wishlistIcon: {
      title: "Wishlist Icon",
      description: "Add products to your wishlist—a filled icon means it’s already saved!",
      image: productWishlistImage,
    },
    wishlistButton: {
      title: "Wishlist Button",
      description: "Check your saved products by tapping the wishlist button in your profile.",
      image: profileWishlistButtonImage,
    },
    wishlistScreen: {
      title: "Wishlist Screen",
      description: "View all your wishlisted products here and add them to your cart anytime.",
      image: wishlistScreenImage,
    },
  },
};

// User manual function (no role-specific variations unless specified)
export const firstLoginManual = () => {
  return {
    ...baseManual,
    steps: [
      baseManual.steps.homescreen,
      baseManual.steps.searchBar,
      baseManual.steps.searchScreen,
      baseManual.steps.cartIcon,
      baseManual.steps.cartScreen,
      baseManual.steps.shippingDetails,
      baseManual.steps.orderSummary,
      baseManual.steps.deliveryOptions,
      baseManual.steps.paymentMethod,
      baseManual.steps.subtotalPlaceOrder,
      baseManual.steps.profileIcon,
      baseManual.steps.editProfileButton,
      baseManual.steps.editProfileModal,
      baseManual.steps.purchaseHistoryButton,
      baseManual.steps.purchaseHistoryScreen,
      baseManual.steps.reviewModal,
      baseManual.steps.wishlistIcon,
      baseManual.steps.wishlistButton,
      baseManual.steps.wishlistScreen,
    ],
  };
};