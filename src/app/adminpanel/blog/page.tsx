import { prisma } from "@/lib/prisma";
import BlogAdminClient from "@/components/admin/BlogAdminClient";

export default async function BlogAdminPage() {
    const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
    });

    // Przekształcenie daty na ISO string dla klienta
    const serializablePosts = posts.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));

    return <BlogAdminClient initialPosts={serializablePosts} />;
}
