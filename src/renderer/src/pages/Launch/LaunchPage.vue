<script setup lang="ts">

import { f7 } from "framework7-vue";

function onPageAfterIn(): void {
  console.info('LaunchPage: onPageAfterIn', f7.views.main);
  f7.views.main.router.navigate('/idle', {
    reloadCurrent: true,
    reloadAll: true,
  });
}

</script>

<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-page-content id="content">
      <div id="bg" ref="bg"></div>
      <div id="fg"></div>
    </f7-page-content>
  </f7-page>
</template>

<style scoped>
#content {
  width: 100%;
  height: 100%;
  position: relative;
  justify-content: center;
  align-items: center;
  background-color: bisque;
}
#bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: bisque;
}
#fg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: bisque;
}
</style>
