---
description: How to set up and run the IDRO multi-stack project
---

# IDRO Project Startup Workflow

Follow these steps to start the IDRO project components in the correct order.

## Prerequisites
- **Java 21** installed
- **Node.js** installed
- **Python 3.10+** installed
- **MongoDB** running on localhost:27017

## 1. Start the IDRO-AI (Machine Learning Server)
Navigate to the `IDRO-AI` directory and run:

```bash
cd IDRO-AI
pip install -r requirements.txt
uvicorn ml_server:app --port 8000 --reload
```

## 2. Start the IDRO-Backend (Spring Boot)
Navigate to the `idro-backend/idro` directory and run:

```bash
cd idro-backend/idro
./mvnw spring-boot:run
```
*Note: Ensure your MongoDB is running before starting the backend.*

## 3. Start the IDRO-Frontend (React)
Navigate to the `idro-frontend` directory and run:

```bash
cd idro-frontend
npm install
npm start
```

## 4. Access the Application
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8085/swagger-ui.html](http://localhost:8085/swagger-ui.html)
- **AI API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **WebSocket Endpoints**:
  - `ws://localhost:8085/ws/coordination`
  - `ws://localhost:8085/ws/alerts`
