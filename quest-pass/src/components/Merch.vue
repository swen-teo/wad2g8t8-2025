<template>
  <div class="merch-creator-page container my-5">
    <h1 class="page-title text-center mb-4">
      Claim Your Free QuestPass Merch
    </h1>

    <!-- Access gating: require Gold tier -->
    <div v-if="!userStore.isLoggedIn" class="alert alert-warning d-flex align-items-center justify-content-center gap-2">
      <font-awesome-icon :icon="['fas','right-to-bracket']" class="me-2" />
      <div>Please log in to participate in quests and rewards.</div>
    </div>
    <div v-else-if="userStore.currentUser?.currentTier !== 'Gold'" class="alert alert-warning text-center">
      <div class="d-flex align-items-center justify-content-center mb-1">
        <font-awesome-icon :icon="['fas','lock']" class="me-2" />
        <span class="lead mb-0">This exclusive merch creator is unlocked at <strong>Gold Tier</strong>.</span>
      </div>
      <div class="text-muted small">Keep completing quests to earn more points!</div>
    </div>

    <div class="row g-4" v-else>
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
            <h3 class="mb-0">Price: <span class="text-success">Free</span></h3>

            <div class="d-flex gap-3 align-items-center">
              <div>
                <label for="size" class="form-label me-2 mb-0">Size:</label>
                <select
                  id="size"
                  v-model="selectedSize"
                  class="form-select d-inline-block"
                  style="width: 120px;"
                >
                  <option v-for="size in sizeOptions" :key="size" :value="size">
                    {{ size }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <button
            class="btn btn-primary btn-lg w-100"
            :disabled="claiming || hasClaimed"
            @click="claimFreeMerch"
          >
            <template v-if="hasClaimed">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="me-2" />
              Claimed!
            </template>
            <template v-else>
              <font-awesome-icon :icon="['fas', 'gift']" class="me-2" />
              {{ claiming ? 'Claiming…' : 'Claim your free merch' }}
            </template>
          </button>

          <div v-if="claimSuccess" class="alert alert-success mt-3 mb-0" role="alert">
            <div>Your custom merch has been saved! We’ll process your claim shortly.</div>
            <div v-if="lastSaved" class="small text-muted mt-1">
              Saved item: <strong>{{ lastSavedLabel }}</strong>
              <span class="mx-1">•</span>
              Size: <strong>{{ lastSaved.size }}</strong>
            </div>
          </div>
          <div v-else-if="claimError" class="alert alert-danger mt-3 mb-0" role="alert">
            {{ claimError }}
          </div>
          <p v-else-if="hasClaimed" class="text-center text-muted mt-3 small mb-0">
            You have already claimed your free merch. One per user.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast container (position fixed) -->
  <div
    class="toast-container position-fixed top-0 end-0 p-3"
    style="z-index: 1100;"
    aria-live="polite"
    aria-atomic="true"
  >
    <div
      v-if="showToast"
      :class="toastClass"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">{{ toastMessage }}</div>
        <button
          type="button"
          class="btn-close me-2 m-auto"
          :class="{ 'btn-close-white': toastVariant === 'success' }"
          aria-label="Close"
          @click="hideToast"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useUserStore } from "@/store/user";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const userStore = useUserStore();

const selectedProduct = ref("tshirt");
const selectedSize = ref("M");
const basePrice = ref(0);
const hasClaimed = ref(false);
const claiming = ref(false);
const claimSuccess = ref(false);
const claimError = ref(null);
const lastSaved = ref(null);

// Toast state and helpers
const showToast = ref(false);
const toastMessage = ref("");
const toastVariant = ref("success"); // 'success' | 'danger'
const toastTimeoutId = ref(null);

const toastClass = computed(() => {
  const base = "toast align-items-center show";
  return toastVariant.value === 'success' ? `${base} text-bg-success` : `${base} text-bg-danger`;
});

function showToastMessage(variant, message, duration = 3000) {
  toastVariant.value = variant;
  toastMessage.value = message;
  showToast.value = true;
  if (toastTimeoutId.value) {
    clearTimeout(toastTimeoutId.value);
    toastTimeoutId.value = null;
  }
  toastTimeoutId.value = setTimeout(() => {
    showToast.value = false;
    toastTimeoutId.value = null;
  }, duration);
}

function hideToast() {
  showToast.value = false;
  if (toastTimeoutId.value) {
    clearTimeout(toastTimeoutId.value);
    toastTimeoutId.value = null;
  }
}

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

const productLabels = {
  tshirt: 'T-Shirt',
  cap: 'Cap',
  jacket: 'Jacket',
};

