<script setup lang="ts">
import { ref, onMounted } from "vue";
import { f7, f7ready } from "framework7-vue";

import routes from "@renderer/routes";
import store from "@renderer/store";
import { ErrorInfo, WarningInfo } from "@preload/MainEventHandler";

const f7params = {
  name: "f7-demo", // App name
  theme: "ios", // Automatic theme detection
  // App store
  store: store,
  // App routes
  routes: routes,
};

onMounted(() => {
  f7ready(() => {
    // Call F7 APIs here
  });
});

window.mainEvent.addHandler({
  onWarning(info: WarningInfo) {
    console.warn('onWarning', info)
  },
  onError(info: ErrorInfo) {
    console.error('onError', info)
  }
})

</script>
<template>
  <f7-app v-bind="f7params">
    <f7-view main url="/" />
  </f7-app>
</template>
