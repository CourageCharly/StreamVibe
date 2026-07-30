import type { Category, MovieCategoryKey, ShowCategoryKey } from "./types";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies & Shows" },
  { href: "/support", label: "Support" },
  { href: "/subscriptions", label: "Subscriptions" },
] as const;

/** Genre categories — Our Genres + Popular Top 10 (slider count = length) */
export const CATEGORIES: Category[] = [
  {
    key: "action",
    name: "Action",
    genreId: 28,
    // Exclude Adventure so Action ≠ Adventure collages
    tmdbPath:
      "/discover/movie?with_genres=28&without_genres=12&sort_by=popularity.desc",
  },
  {
    key: "adventure",
    name: "Adventure",
    genreId: 12,
    // Exclude Action + Comedy so Adventure collages stay distinct
    tmdbPath:
      "/discover/movie?with_genres=12&without_genres=28,35&sort_by=popularity.desc",
  },
  {
    key: "comedy",
    name: "Comedy",
    genreId: 35,
    // Never mix Comedy with Drama (or Adventure) in discover results
    tmdbPath:
      "/discover/movie?with_genres=35&without_genres=12,18&sort_by=popularity.desc",
  },
  {
    key: "drama",
    name: "Drama",
    genreId: 18,
    // Never mix Drama with Comedy in discover results
    tmdbPath:
      "/discover/movie?with_genres=18&without_genres=35&sort_by=popularity.desc",
  },
  {
    key: "horror",
    name: "Horror",
    genreId: 27,
    // Exclude Thriller so Horror ≠ Thriller posters
    tmdbPath:
      "/discover/movie?with_genres=27&without_genres=53&sort_by=popularity.desc",
  },
  {
    key: "thriller",
    name: "Thriller",
    genreId: 53,
    // Exclude Horror so Thriller ≠ Horror posters
    tmdbPath:
      "/discover/movie?with_genres=53&without_genres=27&sort_by=popularity.desc",
  },
  {
    key: "romance",
    name: "Romance",
    genreId: 10749,
    // Exclude pure Comedy so Romance collages stay distinct
    tmdbPath:
      "/discover/movie?with_genres=10749&without_genres=35&sort_by=popularity.desc",
  },
  {
    key: "scifi",
    name: "Sci-Fi",
    genreId: 878,
    // Exclude Fantasy so Sci-Fi ≠ Fantasy collages
    tmdbPath:
      "/discover/movie?with_genres=878&without_genres=14&sort_by=popularity.desc",
  },
  {
    key: "animation",
    name: "Animation",
    genreId: 16,
    // Exclude Family so Animation ≠ Family collages
    tmdbPath:
      "/discover/movie?with_genres=16&without_genres=10751&sort_by=popularity.desc",
  },
  {
    key: "crime",
    name: "Crime",
    genreId: 80,
    // Exclude Thriller overlap titles from Crime collages
    tmdbPath:
      "/discover/movie?with_genres=80&without_genres=53&sort_by=popularity.desc",
  },
  {
    key: "fantasy",
    name: "Fantasy",
    genreId: 14,
    // Exclude Sci-Fi + Adventure so Fantasy stays unique
    tmdbPath:
      "/discover/movie?with_genres=14&without_genres=878,12&sort_by=popularity.desc",
  },
  {
    key: "family",
    name: "Family",
    genreId: 10751,
    // Exclude Animation so Family ≠ Animation collages
    tmdbPath:
      "/discover/movie?with_genres=10751&without_genres=16&sort_by=popularity.desc",
  },
];

/** All movie filters available on /movies and GET /api/movies */
export const MOVIE_LISTS: Category[] = [
  { key: "trending", name: "Trending", tmdbPath: "/trending/movie/week" },
  { key: "popular", name: "Popular", tmdbPath: "/movie/popular" },
  { key: "top_rated", name: "Top Rated", tmdbPath: "/movie/top_rated" },
  { key: "upcoming", name: "Upcoming", tmdbPath: "/movie/upcoming" },
  { key: "now_playing", name: "Now Playing", tmdbPath: "/movie/now_playing" },
  ...CATEGORIES,
];

export const MOVIE_CATEGORY_KEYS = new Set<string>(
  MOVIE_LISTS.map((c) => c.key),
);

