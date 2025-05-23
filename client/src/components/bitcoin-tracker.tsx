import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { SiBitcoin } from "react-icons/si";
import type { BitcoinData } from "@shared/schema";

export default function BitcoinTracker() {
  const { data: bitcoin, isLoading, error } = useQuery<BitcoinData>({
    queryKey: ["/api/bitcoin"],
    refetchInterval: 60000, // Refresh every minute
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatLastUpdate = (dateString: string) => {
    const now = new Date();
    const lastUpdate = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    return `${Math.floor(diffMinutes / 60)} hr ago`;
  };

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Bitcoin Price</h3>
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <SiBitcoin className="text-orange-500 w-5 h-5" />
            </div>
          </div>
          <p className="text-red-400 text-sm">Failed to load Bitcoin data</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Bitcoin Price</h3>
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <SiBitcoin className="text-orange-500 w-5 h-5" />
            </div>
          </div>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-slate-700 rounded w-32 mx-auto"></div>
            <div className="h-4 bg-slate-700 rounded w-24 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-700 rounded"></div>
              <div className="h-3 bg-slate-700 rounded"></div>
              <div className="h-3 bg-slate-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bitcoin) return null;

  const isPositive = (bitcoin.change24h || 0) >= 0;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Bitcoin Price</h3>
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <SiBitcoin className="text-orange-500 w-5 h-5" />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {formatPrice(bitcoin.price)}
            </p>
            <div className={`flex items-center justify-center space-x-1 text-sm ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {isPositive ? "+" : ""}{(bitcoin.change24h || 0).toFixed(2)}% (24h)
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Market Cap:</span>
              <span className="text-slate-200">{formatMarketCap(bitcoin.marketCap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Volume 24h:</span>
              <span className="text-slate-200">{formatMarketCap(bitcoin.volume)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Updated:</span>
              <span className="text-slate-200">{formatLastUpdate(bitcoin.lastUpdated)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
