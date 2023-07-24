<template>
  <div>
    <three-js-face :model="model" :speaking="speaking"></three-js-face>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { ThreeJSFace } from './three-js-face.js';

export default defineComponent({
  name: 'TalkingFace',
  components: {
    ThreeJSFace,
  },
  data() {
    return {
      model: null,
      speaking: false,
    };
  },
  methods: {
    onSpeakingChange() {
      this.model.speaking = this.speaking;
    },
  },
});
</script>

<style>
.talking-face {
  width: 300px;
  height: 300px;
}
</style>