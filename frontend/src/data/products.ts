import product2 from "@/assets/product-2.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";
import collectionWomen from "@/assets/collection-women.jpg";
import collectionMen from "@/assets/collection-men.jpg";
import collectionAccessories from "@/assets/collection-accessories.jpg";
import collectionShoes from "@/assets/collection-shoes.avif";
import collectionBags from "@/assets/collection-bags.jpg";
import collectionBeautyProducts from "@/assets/collection-beauty-products.avif";
export const products = [
  {
    id: "1",
    name: "Burgundy Evening Gown",
    price: 45000,
    originalPrice: 58000,
    image: product5,
    vendor: "Ama Collections",
    isPremiumVendor: true,
    category: "Women",
    subcategory: "Gowns",
    rating: 4.8,
    reviews: 124,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Burgundy", "Black", "Navy"],
    isNew: true,
    isTrending: true,
  },
  {
    id: "2",
    name: "Classic Agbada Set",
    price: 65000,
    image: product2,
    vendor: "Kings Tailoring",
    isPremiumVendor: true,
    category: "Men",
    subcategory: "Native Wear",
    rating: 4.9,
    reviews: 89,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Navy"],
    isTrending: true,
  },
  {
    id: "3",
    name: "Gold Chain Handbag",
    price: 28000,
    originalPrice: 35000,
    image: product4,
    vendor: "Luxe Accessories NG",
    isPremiumVendor: false,
    category: "Accessories",
    subcategory: "Bags",
    rating: 4.6,
    reviews: 67,
    colors: ["Gold", "Silver", "Rose Gold"],
    isNew: true,
  },
  {
    id: "4",
    name: "Navy Corporate Suit",
    price: 85000,
    image: product6,
    vendor: "Elite Menswear",
    isPremiumVendor: true,
    category: "Men",
    subcategory: "Corporate",
    rating: 4.7,
    reviews: 45,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy", "Charcoal", "Black"],
  },
  {
    id: "5",
    name: "Royal Gold Jewelry Set",
    price: 32000,
    originalPrice: 42000,
    image: product7,
    vendor: "Adorn NG",
    isPremiumVendor: false,
    category: "Accessories",
    subcategory: "Jewelry",
    rating: 4.5,
    reviews: 156,
    isTrending: true,
  },
  {
    id: "6",
    name: "Blush Pink Stilettos",
    price: 18000,
    image: product8,
    vendor: "Sole Sisters",
    isPremiumVendor: true,
    category: "Accessories",
    subcategory: "Shoes",
    rating: 4.4,
    reviews: 92,
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: ["Pink", "Nude", "Black"],
    isNew: true,
    isTrending: true,
  },
];

export const categories = [
  {
    name: "Women's fashion",
    image: collectionWomen,
    subcategories: ["Dresses", "Two-piece", "Gowns"],
  },
  {
    name: "Men's fashion",
    image: collectionMen,
    subcategories: ["Native Wear", "Casual", "Corporate"],
  },
  {
    name: "Accessories",
    image: collectionAccessories,
    subcategories: ["Bags", "Shoes", "Jewelry"],
  },
  {
    name: "Shoes",
    image: collectionShoes,
    subcategories: ["Heels", "Flats", "Sneakers"],
  },
  {
    name: "Bags",
    image: collectionBags,
    subcategories: ["Handbags", "Backpacks", "Clutches"],
  },
  {
    name: "Beauty products",
    image: collectionBeautyProducts,
    subcategories: ["Skincare", "Makeup", "Fragrances"],
  },
];

export const vendors = [
  {
    id: "1",
    name: "Ama Collections",
    logo: collectionWomen,
    isPremium: true,
    rating: 4.8,
    productCount: 48,
  },
  {
    id: "2",
    name: "Kings Tailoring",
    logo: collectionMen,
    isPremium: true,
    rating: 4.9,
    productCount: 35,
  },
  {
    id: "3",
    name: "Luxe Accessories NG",
    logo: collectionAccessories,
    isPremium: false,
    rating: 4.6,
    productCount: 62,
  },
  {
    id: "4",
    name: "Elite Menswear",
    logo: collectionMen,
    isPremium: true,
    rating: 4.7,
    productCount: 28,
  },
];
