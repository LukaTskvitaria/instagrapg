"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { 
  Users, 
  Eye, 
  Heart, 
  TrendingUp, 
  RefreshCw,
  Instagram,
  Lightbulb,
  Calendar,
  BarChart3
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface DashboardData {
  account: {
    id: string;
    username: string;
    name: string;
    followersCount: number;
    followingCount: number;
    mediaCount: number;
  };
  metrics: {
    totalReach: number;
    totalImpressions: number;
    avgEngagementRate: number;
    followersGrowth: number;
    postsAnalyzed: number;
  };
  chartData: {
    followersGrowth: Array<{ date: string; followers: number }>;
    engagementTrend: Array<{ date: string; engagementRate: number }>;
    reachImpressions: Array<{ date: string; reach: number; impressions: number }>;
  };
}

interface Recommendation {
  id: string;
  type: string;
  title: string;
  content: any;
  priority: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // For demo purposes, using a mock account ID
  const accountId = "demo-account-id";

  useEffect(() => {
    loadDashboardData();
    loadRecommendations();
  }, []);

  const loadDashboardData = async () => {
    try {
      // For demo purposes, using mock data
      const mockData: DashboardData = {
        account: {
          id: "demo-account-id",
          username: "demo_account",
          name: "Demo Account",
          followersCount: 5420,
          followingCount: 850,
          mediaCount: 127,
        },
        metrics: {
          totalReach: 45230,
          totalImpressions: 67890,
          avgEngagementRate: 4.2,
          followersGrowth: 234,
          postsAnalyzed: 15,
        },
        chartData: {
          followersGrowth: [
            { date: "2024-01-01", followers: 5186 },
            { date: "2024-01-02", followers: 5201 },
            { date: "2024-01-03", followers: 5234 },
            { date: "2024-01-04", followers: 5267 },
            { date: "2024-01-05", followers: 5298 },
            { date: "2024-01-06", followers: 5356 },
            { date: "2024-01-07", followers: 5420 },
          ],
          engagementTrend: [
            { date: "2024-01-01", engagementRate: 3.2 },
            { date: "2024-01-02", engagementRate: 4.1 },
            { date: "2024-01-03", engagementRate: 3.8 },
            { date: "2024-01-04", engagementRate: 5.2 },
            { date: "2024-01-05", engagementRate: 4.7 },
            { date: "2024-01-06", engagementRate: 3.9 },
            { date: "2024-01-07", engagementRate: 4.2 },
          ],
          reachImpressions: [
            { date: "2024-01-01", reach: 6200, impressions: 8900 },
            { date: "2024-01-02", reach: 7100, impressions: 10200 },
            { date: "2024-01-03", reach: 5800, impressions: 8400 },
            { date: "2024-01-04", reach: 8900, impressions: 12300 },
            { date: "2024-01-05", reach: 7600, impressions: 11100 },
            { date: "2024-01-06", reach: 6400, impressions: 9200 },
            { date: "2024-01-07", reach: 7300, impressions: 10500 },
          ],
        },
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      // Mock recommendations data
      const mockRecommendations: Recommendation[] = [
        {
          id: "1",
          type: "content_idea",
          title: "5 რჩევა Instagram-ის ზრდისთვის",
          content: {
            idea: {
              title: "5 რჩევა Instagram-ის ზრდისთვის",
              contentType: "REEL",
              hooks: ["გსურს იცოდე...", "ეს რჩევები შეცვლის...", "5 წუთში ისწავლე..."]
            }
          },
          priority: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          type: "timing",
          title: "საუკეთესო დრო გამოქვეყნებისთვის",
          content: {
            bestTimes: {
              bestHours: [{ hour: 19, avgER: 5.2 }, { hour: 21, avgER: 4.8 }],
              bestDays: [{ dayName: "ოთხშაბათი", avgER: 4.9 }, { dayName: "პარასკევი", avgER: 4.6 }]
            }
          },
          priority: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          type: "hashtags",
          title: "ახალი ჰეშთეგების რეკომენდაციები",
          content: {
            suggestions: {
              core: ["#ბიზნესი", "#წარმატება", "#რჩევები"],
              niche: ["#მარკეტინგი", "#სოციალურიმედია", "#ზრდა"],
              rotating: ["#დღესდღეობით", "#ტრენდი", "#ახალი"]
            }
          },
          priority: 2,
          createdAt: new Date().toISOString(),
        },
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const handleRefreshInsights = async () => {
    setRefreshing(true);
    try {
      // In real implementation, call API to refresh insights
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to refresh insights:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">მონაცემების ჩატვირთვა...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <Instagram className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Instagram ანგარიში არ არის დაკავშირებული</h3>
        <p className="text-gray-400 mb-6">დააკავშირეთ თქვენი Instagram Business ანგარიში ანალიტიკის სანახავად</p>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Instagram-ის დაკავშირება
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">დაშბორდი</h1>
          <p className="text-gray-400">@{dashboardData.account.username} - ანალიტიკა და რეკომენდაციები</p>
        </div>
        <Button 
          onClick={handleRefreshInsights}
          disabled={refreshing}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          განახლება
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="გამომწერები"
          value={dashboardData.account.followersCount.toLocaleString()}
          change={{ value: dashboardData.metrics.followersGrowth, type: 'increase' }}
          icon={Users}
          description="ბოლო 30 დღე"
        />
        <StatsCard
          title="საერთო Reach"
          value={dashboardData.metrics.totalReach.toLocaleString()}
          icon={Eye}
          description="ბოლო 30 დღე"
        />
        <StatsCard
          title="Engagement Rate"
          value={`${dashboardData.metrics.avgEngagementRate}%`}
          icon={Heart}
          description="საშუალო ღირებულება"
        />
        <StatsCard
          title="პოსტები"
          value={dashboardData.account.mediaCount}
          icon={BarChart3}
          description="სულ გამოქვეყნებული"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="გამომწერების ზრდა"
          description="ბოლო 7 დღის სტატისტიკა"
          data={dashboardData.chartData.followersGrowth}
          type="line"
          dataKey="followers"
          xAxisKey="date"
          color="#8b5cf6"
        />
        <AnalyticsChart
          title="Engagement Trend"
          description="ჩართულობის ტენდენცია"
          data={dashboardData.chartData.engagementTrend}
          type="line"
          dataKey="engagementRate"
          xAxisKey="date"
          color="#10b981"
        />
      </div>

      {/* Recommendations */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                AI რეკომენდაციები
              </CardTitle>
              <CardDescription className="text-gray-400">
                პერსონალიზებული რჩევები თქვენი ანალიტიკის საფუძველზე
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              ყველას ნახვა
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg">
                <div className="flex-shrink-0">
                  {rec.type === 'content_idea' && <Lightbulb className="h-5 w-5 text-yellow-500" />}
                  {rec.type === 'timing' && <Calendar className="h-5 w-5 text-blue-500" />}
                  {rec.type === 'hashtags' && <TrendingUp className="h-5 w-5 text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-white">{rec.title}</h4>
                    <Badge variant={rec.priority === 1 ? "default" : "secondary"}>
                      {rec.priority === 1 ? "მაღალი" : "საშუალო"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    {rec.type === 'content_idea' && "ახალი კონტენტის იდეა მაღალი engagement-ით"}
                    {rec.type === 'timing' && "ოპტიმალური დრო გამოქვეყნებისთვის"}
                    {rec.type === 'hashtags' && "რეკომენდებული ჰეშთეგები უკეთესი reach-ისთვის"}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
                  დეტალები
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
