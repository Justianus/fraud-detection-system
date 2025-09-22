"""
Real-Time Fraud Prediction System
================================

This system allows you to predict fraud for new insurance claims in real-time.
It uses the trained Gradient Boosting model from your analysis.

Author: AI Assistant
Date: 2024
Purpose: Mini-thesis on premium payment leakage in Namibian insurance companies
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import GradientBoostingClassifier
import pickle
import warnings
warnings.filterwarnings('ignore')

class FraudPredictionSystem:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_selector = None
        self.label_encoders = {}
        self.feature_names = []
        self.is_trained = False
        
    def train_model(self, data_path='../data/insurance_fraud_datasetCOMBINED.csv'):
        """Train the model using your dataset."""
        print("Training the fraud detection model...")
        
        # Load and preprocess data (same as in optimized version)
        df = pd.read_csv(data_path)
        
        # Remove personal identifiers
        personal_columns = ['FirstName', 'LastName', 'CellNumber', 'IDNumber']
        df_clean = df.drop(columns=personal_columns, errors='ignore')
        
        # Handle missing values
        df_clean['FraudType'] = df_clean['FraudType'].fillna('Unknown')
        
        # Advanced feature engineering
        df_engineered = self._create_features(df_clean)
        
        # Preprocessing
        X, y = self._preprocess_data(df_engineered)
        
        # Train the model
        self.model = GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=8,
            min_samples_split=10,
            min_samples_leaf=4,
            random_state=42
        )
        
        self.model.fit(X, y)
        self.is_trained = True
        
        print("✅ Model trained successfully!")
        return True
    
    def _create_features(self, df):
        """Create the same features as in the optimized version."""
        # Create new features
        df['RiskScore'] = 0
        
        # High-risk age groups
        df.loc[df['AgeGroup'].isin(['18-25', '60+']), 'RiskScore'] += 1
        
        # High-risk income
        df.loc[df['IncomeBand'].isin(['<5000', '5000-15000']), 'RiskScore'] += 1
        
        # High-risk employment
        df.loc[df['EmploymentStatus'].isin(['Unemployed', 'Student']), 'RiskScore'] += 1
        
        # Multiple claims history
        df.loc[df['PastNumberOfClaims'] > 2, 'RiskScore'] += 1
        
        # Recent address change
        df.loc[df['AddressChange_Last6Months'] == 'Yes', 'RiskScore'] += 1
        
        # Claim-to-Policy Ratio
        df['ClaimToPolicyRatio'] = df['Days_Policy_Claim'] / (df['Days_Policy_Accident'] + 1)
        
        # Vehicle Age Risk
        df['VehicleAgeRisk'] = 0
        df.loc[df['VehicleAge(In Years)'] > 10, 'VehicleAgeRisk'] = 1
        df.loc[df['VehicleAge(In Years)'] > 15, 'VehicleAgeRisk'] = 2
        
        # Claim Amount Risk
        df['ClaimAmountRisk'] = 0
        df.loc[df['ClaimAmountRange'].isin(['100k+']), 'ClaimAmountRisk'] = 2
        df.loc[df['ClaimAmountRange'].isin(['50k-100k']), 'ClaimAmountRisk'] = 1
        
        # Payout Ratio Risk
        df['PayoutRatioRisk'] = 0
        df.loc[df['PayoutToClaimRatio'] > 0.8, 'PayoutRatioRisk'] = 1
        df.loc[df['PayoutToClaimRatio'] > 0.9, 'PayoutRatioRisk'] = 2
        
        # Fraud Type Risk
        df['FraudTypeRisk'] = 0
        df.loc[df['FraudType'].isin(['Staged Accident', 'False Documents']), 'FraudTypeRisk'] = 2
        df.loc[df['FraudType'].isin(['Inflated Claim']), 'FraudTypeRisk'] = 1
        
        # Region Risk
        region_risk = {
            'Khomas': 1, 'Otjozondjupa': 1, 'Hardap': 1,
            'Erongo': 0, 'Oshana': 0
        }
        df['RegionRisk'] = df['Region'].map(region_risk).fillna(0)
        
        # Time-based features
        df['AccidentTimeRisk'] = 0
        df.loc[df['AccidentTime'].isin(['Night', 'Evening']), 'AccidentTimeRisk'] = 1
        
        # Weather Risk
        df['WeatherRisk'] = 0
        df.loc[df['WeatherCondition'].isin(['Foggy', 'Windy']), 'WeatherRisk'] = 1
        
        # Combined Risk Score
        df['CombinedRiskScore'] = (
            df['RiskScore'] + 
            df['VehicleAgeRisk'] + 
            df['ClaimAmountRisk'] + 
            df['PayoutRatioRisk'] + 
            df['FraudTypeRisk'] + 
            df['RegionRisk'] + 
            df['AccidentTimeRisk'] + 
            df['WeatherRisk']
        )
        
        return df
    
    def _preprocess_data(self, df):
        """Preprocess data for training."""
        X = df.drop('FraudLabel', axis=1)
        y = df['FraudLabel']
        
        # Identify column types
        categorical_columns = X.select_dtypes(include=['object']).columns.tolist()
        numerical_columns = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
        
        # Create processed dataset
        X_processed = X.copy()
        
        # Encode categorical variables
        for col in categorical_columns:
            le = LabelEncoder()
            X_processed[col] = le.fit_transform(X_processed[col].astype(str))
            self.label_encoders[col] = le
        
        # Scale numerical features
        self.scaler = StandardScaler()
        X_processed[numerical_columns] = self.scaler.fit_transform(X_processed[numerical_columns])
        
        # Store feature names
        self.feature_names = X_processed.columns.tolist()
        
        return X_processed, y
    
    def predict_single_claim(self, claim_data):
        """Predict fraud for a single claim."""
        if not self.is_trained:
            raise ValueError("Model not trained. Please train the model first.")
        
        # Convert to DataFrame
        if isinstance(claim_data, dict):
            df = pd.DataFrame([claim_data])
        else:
            df = claim_data.copy()
        
        # Create features
        df_engineered = self._create_features(df)
        
        # Preprocess
        X = df_engineered.drop('FraudLabel', axis=1, errors='ignore')
        
        # Encode categorical variables
        categorical_columns = X.select_dtypes(include=['object']).columns.tolist()
        numerical_columns = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
        
        X_processed = X.copy()
        
        for col in categorical_columns:
            if col in self.label_encoders:
                # Handle unseen categories
                try:
                    X_processed[col] = self.label_encoders[col].transform(X_processed[col].astype(str))
                except ValueError:
                    # If category not seen during training, use the most common one
                    X_processed[col] = 0
        
        # Scale numerical features
        X_processed[numerical_columns] = self.scaler.transform(X_processed[numerical_columns])
        
        # Ensure same features as training
        X_processed = X_processed.reindex(columns=self.feature_names, fill_value=0)
        
        # Make prediction
        fraud_probability = self.model.predict_proba(X_processed)[0, 1]
        fraud_prediction = self.model.predict(X_processed)[0]
        
        return {
            'fraud_prediction': int(fraud_prediction),
            'fraud_probability': float(fraud_probability),
            'risk_level': self._get_risk_level(fraud_probability)
        }
    
    def _get_risk_level(self, probability):
        """Convert probability to risk level."""
        if probability >= 0.7:
            return "HIGH RISK"
        elif probability >= 0.4:
            return "MEDIUM RISK"
        else:
            return "LOW RISK"
    
    def predict_batch(self, claims_data):
        """Predict fraud for multiple claims."""
        results = []
        for i, claim in enumerate(claims_data):
            try:
                result = self.predict_single_claim(claim)
                result['claim_id'] = i + 1
                results.append(result)
            except Exception as e:
                results.append({
                    'claim_id': i + 1,
                    'error': str(e),
                    'fraud_prediction': None,
                    'fraud_probability': None,
                    'risk_level': None
                })
        return results
    
    def save_model(self, filepath='models/fraud_detection_model.pkl'):
        """Save the trained model."""
        if not self.is_trained:
            raise ValueError("Model not trained. Please train the model first.")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_names': self.feature_names
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"✅ Model saved to {filepath}")
    
    def load_model(self, filepath='models/fraud_detection_model.pkl'):
        """Load a pre-trained model."""
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.label_encoders = model_data['label_encoders']
            self.feature_names = model_data['feature_names']
            self.is_trained = True
            
            print(f"✅ Model loaded from {filepath}")
            return True
        except FileNotFoundError:
            print(f"❌ Model file not found: {filepath}")
            return False
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            return False

def create_sample_claim():
    """Create a sample claim for testing."""
    return {
        'AgeGroup': '26-35',
        'Gender': 'Male',
        'MaritalStatus': 'Married',
        'IncomeBand': '15001-30000',
        'AddressChange_Last6Months': 'No',
        'PolicyType': 'Vehicle',
        'DeductibleLevel': 'Medium',
        'Days_Policy_Accident': 150,
        'Days_Policy_Claim': 200,
        'VehicleCategory': 'SUV',
        'VehiclePriceRange': '100k-250k',
        'VehicleAge(In Years)': 5,
        'PastNumberOfClaims': 1,
        'AccidentArea': 'Urban',
        'PoliceReportFiled': 'Yes',
        'WitnessPresent': 'Yes',
        'AgentType': 'Internal',
        'ClaimAmendments': 0,
        'AddressChange_LinkedToClaim': 'No',
        'FraudPercentageEstimate': 15.5,
        'FraudType': 'None',
        'HighRiskCombination': 'No',
        'Region': 'Khomas',
        'EmploymentStatus': 'Employed',
        'ClaimAmountRange': '10k-50k',
        'PayoutToClaimRatio': 0.75,
        'ClaimChannel': 'Agent',
        'WeatherCondition': 'Clear',
        'AccidentTime': 'Morning',
        'RepairShopPattern': 'One-time'
    }

def main():
    """Main function to demonstrate the prediction system."""
    print("🚀 FRAUD PREDICTION SYSTEM")
    print("=" * 50)
    
    # Initialize the system
    fraud_system = FraudPredictionSystem()
    
    # Train the model
    print("\n1. Training the model...")
    fraud_system.train_model()
    
    # Save the model
    print("\n2. Saving the model...")
    fraud_system.save_model()
    
    # Test with a sample claim
    print("\n3. Testing with a sample claim...")
    sample_claim = create_sample_claim()
    
    result = fraud_system.predict_single_claim(sample_claim)
    
    print(f"\n📊 PREDICTION RESULTS:")
    print(f"Fraud Prediction: {'FRAUD' if result['fraud_prediction'] else 'LEGITIMATE'}")
    print(f"Fraud Probability: {result['fraud_probability']:.4f}")
    print(f"Risk Level: {result['risk_level']}")
    
    # Test with multiple claims
    print(f"\n4. Testing with multiple claims...")
    sample_claims = [
        create_sample_claim(),
        {**create_sample_claim(), 'FraudType': 'Staged Accident', 'IncomeBand': '<5000'},
        {**create_sample_claim(), 'PastNumberOfClaims': 5, 'ClaimAmountRange': '100k+'}
    ]
    
    batch_results = fraud_system.predict_batch(sample_claims)
    
    print(f"\n📊 BATCH PREDICTION RESULTS:")
    for result in batch_results:
        print(f"Claim {result['claim_id']}: {result['risk_level']} (Probability: {result['fraud_probability']:.4f})")
    
    print(f"\n✅ System ready for production use!")
    print(f"Use fraud_system.predict_single_claim(claim_data) for new predictions")

if __name__ == "__main__":
    main()






