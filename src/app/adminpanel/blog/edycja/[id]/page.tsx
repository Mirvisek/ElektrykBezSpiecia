import { prisma } from "@/lib/prisma";
import BlogEditorClient from "@/components/admin/BlogEditorClient";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
        where: { id },
    });

    if (!post) notFound();

    return <BlogEditorClient initialData={post} />;
}