const lastSavedLabel = computed(() => {
  const key = lastSaved.value?.product;
  return productLabels[key] || (key ? String(key) : '—');
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

const formattedPrice = computed(() => `$${(basePrice.value).toFixed(2)}`);

watch(selectedProduct, (newValue) => {
  switch (newValue) {
    case "tshirt":
      basePrice.value = 0.0;
      selectedSize.value = "M";
      break;
    case "cap":
      basePrice.value = 0.0;
      selectedSize.value = "One Size";
      break;
    case "jacket":
      basePrice.value = 0.0;
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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function generatePreviewDataUrl() {
  try {
    const baseUrl = baseProductImage.value;
    const baseImg = await loadImage(baseUrl);

    // Choose a reasonable canvas size based on base image
    const maxDim = 800;
    const baseW = Math.max(1, baseImg?.naturalWidth || 800);
    const baseH = Math.max(1, baseImg?.naturalHeight || 800);
    const scale = Math.min(maxDim / baseW, maxDim / baseH);
    const canvasW = Math.round(baseW * scale);
    const canvasH = Math.round(baseH * scale);

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');

    // Draw base image or a fallback background
    if (baseImg) {
      ctx.drawImage(baseImg, 0, 0, canvasW, canvasH);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    // Draw overlay image if present
    if (merchConfig.value.image.src) {
      const overlayImg = await loadImage(merchConfig.value.image.src);
      if (overlayImg) {
        const imgWidth = Number(merchConfig.value.image.size) || 150;
        const ratio = overlayImg.naturalWidth / overlayImg.naturalHeight || 1;
        const drawW = imgWidth;
        const drawH = Math.round(drawW / ratio);
        const cx = (Number(merchConfig.value.image.x) / 100) * canvasW;
        const cy = (Number(merchConfig.value.image.y) / 100) * canvasH;
        ctx.drawImage(overlayImg, Math.round(cx - drawW / 2), Math.round(cy - drawH / 2), drawW, drawH);
      }
    }

    // Draw text overlay if present
    const t = merchConfig.value.text;
    if (t?.content) {
      const size = Number(t.size) || 24;
      const family = t.fontFamily || 'Arial';
      const tx = (Number(t.x) / 100) * canvasW;
      const ty = (Number(t.y) / 100) * canvasH;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${size}px ${family}`;
      // outline for readability similar to text-shadow
      ctx.lineWidth = Math.max(2, Math.round(size * 0.08));
      ctx.strokeStyle = '#ffffff';
      ctx.strokeText(t.content, tx, ty);
      ctx.fillStyle = t.color || '#000000';
      ctx.fillText(t.content, tx, ty);
    }

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Preview generation failed:', err);
    return null;
  }
}

async function claimFreeMerch() {
  if (!userStore.currentUser?.uid) return;
  if (userStore.currentUser?.currentTier !== 'Gold') {
    claimError.value = 'Only Gold tier users can claim free merch.';
    return;
  }
  if (hasClaimed.value || claiming.value) return;
  claiming.value = true;

  try {
    const preview = await generatePreviewDataUrl();
    const uid = userStore.currentUser.uid;
    const claimRef = doc(db, 'merchClaims', uid);
    const claimSnap = await getDoc(claimRef);
    if (claimSnap.exists()) {
      hasClaimed.value = true;
      claimSuccess.value = true; // already saved previously; show success state
      // Load saved details for summary
      const data = claimSnap.data();
      if (data?.product || data?.size) {
        lastSaved.value = { product: data.product, size: data.size };
      }
      return;
    }

    await setDoc(claimRef, {
      uid,
      product: selectedProduct.value,
      size: selectedSize.value,
      config: JSON.parse(JSON.stringify(merchConfig.value)),
      previewImage: preview || baseProductImage.value,
      status: 'claimed',
      claimedAt: serverTimestamp(),
    });

    hasClaimed.value = true;
    claimSuccess.value = true;
    claimError.value = null;
    lastSaved.value = { product: selectedProduct.value, size: selectedSize.value };
    showToastMessage(
      'success',
      `Merch saved: ${productLabels[lastSaved.value.product] || lastSaved.value.product} • Size ${lastSaved.value.size}`
    );
  } catch (err) {
    console.error('Failed to claim merch:', err);
    claimError.value = 'Something went wrong saving your claim. Please try again.';
    showToastMessage('danger', 'Failed to save your merch. Please try again.');
  } finally {
    claiming.value = false;
  }
}

onMounted(async () => {
  try {
    const uid = userStore.currentUser?.uid;
    if (!uid) return;
    const claimRef = doc(db, 'merchClaims', uid);
    const snap = await getDoc(claimRef);
    hasClaimed.value = snap.exists();
    if (hasClaimed.value) {
      claimSuccess.value = true;
      const data = snap.data();
      if (data?.product || data?.size) {
        lastSaved.value = { product: data.product, size: data.size };
      }
    }
  } catch (e) {
    console.warn('Could not check claim status:', e);
  }
});
</script>

<style scoped>
:root {
  --primary-1: #8b5cf6;
}

.merch-creator-page {
  /* Use the site-wide Poppins font to match the rest of the app */
  font-family: 'Poppins', sans-serif;
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