/** TV list endpoints + genre discovers (same keys as movie genres for /shows?category=) */
export const SHOW_CATEGORIES: {
  key: ShowCategoryKey;
  name: string;
  tmdbPath: string;
}[] = [
  { key: "trending", name: "Trending", tmdbPath: "/trending/tv/week" },
  { key: "popular", name: "Popular", tmdbPath: "/tv/popular" },
  { key: "top_rated", name: "Top Rated", tmdbPath: "/tv/top_rated" },
  { key: "on_the_air", name: "On The Air", tmdbPath: "/tv/on_the_air" },
  { key: "airing_today", name: "Airing Today", tmdbPath: "/tv/airing_today" },
  /**
   * Genres — TMDB TV has fewer genre ids than movies (e.g. Action & Adventure
   * is a single id 10759). Each UI label uses a distinct discover query so
   * Action ≠ Adventure (and other pairs) don’t share the same result set.
   */
  {
    key: "action",
    name: "Action",
    // Action & Adventure — by popularity
    tmdbPath: "/discover/tv?with_genres=10759&sort_by=popularity.desc",
  },
  {
    key: "adventure",
    name: "Adventure",
    // Distinct from Action: Sci-Fi & Fantasy (adventure epics) by popularity
    // (TV has no separate Adventure id; 10759 was identical to Action)
    tmdbPath: "/discover/tv?with_genres=10765&sort_by=popularity.desc",
  },
  {
    key: "comedy",
    name: "Comedy",
    // Never mix Comedy with Drama on TV either
    tmdbPath:
      "/discover/tv?with_genres=35&without_genres=18&sort_by=popularity.desc",
  },
  {
    key: "drama",
    name: "Drama",
    // Never mix Drama with Comedy on TV either
    tmdbPath:
      "/discover/tv?with_genres=18&without_genres=35&sort_by=popularity.desc",
  },
  {
    key: "horror",
    name: "Horror",
    // TV has no pure Horror id — Mystery by popularity (Thriller uses a different sort)
    tmdbPath: "/discover/tv?with_genres=9648&sort_by=popularity.desc",
  },
  {
    key: "thriller",
    name: "Thriller",
    // Same Mystery id as Horror, different ranking → diversifyGenreCollages de-dupes IDs
    tmdbPath:
      "/discover/tv?with_genres=9648&sort_by=vote_average.desc&vote_count.gte=150",
  },
  {
    key: "romance",
    name: "Romance",
    // Soap / romance — exclude Comedy so posters stay distinct
    tmdbPath:
      "/discover/tv?with_genres=10766&without_genres=35&sort_by=popularity.desc",
  },
  {
    key: "scifi",
    name: "Sci-Fi",
    // Distinct ranking from Adventure/Fantasy (also 10765); de-dupe by id in catalog
    tmdbPath:
      "/discover/tv?with_genres=10765&sort_by=vote_count.desc",
  },
  {
    key: "animation",
    name: "Animation",
    tmdbPath:
      "/discover/tv?with_genres=16&without_genres=10751&sort_by=popularity.desc",
  },
  {
    key: "crime",
    name: "Crime",
    tmdbPath:
      "/discover/tv?with_genres=80&without_genres=35&sort_by=popularity.desc",
  },
  {
    key: "fantasy",
    name: "Fantasy",
    // Distinct ranking from Sci-Fi / Adventure (also 10765)
    tmdbPath:
      "/discover/tv?with_genres=10765&sort_by=vote_average.desc&vote_count.gte=200",
  },
  {
    key: "family",
    name: "Family",
    tmdbPath:
      "/discover/tv?with_genres=10751&without_genres=16&sort_by=popularity.desc",
  },
];

export const SHOW_CATEGORY_KEYS = new Set<string>(
  SHOW_CATEGORIES.map((c) => c.key),
);

export function isMovieCategory(value: string): value is MovieCategoryKey {
  return MOVIE_CATEGORY_KEYS.has(value);
}

export function isShowCategory(value: string): value is ShowCategoryKey {
  return SHOW_CATEGORY_KEYS.has(value);
}

export const DEVICES = [
  {
    title: "Smartphones",
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
    iconSrc: "/Icons/Smartphone.svg",
  },
  {
    title: "Tablet",
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
    iconSrc: "/Icons/Tablet.svg",
  },
  {
    title: "Smart TV",
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
    iconSrc: "/Icons/Smart TV.svg",
  },
  {
    title: "Laptops",
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
    iconSrc: "/Icons/Laptops.svg",
  },
  {
    title: "Gaming Consoles",
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
    iconSrc: "/Icons/Gaming Consoles.svg",
  },
  {
    title: "VR Headsets",
    description:
      "StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store",
    iconSrc: "/Icons/VR Headsets.svg",
  },
];

