"""
=============================================================================
IDRO-AI ML Server (ml_server.py)
=============================================================================

This file serves as the Machine Learning API Server for the IDRO project.
It uses FastAPI to expose the trained XGBoost model as a REST API.

--- 1. How to Run Server ---
Command:
    uvicorn ml_server:app --reload

--- 2. How to Open API Docs ---
URL:
    http://127.0.0.1:8000/docs

--- 3. Expected Request Format (JSON) ---
POST /predict
{
  "disaster_type": "Flood",
  "severity": "High",
  "urgency": "Immediate",
  "affected_count": 500,
  "injured_count": 20,
  "missing_count": 5,
  "latitude": 26.5775,
  "longitude": 93.1711
}

--- 4. Example Response Format (JSON) ---
{
  "requirements": {
      "food_packets_per_day": 2000,
      "water_liters_per_day": 5000,
      "medical_kits_required": 50,
      "beds_required": 100,
      "blankets_required": 200,
      "toilets_required": 20,
      "power_units_required": 10,
      "ambulances_required": 5,
      "volunteers_required": 30
  },
  "risk_score": 60.0,
  "explanation": [
      "Due to High severity, immediate rescue and extensive resources are critical.",
      "With over 500 people affected, mass food and water supplies are prioritized."
  ]
}

=============================================================================
"""

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
import logging
import sys

