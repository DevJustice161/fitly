import { Link } from 'react-router-dom';
import { Star, BadgeCheck, Heart, MessageCircle, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { vendorProfile, vendorProducts } from '@/data/vendorData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const VendorStorePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={vendorProfile.storeBanner} alt="Store banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="section-padding -mt-16 relative z-10">
        {/* Store Info */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
          <img src={vendorProfile.storeLogo} alt={vendorProfile.storeName}
            className="h-24 w-24 rounded-xl border-4 border-card object-cover shadow-md" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{vendorProfile.storeName}</h1>
              {vendorProfile.isVerified && <BadgeCheck className="h-6 w-6 text-primary" />}
              {vendorProfile.isPremium && (
                <Badge className="premium-badge text-xs">Premium</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1 max-w-2xl">{vendorProfile.storeDescription}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary fill-primary" /> {vendorProfile.rating} ({vendorProfile.totalReviews} reviews)</span>
              <span>{vendorProfile.followers.toLocaleString()} followers</span>
              <span>Joined {vendorProfile.joinedDate}</span>
              <span>{vendorProfile.city}, {vendorProfile.state}</span>
            </div>
            <div className="flex gap-3 mt-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                <Heart className="h-4 w-4 mr-2" /> Follow
              </Button>
              <Button variant="outline" className="rounded-full border-primary text-primary">
                <MessageCircle className="h-4 w-4 mr-2" /> Message
              </Button>
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" /> Products ({vendorProducts.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {vendorProducts.filter(p => p.status === 'Active').map(product => (
            <Link to={`/product/${product.id}`} key={product.id}>
              <Card className="border border-border shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardContent className="p-3">
                  <img src={product.image} alt={product.name} className="w-full aspect-square rounded-lg object-cover bg-muted mb-2 group-hover:scale-[1.02] transition-transform" />
                  <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-heading font-semibold text-foreground">₦{product.price.toLocaleString()}</p>
                    {product.discountPrice && (
                      <p className="text-xs text-muted-foreground line-through">₦{product.discountPrice.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-primary fill-primary" />
                    <span className="text-xs text-muted-foreground">{product.rating}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VendorStorePage;
