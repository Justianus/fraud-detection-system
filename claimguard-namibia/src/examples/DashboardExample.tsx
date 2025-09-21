// Example of how to update your Dashboard component to use environment variables
// This shows the BEFORE and AFTER approach

import { useState, useEffect } from "react";
import { apiService } from '@/services/api';

export default function DashboardExample() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ✅ NEW WAY: Using API service with environment variables
      const [stats, claims] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getClaims()
      ]);
      
      setDashboardStats(stats);
      // Handle claims data...
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ❌ OLD WAY: Hardcoded URLs
  /*
  const fetchDashboardData = async () => {
    try {
      const [statsResponse, claimsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/stats'),
        fetch('http://localhost:5000/api/claims')
      ]);

      const [stats, claims] = await Promise.all([
        statsResponse.ok ? statsResponse.json() : null,
        claimsResponse.ok ? claimsResponse.json() : null
      ]);
      
      if (stats) setDashboardStats(stats);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };
  */

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard Example</h1>
      {/* Your dashboard content */}
    </div>
  );
}


