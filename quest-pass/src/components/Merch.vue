<template>
  <div class="merch-creator-page container my-5">
    <h1 class="text-center mb-4 display-4 fw-bold text-primary">
      Design Your QuestPass Merch!
    </h1>

    <div class="row g-4">
      <!-- LEFT COLUMN: Product Selection + Customization -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm p-4 h-100">
          <h2 class="h4 mb-3">1. Choose Your Product</h2>

          <div class="product-selector btn-group d-flex mb-4" role="group">
            <input
              type="radio"
              class="btn-check"
              name="product"
              id="shirt"
              value="tshirt"
              v-model="selectedProduct"
            />
            <label class="btn btn-outline-primary" for="shirt">
              <font-awesome-icon :icon="['fas', 'tshirt']" class="me-2" />T-Shirt
            </label>

            <input
              type="radio"
              class="btn-check"
              name="product"
              id="cap"
              value="cap"
              v-model="selectedProduct"
            />
            <label class="btn btn-outline-primary" for="cap">
              <font-awesome-icon :icon="['fas', 'baseball-ball']" class="me-2" />Cap
            </label>

            <input
              type="radio"
              class="btn-check"
              name="product"
              id="jacket"
              value="jacket"
              v-model="selectedProduct"
            />
            <label class="btn btn-outline-primary" for="jacket">
              <font-awesome-icon :icon="['fas', 'user-ninja']" class="me-2" />Jacket
            </label>
          </div>

          <h2 class="h4 mb-3">2. Customize Your Design</h2>

          <!-- TEXT CUSTOMIZATION -->
          <div class="card mb-3">
            <div class="card-header bg-light fw-semibold">Add Text</div>
            <div class="card-body">
              <div class="mb-3">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Enter your text"
                  v-model="merchConfig.text.content"
                />
              </div>

              <div class="row g-2">
                <div class="col-6">
                  <label for="textColor" class="form-label small">Color</label>
                  <input
                    type="color"
                    class="form-control form-control-color"
                    id="textColor"
                    v-model="merchConfig.text.color"
                  />
                </div>
                <div class="col-6">
                  <label for="textSize" class="form-label small">Size</label>
                  <input
                    type="range"
                    class="form-range"
                    id="textSize"
                    min="10"
                    max="72"
                    v-model="merchConfig.text.size"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label for="fontFamily" class="form-label small">Font</label>
                <select
                  class="form-select"
                  id="fontFamily"
                  v-model="merchConfig.text.fontFamily"
                >
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Impact">Impact</option>
                  <option value="QuestFont">QuestFont (Custom)</option>
                </select>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-2">
                <div>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="merchConfig.text.x -= 5">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" />
                  </button>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="merchConfig.text.y -= 5">
                    <font-awesome-icon :icon="['fas', 'arrow-up']" />
                  </button>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="merchConfig.text.y += 5">
                    <font-awesome-icon :icon="['fas', 'arrow-down']" />
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" @click="merchConfig.text.x += 5">
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </button>
                </div>

                <button
                  v-if="merchConfig.text.content"
                  class="btn btn-sm btn-outline-danger"
                  @click="removeText"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="me-1" /> Remove
                </button>
              </div>
            </div>
          </div>

          <!-- IMAGE CUSTOMIZATION -->
          <div class="card mb-3">
            <div class="card-header bg-light fw-semibold">Add Image</div>
            <div class="card-body">
              <label class="form-label small">Upload Image</label>
              <input
                type="file"
                class="form-control mb-2"
                @change="handleImageUpload"
                accept="image/*"
              />

              <div
                v-if="merchConfig.image.src"
                class="d-flex align-items-center justify-content-between mt-3"
              >
                <img
                  :src="merchConfig.image.src"
                  alt="Uploaded Preview"
                  class="img-thumbnail"
                  style="max-width: 80px; max-height: 80px"
                />
                <div class="ms-3 flex-grow-1">
                  <label for="imageSize" class="form-label small">Size</label>
                  <input
                    type="range"
                    class="form-range"
                    id="imageSize"
                    min="50"
                    max="300"
                    v-model="merchConfig.image.size"
                  />
                </div>
              </div>

              <div
                v-if="merchConfig.image.src"
                class="d-flex justify-content-between align-items-center mt-2"
              >
                <div>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="merchConfig.image.x -= 5">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" />
                  </button>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="merchConfig.image.y -= 5">
                    <font-awesome-icon :icon="['fas', 'arrow-up']" />
                  </button>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="merchConfig.image.y += 5">
                    <font-awesome-icon :icon="['fas', 'arrow-down']" />
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" @click="merchConfig.image.x += 5">
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </button>
                </div>

                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="removeImage"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="me-1" /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Live Preview -->
      <div class="col-lg-6">
        <div class="card shadow-sm p-4 h-100 d-flex flex-column">
          <h2 class="h4 mb-3 text-center">3. Live Preview</h2>

          <div
            class="merch-preview-container flex-grow-1 d-flex align-items-center justify-content-center p-3 mb-4 border rounded bg-light position-relative"
          >
            <img
              :src="baseProductImage"
              :alt="selectedProduct"
              class="img-fluid base-product-image"
            />

            <div
              v-if="merchConfig.text.content"
              class="design-overlay text-overlay"
              :style="textStyle"
            >
              {{ merchConfig.text.content }}
            </div>

            <img
              v-if="merchConfig.image.src"
              :src="merchConfig.image.src"
              alt="Custom Design"
              class="design-overlay image-overlay"
              :style="imageStyle"
            />
          </div>

          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>Price: <span class="text-success">{{ formattedPrice }}</span></h3>

            <div class="d-flex gap-3 align-items-center">
              <div>
                <label for="size" class="form-label me-2 mb-0">Size:</label>
                <select
                  id="size"
                  v-model="selectedSize"
                  class="form-select d-inline-block"
                  style="width: 100px;"
                >
                  <option v-for="size in sizeOptions" :key="size" :value="size">
                    {{ size }}
                  </option>
                </select>
              </div>

              <div>
                <label for="quantity" class="form-label me-2 mb-0">Qty:</label>
                <input
                  type="number"
                  id="quantity"
                  v-model.number="quantity"
                  min="1"
                  class="form-control d-inline-block"
                  style="width: 80px"
                />
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg w-100" @click="addToCart">
            <font-awesome-icon :icon="['fas', 'cart-plus']" class="me-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/store/cart";

