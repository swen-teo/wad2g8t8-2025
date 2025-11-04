// src/store/cart.js
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useCartStore = defineStore('cart', () => {
  // STATE
  // Initialize from localStorage if available
  const items = ref([]);
  try {
    const saved = localStorage.getItem('questpass_cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) items.value = parsed;
    }
  } catch (e) {
    // ignore
  }

  // GETTERS
  const itemCount = computed(() => items.value.length);

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      // (item.price * item.quantity) is the total for that line item
      return total + (item.price * item.quantity);
    }, 0);
  });
  
  const formattedTotalPrice = computed(() => {
    return `$${totalPrice.value.toFixed(2)}`;
  });

  // ACTIONS
  function addItem(item) {
    // For simplicity, we just add the new item.
    // A more complex cart might check for existing items and merge quantities.
    items.value.push(item);
    console.log("Item added to cart store:", item);
  }

  function removeItem(index) {
    items.value.splice(index, 1);
  }

  function clearCart() {
    items.value = [];
  }

  // Persist cart changes
  watch(items, (val) => {
    try {
      localStorage.setItem('questpass_cart', JSON.stringify(val));
    } catch (e) {
      // ignore persistence errors
    }
  }, { deep: true });

  return { items, itemCount, totalPrice, formattedTotalPrice, addItem, removeItem, clearCart };
});