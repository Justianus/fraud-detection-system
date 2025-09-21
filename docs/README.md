# Vehicle Insurance Fraud Detection Model

This project implements a comprehensive machine learning pipeline for detecting fraudulent vehicle insurance claims, specifically designed for your mini-thesis on premium payment leakage in Namibian insurance companies.

## Project Overview

The project addresses the critical issue of premium payment leakage in insurance companies through advanced predictive modeling. It uses multiple machine learning algorithms to identify patterns associated with fraudulent claims, helping insurance companies reduce financial losses and improve operational efficiency.

## Dataset

The analysis uses synthetic vehicle insurance claim data with the following characteristics:
- **Target Variable**: FraudLabel (0 = Non-fraud, 1 = Fraud)
- **Features**: 33+ features including demographic, policy, vehicle, and claim-related information
- **Data Quality**: Clean dataset with no missing values

## Models Implemented

The project compares five different machine learning algorithms:

1. **Logistic Regression** - Linear baseline model
2. **Random Forest** - Ensemble method with good interpretability
3. **Gradient Boosting** - Advanced ensemble method
4. **Support Vector Machine (Linear)** - Linear kernel SVM
5. **Support Vector Machine (RBF)** - Non-linear kernel SVM

## Files Description

- `fraud_detection_model.py` - Complete analysis with visualizations
- `fraud_detection_simple.py` - Simplified version without complex visualizations
- `requirements.txt` - Python package dependencies
- `insurance_fraud_datasetCOMBINED.csv` - Your synthetic dataset
- `README.md` - This file

## Installation and Setup

### Option 1: Full Installation (Recommended)

1. Install Python 3.8 or higher
2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the complete analysis:
   ```bash
   python fraud_detection_model.py
   ```

### Option 2: Simplified Installation

If you encounter issues with visualization packages, use the simplified version:

1. Install basic packages:
   ```bash
   pip install pandas numpy scikit-learn
   ```

2. Run the simplified analysis:
   ```bash
   python fraud_detection_simple.py
   ```

## Expected Outputs

The analysis will generate:

1. **Console Output**: Detailed analysis results, model comparisons, and performance metrics
2. **fraud_detection_report.txt**: Comprehensive written report with findings and recommendations
3. **model_performance_analysis.png**: Visualizations (full version only)

## Key Features

### Data Preprocessing
- Automatic handling of categorical and numerical variables
- Standardization of numerical features
- One-hot encoding of categorical features
- Removal of personal identifiers for privacy protection

### Model Evaluation
- Cross-validation for robust performance estimation
- Multiple evaluation metrics (Accuracy, Precision, Recall, F1-Score, ROC-AUC)
- Confusion matrix analysis
- Feature importance analysis (where applicable)

### Business Insights
- Identification of the best-performing model
- Detailed performance analysis
- Recommendations for implementation
- Business impact assessment

## Results Interpretation

The analysis will help you understand:

1. **Which model performs best** for your specific dataset
2. **Model performance metrics** and their business implications
3. **Feature importance** for understanding fraud patterns
4. **Implementation recommendations** for real-world deployment

## Research Context

This project directly supports your research objectives:

- **Objective I**: Data preprocessing and quality improvement
- **Objective II**: Design of predictive models using SVM and ensemble methods
- **Objective III**: Development of a functional fraud detection system
- **Objective IV**: Evaluation of system accuracy and performance

## Expected Performance

Based on the synthetic dataset characteristics, you can expect:
- ROC-AUC scores between 0.75-0.95 depending on the model
- Good precision for fraud detection (reducing false positives)
- Reasonable recall for fraud coverage (catching most fraud cases)

## Troubleshooting

### Common Issues:

1. **Python not found**: Install Python from python.org or use Anaconda
2. **Package installation errors**: Use `pip install --upgrade pip` first
3. **Memory issues**: The simplified version uses less memory
4. **Visualization errors**: Use the simplified version if matplotlib fails

### Getting Help:

If you encounter any issues, the simplified version (`fraud_detection_simple.py`) is designed to work with minimal dependencies and should run successfully in most environments.

## Next Steps

After running the analysis:

1. Review the generated report for key findings
2. Consider the best model for your thesis implementation
3. Plan integration with existing insurance systems
4. Develop a deployment strategy for real-world application

## Academic Use

This project is designed to support your mini-thesis research. The results can be used to:
- Demonstrate the effectiveness of machine learning in fraud detection
- Compare different algorithmic approaches
- Provide empirical evidence for your research objectives
- Support recommendations for Namibian insurance companies

Good luck with your research!