const router = useRouter();
const cartStore = useCartStore();

const selectedProduct = ref("tshirt");
const selectedSize = ref("M");
const quantity = ref(1);
const basePrice = ref(25.0);

const merchConfig = ref({
  text: { content: "", color: "#000000", size: 24, fontFamily: "Arial", x: 50, y: 50 },
  image: { src: null, size: 150, x: 50, y: 50 },
});

const sizeOptions = computed(() => {
  return selectedProduct.value === "cap" ? ["One Size"] : ["S", "M", "L", "XL"];
});

const baseProductImage = computed(() => {
  switch (selectedProduct.value) {
    case "tshirt":
      return "https://cdn.shopify.com/s/files/1/0522/5313/0909/files/Studio-Tee_White_Front.png?v=1682412237";
    case "cap":
      return "https://i5.walmartimages.com/asr/bb869401-0a35-42c6-871a-90d4b3e7e8f5.5b8f2bccbc83b09043a2792e6c2e96f7.png";
    case "jacket":
      return "https://5.imimg.com/data5/SELLER/Default/2022/5/JI/HN/LX/98045881/white-hoodie.png";
    default:
      return "";
  }
});

const textStyle = computed(() => ({
  color: merchConfig.value.text.color,
  fontSize: `${merchConfig.value.text.size}px`,
  fontFamily: merchConfig.value.text.fontFamily,
  left: `${merchConfig.value.text.x}%`,
  top: `${merchConfig.value.text.y}%`,
  transform: "translate(-50%, -50%)",
  whiteSpace: "nowrap",
}));

const imageStyle = computed(() => ({
  width: `${merchConfig.value.image.size}px`,
  height: "auto",
  left: `${merchConfig.value.image.x}%`,
  top: `${merchConfig.value.image.y}%`,
  transform: "translate(-50%, -50%)",
}));

const formattedPrice = computed(() => `$${(basePrice.value * quantity.value).toFixed(2)}`);

watch(selectedProduct, (newValue) => {
  switch (newValue) {
    case "tshirt":
      basePrice.value = 25.0;
      selectedSize.value = "M";
      break;
    case "cap":
      basePrice.value = 20.0;
      selectedSize.value = "One Size";
      break;
    case "jacket":
      basePrice.value = 60.0;
      selectedSize.value = "M";
      break;
  }
  merchConfig.value.text.content = "";
  merchConfig.value.image.src = null;
});

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => (merchConfig.value.image.src = e.target.result);
    reader.readAsDataURL(file);
  }
}

function removeText() {
  merchConfig.value.text.content = "";
}

function removeImage() {
  merchConfig.value.image.src = null;
}

function addToCart() {
  const customMerchItem = {
    id: Date.now(),
    product: selectedProduct.value,
    size: selectedSize.value,
    config: JSON.parse(JSON.stringify(merchConfig.value)),
    quantity: quantity.value,
    price: basePrice.value,
    previewImage: baseProductImage.value,
  };

  cartStore.addItem(customMerchItem);
  router.push({ name: "Cart" });
}
</script>

<style scoped>
:root {
  --primary-1: #8b5cf6;
}

.merch-creator-page {
  font-family: "Inter", sans-serif;
}

.product-selector .btn-check:checked + .btn-outline-primary {
  background-color: var(--primary-1);
  color: white;
  border-color: var(--primary-1);
}

.form-control-color {
  width: 100%;
  height: 40px;
  padding: 0.25rem;
}

.merch-preview-container {
  height: 550px;
  position: relative;
  overflow: hidden;
}

.base-product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.design-overlay {
  position: absolute;
  pointer-events: none;
  z-index: 10;
}

.text-overlay {
  font-weight: bold;
  text-align: center;
  text-shadow:
    -1px -1px 0 #fff,
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff;
  line-height: 1;
}

.image-overlay {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

.btn-group .btn {
  border-radius: 0.5rem;
  margin-right: 0.5rem;
}
.btn-group .btn:last-child {
  margin-right: 0;
}
</style>
