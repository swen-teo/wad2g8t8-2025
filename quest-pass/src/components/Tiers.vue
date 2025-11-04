<template>
  <div class="container py-5">
    <div class="text-center mb-5">
      <h1 class="display-5 fw-bold mb-3">🏅 QuestPass Tier Levels</h1>
      <p class="lead text-muted">Advance your tier by earning points through event quests to unlock exclusive rewards and benefits.</p>
    </div>

    <div class="card shadow-lg tier-table-card">
      <div class="card-body p-4 p-md-5">
        
        <h3 class="fw-bold mb-4">Progression & Rewards</h3>

        <div class="table-responsive">
          <table class="table table-hover align-middle tier-table">
            <thead>
              <tr>
                <th scope="col" style="width: 15%;">Tier</th>
                <th scope="col" style="width: 25%;">Level Range</th>
                <th scope="col" style="width: 30%;">Voucher Reward</th>
                <th scope="col">Visual & Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tier, index) in tiers" :key="tier.name" :class="{ 'tier-row-highlight': index === 3 }">
                <td class="fw-bold">{{ tier.name }}</td>
                <td>{{ tier.levels }}</td>
                <td :class="tier.voucherClass">
                  <span v-if="tier.voucherValue">{{ tier.voucherValue }}</span>
                  <span v-else class="text-muted">No Voucher</span>
                </td>
                <td>
                  <span class="tier-visual">{{ tier.visual }}</span>
                  <small class="text-muted ms-2">{{ tier.status }}</small>
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
import { computed } from 'vue';

const tiers = computed(() => [
  {
    name: 'Bronze',
    levels: 'Levels 1–10',
    voucherValue: 'No Voucher',
    voucherClass: 'text-muted',
    visual: '🟤',
    status: 'Entry Level',
  },
  {
    name: 'Silver',
    levels: 'Levels 11–20',
    voucherValue: '$5 Voucher',
    voucherClass: 'text-success',
    visual: '⚪',
    status: 'Tiered Reward Unlocked',
  },
  {
    name: 'Gold',
    levels: 'Levels 21–30',
    voucherValue: '$10 Voucher',
    voucherClass: 'text-success fw-semibold',
    visual: '🟡',
    status: 'Enhanced Rewards',
  },
  {
    name: 'Platinum',
    levels: 'Levels 31+',
    voucherValue: '$20 Voucher',
    voucherClass: 'text-info fw-bold',
    visual: '💎',
    status: 'Exclusive Access',
  },
]);
</script>

<style scoped>
.tier-table-card {
  border-radius: 1rem;
  background-color: #ffffff;
}
.tier-table {
  --bs-table-bg: none;
  --bs-table-hover-bg: #f5f5f5;
  border-radius: 0.75rem;
  overflow: hidden;
}
.tier-table thead th {
  background-color: #f8f9fa;
  border-bottom-width: 2px;
}
.tier-visual {
  font-size: 1.5rem;
}
.tier-row-highlight {
  /* Highlight for the highest tier */
  border-left: 4px solid var(--bs-info, #0dcaf0);
  background-color: #f7fcff;
}
.text-success {
    color: var(--bs-success); /* Ensure success color is available */
}
.text-info {
    color: var(--bs-info); /* Ensure info color is available */
}
</style>