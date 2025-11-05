<template>
    <div class="container my-5">
        <h1 class="page-title text-center mb-4">Spin to Win Ticketmaster Voucher!</h1>
        <div class="card shadow-sm merch-card">
            <div class="card-body p-4 p-md-5 text-center">
        
                <!-- 1. Not Logged In -->
                <div v-if="!userStore.isLoggedIn" class="alert alert-warning d-flex align-items-center justify-content-center gap-2">
                    <font-awesome-icon :icon="['fas','right-to-bracket']" class="me-2" />
                    <div>Please log in to participate in quests and rewards.</div>
                </div>
                
                <!-- 2. Wrong Tier -->
                <div v-else-if="userStore.currentUser?.currentTier === 'Bronze'" class="alert alert-warning text-center">
                    <div class="d-flex align-items-center justify-content-center mb-1">
                        <font-awesome-icon :icon="['fas','lock']" class="me-2" />
                        <span class="lead mb-0">This exclusive voucher is unlocked at <strong>Silver Tier</strong>.</span>
                    </div>
                    <div class="text-muted small">Keep completing quests to earn more points!</div>
                </div>
        
                <!-- 3. Logged in, Correct Tier: Show Wheel -->
                <div v-else>
                    
                    <!-- Loading Spinner while checking DB -->
                    <div v-if="isLoading" class="text-center p-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 text-muted">{{ statusMessage }}</p>
                    </div>
                    
                    <!-- Main Content (Wheel or Voucher) -->
                    <div v-else>
                        <div class="d-flex flex-column flex-md-row align-items-center justify-content-center gap-5 mb-5">
                            
                            <!-- Wheel Container -->
                            <div class="wheel-container mx-auto">
                                <div class="wheel-pointer">
                                    <font-awesome-icon :icon="['fas', 'caret-down']" />
                                </div>
                                <div 
                                    class="wheel" 
                                    :style="{ transform: `rotate(${wheelRotation}deg)` }"
                                    @transitionend="handleSpinEnd"
                                >
                                    <div class="segment-label" style="transform: rotate(60deg) translateY(calc(-1 * var(--label-radius)));">$5</div>
                                    <div class="segment-label" style="transform: rotate(180deg) translateY(calc(-1 * var(--label-radius)));">$10</div>
                                    <div class="segment-label" style="transform: rotate(300deg) translateY(calc(-1 * var(--label-radius)));">$20</div>
                                </div>
                            </div>
                            
                            <!-- Legend -->
                            <div class="voucher-legend card p-3 shadow-sm text-start">
                                <h5 class="mb-3">Your Possible Rewards</h5>
                                <ul class="list-unstyled mb-0">
                                    <li class="mb-2 d-flex align-items-center">
                                        <span class="legend-color-box me-2" style="background-color: var(--reward-5);"></span>
                                        <strong class="me-auto">$5 Voucher</strong>
                                        <span v-if="userTier === 'Silver' || userTier === 'Gold'" class="badge bg-secondary-subtle text-secondary-emphasis">Common</span>
                                    </li>
                                    <li class="mb-2 d-flex align-items-center">
                                        <span class="legend-color-box me-2" style="background-color: var(--reward-10);"></span>
                                        <strong class="me-auto">$10 Voucher</strong>
                                        <span v-if="userTier === 'Silver'" class="badge bg-primary-subtle text-primary-emphasis">Rare</span>
                                        <span v-if="userTier === 'Gold'" class="badge bg-secondary-subtle text-secondary-emphasis">Common</span>
                                        <span v-if="userTier === 'Platinum'" class="badge bg-secondary-subtle text-secondary-emphasis">Common</span>
                                    </li>
                                    <li class="d-flex align-items-center">
                                        <span class="legend-color-box me-2" style="background-color: var(--reward-20);"></span>
                                        <strong class="me-auto">$20 Voucher</strong>
                                        <span v-if="userTier === 'Gold'" class="badge bg-primary-subtle text-primary-emphasis">Rare</span>
                                        <span v-if="userTier === 'Platinum'" class="badge bg-primary-subtle text-primary-emphasis">Rare</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Status Message (Ready to spin, etc) -->
                        <div class="mt-n4 mb-3 small text-muted" v-if="!voucherCode && !isSpinning">{{ statusMessage }}</div>
                        <div class="visually-hidden" aria-live="polite">{{ statusMessage }}</div>

                        <!-- Spin Button -->
                        <button 
                            class="btn btn-primary btn-lg" 
                            @click="startSpin" 
                            :disabled="isButtonDisabled"
                            :aria-disabled="isButtonDisabled ? 'true' : 'false'"
                            :title="disabledReason"
                        >
                            <span v-if="isSpinning">
                                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Spinning...
                            </span>
                            <span v-else-if="hasSpun || voucherCode">Voucher Claimed!</span>
                            <span v-else>Spin the Wheel!</span>
                        </button>

                        <!-- Voucher Code Display (appears after spin) -->
                        <div v-if="voucherCode" class="mt-4">
                            <p class="success-title">
                                <font-awesome-icon :icon="['fas', 'trophy']" class="me-2 success-icon" />
                                <span>You Won a ${{ voucherValue }} Voucher!</span>
                            </p>
                            <div class="code-display fw-bold mb-2">{{ voucherCode }}</div>
                            <button class="btn btn-outline-secondary" @click="copyCode">
                                <font-awesome-icon :icon="['far', 'copy']" class="me-2" />
                                {{ copyButtonText }}
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/store/user.js';

