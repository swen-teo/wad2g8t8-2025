<template>
  <div class="container py-5">
    <div class="card shadow-lg merch-card">
      <div class="card-body p-4 p-md-5 text-center">
        <h2 class="fw-bold mb-4">🛒 Spin to Win Merch Voucher!</h2>
        
        <div v-if="!userStore.isLoggedIn">
            <p class="text-warning">Please log in to participate in quests and rewards.</p>
        </div>
        <div v-else-if="userStore.currentUser?.currentTier === 'Bronze'">
            <p class="lead text-warning">
                <i class="fas fa-lock me-2"></i> This exclusive voucher is unlocked at **Silver Tier**.
            </p>
            <p class="text-muted">Keep completing quests to earn more points!</p>
        </div>
        
        <div v-else>
            
            <div class="d-flex flex-column flex-md-row align-items-center justify-content-center gap-5 mb-5">
                
                <div class="wheel-container mx-auto">
                    <div class="wheel-pointer">
                        <font-awesome-icon :icon="['fas', 'caret-down']" />
                    </div>

                    <div 
                        class="wheel" 
                        :class="{ 'spinning': isSpinning }"
                        :style="{ transform: `rotate(${wheelRotation}deg)` }"
                        @transitionend="handleSpinEnd"
                    >
                        <div class="segment s1"></div>
                        <div class="segment s2"></div>
                        <div class="segment s3"></div>
                    </div>
                </div>

                <div class="voucher-legend text-start">
                    <h5 class="fw-bold mb-3">Wheel Segments:</h5>
                    <div class="legend-item d-flex align-items-center mb-2">
                        <span class="legend-color-box color-s1"></span>
                        <span class="fw-semibold">$5 Voucher</span>
                    </div>
                    <div class="legend-item d-flex align-items-center mb-2">
                        <span class="legend-color-box color-s2"></span>
                        <span class="fw-semibold">$10 Voucher</span>
                    </div>
                    <div class="legend-item d-flex align-items-center mb-2">
                        <span class="legend-color-box color-s3"></span>
                        <span class="fw-semibold">$20 Voucher</span>
                    </div>
                </div>
            </div>
            <div v-if="voucherCode" class="mt-4">
                <p class="lead text-success fw-semibold">🎉 You Won a ${{ voucherValue }} Voucher!</p>
                <div class="code-display fw-bold display-6 mb-4">{{ voucherCode }}</div>
                <button class="btn btn-outline-primary" @click="copyCode">
                    <i class="fas fa-copy me-2"></i> {{ copyButtonText }}
                </button>
            </div>

            <div v-else-if="isLoading || isSpinning">
                <div class="spinner-border text-primary-1" role="status"></div>
                <p class="mt-3">{{ statusMessage }}</p>
            </div>
            
            <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

            <div v-else>
                <p class="mb-4">
                    Click spin to redeem your reward! Your voucher value is determined by your tier.
                </p>
                <button 
                    class="btn btn-primary btn-lg spin-button" 
                    @click="startSpin" 
                    :disabled="isSpinning || hasSpun"
                >
                    Spin the Wheel!
                </button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase.js'; 
import { useUserStore } from '@/store/user.js';

const userStore = useUserStore();
const generateVoucherCode = httpsCallable(functions, 'generateVoucherCode');

// --- State Variables ---
const isLoading = ref(false); // Controls the spinner while waiting for API/code
const isSpinning = ref(false); // Controls the CSS spin animation
const hasSpun = ref(false); 
const wheelRotation = ref(0); 
const voucherCode = ref('');
const voucherValue = ref(0);
const error = ref('');
const copyButtonText = ref('Copy Code');
const statusMessage = ref('Ready to spin!');

// --- Configuration ---
const userTier = computed(() => userStore.currentUser?.currentTier);

// Define 3 segments (120 degrees per segment)
const SEGMENTS = {
    '$5': { value: 5, degrees: 60 },   
    '$10': { value: 10, degrees: 180 }, 
    '$20': { value: 20, degrees: 300 }, 
};