# Configure Logging
# To enable debug logging for encoder verification, change level to logging.DEBUG
logging.basicConfig(
    level=logging.INFO,  # Change to logging.DEBUG to see encoder mappings during prediction
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
# Title: Displayed in the interactive API docs (http://localhost:8000/docs)
app = FastAPI(title="IDRO AI Prediction Service")

# --- Why we use these libraries ---
# 1. FastAPI: A modern, fast (high-performance) web framework for building APIs with Python 3.7+.
# 2. pandas: Used to structure the input data into a DataFrame, matching the format expected by the model.
# 3. joblib: Used to load the pre-trained Machine Learning model (.pkl files) efficiently.
# 4. pydantic: Used for data validation and defining the schema of the input JSON request.

# --- Load Trained ML Artifacts ---
print("--- Starting IDRO AI Server ---")
try:
    logger.info("Loading ML model and encoders...")
    
    # Load the trained XGBoost MultiOutputRegressor model
    model = joblib.load('idro_requirement_model.pkl')
    logger.info("✅ Model 'idro_requirement_model.pkl' loaded successfully")
    
    # ============================================================
    # CRITICAL: LOAD FROZEN ENCODERS
    # ============================================================
    # Encoders are loaded ONCE at startup and NEVER modified.
    # They are used ONLY for transform() operations during prediction.
    # DO NOT call fit() or fit_transform() on these encoders.
    # ============================================================
    
    # Load all encoders from the consolidated file
    try:
        encoders = joblib.load('encoders.pkl')
        logger.info("✅ Encoders loaded from 'encoders.pkl' (FROZEN)")
        
        # ============================================================
        # DEVELOPER DEBUG: Encoder Mappings
        # ============================================================
        # Print complete encoder mappings for verification
        logger.info(f"📋 Available encoders: {list(encoders.keys())}")
        logger.info("\n" + "="*60)
        logger.info("ENCODER MAPPINGS (for debugging)")
        logger.info("="*60)
        
        for encoder_name, encoder in encoders.items():
            logger.info(f"\n🔹 {encoder_name.upper()}")
            logger.info(f"   Classes: {list(encoder.classes_)}")
            
            # Create complete mapping: category → numeric code
            mapping = {cls: int(encoder.transform([cls])[0]) for cls in encoder.classes_}
            logger.info(f"   Mapping (Category → Code):")
            for category, code in mapping.items():
                logger.info(f"      '{category}' → {code}")
        
        logger.info("\n" + "="*60 + "\n")
        
        # Validate that required encoders are present
        required_encoders = ['disaster_type', 'severity', 'urgency']
        missing_encoders = [enc for enc in required_encoders if enc not in encoders]
        
        if missing_encoders:
            raise ValueError(f"Missing required encoders: {missing_encoders}")
        
        logger.info("✅ All required encoders validated")
        
    except FileNotFoundError:
        logger.error("❌ CRITICAL ERROR: 'encoders.pkl' not found")
        logger.error("Please run 'train_model.py' to generate encoder file before starting the server")
        sys.exit(1)  # Fail fast - cannot run without encoders
    except Exception as e:
        logger.error(f"❌ CRITICAL ERROR: Failed to load encoders: {e}")
        sys.exit(1)  # Fail fast

except FileNotFoundError as e:
    logger.error(f"❌ CRITICAL ERROR: Model file not found: {e}")
    logger.error("Please run 'train_model.py' to generate model files before starting the server")
    sys.exit(1)  # Fail fast - cannot run without model
except Exception as e:
    logger.error(f"❌ CRITICAL ERROR: Unexpected error during initialization: {e}")
    sys.exit(1)  # Fail fast

print("--- Initialization Complete ---\n")

def calculate_risk_score(severity: str, urgency: str, affected_count: int) -> float:
    """
    Calculates a risk score for disaster prioritization.
    
    Formula: Risk Score = Severity_Value * Urgency_Value * (Affected_Count / 100)
    
    Why this helps:
    - Prioritization: Helps authorities rank disasters based on impact and urgency.
    - Resource Allocation: Higher risk scores indicate a need for more immediate resources.
    - Scalability: The formula scales with the number of affected people.
    """
    
    # Mapping severity to numeric values (1-4 scale)
    severity_map = {
        'Low': 1,
        'Moderate': 2,
        'High': 3,
        'Critical': 4
    }
    
    # Mapping urgency to numeric values (1-4 scale)
    urgency_map = {
        'Low': 1,
        'Medium': 2,
        'High': 3,
        'Immediate': 4
    }
    
    # Get numeric values, defaulting to 1 (Low) if unknown
    severity_val = severity_map.get(severity, 1)
    urgency_val = urgency_map.get(urgency, 1)
    
    # Calculate Risk Score
    risk_score = severity_val * urgency_val * (affected_count / 100)
    
    return round(risk_score, 2)

def generate_explanation(severity: str, urgency: str, affected_count: int, injured_count: int) -> list:
    """
    Generates human-readable explanations for why resources are needed.
    
    Logic:
    - High Severity (High/Critical) -> Emphasizes immediate reconstruction/rescue needs.
    - High Urgency (High/Immediate) -> Emphasizes speed of delivery.
    - Large Population (>1000) -> Emphasizes mass supplies (food/water).
    - High Injuries (>50) -> Emphasizes medical kits and ambulances.
    """
    explanations = []
    
    # Severity Check
    if severity in ['High', 'Critical']:
        explanations.append(f"Due to {severity} severity, immediate rescue and extensive resources are critical.")
        
    # Urgency Check
    if urgency in ['High', 'Immediate']:
        explanations.append(f"The situation is marked as {urgency} urgency, requiring rapid deployment of teams.")
        
    # Affected Population Check
    if affected_count > 1000:
        explanations.append(f"With over {affected_count} people affected, mass food and water supplies are prioritized.")
    elif affected_count > 0:
        explanations.append(f"Resources are allocated to support the {affected_count} affected individuals.")

    # Injury Check
    if injured_count > 50:
        explanations.append(f"High injury count ({injured_count}) indicates a critical need for medical kits and ambulances.")
        
    if not explanations:
        explanations.append("Standard relief resources allocated based on disaster protocols.")
        
    return explanations

@app.get("/")
def read_root():
    return {"message": "IDRO AI Prediction Service is Running"}

def fallback_prediction(affected_count: int) -> dict:
    """
    Provides rule-based estimation if ML model fails.
    """
    return {
        'food_packets_per_day': int(affected_count * 2.5),
        'water_liters_per_day': int(affected_count * 5),
        'medical_kits_required': int(max(1, affected_count / 100)),
        'beds_required': int(max(1, affected_count / 20)),
        'blankets_required': int(max(1, affected_count / 5)),
        'toilets_required': int(max(1, affected_count / 50)),
        'power_units_required': int(max(1, affected_count / 200)),
        'ambulances_required': int(max(1, affected_count / 500)),
        'volunteers_required': int(max(1, affected_count / 50))
    }

# --- Input Validation Model ---
class DisasterInput(BaseModel):
    disaster_type: str
    severity: str
    urgency: str
    affected_count: int
    injured_count: int
    missing_count: int
    latitude: float
    longitude: float

# --- Prediction Endpoint ---
@app.post("/predict")
def predict_requirements(data: DisasterInput):
    """
    Predicts relief resource requirements based on disaster details.
    
    Sample Request Payload:
    {
      "disaster_type": "Earthquake",
      "severity": "Critical",
      "urgency": "Immediate",
      "affected_count": 2000,
      "injured_count": 150,
      "missing_count": 20,
      "latitude": 34.0522,
      "longitude": -118.2437
    }

    Workflow:
    1. Validate Input (Numeric ranges, Categories).
    2. Convert input to DataFrame.
    3. Encode 'disaster_type' using the saved LabelEncoder.
    4. Run ML model to predict resources.
    5. Calculate Risk Score.
    6. Generate Explanations.
    7. Return structured JSON response.
    """
    
    logger.info(f"Received prediction request for: {data.disaster_type} (Severity: {data.severity}, Urgency: {data.urgency})")
    
    # Track if we need to use fallback
    use_fallback = False
    fallback_reason = None
    
    # 0. Validate Input
    if data.affected_count < 0 or data.injured_count < 0 or data.missing_count < 0:
        logger.warning("Validation failed: Negative counts in input.")
        raise HTTPException(status_code=400, detail="Counts (affected, injured, missing) must be non-negative.")
    
    # Check if categorical values are known to encoders
    # If not, we'll use fallback instead of crashing
    if 'disaster_type' in encoders and data.disaster_type not in encoders['disaster_type'].classes_:
        logger.warning(f"Unknown disaster_type '{data.disaster_type}' not in encoder. Switching to fallback.")
        use_fallback = True
        fallback_reason = f"Unknown disaster type: {data.disaster_type}"
    
    if 'severity' in encoders and data.severity not in encoders['severity'].classes_:
        logger.warning(f"Unknown severity '{data.severity}' not in encoder. Switching to fallback.")
        use_fallback = True
        fallback_reason = f"Unknown severity: {data.severity}"
    
    if 'urgency' in encoders and data.urgency not in encoders['urgency'].classes_:
        logger.warning(f"Unknown urgency '{data.urgency}' not in encoder. Switching to fallback.")
        use_fallback = True
        fallback_reason = f"Unknown urgency: {data.urgency}"

    if model is None:
        logger.critical("Model not loaded.")
        raise HTTPException(status_code=503, detail="Model not loaded. Please contact administrator.")

    # If we detected unseen categories, use fallback prediction
    if use_fallback:
        logger.info(f"Using fallback prediction. Reason: {fallback_reason}")
        predicted_requirements = fallback_prediction(data.affected_count)
        prediction_source = "Fallback"
    else:
        # 1. Convert input to DataFrame
        input_data = {
            'disaster_type': [data.disaster_type],
            'severity': [data.severity],
            'urgency': [data.urgency],
            'affected_count': [data.affected_count],
            'injured_count': [data.injured_count],
            'missing_count': [data.missing_count],
            'latitude': [data.latitude],
            'longitude': [data.longitude]
        }
        input_df = pd.DataFrame(input_data)
        
        # 2. Encode categorical features using FROZEN encoders
        # CRITICAL: Only transform() is called - NEVER fit() or fit_transform()
        try:
            # ============================================================
            # DEVELOPER DEBUG: Encoding Verification
            # ============================================================
            logger.debug("🔍 Encoding categorical features...")
            
            # Transform disaster_type using frozen encoder
            original_disaster_type = input_df['disaster_type'].iloc[0]
            input_df['disaster_type'] = encoders['disaster_type'].transform(input_df['disaster_type'])
            encoded_disaster_type = input_df['disaster_type'].iloc[0]
            logger.debug(f"   disaster_type: '{original_disaster_type}' → {encoded_disaster_type}")
            
            # 3. Encode Severity and Urgency using frozen encoders
            for col in ['severity', 'urgency']:
                if col in encoders:
                    # Use frozen encoder - only transform(), never fit()
                    original_value = input_df[col].iloc[0]
                    input_df[col] = encoders[col].transform(input_df[col])
                    encoded_value = input_df[col].iloc[0]
                    logger.debug(f"   {col}: '{original_value}' → {encoded_value}")
                else:
                     # This should never happen if training was done correctly
                     logger.error(f"CRITICAL: No encoder found for {col}")
                     raise HTTPException(status_code=500, detail=f"Server configuration error: missing encoder for {col}")
            
            logger.debug(f"✅ All categorical features encoded successfully")
        except ValueError as e:
            # If encoding fails for any reason, fall back to rule-based prediction
            logger.warning(f"Encoding error: {e}. Using fallback prediction.")
            predicted_requirements = fallback_prediction(data.affected_count)
            prediction_source = "Fallback"
            use_fallback = True

    # We continue to formatted response instead of returning error

    # 4. Run ML Prediction (only if not using fallback)
    if not use_fallback:
        try:
            # Predict returns a numpy array
            predictions = model.predict(input_df)
            pred_values = predictions[0] # Get the first (and only) row
            
            # Target columns list (Order MUST match training)
            target_columns = [
                'food_packets_per_day',
                'water_liters_per_day',
                'medical_kits_required',
                'beds_required',
                'blankets_required',
                'toilets_required',
                'power_units_required',
                'ambulances_required',
                'volunteers_required'
            ]
            
            # Create a dictionary of results
            predicted_requirements = {}
            for i, target in enumerate(target_columns):
                predicted_requirements[target] = int(round(float(pred_values[i])))
                
            # Mark as ML prediction
            prediction_source = "ML"
                
        except Exception as e:
            logger.error(f"ML Prediction failed: {str(e)}. Using fallback rules.")
            predicted_requirements = fallback_prediction(data.affected_count)
            prediction_source = "Fallback"


    # 5. Calculate Risk Score
    risk_score = calculate_risk_score(data.severity, data.urgency, data.affected_count)
    
    # 6. Generate Explanations
    explanations = generate_explanation(data.severity, data.urgency, data.affected_count, data.injured_count)
    
    # 7. Construct Final Response
    response = {
        "requirements": predicted_requirements,
        "risk_score": risk_score,
        "explanation": explanations,
        "prediction_source": prediction_source
    }
    
    logger.info(f"Prediction successful. Risk Score: {risk_score}")
    return response
