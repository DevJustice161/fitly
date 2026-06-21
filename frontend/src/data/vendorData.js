import collectionWomen from '@/assets/collection-women.jpg';
import collectionMen from '@/assets/collection-men.jpg';
import collectionAccessories from '@/assets/collection-accessories.jpg';
import product2 from '@/assets/product-2.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';
import product6 from '@/assets/product-6.jpg';
import product7 from '@/assets/product-7.jpg';
import product8 from '@/assets/product-8.jpg';

export const vendorProfile = {
  id: 'v1',
  storeName: 'Ama Collections',
  storeLogo: collectionWomen,
  storeBanner: collectionWomen,
  storeDescription: 'Premium ready-to-wear fashion for the modern Nigerian woman. We specialize in elegant dresses, gowns, and two-piece sets crafted with the finest fabrics.',
  category: "Women's fashion",
  ownerName: 'Amara Johnson',
  email: 'amara@amacollections.ng',
  phone: '+234 901 234 5678',
  address: '15 Admiralty Way, Lekki Phase 1',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  bankName: 'GTBank',
  accountName: 'Amara Johnson',
  accountNumber: '0123456789',
  rating: 4.8,
  totalReviews: 312,
  isVerified: true,
  isPremium: true,
  joinedDate: 'Jan 2024',
  followers: 1248,
};

export const vendorStats = {
  totalProducts: 48,
  totalOrders: 256,
  totalSales: 3850000,
  pendingWithdrawals: 425000,
  totalEarnings: 3465000,
  commissionDeducted: 385000,
  netBalance: 425000,
};

export const vendorProducts = [
  { id: 'vp1', name: 'Burgundy Evening Gown', price: 45000, discountPrice: 38000, category: "Women's fashion", stock: 12, image: product5, status: 'Active', sales: 45, rating: 4.8 },
  { id: 'vp2', name: 'Gold Chain Handbag', price: 28000, category: 'Bags', stock: 8, image: product4, status: 'Active', sales: 32, rating: 4.6 },
  { id: 'vp3', name: 'Royal Gold Jewelry Set', price: 32000, discountPrice: 27000, category: 'Accessories', stock: 5, image: product7, status: 'Active', sales: 67, rating: 4.5 },
  { id: 'vp4', name: 'Blush Pink Stilettos', price: 18000, category: 'Shoes', stock: 0, image: product8, status: 'Out of Stock', sales: 28, rating: 4.4 },
  { id: 'vp5', name: 'Classic Agbada Set', price: 65000, category: "Men's fashion", stock: 15, image: product2, status: 'Active', sales: 19, rating: 4.9 },
  { id: 'vp6', name: 'Navy Corporate Suit', price: 85000, category: "Men's fashion", stock: 7, image: product6, status: 'Active', sales: 12, rating: 4.7 },
];

export const vendorOrders = [
  { id: 'VO-2024-001', product: 'Burgundy Evening Gown', productImage: product5, customer: 'Chidinma Okafor', date: 'Mar 20, 2024', price: 45000, status: 'Delivered', commission: 4500, earning: 40500 },
  { id: 'VO-2024-002', product: 'Gold Chain Handbag', productImage: product4, customer: 'Fatima Ibrahim', date: 'Mar 19, 2024', price: 28000, status: 'Shipped', commission: 2800, earning: 25200 },
  { id: 'VO-2024-003', product: 'Royal Gold Jewelry Set', productImage: product7, customer: 'Blessing Eze', date: 'Mar 18, 2024', price: 32000, status: 'Processing', commission: 3200, earning: 28800 },
  { id: 'VO-2024-004', product: 'Classic Agbada Set', productImage: product2, customer: 'Emeka Nwankwo', date: 'Mar 17, 2024', price: 65000, status: 'Pending', commission: 6500, earning: 58500 },
  { id: 'VO-2024-005', product: 'Blush Pink Stilettos', productImage: product8, customer: 'Aisha Musa', date: 'Mar 15, 2024', price: 18000, status: 'Cancelled', commission: 0, earning: 0 },
];

export const vendorCustomers = [
  { id: 'c1', name: 'Chidinma Okafor', email: 'chidinma@email.com', orders: 5, totalSpent: 225000, lastOrder: 'Mar 20, 2024' },
  { id: 'c2', name: 'Fatima Ibrahim', email: 'fatima@email.com', orders: 3, totalSpent: 84000, lastOrder: 'Mar 19, 2024' },
  { id: 'c3', name: 'Blessing Eze', email: 'blessing@email.com', orders: 7, totalSpent: 312000, lastOrder: 'Mar 18, 2024' },
  { id: 'c4', name: 'Emeka Nwankwo', email: 'emeka@email.com', orders: 2, totalSpent: 130000, lastOrder: 'Mar 17, 2024' },
  { id: 'c5', name: 'Aisha Musa', email: 'aisha@email.com', orders: 4, totalSpent: 156000, lastOrder: 'Mar 15, 2024' },
];

