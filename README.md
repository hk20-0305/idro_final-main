# 🌍 IDRO – Integrated Disaster Response Operations

## 📌 Problem Statement

During disasters such as earthquakes, floods, or cyclones, authorities and response teams often struggle with **delayed information, lack of centralized data, and inefficient coordination**. Real-time disaster data is scattered across multiple platforms, making it difficult to quickly understand the situation and deploy resources effectively.

**IDRO (Integrated Disaster Response Operations)** aims to solve this problem by providing a **centralized platform that collects real-time disaster data, predicts risk levels, and visualizes affected areas on an interactive map**, helping authorities and volunteers respond faster and more efficiently.

---

# ⚙️ System Workflow

## 🔹 Theoretical Workflow

```text
Disaster Occurs
       │
       ▼
Global Disaster Monitoring Systems
(GDACS / USGS / Weather APIs)
       │
       ▼
Data Collection Layer
(Backend Fetches Disaster Data)
       │
       ▼
AI Prediction Service
(Analyzes Risk & Impact)
       │
       ▼
Backend Processing
(Spring Boot REST APIs)
       │
       ▼
Frontend Visualization
(React + Interactive Map)
       │
       ▼
Users / Disaster Response Teams
(View Alerts & Take Action)
```

---

# 🧠 Technical Workflow

```text
                ┌────────────────────────────┐
                │     External APIs          │
                │  GDACS / USGS / Weather    │
                └─────────────┬──────────────┘
                              │
                              ▼
                ┌────────────────────────────┐
                │     Spring Boot Backend    │
                │  - Fetch Disaster Data     │
                │  - Process API Responses   │
                │  - Provide REST Endpoints  │
                └─────────────┬──────────────┘
                              │
                ┌─────────────┴──────────────┐
                ▼                            ▼
      ┌─────────────────────┐      ┌────────────────────┐
      │  Python AI Service  │      │  Database (Optional)│
      │  - Risk Prediction  │      │  Store Alerts       │
      │  - Impact Analysis  │      │  Disaster History   │
      └───────────┬─────────┘      └────────────────────┘
                  │
                  ▼
        ┌─────────────────────────┐
        │   React Frontend        │
        │   - React Leaflet Map   │
        │   - Disaster Markers    │
        │   - Alert Dashboard     │
        └───────────┬─────────────┘
                    │
                    ▼
          ┌─────────────────────┐
          │   End Users         │
          │ Authorities / NGOs  │
          │ Volunteers          │
          └─────────────────────┘
```

---

# 🛠 Tech Stack

**Frontend**

* React
* React-Leaflet
* JavaScript

**Backend**

* Spring Boot
* REST APIs

**AI Service**

* Python

**Data Sources**

* GDACS Disaster Alerts
* USGS Earthquake Data
* OpenStreetMap Geolocation

---

# 🎯 Objective

The main objective of IDRO is to **improve disaster preparedness and response by combining real-time monitoring, predictive analytics, and interactive visualization into a single unified platform.**
