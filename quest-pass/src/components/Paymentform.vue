<template>
  <div class="payment-form-container">
    <form @submit.prevent="handleSubmit">
      <h3 class="form-title">Secure Payment</h3>
      <p class="form-description">Enter your card details to complete the payment.</p>

      <!-- Stripe Card Element -->
      <div id="card-element" class="stripe-element"></div>

      <!-- Pay Button -->
      <button :disabled="isLoading || totalPriceCents <= 0" class="pay-button">
        <span v-if="isLoading">Processing...</span>
        <span v-else>Pay {{ formattedTotal }}</span>
      </button>

      <!-- Error / Success Messages -->
      <div v-if="paymentError" class="error-message" role="alert">
        {{ paymentError }}
      </div>

      <div v-if="paymentSuccess" class="success-message" role="alert">
        Payment succeeded! Thank you.
      </div>
    </form>
  </div>
</template>

<script setup>
import axios from "axios";
import { useCartStore } from '@/store/cart';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { loadStripe } from '@stripe/stripe-js';

// --- Cart Store ---
const cartStore = useCartStore();

// --- Reactive State ---
const isLoading = ref(true);
const paymentError = ref(null);
const paymentSuccess = ref(false);

// --- Computed Totals ---
const totalPriceCents = computed(() => Math.round(cartStore.totalPrice * 100));
const formattedTotal = computed(() => cartStore.formattedTotalPrice);

// --- Stripe Elements ---
const stripePublishableKey = "pk_test_51SPekvR2taviemszz5Pgr4Ly4E4csze8Zj3onwazJfG8ufx8W3Y9CKjXhIfvzxlvJKcsOiCMZmLJ5xtoYnL39u3H00wepDU4AU";
let stripe = null;
let cardElement = null;

// --- Mount Stripe Elements ---
onMounted(async () => {
  try {
    stripe = await loadStripe(stripePublishableKey);
    if (!stripe) throw new Error("Stripe failed to load");

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
        }
      }
    });

    cardElement.mount("#card-element");
    isLoading.value = false;

  } catch (err) {
    console.error("Stripe init error:", err);
    paymentError.value = "Could not load payment form. Please refresh.";
    isLoading.value = false;
  }
});

// --- Cleanup ---
onBeforeUnmount(() => {
  if (cardElement) cardElement.destroy();
});

// --- Handle Payment ---
const handleSubmit = async () => {
  if (!stripe || !cardElement) return;
  isLoading.value = true;
  paymentError.value = null;
  paymentSuccess.value = false;

  try {
    // 1️⃣ Call Firebase onRequest function
    const response = await axios.post(
      "https://createpaymentintent-dkcssvmdwa-uc.a.run.app", // Replace with your deployed function URL
      { amount: totalPriceCents.value },
      { headers: { "Content-Type": "application/json" } }
    );

    const clientSecret = response.data.clientSecret;
    if (!clientSecret) throw new Error("No client secret returned from server");

    // 2️⃣ Confirm the payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      paymentError.value = error.message;
      console.error("Stripe payment error:", error);
    } else if (paymentIntent.status === "succeeded") {
      paymentSuccess.value = true;
      console.log("Payment succeeded!", paymentIntent);
    } else {
      paymentError.value = `Payment status: ${paymentIntent.status}`;
    }

  } catch (err) {
    console.error("Payment submission error:", err);
    paymentError.value = err.response?.data?.error || "Unexpected error occurred";
  } finally {
    isLoading.value = false;
  }
};
</script>


<style scoped>
.payment-form-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.stripe-element {
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.pay-button {
  width: 100%;
  padding: 12px;
  background-color: #6772e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.pay-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 1rem;
}

.success-message {
  color: green;
  margin-top: 1rem;
}
</style>
