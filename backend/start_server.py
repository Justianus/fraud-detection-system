"""
Start Backend API Server
=======================

This script starts the backend API server with your Supabase connection string.
"""

import os
import sys
from app import app, initialize_system

def main():
    """Start the backend server."""
    print("🚀 STARTING FRAUD DETECTION API SERVER")
    print("=" * 50)
    
    # Read connection string from file
    try:
        with open('connection_string.txt', 'r') as f:
            connection_string = f.read().strip()
        
        # Set environment variable
        os.environ['DATABASE_URL'] = connection_string
        
        print("✅ Connection string loaded from file")
        
    except FileNotFoundError:
        print("❌ Connection string file not found. Please create connection_string.txt file.")
        return
    
    try:
        # Initialize the system
        print("Initializing fraud detection system...")
        initialize_system()
        
        print("\n🎉 API SERVER STARTED SUCCESSFULLY!")
        print("=" * 50)
        print("API Endpoints:")
        print("  GET  /api/health - Health check")
        print("  POST /api/claims - Create new claim")
        print("  GET  /api/claims - Get all claims")
        print("  GET  /api/claims/<id> - Get specific claim")
        print("  POST /api/claims/<id>/predict - Predict fraud for claim")
        print("  POST /api/batch-predict - Batch fraud prediction")
        print("  GET  /api/dashboard/stats - Dashboard statistics")
        print("\n🌐 Server running on: http://localhost:5000")
        print("📊 Test the API: http://localhost:5000/api/health")
        print("\n💡 Ready for deployment!")
        print("   Use API URL: http://localhost:5000")
        
        # Start the server
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except Exception as e:
        print(f"❌ Error starting server: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure the database setup completed successfully")
        print("2. Check that all required packages are installed")
        print("3. Verify the connection string is correct")

if __name__ == "__main__":
    main()
