<template>
  <div class="wave-background">
    <div class="waves">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
      <div class="wave wave-4"></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.wave-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.waves {
  position: relative;
  width: 100%;
  height: 100%;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background-repeat: repeat-x;
  opacity: 0.6;
}

.wave-1 {
  background: radial-gradient(
    ellipse at center,
    rgba(179, 229, 252, 0.8) 0%,
    rgba(129, 212, 250, 0.6) 50%,
    rgba(66, 165, 245, 0.4) 100%
  );
  animation:
    waveMove 25s linear infinite,
    waveRise 15s ease-in-out infinite;
  z-index: 4;
}

.wave-2 {
  background: radial-gradient(
    ellipse at center,
    rgba(129, 212, 250, 0.6) 0%,
    rgba(66, 165, 245, 0.4) 50%,
    rgba(21, 101, 192, 0.2) 100%
  );
  animation:
    waveMove 20s linear infinite reverse,
    waveRise 18s ease-in-out infinite 2s;
  z-index: 3;
  opacity: 0.4;
}

.wave-3 {
  background: radial-gradient(
    ellipse at center,
    rgba(66, 165, 245, 0.4) 0%,
    rgba(21, 101, 192, 0.3) 50%,
    rgba(13, 71, 161, 0.1) 100%
  );
  animation:
    waveMove 30s linear infinite,
    waveRise 25s ease-in-out infinite 1s;
  z-index: 2;
  opacity: 0.3;
}

.wave-4 {
  background: radial-gradient(
    ellipse at center,
    rgba(21, 101, 192, 0.3) 0%,
    rgba(13, 71, 161, 0.2) 50%,
    rgba(2, 48, 112, 0.1) 100%
  );
  animation:
    waveMove 35s linear infinite reverse,
    waveRise 30s ease-in-out infinite 3s;
  z-index: 1;
  opacity: 0.2;
}

@keyframes waveMove {
  0% {
    transform: translateX(0) scaleY(1);
  }
  50% {
    transform: translateX(-25%) scaleY(1.05);
  }
  100% {
    transform: translateX(-50%) scaleY(1);
  }
}

@keyframes waveRise {
  0%,
  100% {
    height: 60%;
    bottom: -10%;
  }
  25% {
    height: 75%;
    bottom: -5%;
  }
  50% {
    height: 85%;
    bottom: 0%;
  }
  75% {
    height: 75%;
    bottom: -5%;
  }
}

@media (max-width: 768px) {
  .wave {
    animation-duration: 20s, 12s !important;
  }

  @keyframes waveRise {
    0%,
    100% {
      height: 50%;
      bottom: -5%;
    }
    50% {
      height: 70%;
      bottom: 0%;
    }
  }
}
</style>
