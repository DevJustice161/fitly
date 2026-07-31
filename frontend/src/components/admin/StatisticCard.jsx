import { Card, CardContent } from "@/components/ui/card";

const StatisticCard = ({ label, value, icon: Icon, tone = "gold", hint }) => {
  const tones = {
    gold: "bg-gold/15 text-gold-dark",
    pink: "bg-pink/25 text-pink-dark",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <Card className="border border-border shadow-soft rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
      <CardContent className="p-4 md:p-5">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${tones[tone] || tones.gold}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-heading text-xl md:text-2xl font-bold text-foreground leading-tight break-words">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        {hint && (
          <p className="text-[11px] text-muted-foreground/80 mt-1">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatisticCard;
