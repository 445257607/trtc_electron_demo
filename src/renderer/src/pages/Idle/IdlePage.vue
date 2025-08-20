<script setup lang="ts">

function onClickJoin(): void {
  console.info('IdlePage: onClickJoin');
  window.api.joinRoom({
    roomId: 1
  })
}

</script>

<template>
  <f7-page id="idle-page">
    <div id="background"></div>
    <div id="content">
      <f7-button id="join" title="加入" @click="onClickJoin"></f7-button>
    </div>
  </f7-page>
</template>

<style scoped>
#idle-page {
  position: relative;
  background-color: red;
}
#background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  z-index: -1; /* Ensure the background is behind other elements */
}
#content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: red;
  #join {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 200px;
    height: 50px;
    background-color: #007aff; /* iOS blue */
    color: white;
    font-size: 18px;
  }
}
</style>
