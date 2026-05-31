import type { MetadataRoute } from "next";
import { PWA_CONFIG, PWA_ICONS } from "@/lib/pwa/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: PWA_CONFIG.name,
    short_name: PWA_CONFIG.shortName,
    description: PWA_CONFIG.description,
    start_url: PWA_CONFIG.startUrl,
    scope: PWA_CONFIG.scope,
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "any",
    theme_color: PWA_CONFIG.themeColor,
    background_color: PWA_CONFIG.backgroundColor,
    categories: ["business", "productivity"],
    prefer_related_applications: false,
    icons: PWA_ICONS.map(({ purpose, ...icon }) =>
      purpose ? { ...icon, purpose } : icon,
    ),
  };
}
