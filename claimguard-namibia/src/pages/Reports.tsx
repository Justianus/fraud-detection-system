import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/services/api";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Download,
  FileBarChart,
  TrendingUp,
  Calendar,
  Filter,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// Data will be fetched from API

const chartConfig = {
  detected: {
    label: "Fraud Detected",
    color: "hsl(var(--chart-primary))",
  },
  accuracy: {
    label: "Accuracy %",
    color: "hsl(var(--chart-accent))",
  },
  cases: {
    label: "Cases",
    color: "hsl(var(--chart-primary))",
  },
};

export default function Reports() {
  const [reportData, setReportData] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSections, setLoadingSections] = useState({
    trends: false,
    regional: false,
    stats: false
  });
  const [selectedPeriod, setSelectedPeriod] = useState("last-6-months");
  const [selectedRegion, setSelectedRegion] = useState("all-regions");
  const [selectedRisk, setSelectedRisk] = useState("all-risk");
  const [selectedReportType, setSelectedReportType] = useState("fraud-summary");

  // Debounced data fetching to prevent too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReportsData();
    }, 300); // Wait 300ms after last filter change

    return () => clearTimeout(timeoutId);
  }, [selectedPeriod, selectedRegion, selectedRisk]);

  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Make all API calls in parallel using the API service
      const [trendsData, regionalData, statsData] = await Promise.all([
        apiService.getMonthlyTrends(),
        apiService.getRegionalAnalysis(),
        apiService.getSummaryStats()
      ]);

      // Update state with all data at once
      setReportData(trendsData);
      setRegionalData(regionalData);
      setSummaryStats(statsData);
      
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedRegion, selectedRisk]);

  const handleExport = async (format: string) => {
    try {
      const blob = await apiService.exportReports(format as 'csv' | 'excel' | 'pdf');
      
      if (format === 'csv') {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fraud_detection_report.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.log(`${format.toUpperCase()} export data:`, blob);
        alert(`${format.toUpperCase()} export completed. Check console for data.`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading reports data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive fraud detection reports and performance analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => fetchReportsData()} disabled={loading}>
            <Filter className="mr-2 h-4 w-4" />
            {loading ? "Loading..." : "Refresh Data"}
          </Button>
          <Button onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Report Configuration
            {loading && <span className="ml-2 text-sm text-muted-foreground">(Loading...)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-regions">All Regions</SelectItem>
                <SelectItem value="khomas">Khomas</SelectItem>
                <SelectItem value="erongo">Erongo</SelectItem>
                <SelectItem value="hardap">Hardap</SelectItem>
                <SelectItem value="otjozondjupa">Otjozondjupa</SelectItem>
                <SelectItem value="oshana">Oshana</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-risk">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedReportType} onValueChange={setSelectedReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fraud-summary">Fraud Detection Summary</SelectItem>
                <SelectItem value="regional-analysis">Regional Analysis</SelectItem>
                <SelectItem value="model-performance">Model Performance</SelectItem>
                <SelectItem value="trend-analysis">Trend Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileBarChart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{summaryStats?.total_claims_processed || 0}</p>
                <p className="text-sm text-muted-foreground">Total Claims Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{summaryStats?.fraud_cases_detected || 0}</p>
                <p className="text-sm text-muted-foreground">Fraud Cases Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-2xl font-bold">{summaryStats?.average_accuracy || 94.9}%</p>
              <p className="text-sm text-muted-foreground">Average Accuracy</p>
              <Badge variant="success" className="mt-2">
                Real-time data
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-2xl font-bold">N$ {summaryStats?.potential_fraud_saved?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Potential Fraud Saved</p>
              <Badge variant="success" className="mt-2">
                From detected fraud
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Fraud Detection Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Fraud Detection Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="detected" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* System Accuracy Trends */}
        <Card>
          <CardHeader>
            <CardTitle>System Accuracy Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[90, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#10b981" 
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Regional Performance */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Regional Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="cases" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start" onClick={() => handleExport('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => handleExport('excel')}>
              <Download className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => handleExport('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}