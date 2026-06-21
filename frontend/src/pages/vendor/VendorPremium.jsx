import { Crown, Check, BadgeCheck, TrendingUp, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    name: 'Basic Vendor',
    price: 'Free',
    period: '',
    features: ['List up to 20 products', 'Standard search ranking', 'Basic analytics', 'Email support'],
    current: false,
  },
  {
    name: 'Premium Vendor',
    price: '₦15,000',
    period: '/month',
    features: [
      'Unlimited products',
      'Higher search ranking',
      'Featured on homepage',
      'Priority product visibility',
      'Verified vendor badge',
      'Advanced analytics',
      'Priority support',
      'Reduced commission (8%)',
    ],
    current: true,
    popular: true,
  },
];

const VendorPremium = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">Premium Vendor</h1>
        <p className="text-muted-foreground mt-1">Boost your visibility and sales with Premium</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map(plan => (
          <Card key={plan.name} className={`border shadow-sm relative ${plan.popular ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-border'}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="premium-badge px-3 py-1"><Crown className="h-3 w-3" /> Most Popular</span>
              </div>
            )}
            <CardHeader className="text-center pt-8">
              <CardTitle className="font-heading text-xl">{plan.name}</CardTitle>
              <p className="text-3xl font-heading font-bold text-foreground mt-2">
                {plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
                onClick={() => toast({ title: plan.current ? 'Already subscribed' : 'Subscription started', description: plan.current ? 'You are already on this plan' : `You are now on the ${plan.name} plan` })}
              >
                {plan.current ? 'Current Plan' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader><CardTitle className="font-heading text-lg">Premium Benefits</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: TrendingUp, title: 'Higher Rankings', desc: 'Your products appear first in search results' },
              { icon: Star, title: 'Homepage Featured', desc: 'Get showcased in the featured vendors section' },
              { icon: BadgeCheck, title: 'Verified Badge', desc: 'Build trust with the verified vendor badge' },
              { icon: Zap, title: 'Lower Commission', desc: 'Pay only 8% commission instead of 10%' },
            ].map(b => (
              <div key={b.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <b.icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPremium;
