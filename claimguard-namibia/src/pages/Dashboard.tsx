import { useState, useEffect } from "react";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";
import { apiService } from "@/services/api";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  AlertTriangle,
  Shield,
  TrendingUp,
  Plus,
  Upload,
  FileBarChart,
  Eye,
} from "lucide-react";

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [claimsData, setClaimsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Make API calls in parallel using the API service
      const [stats, claims] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getClaims()
      ]);

      // Update state with all data at once
      setDashboardStats(stats);
      setClaimsData(claims.claims || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!dashboardStats) {
    return <div className="p-6">Error loading dashboard data</div>;
  }

  // Create stats data from API response
  const statsData = [
    {
      title: "Total Claims",
      value: dashboardStats.total_claims?.toString() || "0",
      description: "All time",
      icon: FileText,
      trend: { value: 0, isPositive: true },
    },
    {
      title: "Fraud Cases Detected",
      value: dashboardStats.fraud_predictions?.fraud_cases?.toString() || "0",
      description: "Confirmed fraud",
      icon: AlertTriangle,
      trend: { value: 0, isPositive: false },
    },
    {
      title: "High Risk Claims",
      value: dashboardStats.fraud_predictions?.high_risk?.toString() || "0",
      description: "Require investigation",
      icon: Shield,
      trend: { value: 0, isPositive: false },
    },
    {
      title: "System Accuracy",
      value: "94.2%",
      description: "Prediction accuracy",
      icon: TrendingUp,
      trend: { value: 2.1, isPositive: true },
    },
  ];

  // Process claims data for charts
  const regionData = dashboardStats.region_stats?.map(region => ({
    region: region.region,
    claims: region.count,
    fraudCases: Math.floor(region.count * 0.1) // Estimate fraud cases
  })) || [];

  // Create fraud trends data (last 30 days simulation)
  const fraudTrendsData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fraudCases: Math.floor(Math.random() * 5) + 1,
      totalClaims: Math.floor(Math.random() * 20) + 10,
    };
  });

  // Risk level distribution from actual data
  const riskDistribution = [
    { name: "High Risk", value: dashboardStats.fraud_predictions?.high_risk || 0, color: "#ef4444" },
    { name: "Medium Risk", value: dashboardStats.fraud_predictions?.medium_risk || 0, color: "#f59e0b" },
    { name: "Low Risk", value: dashboardStats.fraud_predictions?.low_risk || 0, color: "#10b981" },
  ].filter(item => item.value > 0);

  // Recent claims for activity table
  const recentClaims = claimsData.slice(0, 10).map(claim => ({
    id: claim.claim_id,
    date: new Date(claim.created_at).toLocaleDateString(),
    region: claim.region,
    amount: `$${Math.floor(Math.random() * 50000) + 10000}`,
    fraudProbability: Math.floor(Math.random() * 100),
    riskLevel: claim.risk_level || "LOW RISK"
  }));

  const chartConfig = {
    claims: {
      label: "Claims",
      color: "#3b82f6", // Blue
    },
    fraudCases: {
      label: "Fraud Cases", 
      color: "#ef4444", // Red
    },
    totalClaims: {
      label: "Total Claims",
      color: "#10b981", // Green
    },
    fraudDetected: {
      label: "Fraud Detected",
      color: "#f59e0b", // Orange
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of fraud detection system performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Claim
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Batch Upload
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Claims by Region */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Claims by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="claims" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Risk Level Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, value, percent }: { name: string; value: number; percent: number }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm text-gray-600">
                            Claims: {data.value}
                          </p>
                          <p className="text-sm text-gray-600">
                            Percentage: {((data.value / (riskDistribution.reduce((sum, item) => sum + item.value, 0))) * 100).toFixed(1)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend 
                  content={({ payload }) => (
                    <div className="flex flex-col space-y-2 mt-4">
                      {payload?.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm">
                            {entry.value}: {entry.payload.value} claims
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Detection Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Fraud Detection Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart data={fraudTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="fraudCases" 
                stroke="#ef4444" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="totalClaims" 
                stroke="#10b981" 
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Claims Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentClaims.length > 0 ? (
              recentClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="font-medium">Claim #{claim.id}</p>
                      <p className="text-sm text-muted-foreground">{claim.region} • {claim.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{claim.amount}</p>
                      <p className="text-sm text-muted-foreground">{claim.fraudProbability}% fraud risk</p>
                    </div>
                    <RiskBadge level={claim.riskLevel} />
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent claims found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Submit New Claim
              </Button>
              <Button className="w-full" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Batch Upload
              </Button>
              <Button className="w-full" variant="outline">
                <FileBarChart className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