// Import Firebase services
import { db } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const userStore = useUserStore();

// --- State Variables ---
const isLoading = ref(true); // Start as true to check DB
const isSpinning = ref(false); 
const hasSpun = ref(false); 
const wheelRotation = ref(0); 
const voucherCode = ref('');
const voucherValue = ref(0);
const error = ref('');
const copyButtonText = ref('Copy Code');
const statusMessage = ref('Checking your spin status...'); 
const spinTimeoutId = ref(null); // fallback timer for spin end

// Centralize disabled state and reason (helps debug when button appears disabled)
const isButtonDisabled = computed(() => (
    isSpinning.value || hasSpun.value || isLoading.value || !!voucherCode.value
));
// const disabledReason = computed(() => {
//     if (isLoading.value) return 'Loading';
//     if (!userStore.isLoggedIn) return 'Not logged in';
//     if (userTier.value === 'Bronze') return 'Tier locked';
//     if (isSpinning.value) return 'Already spinning';
//     if (hasSpun.value) return 'Voucher already claimed';
//     if (voucherCode.value) return 'Voucher code present';
//     return '';
// });

// Template-safe dev flag (import.meta isn't supported directly in template expressions)
const IS_DEV = import.meta.env.DEV;

// --- Configuration ---
const userTier = computed(() => userStore.currentUser?.currentTier);

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

// --- Check for existing claim on component mount ---
onMounted(async () => {
    // No user or wrong tier, just stop loading and let the template handle the message.
    if (!userStore.isLoggedIn || userStore.currentUser?.currentTier === 'Bronze') {
        isLoading.value = false;
        statusMessage.value = 'Log in to spin!';
        return;
    }

    const uid = userStore.currentUser.uid;
    
    try {
        const claimRef = doc(db, 'silverVoucherClaims', uid);
        const snap = await getDoc(claimRef);
        
        if (snap.exists()) {
            const data = snap.data();
            hasSpun.value = true;
            voucherCode.value = data.voucherCode;
            voucherValue.value = data.voucherValue;
            statusMessage.value = 'Voucher already claimed.';
        } else {
            hasSpun.value = false;
            voucherCode.value = '';
            statusMessage.value = 'Ready to spin!';
        }
    } catch (e) {
        console.warn('Could not check voucher status:', e);
        error.value = "Could not check your voucher status. Please refresh.";
        statusMessage.value = 'Error checking status.';
    } finally {
        isLoading.value = false;
    }
});


// --- Helper Functions ---
function getFinalOutcome(tier) {
    const rewards = TIER_REWARDS[tier] || [5]; // Default to $5 if tier is weird
    const result = rewards[Math.floor(Math.random() * rewards.length)];
    const segmentName = Object.keys(SEGMENTS).find(key => SEGMENTS[key].value === result);
    return SEGMENTS[segmentName]; // Return the full segment object
}

// --- Main Spin Logic ---
function startSpin() {
    if (isSpinning.value || hasSpun.value || !userStore.isLoggedIn || userTier.value === 'Bronze') return;

    error.value = '';
    isSpinning.value = true;
    statusMessage.value = "Wheel spinning... good luck!";

    const outcome = getFinalOutcome(userTier.value);
    
    // Calculate final rotation
    // 5 full spins + stop on the right segment + small random offset
    const revolutions = 5 * 360; 
    // 360 - degrees = position to stop. (e.g., $5 is at 60 deg, so we stop at 360-60=300)
    const finalRotation = revolutions + (360 - outcome.degrees) + (Math.random() * 20 - 10); // small jitter
    
    wheelRotation.value = finalRotation;
    voucherValue.value = outcome.value; // Store the value for later

    // Handle users who prefer reduced motion (no CSS transition) or missing transitionend
    const prefersReducedMotion = typeof window !== 'undefined' 
        && window.matchMedia 
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Clear any existing fallback timer
    if (spinTimeoutId.value) {
        clearTimeout(spinTimeoutId.value);
        spinTimeoutId.value = null;
    }

    if (prefersReducedMotion) {
        // Call the end handler almost immediately to finish the flow without animation
        spinTimeoutId.value = setTimeout(() => {
            if (isSpinning.value) handleSpinEnd();
        }, 30);
    } else {
        // Backup: if transitionend doesn't fire for any reason, finish after 5.2s
        spinTimeoutId.value = setTimeout(() => {
            if (isSpinning.value) handleSpinEnd();
        }, 5200);
    }
}

