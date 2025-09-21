# ClaimGuard Namibia - Fraud Detection System

A comprehensive fraud detection system for Namibian insurance companies, built with React frontend and Python Flask backend.

## 🏗️ Project Structure

```
claimguard-namibia/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API services
│   │   └── config/         # Configuration files
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Python Flask API
│   ├── app.py              # Main Flask application
│   ├── models/             # Machine Learning models
│   ├── database/           # Database setup and connections
│   ├── requirements.txt
│   └── start_server.py
├── data/                   # Dataset files
├── docs/                   # Documentation
└── tests/                  # Test files
```

## 🚀 Features

- **Real-time Fraud Detection**: ML-powered risk assessment
- **Claims Management**: View, filter, and manage insurance claims
- **Dashboard Analytics**: Comprehensive fraud detection statistics
- **Regional Analysis**: Performance metrics by region
- **Batch Processing**: Upload and process multiple claims
- **Risk Assessment**: Detailed fraud probability scoring

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **React Router** for navigation
- **Recharts** for data visualization

### Backend
- **Python Flask** REST API
- **PostgreSQL** database
- **Machine Learning** models (Gradient Boosting)
- **CORS** enabled for frontend integration

## 📋 Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- PostgreSQL database
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd claimguard-namibia
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Add your database connection string to connection_string.txt
python start_server.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 📊 API Endpoints

- `GET /api/health` - Health check
- `GET /api/claims` - Get all claims
- `POST /api/claims` - Create new claim
- `GET /api/claims/<id>` - Get specific claim
- `POST /api/claims/<id>/predict` - Predict fraud for claim
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/reports/*` - Various reporting endpoints

## 🎯 Usage

1. **Dashboard**: View overall fraud detection statistics
2. **Claims**: Browse and filter insurance claims
3. **New Claim**: Submit individual claims for processing
4. **Batch Upload**: Process multiple claims at once
5. **Reports**: Generate detailed fraud analysis reports

## 🔧 Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:5000)
- `DATABASE_URL`: PostgreSQL connection string

### Database Setup
Run the database setup script to initialize tables and sample data:
```bash
cd backend/database
python database_setup.py
```

## 📈 Machine Learning

The system uses a Gradient Boosting classifier trained on historical fraud data. Features include:
- Demographics (age, gender, income)
- Claim history and patterns
- Vehicle information
- Geographic factors
- Risk indicators

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

### Backend (Railway/Heroku)
1. Create new project on Railway/Heroku
2. Connect GitHub repository
3. Set environment variables
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of a mini-thesis on premium payment leakage in Namibian insurance companies.

## 👥 Author

AI Assistant - 2024
