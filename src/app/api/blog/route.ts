import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { title, slug, content, excerpt, imageUrl, isPublished } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug,
                content,
                excerpt,
                imageUrl,
                isPublished: !!isPublished,
            },
        });

        return NextResponse.json(post);
    } catch (error: any) {
        console.error("DEBUG: Blog POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
}
