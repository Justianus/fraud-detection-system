import { Badge } from "@/components/ui/badge";

type RiskLevel = "high" | "medium" | "low";

interface RiskBadgeProps {
  level: RiskLevel;
  percentage?: number;
}

export function RiskBadge({ level, percentage }: RiskBadgeProps) {
  const variant = level === "high" ? "risk-high" : level === "medium" ? "risk-medium" : "risk-low";
  const label = level === "high" ? "High Risk" : level === "medium" ? "Medium Risk" : "Low Risk";
  
  return (
    <Badge variant={variant}>
      {label}
      {percentage !== undefined && ` (${percentage}%)`}
    </Badge>
  );
}
