import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/chat/", "/upload/", "/insights/", "/reports/", "/settings/"],
    },
    sitemap: "https://productmind.ai/sitemap.xml",
  };
}
