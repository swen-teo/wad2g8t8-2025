<template>
  <div class="filter-select" ref="wrapperRef">
    <label :for="triggerId" class="filter-label">{{ label }}</label>
    <div class="select-wrapper">
      <button
        :id="triggerId"
        type="button"
        class="select-trigger"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-haspopup="'listbox'"
        :aria-controls="listboxId"
        @click="toggleMenu"
        @keydown="onTriggerKeydown"
        ref="triggerRef"
      >
        <span class="trigger-label">{{ displayLabel }}</span>
        <i class="fas fa-chevron-down" aria-hidden="true"></i>
      </button>
      <transition name="dropdown-fade">
        <ul
          v-if="isOpen"
          :id="listboxId"
          class="select-menu"
          role="listbox"
          ref="menuRef"
        >
          <li
            v-for="option in options"
            :key="option.value"
            class="select-option"
            role="option"
            :aria-selected="option.value === modelValue ? 'true' : 'false'"
            :class="{ active: option.value === modelValue }"
            @mousedown.prevent
            @click="selectOption(option.value)"
          >
            {{ option.label }}
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: 'all',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const triggerRef = ref(null);
const menuRef = ref(null);
const wrapperRef = ref(null);

const uid = Math.random().toString(36).slice(2, 8);
const triggerId = `filter-trigger-${uid}`;
const listboxId = `filter-listbox-${uid}`;

const displayLabel = computed(() => {
  const match = props.options.find((option) => option.value === props.modelValue);
  return match?.label ?? props.placeholder;
});

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function closeMenu() {
  if (!isOpen.value) return;
  isOpen.value = false;
}

function selectOption(value) {
  emit('update:modelValue', value);
  closeMenu();
  requestAnimationFrame(() => {
    triggerRef.value?.focus();
  });
}

function handleClickOutside(event) {
  if (!wrapperRef.value) return;
  if (
    wrapperRef.value.contains(event.target) ||
    (menuRef.value && menuRef.value.contains(event.target))
  ) {
    return;
  }
  closeMenu();
}

function handleGlobalKeydown(event) {
  if (event.key === 'Escape') {
    closeMenu();
    requestAnimationFrame(() => {
      triggerRef.value?.focus();
    });
  }
}

function onTriggerKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleMenu();
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (!isOpen.value) {
      isOpen.value = true;
    }
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style scoped>
.filter-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 160px;
  flex: 1 1 160px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-muted, #6c757d);
}

.select-wrapper {
  position: relative;
}

.select-trigger {
  width: 100%;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--bs-border-color, #ced4da);
  background-color: #fff;
  color: var(--bs-body-color, #212529);
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.select-trigger:focus-visible {
  outline: none;
  border-color: var(--primary-1, #a78bfa);
  box-shadow: 0 0 0 0.25rem rgba(167, 139, 250, 0.25);
}

.select-trigger i {
  font-size: 0.85rem;
  color: var(--ink-muted, #6c757d);
}

.select-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 100%;
  padding: 0.25rem;
  margin: 0;
  list-style: none;
  background-color: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 18px 42px rgba(45, 45, 61, 0.16);
  border: 1px solid rgba(167, 139, 250, 0.2);
  z-index: 20;
  max-height: 14rem;
  overflow-y: auto;
}

.select-option {
  padding: 0.6rem 0.85rem;
  border-radius: 0.6rem;
  cursor: pointer;
  color: var(--bs-body-color, #212529);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.select-option:hover,
.select-option:focus,
.select-option.active {
  background-color: rgba(167, 139, 250, 0.14);
  color: var(--bs-body-color, #212529);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
