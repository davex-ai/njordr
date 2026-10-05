import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Njörðr",
    short_name: "Njörðr",
    description: "A modern marketplace for things worth having.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f6f2",
    theme_color: "#1b4965",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
