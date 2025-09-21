import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";
import { apiService } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  Shield,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Claims() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [claimsData, setClaimsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: { region?: string; risk_level?: string } = {};
      if (selectedRegion !== "all") params.region = selectedRegion;
      if (selectedRisk !== "all") params.risk_level = selectedRisk.toUpperCase();
      
      const data = await apiService.getClaims(params);
      
      // Transform the data to match our UI format
      const transformedClaims = data.claims.map(claim => ({
        id: claim.claim_id,
        date: new Date(claim.created_at).toISOString().split('T')[0],
        region: claim.region,
        riskLevel: claim.risk_level?.toLowerCase() || "unknown",
        fraudProbability: Math.round((claim.fraud_probability || 0) * 100),
        amount: claim.claim_amount_range,
        status: getStatusFromRisk(claim.risk_level),
        claimant: `${claim.age_group} ${claim.gender}`,
        vehicleType: claim.vehicle_category,
        prediction: claim.fraud_prediction
      }));
      
      setClaimsData(transformedClaims);
      
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError(error.message);
      toast({
        title: "Error Loading Claims",
        description: "Failed to load claims data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromRisk = (riskLevel) => {
    if (!riskLevel) return "Processing";
    
    switch (riskLevel.toLowerCase()) {
      case "high risk":
        return "Flagged";
      case "medium risk":
        return "Under Review";
      case "low risk":
        return "Approved";
      default:
        return "Processing";
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [selectedRegion, selectedRisk]);

  const filteredClaims = claimsData.filter((claim) => {
    return claim.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Claims Management</h1>
          <p className="text-muted-foreground">
            View and manage insurance claims
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchClaims} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Search and Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Claim ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Khomas">Khomas</SelectItem>
                <SelectItem value="Erongo">Erongo</SelectItem>
                <SelectItem value="Hardap">Hardap</SelectItem>
                <SelectItem value="Otjozondjupa">Otjozondjupa</SelectItem>
                <SelectItem value="Oshana">Oshana</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims List ({filteredClaims.length} claims)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading claims...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <span>Error: {error}</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Claimant</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Fraud Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No claims found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.id}</TableCell>
                  <TableCell>{claim.date}</TableCell>
                  <TableCell>{claim.claimant}</TableCell>
                  <TableCell>{claim.region}</TableCell>
                  <TableCell>{claim.vehicleType}</TableCell>
                  <TableCell>{claim.amount}</TableCell>
                  <TableCell>
                    <RiskBadge level={claim.riskLevel} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            claim.fraudProbability > 70 
                              ? "bg-risk-high" 
                              : claim.fraudProbability > 40 
                              ? "bg-risk-medium" 
                              : "bg-risk-low"
                          }`}
                          style={{ width: `${claim.fraudProbability}%` }}
                        />
                      </div>
                      <span className="text-sm">{claim.fraudProbability}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        claim.status === "Flagged" 
                          ? "destructive" 
                          : claim.status === "Approved" 
                          ? "success" 
                          : "secondary"
                      }
                    >
                      {claim.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
