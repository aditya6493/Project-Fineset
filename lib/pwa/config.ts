/** Bump when PWA or in-app logo assets change (triggers cache refresh for clients). */
export const PWA_ASSET_VERSION = "3";

export const BRAND_NAME = "MyStore";

export const PWA_CONFIG = {
  name: BRAND_NAME,
  shortName: BRAND_NAME,
  /** Shown in link previews (WhatsApp, iMessage, Slack, etc.). */
  shareTitle: `${BRAND_NAME} — Performance analytics SaaS powered by tribly.ai`,
  description:
    "Performance analytics SaaS for multi-store retail, powered by tribly.ai",
  themeColor: "#b8972e",
  backgroundColor: "#faf7f2",
  startUrl: "/",
  scope: "/",
} as const;

/** In-app header / UI (displayed with rounded corners via Logo). */
export const APP_LOGO_SRC = `/logo.png?v=${PWA_ASSET_VERSION}`;

type PwaIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose?: "any" | "maskable" | "monochrome";
};

const iconBase = (size: number) =>
  `/icons/icon-${size}x${size}.png?v=${PWA_ASSET_VERSION}` as const;

/** Full-bleed square icons for install / home screen (no maskable crop). */
export const PWA_ICONS: PwaIcon[] = [
  { src: iconBase(72), sizes: "72x72", type: "image/png" },
  { src: iconBase(96), sizes: "96x96", type: "image/png" },
  { src: iconBase(128), sizes: "128x128", type: "image/png" },
  { src: iconBase(144), sizes: "144x144", type: "image/png" },
  { src: iconBase(152), sizes: "152x152", type: "image/png" },
  { src: iconBase(192), sizes: "192x192", type: "image/png" },
  { src: iconBase(384), sizes: "384x384", type: "image/png" },
  { src: iconBase(512), sizes: "512x512", type: "image/png" },
];
