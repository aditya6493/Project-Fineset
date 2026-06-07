export const PRODUCT_CATEGORY_VALUES = [
  "BANGLES",
  "BRACELET",
  "EAR_RINGS",
  "FINGER_RINGS",
  "CHAINS",
  "NECKLACE",
  "MANGALSUTRA",
  "NOSE_PIN",
  "PENDANTS",
  "COLLOR",
  "JUMKA",
  "PENDANT_EARRINGS",
  "NECKLACE_EARRINGS",
  "NECKLACE_PENDANT_EARRINGS",
  "COINS",
  "SILVER",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORY_VALUES)[number];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  BANGLES: "Bangles",
  BRACELET: "Bracelet",
  EAR_RINGS: "Ear rings",
  FINGER_RINGS: "Finger rings",
  CHAINS: "Chains",
  NECKLACE: "Necklace",
  MANGALSUTRA: "Mangalsutra",
  NOSE_PIN: "Nose pin",
  PENDANTS: "Pendants",
  COLLOR: "Collor",
  JUMKA: "Jumka",
  PENDANT_EARRINGS: "Pendant & earrings",
  NECKLACE_EARRINGS: "Necklace & earrings",
  NECKLACE_PENDANT_EARRINGS: "Necklace & pendant & earrings",
  COINS: "Coins",
  SILVER: "Silver",
};
