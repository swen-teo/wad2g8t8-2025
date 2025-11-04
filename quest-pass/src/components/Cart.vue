<template>
  <div class="container my-5">
    <h1 class="mb-4">Your Shopping Cart</h1>

    <div v-if="cartStore.itemCount > 0">
      <div 
        v-for="(item, index) in cartStore.items" 
        :key="item.id" 
        class="card mb-3"
      >
        <div class="row g-0">
          <div class="col-md-2 d-flex align-items-center justify-content-center p-3">
            <img 
              :src="item.previewImage" 
              class="img-fluid rounded object-fit-contain" 
              alt="Product preview" 
              style="max-height: 150px;"
            >
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title text-capitalize">{{ item.product }}</h5>
              <p class="card-text">
                Size: {{ item.size }} <br>
                Quantity: {{ item.quantity }} <br>
                <span v-if="item.config.text.content">
                  Text: "{{ item.config.text.content }}"
                </span>
              </p>
              <p class="card-text">
                <strong>Unit Price:</strong> ${{ item.price.toFixed(2) }}
              </p>
            </div>
          </div>
          <div class="col-md-2 d-flex flex-column align-items-center justify-content-center p-3">
            <h5 class="mb-3">
              ${{ (item.price * item.quantity).toFixed(2) }}
            </h5>
            <button 
              class="btn btn-outline-danger btn-sm" 
              @click="cartStore.removeItem(index)"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <hr class="my-4">

      <div class="d-flex justify-content-between align-items-center">
        <h3 class="mb-0">Total: {{ cartStore.formattedTotalPrice }}</h3>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-lg" @click="keepShopping">
            Add More Items
          </button>
          <button class="btn btn-primary btn-lg" @click="proceedToCheckout">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center">
      <p class="lead">Your cart is empty.</p>
      <router-link to="/" class="btn btn-outline-primary">Keep Shopping</router-link>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/store/cart'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

function proceedToCheckout() {
  // Placeholder for checkout functionality
  console.log('Proceeding to checkout with:', cartStore.items)
  alert('Checkout not implemented yet!')
}

function keepShopping() {
  router.push({ name: 'Merch' })
}
</script>
