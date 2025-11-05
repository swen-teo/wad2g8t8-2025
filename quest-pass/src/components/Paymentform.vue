<template>
  <div class="payment-form-container">
    <form @submit.prevent="handleSubmit">
      <h3 class="form-title">Secure Payment</h3>
      <p class="form-description">Enter your card details to complete the payment.</p>
      
      <div id="card-element" class="stripe-element"></div>

      <button :disabled="isLoading" class="pay-button">
        <span v-if="isLoading">Processing...</span>
        <span v-else>Pay {{ formattedTotal }}</span>
      </button>

      <div v-if="paymentError" class="error-message" role="alert">
        {{ paymentError }}
      </div>
      
      <div v-if="paymentSuccess" class="success-message" role="alert">
        Payment Succeeded! Thank you.
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable } from "firebase/functions";
import { useCartStore } from '@/store/cart';

// --- Stripe Configuration ---
const stripePublishableKey = "pk_test_51SPekvR2taviemszz5Pgr4Ly4E4csze8Zj3onwazJfG8ufx8W3Y9CKjXhIfvzxlvJKcsOiCMZmLJ5xtoYnL39u3H00wepDU4AU"

// --- Reactive State ---
const isLoading = ref(true);
const paymentError = ref(null);
const paymentSuccess = ref(false);

// --- Stripe Elements Refs ---
let stripe = null;
let cardElement = null;

// --- Firebase Function Reference ---
const functions = getFunctions();
const createPaymentIntent = httpsCallable(functions, "createPaymentIntent");

// --- Cart Store ---
const cartStore = useCartStore();

// --- Computed total ---
const totalPriceCents = computed(() => Math.round(cartStore.totalPrice * 100));
const formattedTotal = computed(() => cartStore.formattedTotalPrice);

// --- Lifecycle Hooks ---
onMounted(async () => {
  try {
    stripe = await loadStripe(stripePublishableKey);
    if (!stripe) throw new Error('Stripe failed to load.');

    const elements = stripe.elements();
    cardElement = elements.create("card", {
      style: {
        base: {
          iconColor: '#666EE8',
          color: '#31325F',
          fontWeight: '400',
          fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
          fontSize: '16px',
          '::placeholder': { color: '#CFD7E0' },
        },
      }
    });
    
    cardElement.mount("#card-element");
    isLoading.value = false;

  } catch (error) {
    console.error("Error initializing Stripe:", error);
    paymentError.value = "Could not load payment form. Please refresh the page.";
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  if (cardElement) cardElement.destroy();
});

// --- Handle Payment ---
const handleSubmit = async () => {
  if (isLoading.value || !stripe || !cardElement) return;
  
  isLoading.value = true;
  paymentError.value = null;
  paymentSuccess.value = false;

  try {
    const result = await createPaymentIntent({ amount: totalPriceCents.value });
    const clientSecret = result.data.clientSecret;

    if (!clientSecret) throw new Error("Failed to get payment secret from server.");

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      paymentError.value = error.message;
      console.error("Stripe payment error:", error.message);
    } else if (paymentIntent.status === "succeeded") {
      paymentSuccess.value = true;
      console.log("Payment succeeded!", paymentIntent);
    } else {
      paymentError.value = `Payment status: ${paymentIntent.status}`;
    }

  } catch (error) {
    console.error("Payment submission error:", error);
    paymentError.value = "An unexpected error occurred. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>


<style scoped>
.payment-form-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #30313d;
}

.form-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
}

/**
 * This is the container for the Stripe Element.
 * It gets a border and padding to look like an input field.
 */
.stripe-element {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #fff;
  margin-bottom: 24px;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.stripe-element--focus {
  border-color: #666EE8;
  box-shadow: 0 0 0 1px #666EE8;
}

.pay-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  background-color: #666EE8;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.pay-button:hover {
  background-color: #5558c4;
}

.pay-button:disabled {
  background-color: #a5a6f6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  font-size: 14px;
  color: #b91c1c;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.success-message {
  margin-top: 16px;
  padding: 12px;
  font-size: 14px;
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
}
</style>