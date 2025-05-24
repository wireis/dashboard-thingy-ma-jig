import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, ExternalLink, Settings } from "lucide-react";
import type { RSSItem } from "@shared/schema";
import RssFeedManagementModal from "./rss-feed-management-modal";

export default function RSSFeed() {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  
  const { data: rssItems = [], isLoading, error } = useQuery<RSSItem[]>({
    queryKey: ["/api/rss/combined"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const pubDate = new Date(dateString);
    const diffHours = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Less than 1 hour ago";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? 's' : ''} ago`;
  };

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">GB News</h3>
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Newspaper className="text-red-500 w-5 h-5" />
            </div>
          </div>
          <p className="text-red-400 text-sm">Failed to load news feed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">RSS Feeds</h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsManagementOpen(true)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 px-2 py-1"
            >
              <Settings className="w-3 h-3" />
            </Button>
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Newspaper className="text-orange-500 w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-b border-slate-700 pb-3">
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded"></div>
                  <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : rssItems.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              No RSS feeds configured or articles available
            </p>
          ) : (
            rssItems.slice(0, 8).map((item, index) => (
              <div key={item.guid || index} className="border-b border-slate-700 pb-3 last:border-b-0">
                <h4 className="text-sm font-medium text-white mb-1 leading-tight hover:text-blue-400 transition-colors">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-2"
                  >
                    <span>{item.title}</span>
                    <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-60" />
                  </a>
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs text-slate-400">
                    {item.pubDate ? formatTimeAgo(item.pubDate) : "Unknown time"}
                  </p>
                  {item.feedName && (
                    <>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-blue-400">{item.feedName}</span>
                    </>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        
        <Button 
          variant="secondary"
          className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-lg text-sm transition-colors"
          onClick={() => window.open("https://www.gbnews.uk", "_blank", "noopener,noreferrer")}
        >
          View All News
        </Button>
      </CardContent>
    </Card>
  );
}
