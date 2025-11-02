<template>
  <div :class="['loader-overlay', { hidden: !isLoading }]">
    <div class="loader-box">
      <div class="image-stack">
        <img src="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/d4f896125442961.6119ab33451ce.png" alt="Event preview 1">
        <img src="https://cdn3.f-cdn.com//files/download/198354575/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202023-05-27%20202204.png?width=780&height=1089&fit=crop" alt="Event preview 2">
        <img src="https://i.ebayimg.com/images/g/xMIAAOSwiHlgmGH8/s-l1200.jpg" alt="Event preview 3">
        <img src="https://ew.com/thmb/2QtrKxN4hhEB5sMSD4-mPPoAAKc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/JB_Key_Art_1500x2000-f0bb47f694a1436182c83488c68ec29a.jpg" alt="Event preview 4">
        <img src="https://png.pngtree.com/png-clipart/20210627/original/pngtree-purple-light-effect-violin-concert-poster-png-image_6457012.jpg" alt="Event preview 5">
        <img src="https://i.redd.it/uefm2er845da1.jpg" alt="Event preview 6">
      </div>

      <div class="loader-text">Loading...</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: true
  }
});
</script>

<style>
/* ----------------------------
   Fullscreen loading overlay
   ---------------------------- */
.loader-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #ffffff, #f7f3ff);
  z-index: 9999;
  transition: opacity 0.6s ease, visibility 0.6s ease;
  opacity: 1;
  visibility: visible;
  overflow: hidden;
}
.loader-overlay.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  transition: transform 0.6s ease, opacity 0.6s ease;
}
.loader-overlay.hidden .loader-box {
  opacity: 0;
  transform: translateY(-20px);
}

/* ----------------------------
   Text shimmer effect
   ---------------------------- */
.loader-text {
  position: relative;
  overflow: hidden;
  color: #6f6b86;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.loader-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.7), transparent);
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* ----------------------------
   Image stack
   ---------------------------- */
.image-stack {
  position: relative;
  width: 300px;
  height: 390px;
}

.image-stack img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  
  opacity: 0;
  animation: pile-on 0.6s ease-out forwards;
  transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55),
              opacity 0.5s ease-out;
}

/* Pile transforms */
.image-stack img:nth-child(1) {
  animation-delay: 0s;
  transform: rotate(-8deg) translateX(-15px) translateY(10px);
}
.image-stack img:nth-child(2) {
  animation-delay: 0.5s;
  transform: rotate(4deg) translateX(8px) translateY(-5px);
}
.image-stack img:nth-child(3) {
  animation-delay: 1s;
  transform: rotate(10deg) translateX(12px) translateY(15px);
}
.image-stack img:nth-child(4) {
  animation-delay: 1.5s;
  transform: rotate(-2deg) translateX(-5px) translateY(-10px);
}
.image-stack img:nth-child(5) {
  animation-delay: 2s;
  transform: rotate(-6deg) translateX(-18px) translateY(8px);
}
.image-stack img:nth-child(6) {
  animation-delay: 2.5s;
  transform: rotate(5deg) translateX(5px) translateY(-15px);
}

/* Exit animation (move upward & fade) */
.loader-overlay.hidden .image-stack img {
  opacity: 0 !important;
  transform: translateY(-100px) scale(0.9);
}

/* Keyframe for entry */
@keyframes pile-on {
  0% {
    opacity: 0;
    transform: translateY(-80px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
