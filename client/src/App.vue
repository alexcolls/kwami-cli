<script setup lang="ts">
import "./services/recordAudio";
import LiquidBody from "./components/LiquidBody.vue";
// import LiquidTalk from "./components/LiquidTalk.vue";

// import HumanFace from './components/HumanFace.vue'
</script>

<template>
  <main>
    <!-- <HumanFace /> -->
    <LiquidBody />
    <!-- <LiquidTalk /> -->
  </main>
</template>

<style>
/* 
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #3fbb34;
  margin: 0 !important;
} */

html body {
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden;
}
</style>