/** FAQ items — optional questionLines force a clean 2-line break on mobile */
export const FAQS: {
  id: string;
  question: string;
  /** Mobile-only 2-line title [line1, line2]; desktop uses `question` */
  questionLines?: [string, string];
  answer: string;
}[] = [
  {
    id: "01",
    question: "What is StreamVibe?",
    answer:
      "StreamVibe is a streaming service that allows you to watch movies and shows on demand.",
  },
  {
    id: "02",
    question: "How much does StreamVibe cost?",
    answer:
      "StreamVibe offers flexible plans starting at $9.99/month for Basic, $12.99/month for Standard, and $14.99/month for Premium. Yearly plans include additional savings.",
  },
  {
    id: "03",
    question: "What content is available on StreamVibe?",
    questionLines: [
      "What content is available",
      "on StreamVibe?",
    ],
    answer:
      "StreamVibe features the latest blockbusters, classic movies, popular TV shows, exclusive originals, and more across many genres.",
  },
  {
    id: "04",
    question: "How can I watch StreamVibe?",
    answer:
      "You can watch StreamVibe on smartphones, tablets, smart TVs, laptops, gaming consoles, and VR headsets — anytime, anywhere.",
  },
  {
    id: "05",
    question: "How do I sign up for StreamVibe?",
    questionLines: ["How do I sign up", "for StreamVibe?"],
    answer:
      "Click Start Watching Now or Start Free Trial, create an account with your email, choose a plan, and start streaming in minutes.",
  },
  {
    id: "06",
    question: "What is the StreamVibe free trial?",
    questionLines: ["What is the StreamVibe", "free trial?"],
    answer:
      "New users can start a free trial to explore StreamVibe’s full library before committing to a paid subscription.",
  },
  {
    id: "07",
    question: "How do I contact StreamVibe customer support?",
    questionLines: [
      "How do I contact StreamVibe",
      "customer support?",
    ],
    answer:
      "Reach our support team through the Support page, email, or in-app help center. We’re available to assist with billing, playback, and account questions.",
  },
  {
    id: "08",
    question: "What are the StreamVibe payment methods?",
    questionLines: [
      "What are the StreamVibe",
      "payment methods?",
    ],
    answer:
      "We accept major credit and debit cards, PayPal, and other local payment methods depending on your region.",
  },
];

export const PLANS = [
  {
    name: "Basic Plan",
    shortName: "Basic",
    description:
      "Enjoy an extensive library of movies and shows, featuring a range of content, including recently released titles.",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    popular: false,
    features: {
      content:
        "Access to a wider selection of movies and shows, including most new releases and exclusive content",
      devices: "Watch on one device simultaneously",
      freeTrial: "7 Days",
      cancelAnytime: "Yes",
      hdr: "No",
      dolbyAtmos: "No",
      adFree: "No",
      offline: "No",
      familySharing: "No",
    },
  },
  {
    name: "Standard Plan",
    shortName: "Standard",
    description:
      "Access to a wider selection of movies and shows, including most new releases and exclusive content",
    monthlyPrice: 12.99,
    yearlyPrice: 129.99,
    popular: true,
    features: {
      content:
        "Access to a wider selection of movies and shows, including most new releases and exclusive content",
      devices: "Watch on Two device simultaneously",
      freeTrial: "7 Days",
      cancelAnytime: "Yes",
      hdr: "Yes",
      dolbyAtmos: "Yes",
      adFree: "Yes",
      offline: "Yes, for select titles.",
      familySharing: "Yes, up to 5 family members.",
    },
  },
  {
    name: "Premium Plan",
    shortName: "Premium",
    description:
      "Access to a widest selection of movies and shows, including all new releases and Offline Viewing",
    monthlyPrice: 14.99,
    yearlyPrice: 149.99,
    popular: false,
    features: {
      content:
        "Access to a wider selection of movies and shows, including most new releases and exclusive content",
      devices: "Watch on Four device simultaneously",
      freeTrial: "7 Days",
      cancelAnytime: "Yes",
      hdr: "Yes",
      dolbyAtmos: "Yes",
      adFree: "Yes",
      offline: "Yes, for all titles.",
      familySharing: "Yes, up to 6 family members.",
    },
  },
];

/** Rows for the subscription comparison table (Subscription Page design) */
export const PLAN_COMPARE_ROWS: {
  key: keyof (typeof PLANS)[number]["features"] | "price";
  label: string;
}[] = [
  { key: "price", label: "Price" },
  { key: "content", label: "Content" },
  { key: "devices", label: "Devices" },
  { key: "freeTrial", label: "Free Trail" },
  { key: "cancelAnytime", label: "Cancel Anytime" },
  { key: "hdr", label: "HDR" },
  { key: "dolbyAtmos", label: "Dolby Atmos" },
  { key: "adFree", label: "Ad - Free" },
  { key: "offline", label: "Offline Viewing" },
  { key: "familySharing", label: "Family Sharing" },
];

export const FOOTER_LINKS = {
  Home: [
    { label: "Categories", href: "/#categories" },
    { label: "Devices", href: "/#devices" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ],
  Movies: [
    { label: "Genres", href: "/movies" },
    { label: "Trending", href: "/movies?category=trending" },
    { label: "New Release", href: "/movies?category=upcoming" },
    { label: "Popular", href: "/movies?category=popular" },
  ],
  Shows: [
    { label: "Genres", href: "/shows" },
    { label: "Trending", href: "/shows?category=trending" },
    { label: "New Release", href: "/shows?category=on_the_air" },
    { label: "Popular", href: "/shows?category=popular" },
  ],
  Support: [{ label: "Contact Us", href: "/support" }],
  Subscription: [
    { label: "Plans", href: "/subscriptions" },
    { label: "Features", href: "/subscriptions#features" },
  ],
};
