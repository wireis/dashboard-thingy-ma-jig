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
        
        <div className="space-y-4 max-h-96 xl:max-h-[500px] overflow-y-auto">
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
            rssItems.slice(0, 12).map((item, index) => (
              <div key={item.guid || index} className="border-b border-slate-700 pb-3 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {item.imageUrl ? (
                      <div className="relative">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-12 object-cover rounded-lg bg-slate-600"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="w-16 h-12 bg-slate-600 rounded-lg flex items-center justify-center hidden">
                          <Newspaper className="w-6 h-6 text-slate-400" />
                        </div>
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}&sz=16`}
                          alt={item.feedName || "Feed"}
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-sm bg-slate-800 border border-slate-600"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-12 bg-slate-600 rounded-lg flex flex-col items-center justify-center">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}&sz=24`}
                          alt={item.feedName || "Feed"}
                          className="w-6 h-6 rounded-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="w-6 h-6 flex items-center justify-center hidden">
                          <Newspaper className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm xl:text-base font-medium text-white mb-1 leading-tight hover:text-blue-400 transition-colors">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-start gap-2"
                      >
                        <span className="flex-1">{item.title}</span>
                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-60" />
                      </a>
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs xl:text-sm text-slate-400">
                        {item.pubDate ? formatTimeAgo(item.pubDate) : "Unknown time"}
                      </p>
                      {item.feedName && (
                        <>
                          <span className="text-xs xl:text-sm text-slate-500">•</span>
                          <span className="text-xs xl:text-sm text-blue-400">{item.feedName}</span>
                        </>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs xl:text-sm text-slate-300 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <Button 
          variant="secondary"
          className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-lg text-sm transition-colors"
          onClick={() => setIsManagementOpen(true)}
        >
          Manage RSS Feeds
        </Button>
      </CardContent>
      
      <RssFeedManagementModal
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
      />
    </Card>
  );
}
