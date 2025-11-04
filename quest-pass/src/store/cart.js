// src/store/cart.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
  // STATE
  const items = ref([]); // This will hold your merch items

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

  return { items, itemCount, totalPrice, formattedTotalPrice, addItem, removeItem, clearCart };
});