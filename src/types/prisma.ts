import {
    SiteSetting as PrismaSiteSetting,
    HeroSlide as PrismaHeroSlide,
    Advantage as PrismaAdvantage,
    Service as PrismaService,
    Testimonial as PrismaTestimonial,
    BlogPost as PrismaBlogPost,
    PortfolioItem as PrismaPortfolioItem
} from "@prisma/client";

export type SiteSetting = PrismaSiteSetting;
export type HeroSlide = PrismaHeroSlide;
export type Advantage = PrismaAdvantage;
export type Service = PrismaService;
export type Testimonial = PrismaTestimonial;
export type BlogPost = PrismaBlogPost;

// Bazowy typ z Prisma dla Portfolio
export type PrismaPortfolioItemType = PrismaPortfolioItem;

// Rozszerzony typ używany w komponentach (z sparsowanymi zdjęciami)
export interface PortfolioItem extends Omit<PrismaPortfolioItem, "images"> {
    images: string[];
}