async function handleSpinEnd() {
    // Cancel any pending fallback completion
    if (spinTimeoutId.value) {
        clearTimeout(spinTimeoutId.value);
        spinTimeoutId.value = null;
    }
    isSpinning.value = false;
    
    if (voucherValue.value > 0) {
        isLoading.value = true; // Show loading while saving to DB
        statusMessage.value = "Generating voucher code...";
        
        // Generate code
        const randomCode = `TICKETMASTER-${voucherValue.value}-${Math.floor(Math.random() * 9000) + 1000}`;
        voucherCode.value = randomCode; 
        
        // --- Save to Firebase ---
        try {
            const uid = userStore.currentUser.uid;
            if (!uid) throw new Error("User not found. Cannot save voucher.");

            statusMessage.value = "Saving your voucher...";
            const claimRef = doc(db, 'silverVoucherClaims', uid);
            
            await setDoc(claimRef, {
                uid: uid,
                voucherCode: voucherCode.value,
                voucherValue: voucherValue.value,
                tier: userTier.value,
                status: 'claimed',
                claimedAt: serverTimestamp()
            });

            hasSpun.value = true; // Set this only AFTER successful save
            statusMessage.value = "Voucher Ready!";
            error.value = '';

        } catch (err) {
            console.error("Failed to save voucher to Firestore:", err);
            statusMessage.value = "An error occurred while saving.";
            error.value = "Could not save your voucher. Please refresh and try again.";
            // Don't set hasSpun to true, so they can retry
        } finally {
            isLoading.value = false; // Done loading/saving
        }
        
    } else {
        statusMessage.value = "An error occurred.";
        error.value = "Unexpected error. Please refresh and try again.";
    }
}

async function copyCode() {
    if (voucherCode.value) {
        try {
            await navigator.clipboard.writeText(voucherCode.value);
            copyButtonText.value = 'Copied!';
            setTimeout(() => { copyButtonText.value = 'Copy Code'; }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            copyButtonText.value = 'Error!';
             setTimeout(() => { copyButtonText.value = 'Copy Code'; }, 2000);
        }
    }
}
</script>

<style scoped>
.merch-card {
    max-width: 900px;
    margin: 0 auto;
}

.wheel-container {
    /* Responsive sizing for the wheel */
    --wheel-size: clamp(260px, 70vw, 424px);
    --label-radius: calc(var(--wheel-size) * 0.34);
    width: var(--wheel-size);
    height: var(--wheel-size);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
}

.wheel-pointer {
    position: absolute;
    top: calc(var(--wheel-size) * -0.085);
    left: 50%;
    transform: translateX(-50%);
    color: #d4cbc3;
    font-size: clamp(28px, 5vw, 45px);
    z-index: 100;
    pointer-events: none;
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
}

.wheel-pointer :deep(svg) {
    color: inherit;
    width: clamp(24px, 4.5vw, 40px); 
    height: clamp(24px, 4.5vw, 40px);
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
        var(--reward-5) 0deg 120deg,        /* $5 segment */
        var(--reward-10) 120deg 240deg,     /* $10 segment */
        var(--reward-20) 240deg 360deg      /* $20 segment */
    );
    /* Inner shadow for 3D effect */
    box-shadow: 0 0 15px rgba(0,0,0,0.3), inset 0 0 25px rgba(0,0,0,0.4);
    border: 5px solid #fff; /* White border */
}

.wheel::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(var(--wheel-size) * 0.08);
    height: calc(var(--wheel-size) * 0.08);
    background: #fff;
    border-radius: 50%;
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.2);
}

.wheel-container, .wheel {
    box-sizing: border-box;
}



.segment-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center;
    color: white;
    font-weight: 700;
    font-size: clamp(1rem, 3.8vw, 1.5rem);
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
    pointer-events: none;
    margin-top: -15px;
    margin-left: -25px;
    width: 50px;
    height: 30px;
    text-align: center;
}

.voucher-legend {
    width: 250px;
    flex-shrink: 0;
}

.legend-color-box {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid rgba(0,0,0,0.1);
}

/* Voucher Code Display */
.code-display {
    background-color: #f8f9fa; 
    border: 2px dashed #ced4da; 
    padding: 1rem;
    border-radius: 8px;
    color: #343a40;
    max-width: 400px;
    margin: 0 auto;
    letter-spacing: 2px;
    font-size: clamp(1rem, 3.2vw, 1.25rem);
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
}

/* Success message styling to match app theme */
.success-title {
    margin: 0 0 .5rem 0;
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    font-weight: 700;
    font-size: clamp(1.05rem, 2.4vw, 1.35rem);
}
.success-title > span {
    background: linear-gradient(90deg, var(--primary-1) 0%, var(--primary-2) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
.success-icon {
    color: var(--primary-1);
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
}

/* Motion preferences */
@media (prefers-reduced-motion: reduce) {
    .wheel {
        transition: none;
    }
}

/* Dark mode tweaks */
@media (prefers-color-scheme: dark) {
    .wheel-pointer {
        color: #cfc7bf;
    }
    .code-display {
        background-color: #1f2225;
        border-color: #3a3f44;
        color: #e9ecef;
    }
}
</style>