import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AreBet",
    short_name: "AreBet",
    description: "Smart Betting. Simple Insights.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#22c55e",
    orientation: "portrait-primary",
    categories: ["sports", "finance"],
    icons: [
      {
        src: "/arebet-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/arebet-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
