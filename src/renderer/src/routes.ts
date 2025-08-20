import LaunchPage from "./pages/Launch/LaunchPage.vue";
import IdlePage from "@renderer/pages/Idle/IdlePage.vue";

const routes = [
  {
    path: "/",
    component: LaunchPage,
  },
  {
    path: "/idle",
    component: IdlePage,
  }
];

export default routes;
