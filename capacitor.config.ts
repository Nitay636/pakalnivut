import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pakalnivut.app",
  appName: "פק״ל ניווט",
  webDir: "build",
  server: {
    url: "http://192.168.1.245:3000",
    cleartext: true,
  },
};

export default config;
