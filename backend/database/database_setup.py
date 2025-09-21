"""
Database Setup for Fraud Detection System
========================================

This script creates the necessary tables in your Supabase PostgreSQL database
for storing insurance claims and fraud predictions.

Author: AI Assistant
Date: 2024
Purpose: Mini-thesis on premium payment leakage in Namibian insurance companies
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
from datetime import datetime
import json

class DatabaseManager:
    def __init__(self, connection_string):
        """Initialize database connection."""
        self.connection_string = connection_string
        self.conn = None
        self.cursor = None
    
    def connect(self):
        """Connect to the database."""
        try:
            self.conn = psycopg2.connect(self.connection_string)
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            print("✅ Connected to Supabase PostgreSQL database")
            return True
        except Exception as e:
            print(f"❌ Error connecting to database: {str(e)}")
            return False
    
    def disconnect(self):
        """Disconnect from the database."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("✅ Disconnected from database")
    
    def create_tables(self):
        """Create all necessary tables for the fraud detection system."""
        print("🔧 Creating database tables...")
        
        # Table 1: Insurance Claims
        claims_table = """
        CREATE TABLE IF NOT EXISTS insurance_claims (
            id SERIAL PRIMARY KEY,
            claim_id VARCHAR(50) UNIQUE NOT NULL,
            age_group VARCHAR(20) NOT NULL,
            gender VARCHAR(10) NOT NULL,
            marital_status VARCHAR(20) NOT NULL,
            income_band VARCHAR(20) NOT NULL,
            employment_status VARCHAR(20) NOT NULL,
            address_change_last_6_months BOOLEAN NOT NULL,
            deductible_level VARCHAR(10) NOT NULL,
            days_policy_accident INTEGER NOT NULL,
            days_policy_claim INTEGER NOT NULL,
            past_number_of_claims INTEGER NOT NULL,
            vehicle_category VARCHAR(20) NOT NULL,
            vehicle_price_range VARCHAR(20) NOT NULL,
            vehicle_age_years INTEGER NOT NULL,
            accident_area VARCHAR(20) NOT NULL,
            police_report_filed BOOLEAN NOT NULL,
            witness_present BOOLEAN NOT NULL,
            weather_condition VARCHAR(20) NOT NULL,
            accident_time VARCHAR(20) NOT NULL,
            agent_type VARCHAR(20) NOT NULL,
            claim_amendments INTEGER NOT NULL,
            address_change_linked_to_claim BOOLEAN NOT NULL,
            claim_amount_range VARCHAR(20) NOT NULL,
            payout_to_claim_ratio DECIMAL(5,3) NOT NULL,
            claim_channel VARCHAR(20) NOT NULL,
            repair_shop_pattern VARCHAR(20) NOT NULL,
            fraud_percentage_estimate DECIMAL(5,2) NOT NULL,
            fraud_type VARCHAR(30) NOT NULL,
            high_risk_combination BOOLEAN NOT NULL,
            region VARCHAR(30) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Table 2: Fraud Predictions
        predictions_table = """
        CREATE TABLE IF NOT EXISTS fraud_predictions (
            id SERIAL PRIMARY KEY,
            claim_id VARCHAR(50) NOT NULL,
            fraud_prediction BOOLEAN NOT NULL,
            fraud_probability DECIMAL(5,4) NOT NULL,
            risk_level VARCHAR(20) NOT NULL,
            model_used VARCHAR(50) NOT NULL,
            prediction_confidence DECIMAL(5,4),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (claim_id) REFERENCES insurance_claims(claim_id)
        );
        """
        
        # Table 3: Model Performance Tracking
        model_performance_table = """
        CREATE TABLE IF NOT EXISTS model_performance (
            id SERIAL PRIMARY KEY,
            model_name VARCHAR(50) NOT NULL,
            accuracy DECIMAL(5,4) NOT NULL,
            precision_score DECIMAL(5,4) NOT NULL,
            recall_score DECIMAL(5,4) NOT NULL,
            f1_score DECIMAL(5,4) NOT NULL,
            roc_auc DECIMAL(5,4) NOT NULL,
            training_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            dataset_size INTEGER NOT NULL,
            fraud_cases INTEGER NOT NULL,
            non_fraud_cases INTEGER NOT NULL
        );
        """
        
        # Table 4: User Management (for future UI)
        users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'analyst',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        );
        """
        
        # Table 5: Audit Log
        audit_log_table = """
        CREATE TABLE IF NOT EXISTS audit_log (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            action VARCHAR(100) NOT NULL,
            table_name VARCHAR(50),
            record_id VARCHAR(50),
            old_values JSONB,
            new_values JSONB,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        """
        
        # Create indexes for better performance
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_claims_claim_id ON insurance_claims(claim_id);",
            "CREATE INDEX IF NOT EXISTS idx_claims_created_at ON insurance_claims(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_claims_region ON insurance_claims(region);",
            "CREATE INDEX IF NOT EXISTS idx_predictions_claim_id ON fraud_predictions(claim_id);",
            "CREATE INDEX IF NOT EXISTS idx_predictions_risk_level ON fraud_predictions(risk_level);",
            "CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON fraud_predictions(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);",
            "CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);"
        ]
        
        try:
            # Create tables
            self.cursor.execute(claims_table)
            self.cursor.execute(predictions_table)
            self.cursor.execute(model_performance_table)
            self.cursor.execute(users_table)
            self.cursor.execute(audit_log_table)
            
            # Create indexes
            for index in indexes:
                self.cursor.execute(index)
            
            self.conn.commit()
            print("✅ All tables created successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error creating tables: {str(e)}")
            self.conn.rollback()
            return False
    
    def insert_sample_data(self):
        """Insert sample data for testing."""
        print("📊 Inserting sample data...")
        
        sample_claims = [
            {
                'claim_id': 'CLM001',
                'age_group': '26-35',
                'gender': 'Male',
                'marital_status': 'Married',
                'income_band': '15001-30000',
                'employment_status': 'Employed',
                'address_change_last_6_months': False,
                'deductible_level': 'Medium',
                'days_policy_accident': 150,
                'days_policy_claim': 200,
                'past_number_of_claims': 1,
                'vehicle_category': 'SUV',
                'vehicle_price_range': '100k-250k',
                'vehicle_age_years': 5,
                'accident_area': 'Urban',
                'police_report_filed': True,
                'witness_present': True,
                'weather_condition': 'Clear',
                'accident_time': 'Morning',
                'agent_type': 'Internal',
                'claim_amendments': 0,
                'address_change_linked_to_claim': False,
                'claim_amount_range': '10k-50k',
                'payout_to_claim_ratio': 0.75,
                'claim_channel': 'Agent',
                'repair_shop_pattern': 'One-time',
                'fraud_percentage_estimate': 15.5,
                'fraud_type': 'None',
                'high_risk_combination': False,
                'region': 'Khomas'
            },
            {
                'claim_id': 'CLM002',
                'age_group': '18-25',
                'gender': 'Female',
                'marital_status': 'Single',
                'income_band': '5000-15000',
                'employment_status': 'Student',
                'address_change_last_6_months': True,
                'deductible_level': 'Low',
                'days_policy_accident': 50,
                'days_policy_claim': 75,
                'past_number_of_claims': 3,
                'vehicle_category': 'Motorbike',
                'vehicle_price_range': '<100k',
                'vehicle_age_years': 8,
                'accident_area': 'Highway',
                'police_report_filed': False,
                'witness_present': False,
                'weather_condition': 'Foggy',
                'accident_time': 'Night',
                'agent_type': 'External',
                'claim_amendments': 2,
                'address_change_linked_to_claim': True,
                'claim_amount_range': '50k-100k',
                'payout_to_claim_ratio': 0.9,
                'claim_channel': 'Online',
                'repair_shop_pattern': 'Frequent',
                'fraud_percentage_estimate': 45.2,
                'fraud_type': 'Staged Accident',
                'high_risk_combination': True,
                'region': 'Otjozondjupa'
            }
        ]
        
        try:
            for claim in sample_claims:
                insert_query = """
                INSERT INTO insurance_claims (
                    claim_id, age_group, gender, marital_status, income_band,
                    employment_status, address_change_last_6_months, deductible_level,
                    days_policy_accident, days_policy_claim, past_number_of_claims,
                    vehicle_category, vehicle_price_range, vehicle_age_years,
                    accident_area, police_report_filed, witness_present,
                    weather_condition, accident_time, agent_type, claim_amendments,
                    address_change_linked_to_claim, claim_amount_range,
                    payout_to_claim_ratio, claim_channel, repair_shop_pattern,
                    fraud_percentage_estimate, fraud_type, high_risk_combination, region
                ) VALUES (
                    %(claim_id)s, %(age_group)s, %(gender)s, %(marital_status)s, %(income_band)s,
                    %(employment_status)s, %(address_change_last_6_months)s, %(deductible_level)s,
                    %(days_policy_accident)s, %(days_policy_claim)s, %(past_number_of_claims)s,
                    %(vehicle_category)s, %(vehicle_price_range)s, %(vehicle_age_years)s,
                    %(accident_area)s, %(police_report_filed)s, %(witness_present)s,
                    %(weather_condition)s, %(accident_time)s, %(agent_type)s, %(claim_amendments)s,
                    %(address_change_linked_to_claim)s, %(claim_amount_range)s,
                    %(payout_to_claim_ratio)s, %(claim_channel)s, %(repair_shop_pattern)s,
                    %(fraud_percentage_estimate)s, %(fraud_type)s, %(high_risk_combination)s, %(region)s
                ) ON CONFLICT (claim_id) DO NOTHING;
                """
                self.cursor.execute(insert_query, claim)
            
            self.conn.commit()
            print("✅ Sample data inserted successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error inserting sample data: {str(e)}")
            self.conn.rollback()
            return False
    
    def get_table_info(self):
        """Get information about all tables."""
        print("📋 Database Table Information:")
        
        tables = ['insurance_claims', 'fraud_predictions', 'model_performance', 'users', 'audit_log']
        
        for table in tables:
            try:
                self.cursor.execute(f"SELECT COUNT(*) as count FROM {table};")
                count = self.cursor.fetchone()['count']
                print(f"  {table}: {count} records")
            except Exception as e:
                print(f"  {table}: Error - {str(e)}")

def main():
    """Main function to set up the database."""
    print("🚀 SETTING UP FRAUD DETECTION DATABASE")
    print("=" * 50)
    
    # You need to replace this with your actual Supabase connection string
    connection_string = input("Enter your Supabase PostgreSQL connection string: ").strip()
    
    if not connection_string:
        print("❌ No connection string provided. Exiting.")
        return
    
    # Initialize database manager
    db_manager = DatabaseManager(connection_string)
    
    # Connect to database
    if not db_manager.connect():
        return
    
    try:
        # Create tables
        if db_manager.create_tables():
            # Insert sample data
            db_manager.insert_sample_data()
            
            # Show table information
            db_manager.get_table_info()
            
            print("\n✅ Database setup completed successfully!")
            print("Your fraud detection system is ready to use with the database.")
        
    finally:
        db_manager.disconnect()

if __name__ == "__main__":
    main()






