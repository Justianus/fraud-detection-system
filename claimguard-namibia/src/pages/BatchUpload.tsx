import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Trash2,
  RefreshCw,
} from "lucide-react";

export default function BatchUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample CSV template data - matches actual database schema
  const csvTemplate = `claim_id,age_group,gender,marital_status,income_band,employment_status,address_change_last_6_months,deductible_level,days_policy_accident,days_policy_claim,past_number_of_claims,vehicle_category,vehicle_price_range,vehicle_age_years,accident_area,police_report_filed,witness_present,weather_condition,accident_time,agent_type,claim_amendments,address_change_linked_to_claim,claim_amount_range,payout_to_claim_ratio,claim_channel,repair_shop_pattern,fraud_percentage_estimate,fraud_type,high_risk_combination,region
CLM-BATCH-001,25-35,Male,Single,Medium,Employed,false,Medium,30,15,0,Private,150000-200000,4,Urban,true,true,Clear,Day,Direct,0,false,15000-25000,0.85,Online,Standard,2.5,None,false,Windhoek
CLM-BATCH-002,35-45,Female,Married,High,Employed,false,High,45,30,1,Private,100000-150000,5,Suburban,true,false,Clear,Night,Agent,1,false,10000-20000,0.90,Phone,Standard,1.2,None,false,Swakopmund
CLM-BATCH-003,45-55,Male,Married,Medium,Self-employed,true,Low,60,45,2,Commercial,200000-250000,6,Rural,true,true,Cloudy,Day,Agent,2,true,25000-35000,0.75,Online,High-risk,8.5,Staged,true,Walvis Bay`;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
        setSuccess(null);
        setUploadResults([]);
      } else {
        setError('Please select a CSV file');
        setSelectedFile(null);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setUploadResults([]);
    } else {
      setError('Please drop a CSV file');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claim_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        row.rowNumber = i;
        data.push(row);
      }
    }
    return data;
  };

  const validateClaim = (claim: any) => {
    const errors = [];
    
    // Required fields from backend API
    const requiredFields = [
      'claim_id', 'age_group', 'gender', 'marital_status', 'income_band',
      'employment_status', 'address_change_last_6_months', 'deductible_level',
      'days_policy_accident', 'days_policy_claim', 'past_number_of_claims',
      'vehicle_category', 'vehicle_price_range', 'vehicle_age_years',
      'accident_area', 'police_report_filed', 'witness_present',
      'weather_condition', 'accident_time', 'agent_type', 'claim_amendments',
      'address_change_linked_to_claim', 'claim_amount_range',
      'payout_to_claim_ratio', 'claim_channel', 'repair_shop_pattern',
      'fraud_percentage_estimate', 'fraud_type', 'high_risk_combination', 'region'
    ];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!claim[field] && claim[field] !== 0 && claim[field] !== false) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Data type validation
    if (claim.days_policy_accident && isNaN(parseInt(claim.days_policy_accident))) {
      errors.push('days_policy_accident must be a number');
    }
    if (claim.days_policy_claim && isNaN(parseInt(claim.days_policy_claim))) {
      errors.push('days_policy_claim must be a number');
    }
    if (claim.past_number_of_claims && isNaN(parseInt(claim.past_number_of_claims))) {
      errors.push('past_number_of_claims must be a number');
    }
    if (claim.vehicle_age_years && isNaN(parseInt(claim.vehicle_age_years))) {
      errors.push('vehicle_age_years must be a number');
    }
    if (claim.claim_amendments && isNaN(parseInt(claim.claim_amendments))) {
      errors.push('claim_amendments must be a number');
    }
    if (claim.payout_to_claim_ratio && isNaN(parseFloat(claim.payout_to_claim_ratio))) {
      errors.push('payout_to_claim_ratio must be a decimal number');
    }
    if (claim.fraud_percentage_estimate && isNaN(parseFloat(claim.fraud_percentage_estimate))) {
      errors.push('fraud_percentage_estimate must be a decimal number');
    }
    
    // Boolean validation
    if (claim.address_change_last_6_months && !['true', 'false', true, false].includes(claim.address_change_last_6_months)) {
      errors.push('address_change_last_6_months must be true or false');
    }
    if (claim.police_report_filed && !['true', 'false', true, false].includes(claim.police_report_filed)) {
      errors.push('police_report_filed must be true or false');
    }
    if (claim.witness_present && !['true', 'false', true, false].includes(claim.witness_present)) {
      errors.push('witness_present must be true or false');
    }
    if (claim.address_change_linked_to_claim && !['true', 'false', true, false].includes(claim.address_change_linked_to_claim)) {
      errors.push('address_change_linked_to_claim must be true or false');
    }
    if (claim.high_risk_combination && !['true', 'false', true, false].includes(claim.high_risk_combination)) {
      errors.push('high_risk_combination must be true or false');
    }

    return errors;
  };

  const processBatchUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    setUploadResults([]);

    try {
      const csvText = await selectedFile.text();
      const claims = parseCSV(csvText);
      
      if (claims.length === 0) {
        throw new Error('No valid claims found in CSV file');
      }

      const results = [];
      
      // Process each claim with progress updates
      for (let i = 0; i < claims.length; i++) {
        const claim = claims[i];
        const validationErrors = validateClaim(claim);
        
        if (validationErrors.length > 0) {
          results.push({
            row: claim.rowNumber,
            claimId: claim.claim_id || `Row ${claim.rowNumber}`,
            status: 'error',
            message: validationErrors.join(', ')
          });
        } else {
          try {
            // Submit claim using API service
            const result = await apiService.createClaim(claim);
            
            // Get prediction for the claim using API service
            try {
              await apiService.predictFraud(result.claim_id);
              results.push({
                row: claim.rowNumber,
                claimId: result.claim_id,
                status: 'success',
                message: 'Processed successfully with fraud prediction'
              });
            } catch (predictError) {
              results.push({
                row: claim.rowNumber,
                claimId: result.claim_id,
                status: 'warning',
                message: `Claim created but prediction failed: ${predictError.message}`
              });
            }
          } catch (apiError) {
            results.push({
              row: claim.rowNumber,
              claimId: claim.claim_id || `Row ${claim.rowNumber}`,
              status: 'error',
              message: 'API error: ' + (apiError as Error).message
            });
          }
        }

        // Update progress
        const progress = Math.round(((i + 1) / claims.length) * 100);
        setUploadProgress(progress);
      }

      setUploadResults(results);
      
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      
      setSuccess(`Batch processing completed: ${successCount} successful, ${warningCount} warnings, ${errorCount} errors`);
      
    } catch (error) {
      setError('Failed to process CSV file: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResults = () => {
    setUploadResults([]);
    setSelectedFile(null);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const successCount = uploadResults.filter(r => r.status === "success").length;
  const errorCount = uploadResults.filter(r => r.status === "error").length;
  const warningCount = uploadResults.filter(r => r.status === "warning").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batch Upload</h1>
          <p className="text-muted-foreground">
            Upload multiple claims via CSV file for batch processing and fraud detection
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          {uploadResults.length > 0 && (
            <Button variant="outline" onClick={clearResults}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Results
            </Button>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              selectedFile 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <FileSpreadsheet className={`mx-auto h-12 w-12 mb-4 ${
              selectedFile ? 'text-green-600' : 'text-gray-400'
            }`} />
            <div className="space-y-2">
              {selectedFile ? (
                <>
                  <h3 className="text-lg font-medium text-green-800">
                    File Selected: {selectedFile.name}
                  </h3>
                  <p className="text-sm text-green-600">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium">Drop your CSV file here</h3>
                  <p className="text-muted-foreground">
                    or <Button variant="link" className="p-0 h-auto" onClick={() => fileInputRef.current?.click()}>
                      browse files
                    </Button> to upload
                  </p>
                </>
              )}
              <p className="text-sm text-muted-foreground">
                Supports CSV files up to 10MB. Maximum 1000 claims per upload.
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {uploadProgress > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
              {isProcessing && (
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing claims and running fraud detection...
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-4">
            <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
              <span>• Required fields: claim_id, age_group, gender, marital_status, income_band, employment_status</span>
              <span>• Boolean fields: Use "true" or "false" for address_change_last_6_months, police_report_filed, witness_present</span>
              <span>• Number fields: days_policy_accident, days_policy_claim, past_number_of_claims, vehicle_age_years</span>
              <span>• Decimal fields: payout_to_claim_ratio, fraud_percentage_estimate</span>
            </div>
            <div className="flex space-x-2">
              {selectedFile && !isProcessing && uploadResults.length === 0 && (
                <Button onClick={processBatchUpload}>
                  <Play className="mr-2 h-4 w-4" />
                  Process Upload
                </Button>
              )}
              {selectedFile && (
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Change File
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-800">{successCount}</p>
                    <p className="text-sm font-medium text-green-600">Successful</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-800">{warningCount}</p>
                    <p className="text-sm font-medium text-yellow-600">Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-800">{errorCount}</p>
                    <p className="text-sm font-medium text-red-600">Errors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upload Results</span>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Total: {uploadResults.length} claims</span>
                  <span>•</span>
                  <span>Success Rate: {Math.round((successCount / uploadResults.length) * 100)}%</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadResults.map((result) => (
                      <TableRow key={result.row} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{result.row}</TableCell>
                        <TableCell className="font-mono text-sm">{result.claimId}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              result.status === "success" 
                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                : result.status === "error" 
                                ? "bg-red-100 text-red-800 hover:bg-red-200" 
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            }
                          >
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{result.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {uploadResults.length > 10 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing all {uploadResults.length} results
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
