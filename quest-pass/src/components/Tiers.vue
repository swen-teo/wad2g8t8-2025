<template>
  <div class="container py-5">
    <div class=" mb-5">
      <h1 class="display-5 fw-bold mb-3">QuestPass Tier Levels</h1>
      <p class="lead text-muted">Advance your tier by earning points through event quests to unlock exclusive rewards and benefits.</p>
    </div>

    <div class="card shadow-lg tier-table-card">
      <div class="card-body p-4 p-md-5">
        
        <h3 class="fw-bold mb-4">Progression & Rewards</h3>

        <div class="table-responsive table-container">
          <table class="table table-hover align-middle tier-table">
            <thead>
              <tr>
                <th scope="col">Tier</th>
                <th scope="col">Level Range</th>
                <th scope="col">Voucher Reward</th>
                <th scope="col" class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tier in tiers" 
                  :key="tier.name" 
                  :class="[ 'tier-' + tier.name.toLowerCase(), { 'tier-row-highlight': tier.name === currentUserTier } ]">
                
                <td class="fw-bold">{{ tier.name }}</td>
                <td>{{ tier.levels }}</td>
                <td :class="tier.voucherClass">
                  <span v-if="tier.voucherValue">{{ tier.voucherValue }}</span>
                  <span v-else>No Voucher</span>
                </td>
                <td class="text-end">
                  <!-- 
                    CHANGED: Added v-if to hide the button for Bronze 
                  -->
                  <router-link :to="tier.linkUrl" class="btn btn-sm btn-outline-info" v-if="tier.name !== 'Bronze'">
                    View Details
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

// You can change 'Silver' to 'Bronze' or 'Gold' to see the highlight move.
const currentUserTier = ref('Silver');

const tiers = computed(() => [
  {
    name: 'Bronze',
    levels: 'Levels 1–10',
    voucherValue: null,
    voucherClass: 'text-muted',
    linkUrl: '/tier/bronze', // This route won't be used now, but good to keep it consistent
  },
  {
    name: 'Silver',
    levels: 'Levels 11–20',
    voucherValue: 'Randomised Voucher',
    voucherClass: 'text-success',
    linkUrl: '/SilverMerch', // CHANGED
  },
  {
    name: 'Gold',
    levels: 'Levels 21+',
    voucherValue: 'Purchase Custom Merch',
    voucherClass: 'text-success fw-semibold',
    linkUrl: '/Merch', // CHANGED
  },
]);
</script>

<style scoped>
/* All styles from the previous step are retained */
.tier-table-card {
  border-radius: 1rem;
  background-color: #ffffff;
}

.table-container {
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #dee2e6; /* Adds a clean border */
}

.tier-table {
  --bs-table-bg: none;
  --bs-table-hover-bg: #f5f5f5;
  margin-bottom: 0; 
}

.tier-table thead th {
  background-color: #f8f9fa;
  border-bottom-width: 2px;
}

.tier-table th:nth-child(2),
.tier-table td:nth-child(2),
.tier-table th:nth-child(4),
.tier-table td:nth-child(4) {
  white-space: nowrap;
}

/* Glow styles for tier names */
.tier-bronze .fw-bold {
  color: #a05a2c; /* Darker bronze */
  text-shadow: 0 0 6px rgba(205, 127, 50, 0.7); /* Bronze glow */
}

.tier-silver .fw-bold {
  color: #a8a8a8; /* Darker silver */
  text-shadow: 0 0 8px rgba(224, 224, 224, 0.9); /* Silver glow */
}

.tier-gold .fw-bold {
  color: #b8860b; /* Dark goldenrod */
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.8); /* Gold glow */
}

/* Base highlight class (border style) */
.tier-row-highlight {
  border-left-width: 4px;
  border-left-style: solid;
  font-weight: 600;
}

/* Make the highlight color match the tier */
.tier-row-highlight.tier-bronze {
  border-left-color: #cd7f32;
  background-color: #fff4e8;
}

.tier-row-highlight.tier-silver {
  border-left-color: #c0c0c0;
  background-color: #f7f7f7;
}

.tier-row-highlight.tier-gold {
  border-left-color: #ffd700;
  background-color: #fffbeb;
}


.tier-row-highlight .fw-bold {
  font-weight: 700;
}

.text-success {
    color: var(--bs-success);
}
.text-info {
    color: var(--bs-info);
}
</style>