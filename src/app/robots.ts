import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://elektrykbezspiecia.pl";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/adminpanel/", "/api/", "/login/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
