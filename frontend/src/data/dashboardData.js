import { useAuth } from "../context/AuthContext";
//const { user } = useAuth();
const userd = JSON.parse(localStorage.getItem("user"));

export const mockUser = {
  name: userd?.name || "John Doe",
  email: userd?.email || "john.doe@example.com",
  phone: userd?.phone || "+234 801 234 5678",
  avatar: null,
  isPremium: true,
  memberSince: "Jan 2024",
};

export const mockStats = {
  totalOrders: 24,
  pendingOrders: 3,
  wishlistItems: 12,
  availableVouchers: 5,
};

export const mockOrders = [
  {
    id: "FIT-20240301",
    product: "Emerald Silk Blouse",
    image: "/placeholder.svg",
    date: "2024-03-01",
    price: 28500,
    status: "Delivered",
    vendor: "House of Diva",
    size: "M",
    color: "Green",
    quantity: 1,
  },
  {
    id: "FIT-20240215",
    product: "Gold Embroidered Agbada",
    image: "/placeholder.svg",
    date: "2024-02-15",
    price: 75000,
    status: "Shipped",
    vendor: "Kings Couture",
    size: "XL",
    color: "Gold",
    quantity: 1,
  },
  {
    id: "FIT-20240210",
    product: "Crystal Clutch Bag",
    image: "/placeholder.svg",
    date: "2024-02-10",
    price: 18000,
    status: "Pending",
    vendor: "Luxe Accessories",
    size: "One Size",
    color: "Silver",
    quantity: 1,
  },
  {
    id: "FIT-20240128",
    product: "Ankara Print Dress",
    image: "/placeholder.svg",
    date: "2024-01-28",
    price: 15000,
    status: "Cancelled",
    vendor: "Naija Prints",
    size: "S",
    color: "Multi",
    quantity: 2,
  },
  {
    id: "FIT-20240120",
    product: "Leather Oxford Shoes",
    image: "/placeholder.svg",
    date: "2024-01-20",
    price: 42000,
    status: "Delivered",
    vendor: "Step Right",
    size: "43",
    color: "Brown",
    quantity: 1,
  },
];

export const mockWishlist = [
  {
    id: 1,
    name: "Velvet Evening Gown",
    price: 65000,
    vendor: "House of Diva",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Pearl Necklace Set",
    price: 22000,
    vendor: "Luxe Accessories",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Silk Two-Piece Set",
    price: 35000,
    vendor: "Naija Prints",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Designer Sunglasses",
    price: 18000,
    vendor: "Step Right",
    image: "/placeholder.svg",
  },
];

export const mockMessages = [
  {
    id: 1,
    sender: "House of Diva",
    lastMessage: "Your order has been shipped!",
    time: "2 hours ago",
    unread: true,
    avatar: null,
  },
  {
    id: 2,
    sender: "Fitly Support",
    lastMessage: "How can we help you today?",
    time: "1 day ago",
    unread: false,
    avatar: null,
  },
  {
    id: 3,
    sender: "Kings Couture",
    lastMessage: "Thank you for your purchase!",
    time: "3 days ago",
    unread: false,
    avatar: null,
  },
];

export const mockVouchers = [
  {
    code: "FITLY20",
    discount: "20%",
    expiry: "2024-04-30",
    minOrder: 10000,
    active: true,
  },
  {
    code: "NEWUSER10",
    discount: "₦1,500",
    expiry: "2024-03-31",
    minOrder: 5000,
    active: true,
  },
  {
    code: "FREESHIP",
    discount: "Free Delivery",
    expiry: "2024-05-15",
    minOrder: 15000,
    active: true,
  },
  {
    code: "FLASH50",
    discount: "50%",
    expiry: "2024-02-28",
    minOrder: 20000,
    active: false,
  },
];

export const mockReviews = [
  {
    id: 1,
    product: "Emerald Silk Blouse",
    image: "/placeholder.svg",
    rating: 5,
    text: "Absolutely stunning quality! Fits perfectly.",
    date: "2024-03-05",
  },
  {
    id: 2,
    product: "Leather Oxford Shoes",
    image: "/placeholder.svg",
    rating: 4,
    text: "Great shoes, very comfortable. Delivery was fast.",
    date: "2024-01-25",
  },
];

export const mockAddresses = [
  {
    id: 1,
    name: "Adaeze Okafor",
    phone: "+234 801 234 5678",
    address: "12 Admiralty Way",
    city: "Lekki",
    state: "Lagos",
    country: "Nigeria",
    isDefault: true,
  },
  {
    id: 2,
    name: "Adaeze Okafor",
    phone: "+234 801 234 5678",
    address: "45 Wuse Zone 5",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
    isDefault: false,
  },
];

export const mockNotifications = [
  {
    id: 1,
    title: "Order Delivered",
    description: "Your order FIT-20240301 has been delivered.",
    time: "2 hours ago",
    read: false,
    type: "order",
  },
  {
    id: 2,
    title: "New Voucher Available",
    description: "Get 20% off your next purchase with code FITLY20.",
    time: "1 day ago",
    read: false,
    type: "promo",
  },
  {
    id: 3,
    title: "Price Drop Alert",
    description: "Velvet Evening Gown is now ₦55,000!",
    time: "2 days ago",
    read: true,
    type: "promo",
  },
  {
    id: 4,
    title: "Order Shipped",
    description: "Your order FIT-20240215 is on its way.",
    time: "3 days ago",
    read: true,
    type: "order",
  },
];

export const mockRecentlyViewed = [
  {
    id: 1,
    name: "Sequin Party Dress",
    price: 45000,
    vendor: "House of Diva",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Suede Ankle Boots",
    price: 32000,
    vendor: "Step Right",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Beaded Clutch",
    price: 12000,
    vendor: "Luxe Accessories",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Kaftan Maxi Dress",
    price: 28000,
    vendor: "Naija Prints",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    name: "Gold Hoop Earrings",
    price: 8500,
    vendor: "Luxe Accessories",
    image: "/placeholder.svg",
  },
];
