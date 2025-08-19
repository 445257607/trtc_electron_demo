<template>
  <f7-page name="home">
    <!-- Top Navbar -->
    <f7-navbar large :sliding="false">
      <f7-nav-left>
        <f7-link icon-ios="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title sliding>f7-demo</f7-nav-title>
      <f7-nav-right>
        <f7-link icon-ios="f7:menu" icon-md="material:menu" panel-open="right"></f7-link>
      </f7-nav-right>
      <f7-nav-title-large>f7-demo</f7-nav-title-large>
    </f7-navbar>

    <!-- Page content-->
    <f7-block>
      <p>This is an example of tabs-layout application. The main point of such tabbed layout is that each tab contains independent view with its own routing and navigation.</p>

      <p>Each tab/view may have different layout, different navbar type (dynamic, fixed or static) or without navbar like this tab.</p>
    </f7-block>
    <f7-block-title>Navigation</f7-block-title>
    <f7-list strong inset dividersIos>
      <f7-list-item link="/about/" title="About"></f7-list-item>
      <f7-list-item link="/form/" title="Form"></f7-list-item>
    </f7-list>

    <f7-block-title>Modals</f7-block-title>
    <f7-block class="grid grid-cols-2 grid-gap">
      <f7-button fill popup-open="#my-popup">Popup</f7-button>
      <f7-button fill login-screen-open="#my-login-screen">Login Screen</f7-button>
    </f7-block>

    <f7-block-title>Panels</f7-block-title>
    <f7-block class="grid grid-cols-2 grid-gap">
      <f7-button fill panel-open="left">Left Panel</f7-button>
      <f7-button fill panel-open="right">Right Panel</f7-button>
    </f7-block>

    <f7-list strong inset dividersIos>
      <f7-list-item
        title="Dynamic (Component) Route"
        link="/dynamic-route/blog/45/post/125/?foo=bar#about"
      ></f7-list-item>
      <f7-list-item
        title="Default Route (404)"
        link="/load-something-that-doesnt-exist/"
      ></f7-list-item>
      <f7-list-item
        title="Request Data & Load"
        link="/request-and-load/user/123456/"
      ></f7-list-item>
      <f7-list-button title="加入房间" @click="onClickJoinRoom" />
      <f7-list-button title="离开房间" @click="onClickLeaveRoom" />
    </f7-list>
  </f7-page>
</template>
<script setup lang="ts">
function onClickJoinRoom(): void {
  console.info('onClickJoinRoom', window.api)
  window.api.joinRoom({
    roomId: 1,
  })
}

function onClickLeaveRoom(): void {
  console.info('onClickLeaveRoom', window.api)
  window.api.leaveRoom()
}
</script>
