import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, Send, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const steps = [
  "Personal Information",
  "Policy Information", 
  "Vehicle Information",
  "Accident Information",
  "Claim Information",
  "Risk Assessment"
];

export default function NewClaim() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Personal Information
    ageGroup: "",
    gender: "",
    maritalStatus: "",
    incomeBand: "",
    employmentStatus: "",
    
    // Policy Information
    addressChange: "",
    deductibleLevel: "",
    daysPolicyAccident: "",
    daysPolicyClaim: "",
    pastClaims: "",
    
    // Vehicle Information
    vehicleCategory: "",
    vehiclePriceRange: "",
    vehicleAge: "",
    
    // Accident Information
    accidentArea: "",
    policeReport: "",
    witnessPresent: "",
    weatherCondition: "",
    accidentTime: "",
    
    // Claim Information
    agentType: "",
    claimAmendments: "",
    addressChangeLinked: "",
    claimAmountRange: "",
    payoutRatio: "",
    claimChannel: "",
    repairShopPattern: "",
    
    // Risk Information
    fraudPercentage: "",
    fraudType: "",
    highRiskCombination: "",
    region: "",
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateClaimId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `CLM-${timestamp}`;
  };

  const transformFormData = () => {
    return {
      claim_id: generateClaimId(),
      age_group: formData.ageGroup,
      gender: formData.gender,
      marital_status: formData.maritalStatus,
      income_band: formData.incomeBand,
      employment_status: formData.employmentStatus,
      address_change_last_6_months: formData.addressChange === "yes",
      deductible_level: formData.deductibleLevel,
      days_policy_accident: parseInt(formData.daysPolicyAccident) || 0,
      days_policy_claim: parseInt(formData.daysPolicyClaim) || 0,
      past_number_of_claims: parseInt(formData.pastClaims) || 0,
      vehicle_category: formData.vehicleCategory,
      vehicle_price_range: formData.vehiclePriceRange,
      vehicle_age_years: parseInt(formData.vehicleAge) || 0,
      accident_area: formData.accidentArea,
      police_report_filed: formData.policeReport === "yes",
      witness_present: formData.witnessPresent === "yes",
      weather_condition: formData.weatherCondition,
      accident_time: formData.accidentTime,
      agent_type: formData.agentType,
      claim_amendments: parseInt(formData.claimAmendments) || 0,
      address_change_linked_to_claim: formData.addressChangeLinked === "yes",
      claim_amount_range: formData.claimAmountRange,
      payout_to_claim_ratio: parseFloat(formData.payoutRatio) || 0,
      claim_channel: formData.claimChannel,
      repair_shop_pattern: formData.repairShopPattern,
      fraud_percentage_estimate: parseFloat(formData.fraudPercentage) || 0,
      fraud_type: formData.fraudType,
      high_risk_combination: formData.highRiskCombination === "yes",
      region: formData.region
    };
  };

  const submitClaim = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const claimData = transformFormData();
      
      // Submit claim using API service
      const result = await apiService.createClaim(claimData);
      
      // Get fraud prediction using API service
      const predictionResult = await apiService.predictFraud(claimData.claim_id);
      
      setSubmissionResult({
        claimId: result.claim_id,
        prediction: predictionResult.prediction,
        success: true
      });

      toast({
        title: "Claim Submitted Successfully",
        description: `Claim ${result.claim_id} has been submitted and analyzed.`,
      });

    } catch (error) {
      console.error('Error submitting claim:', error);
      setSubmissionResult({
        error: error.message,
        success: false
      });
      
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ageGroup">Age Group</Label>
                <Select value={formData.ageGroup} onValueChange={(value) => setFormData({...formData, ageGroup: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="36-45">36-45</SelectItem>
                    <SelectItem value="46-60">46-60</SelectItem>
                    <SelectItem value="60+">60+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Gender</Label>
                <RadioGroup value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select value={formData.maritalStatus} onValueChange={(value) => setFormData({...formData, maritalStatus: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="incomeBand">Income Band (NAD)</Label>
                <Select value={formData.incomeBand} onValueChange={(value) => setFormData({...formData, incomeBand: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income band" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<5000">&lt; N$ 5,000</SelectItem>
                    <SelectItem value="5000-15000">N$ 5,000 - 15,000</SelectItem>
                    <SelectItem value="15001-30000">N$ 15,001 - 30,000</SelectItem>
                    <SelectItem value="30001-50000">N$ 30,001 - 50,000</SelectItem>
                    <SelectItem value="50000+">N$ 50,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Select value={formData.employmentStatus} onValueChange={(value) => setFormData({...formData, employmentStatus: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="self-employed">Self-Employed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Policy Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Address Change in Last 6 Months</Label>
                <RadioGroup value={formData.addressChange} onValueChange={(value) => setFormData({...formData, addressChange: value})}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="address-yes" />
                    <Label htmlFor="address-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="address-no" />
                    <Label htmlFor="address-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="deductibleLevel">Deductible Level</Label>
                <Select value={formData.deductibleLevel} onValueChange={(value) => setFormData({...formData, deductibleLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deductible level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="daysPolicyAccident">Days Between Policy and Accident</Label>
                <Input
                  id="daysPolicyAccident"
                  type="number"
                  placeholder="Enter number of days"
                  value={formData.daysPolicyAccident}
                  onChange={(e) => setFormData({...formData, daysPolicyAccident: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="daysPolicyClaim">Days Between Policy and Claim</Label>
                <Input
                  id="daysPolicyClaim"
                  type="number"
                  placeholder="Enter number of days"
                  value={formData.daysPolicyClaim}
                  onChange={(e) => setFormData({...formData, daysPolicyClaim: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="pastClaims">Past Number of Claims</Label>
                <Input
                  id="pastClaims"
                  type="number"
                  placeholder="Enter number of past claims"
                  value={formData.pastClaims}
                  onChange={(e) => setFormData({...formData, pastClaims: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleCategory">Vehicle Category</Label>
                <Select value={formData.vehicleCategory} onValueChange={(value) => setFormData({...formData, vehicleCategory: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorbike">Motorbike</SelectItem>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vehiclePriceRange">Vehicle Price Range (NAD)</Label>
                <Select value={formData.vehiclePriceRange} onValueChange={(value) => setFormData({...formData, vehiclePriceRange: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<100k">&lt; N$ 100,000</SelectItem>
                    <SelectItem value="100k-250k">N$ 100,000 - 250,000</SelectItem>
                    <SelectItem value="251k-500k">N$ 251,000 - 500,000</SelectItem>
                    <SelectItem value="500k+">N$ 500,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vehicleAge">Vehicle Age (Years)</Label>
                <Input
                  id="vehicleAge"
                  type="number"
                  placeholder="Enter vehicle age"
                  value={formData.vehicleAge}
                  onChange={(e) => setFormData({...formData, vehicleAge: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Accident Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accidentArea">Accident Area</Label>
                <Select value={formData.accidentArea} onValueChange={(value) => setFormData({...formData, accidentArea: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select accident area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urban">Urban</SelectItem>
                    <SelectItem value="rural">Rural</SelectItem>
                    <SelectItem value="highway">Highway</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Police Report Filed</Label>
                <RadioGroup value={formData.policeReport} onValueChange={(value) => setFormData({...formData, policeReport: value})}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="police-yes" />
                    <Label htmlFor="police-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="police-no" />
                    <Label htmlFor="police-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Witness Present</Label>
                <RadioGroup value={formData.witnessPresent} onValueChange={(value) => setFormData({...formData, witnessPresent: value})}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="witness-yes" />
                    <Label htmlFor="witness-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="witness-no" />
                    <Label htmlFor="witness-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="weatherCondition">Weather Condition</Label>
                <Select value={formData.weatherCondition} onValueChange={(value) => setFormData({...formData, weatherCondition: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weather condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">Clear</SelectItem>
                    <SelectItem value="rainy">Rainy</SelectItem>
                    <SelectItem value="foggy">Foggy</SelectItem>
                    <SelectItem value="windy">Windy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="accidentTime">Accident Time</Label>
                <Select value={formData.accidentTime} onValueChange={(value) => setFormData({...formData, accidentTime: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select accident time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Claim Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agentType">Agent Type</Label>
                <Select value={formData.agentType} onValueChange={(value) => setFormData({...formData, agentType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="claimAmendments">Claim Amendments</Label>
                <Input
                  id="claimAmendments"
                  type="number"
                  placeholder="Enter number of amendments"
                  value={formData.claimAmendments}
                  onChange={(e) => setFormData({...formData, claimAmendments: e.target.value})}
                />
              </div>

              <div>
                <Label>Address Change Linked to Claim</Label>
                <RadioGroup value={formData.addressChangeLinked} onValueChange={(value) => setFormData({...formData, addressChangeLinked: value})}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="address-link-yes" />
                    <Label htmlFor="address-link-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="address-link-no" />
                    <Label htmlFor="address-link-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="claimAmountRange">Claim Amount Range (NAD)</Label>
                <Select value={formData.claimAmountRange} onValueChange={(value) => setFormData({...formData, claimAmountRange: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim amount range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<10k">&lt; N$ 10,000</SelectItem>
                    <SelectItem value="10k-50k">N$ 10,000 - 50,000</SelectItem>
                    <SelectItem value="50k-100k">N$ 50,000 - 100,000</SelectItem>
                    <SelectItem value="100k+">N$ 100,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payoutRatio">Payout to Claim Ratio</Label>
                <Input
                  id="payoutRatio"
                  type="number"
                  step="0.01"
                  placeholder="Enter ratio (0.0 - 1.0)"
                  value={formData.payoutRatio}
                  onChange={(e) => setFormData({...formData, payoutRatio: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="claimChannel">Claim Channel</Label>
                <Select value={formData.claimChannel} onValueChange={(value) => setFormData({...formData, claimChannel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="repairShopPattern">Repair Shop Pattern</Label>
                <Select value={formData.repairShopPattern} onValueChange={(value) => setFormData({...formData, repairShopPattern: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select repair shop pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="frequent">Frequent</SelectItem>
                    <SelectItem value="preferred">Preferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fraudPercentage">Fraud Percentage Estimate</Label>
                <Input
                  id="fraudPercentage"
                  type="number"
                  step="0.1"
                  placeholder="Enter fraud percentage estimate"
                  value={formData.fraudPercentage}
                  onChange={(e) => setFormData({...formData, fraudPercentage: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="fraudType">Fraud Type</Label>
                <Select value={formData.fraudType} onValueChange={(value) => setFormData({...formData, fraudType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fraud type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="staged accident">Staged Accident</SelectItem>
                    <SelectItem value="false documents">False Documents</SelectItem>
                    <SelectItem value="inflated claim">Inflated Claim</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>High Risk Combination</Label>
                <RadioGroup value={formData.highRiskCombination} onValueChange={(value) => setFormData({...formData, highRiskCombination: value})}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="risk-yes" />
                    <Label htmlFor="risk-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="risk-no" />
                    <Label htmlFor="risk-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="region">Region</Label>
                <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="khomas">Khomas</SelectItem>
                    <SelectItem value="erongo">Erongo</SelectItem>
                    <SelectItem value="hardap">Hardap</SelectItem>
                    <SelectItem value="otjozondjupa">Otjozondjupa</SelectItem>
                    <SelectItem value="oshana">Oshana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step {currentStep + 1}</h3>
            <p className="text-muted-foreground">
              This section is under construction. Continue to see the review page.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Claim</h1>
          <p className="text-muted-foreground">
            Submit a new insurance claim for fraud detection
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {steps.map((step, index) => (
                <span 
                  key={index} 
                  className={index <= currentStep ? "text-primary font-medium" : ""}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button onClick={submitClaim} disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Claim"}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Submission Result */}
      {submissionResult && (
        <Card>
          <CardContent className="pt-6">
            {submissionResult.success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Claim Submitted Successfully!</p>
                    <p>Claim ID: {submissionResult.claimId}</p>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Fraud Analysis Results:</h4>
                      <p><strong>Prediction:</strong> {submissionResult.prediction.fraud_prediction ? "FRAUD DETECTED" : "LEGITIMATE CLAIM"}</p>
                      <p><strong>Risk Level:</strong> {submissionResult.prediction.risk_level}</p>
                      <p><strong>Fraud Probability:</strong> {(submissionResult.prediction.fraud_probability * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Submission Failed</p>
                    <p>Error: {submissionResult.error}</p>
                    <p>Please try again or contact support if the problem persists.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
