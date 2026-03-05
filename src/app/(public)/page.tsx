import { prisma } from "@/lib/prisma";
import LandingPageClient from "@/components/LandingPageClient";

export default async function Home() {
  const [settings, heroSlides, advantages, services, testimonials] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: "global" } }),
    prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.advantage.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
  ]);

  return (
    <LandingPageClient
      settings={settings}
      heroSlides={heroSlides}
      advantages={advantages}
      services={services}
      testimonials={testimonials}
    />
  );
}