const TIER_REWARDS = {
    Silver: [5, 5, 10],   
    Gold: [5, 10, 20],    
    Platinum: [10, 20, 20], 
};

// --- Helper Functions ---

function getFinalOutcome(tier) {
    const rewards = TIER_REWARDS[tier] || [5]; 
    
    const result = rewards[Math.floor(Math.random() * rewards.length)];
    
    const segmentName = Object.keys(SEGMENTS).find(key => SEGMENTS[key].value === result);
    return SEGMENTS[segmentName]; 
}

// --- Main Spin Logic ---

function startSpin() {
    if (isSpinning.value || hasSpun.value || userTier.value === 'Bronze') return;

    error.value = '';
    isSpinning.value = true;
    statusMessage.value = "Wheel spinning...";

    const outcome = getFinalOutcome(userTier.value);
    
    const revolutions = 5 * 360; 

    const finalRotation = revolutions + (360 - outcome.degrees) + (Math.random() * 20 - 10); 
    
    wheelRotation.value = finalRotation;

    voucherValue.value = outcome.value; 
}

async function handleSpinEnd() {

    isSpinning.value = false;
    hasSpun.value = true;
    
    if (voucherValue.value > 0) {
        isLoading.value = true; // Start the API spinner
        statusMessage.value = "Finalizing voucher code...";
        
        try {
            const result = await generateVoucherCode({ 
                userTier: userTier.value, 
                voucherValue: voucherValue.value 
            });
            
            voucherCode.value = result.data.code;
            statusMessage.value = "Voucher Ready!";
        } catch (err) {

            console.error("Voucher Generation FAILED after spin:", err);
            error.value = "Code generation failed. Please check your Firebase Function logs!";
            statusMessage.value = "Error!";
        } finally {
            isLoading.value = false;
        }
    } else {
        // Should not be reachable with new TIER_REWARDS
        statusMessage.value = "An error occurred.";
        error.value = "Unexpected error. Please refresh and try again.";
    }
}

async function copyCode() {
    if (voucherCode.value) {
        await navigator.clipboard.writeText(voucherCode.value);
        copyButtonText.value = 'Copied!';
        setTimeout(() => { copyButtonText.value = 'Copy Code'; }, 2000);
    }
}
</script>

<style scoped>
.merch-card {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 1rem;
}
.wheel-container {
    position: relative;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: #f0f4ff;
    border: 5px solid #a78bfa;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    z-index: 1; 
}

.wheel-pointer {
    position: absolute;
    top: -35px; 
    left: 50%;
    transform: translateX(-50%);
    color: #d4cbc3;
    font-size: 45px;
    z-index: 100; 
    pointer-events: none;
}

.wheel-pointer :deep(svg) {
    color: inherit; 
    width: 40px; 
    height: 40px;
    display: block;
}

.wheel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    transition: transform 5s cubic-bezier(0.2, 0.8, 0.4, 1);
    background: conic-gradient(
        #a78bfa 0deg 120deg,       
        #f5c26b 120deg 240deg,     
        #b23b3b 240deg 360deg       
    );
}

.wheel-container, .wheel {
    box-sizing: border-box; 

}

.segment {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: center;
}

/* Inside MerchVoucher.vue <style scoped> (Add this new block) */
.voucher-legend {
    width: 150px; /* Define width for legend area */
    min-width: 150px; 
}
.legend-item {
    font-size: 1rem;
    gap: 10px;
}
.legend-color-box {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
/* Match the colors from your .wheel conic-gradient */
.color-s1 { /* Matches $5 segment color (Purple) */
    background-color: #a78bfa; 
}
.color-s2 { /* Matches $10 segment color (Orange) */
    background-color: #f5c26b; 
}
.color-s3 { /* Matches $20 segment color (Red) */
    background-color: #b23b3b; 
}
</style>