export const vendorWithdrawals = [
  { id: 'w1', amount: 150000, date: 'Mar 15, 2024', status: 'Approved', method: 'Bank Transfer', bank: 'GTBank' },
  { id: 'w2', amount: 200000, date: 'Mar 1, 2024', status: 'Approved', method: 'Bank Transfer', bank: 'GTBank' },
  { id: 'w3', amount: 75000, date: 'Feb 15, 2024', status: 'Pending', method: 'Bank Transfer', bank: 'GTBank' },
];

export const vendorNotifications = [
  { id: 'vn1', title: 'New Order Received', description: 'Chidinma Okafor placed an order for Burgundy Evening Gown', time: '2 hours ago', read: false, type: 'order' },
  { id: 'vn2', title: 'Order Delivered', description: 'Order VO-2024-001 has been delivered successfully', time: '1 day ago', read: false, type: 'delivery' },
  { id: 'vn3', title: 'Withdrawal Approved', description: 'Your withdrawal of ₦150,000 has been approved', time: '2 days ago', read: true, type: 'withdrawal' },
  { id: 'vn4', title: 'Premium Subscription Renewal', description: 'Your premium subscription expires in 7 days', time: '3 days ago', read: true, type: 'subscription' },
  { id: 'vn5', title: 'New Message', description: 'Fatima Ibrahim sent you a message about Gold Chain Handbag', time: '4 days ago', read: true, type: 'message' },
];

export const vendorMessages = [
  { id: 'vm1', customer: 'Chidinma Okafor', lastMessage: 'Is the burgundy gown available in size XL?', time: '2 hours ago', unread: true },
  { id: 'vm2', customer: 'Fatima Ibrahim', lastMessage: 'Thank you! The handbag is beautiful', time: '1 day ago', unread: false },
  { id: 'vm3', customer: 'Blessing Eze', lastMessage: 'When will my order be shipped?', time: '2 days ago', unread: true },
  { id: 'vm4', customer: 'Support Team', lastMessage: 'Your premium subscription has been activated', time: '5 days ago', unread: false },
];

export const monthlySalesData = [
  { month: 'Oct', sales: 280000 },
  { month: 'Nov', sales: 420000 },
  { month: 'Dec', sales: 650000 },
  { month: 'Jan', sales: 380000 },
  { month: 'Feb', sales: 520000 },
  { month: 'Mar', sales: 610000 },
];

export const topSellingProducts = [
  { name: 'Royal Gold Jewelry Set', sales: 67, revenue: 1809000 },
  { name: 'Burgundy Evening Gown', sales: 45, revenue: 1710000 },
  { name: 'Gold Chain Handbag', sales: 32, revenue: 896000 },
  { name: 'Blush Pink Stilettos', sales: 28, revenue: 504000 },
];

// Admin data
export const vendorApplications = [
  { id: 'app1', name: 'Ngozi Obi', storeName: 'Ngozi Couture', email: 'ngozi@email.com', phone: '+234 802 345 6789', date: 'Mar 22, 2024', status: 'Pending', category: "Women's fashion", city: 'Abuja' },
  { id: 'app2', name: 'Tunde Adeyemi', storeName: 'Tunde Menswear', email: 'tunde@email.com', phone: '+234 803 456 7890', date: 'Mar 21, 2024', status: 'Pending', category: "Men's fashion", city: 'Lagos' },
  { id: 'app3', name: 'Amina Bello', storeName: 'Amina Bags & More', email: 'amina@email.com', phone: '+234 804 567 8901', date: 'Mar 18, 2024', status: 'Approved', category: 'Bags', city: 'Kano' },
  { id: 'app4', name: 'Chukwu Eze', storeName: 'Royal Fits', email: 'chukwu@email.com', phone: '+234 805 678 9012', date: 'Mar 15, 2024', status: 'Rejected', category: "Men's fashion", city: 'Port Harcourt' },
];

export const adminStats = {
  totalVendors: 42,
  pendingApplications: 8,
  totalRevenue: 12500000,
  commissionEarned: 1250000,
  pendingWithdrawals: 5,
  activeProducts: 856,
};

export const adminWithdrawalRequests = [
  { id: 'aw1', vendor: 'Ama Collections', amount: 75000, date: 'Mar 20, 2024', status: 'Pending', bank: 'GTBank', accountNumber: '****6789' },
  { id: 'aw2', vendor: 'Kings Tailoring', amount: 120000, date: 'Mar 19, 2024', status: 'Pending', bank: 'First Bank', accountNumber: '****3456' },
  { id: 'aw3', vendor: 'Luxe Accessories NG', amount: 45000, date: 'Mar 18, 2024', status: 'Approved', bank: 'UBA', accountNumber: '****7890' },
];

export const commissionSettings = {
  defaultRate: 10,
  premiumRate: 8,
  categories: [
    { name: "Women's fashion", rate: 10 },
    { name: "Men's fashion", rate: 10 },
    { name: 'Shoes', rate: 12 },
    { name: 'Bags', rate: 12 },
    { name: 'Accessories', rate: 15 },
    { name: 'Beauty products', rate: 12 },
  ],
};
