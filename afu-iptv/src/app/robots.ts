import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/"
      }
    ],
    sitemap: undefined, // Sitemap'i de engelle
    host: undefined // Host bilgisini de engelle
  };
}
