<template>
  <div class="container py-5">
    <div class="mb-5">
      <h1 class="page-title mb-3">QuestPass Tier Levels</h1>
      <p class="lead text-muted">
        Advance your tier by earning points through event quests to unlock exclusive rewards and benefits.
      </p>
    </div>

    <div class="card shadow-lg tier-panel">
      <div class="card-body p-4 p-md-5">
        <h3 class="fw-bold mb-4">Progression & Rewards</h3>

        <!-- 1 card per row on all sizes -->
        <div class="row g-3">
          <div class="col-12" v-for="tier in tiers" :key="tier.name">
            <div
              :class="[
                'tier-item',
                'accent-' + tier.name.toLowerCase(),
                { 'is-current': tier.name === userStore.currentUser?.currentTier }
              ]"
            >
              <div class="left-accent"></div>

              <div class="content">
                <div class="top-row">
                  <div class="title fw-semibold">{{ tier.name }}</div>
                  <router-link
                    v-if="tier.name !== 'Bronze'"
                    :to="tier.linkUrl"
                    class="chip"
                  >
                    View 
                  </router-link>
                </div>

                <div class="meta">
                  <span class="label">Levels</span>
                  <span class="value">{{ tier.levels }}</span>
                  <span class="dot">•</span>
                  <span class="label">Reward</span>
                  <span class="value" :class="tier.voucherClass">
                    {{ tier.voucherValue || 'No Voucher' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div> 
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

const tiers = computed(() => [
  { name: 'Bronze', levels: 'Levels 1–10', voucherValue: null, voucherClass: 'text-muted', linkUrl: '/tier/bronze' },
  { name: 'Silver', levels: 'Levels 11–20', voucherValue: 'Randomised Voucher', voucherClass: 'text-success', linkUrl: '/SilverMerch' },
  { name: 'Gold',   levels: 'Levels 21+', voucherValue: 'Redeem Custom Merch', voucherClass: 'text-success fw-semibold', linkUrl: '/Merch' },
]);
</script>

<style scoped>
/* Panel */
.tier-panel { border-radius: 1rem; background: #fff; }
@media (max-width: 575.98px) { .tier-panel .card-body { padding: 1rem !important; } }

/* Item */
.tier-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,.06);
}

.tier-item.is-current {
  border-color: #f69036ff;
  background: #fff;
  box-shadow: none;
}

/* left accent bar */
.tier-item .left-accent {
  width: 4px;
  align-self: stretch;
  border-radius: 6px;
  background: #e9ecef;
}

/* content */
.tier-item .content { flex: 1 1 auto; min-width: 0; }
.tier-item .top-row { display: flex; align-items: center; justify-content: space-between; }
.tier-item .title { font-size: 1rem; }

/* gradient chip */
.tier-item .chip {
  display: inline-block;
  padding: 5px 20px;
  font-size: .8rem;
  line-height: 1.4;
  border-radius: 9999px;
  border: none;
  color: white;
  font-weight: 600;
  text-decoration: none;
  background: linear-gradient(90deg, #a18cd1 0%, #649bff 100%);
  box-shadow: 0 2px 6px rgba(100,155,255,.3);
  transition: all .25s ease;
}
.tier-item .chip:hover {
  background: linear-gradient(90deg, #649bff 0%, #4d9fff 100%);
  color: black;
  box-shadow: 0 3px 10px rgba(100,155,255,.5);
  transform: translateY(-1px);
}

/* meta row */
.tier-item .meta {
  margin-top: 4px;
  font-size: .9rem;
  color: #6c757d;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.tier-item .meta .label { color: #8b949e; }
.tier-item .meta .value { color: #343a40; }
.tier-item .meta .dot   { color: #c5c9ce; }

/* tier accent colors */
.accent-bronze .left-accent { background: #cd7f32; }
.accent-silver .left-accent { background: #c0c0c0; }
.accent-gold   .left-accent { background: #ffd700; }

@media (max-width: 575.98px) {
  .tier-bronze .fw-bold, .tier-silver .fw-bold, .tier-gold .fw-bold { text-shadow: none; }
}
</style>
