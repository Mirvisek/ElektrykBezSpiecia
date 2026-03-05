import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TestimonialsClient from "@/components/admin/TestimonialsClient";

export const metadata = {
    title: "Opinie i Referencje | Admin Panel",
};

export default async function TestimonialsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const testimonials = await prisma.testimonial.findMany({
        orderBy: { order: "asc" }
    });

    return <TestimonialsClient initialData={testimonials} />;
}
