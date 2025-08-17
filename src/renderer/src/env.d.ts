/// <reference types="vite/client" />

declare module "framework7/lite-bundle" {
  import Framework7 from "framework7";
  export default Framework7;
}

declare module "framework7-vue/bundle" {
  import VueFramework7 from "framework7-vue";
  export default VueFramework7;
  export * from "framework7-vue";
  export { registerComponents } from "framework7-vue/bundle";
}
