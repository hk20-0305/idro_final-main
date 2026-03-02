"""
=============================================================================
IDRO-AI Training Script (train_model.py)
=============================================================================

1. HOW TO RUN:
   - Open terminal or command prompt.
   - Navigate to the project folder: cd "d:\\IDRO\\IDRO-AI"
   - Run the command: python train_model.py

2. REQUIRED DATASET:
   - File Name: idro_final_training_dataset.csv
   - Location: Must be in the same folder as this script.
   - Columns Required: disaster_type, severity, urgency, affected_count, 
     injured_count, missing_count, latitude, longitude, and all 9 target 
     resource columns (food, water, etc.).

3. EXPECTED OUTPUT:
   - Dataset information printed to console.
   - "Model training completed successfully." message.
   - "Mean Absolute Error (MAE)" evaluation results.
   - Two files created: 'idro_requirement_model.pkl' and 'encoders.pkl'

4. TROUBLESHOOTING:
   - "FileNotFoundError": Check if 'idro_final_training_dataset.csv' exists.
   - "KeyError": Check if your CSV has all the required column names correct.
   - "Empty Data": Ensure various columns are not empty in the CSV.

=============================================================================
"""

import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error
import joblib

# Load the training dataset from CSV
# Using try-except block to handle file loading errors
try:
    print("Loading dataset...")
    df = pd.read_csv('idro_final_training_dataset.csv')
    
    # Check if dataframe is empty to avoid errors in subsequent steps
    if df.empty:
        print("Warning: The dataset is empty. Please populate 'idro_final_training_dataset.csv'.")
    else:
        print("Dataset loaded successfully.")
        
        # 3. Prints first 5 rows (Raw Data)
        print("\nFirst 5 rows of the dataset (Raw):")
        print(df.head())
        
        # 4. Prints dataset information
        print("\nDataset Information:")
        print(df.info())

        # --- Preprocessing Steps ---
        print("\n--- Starting Preprocessing ---")

        # ============================================================
        # ENCODER FITTING (TRAINING PHASE ONLY)
        # ============================================================
        # CRITICAL: Encoders are fit ONLY during training and then frozen.
        # They will be saved and reused during prediction without re-fitting.
        # ============================================================
        
        # Encode categorical features: disaster_type, severity, urgency
        # We check if columns exist first to prevent KeyError and handle partial data
        label_encoders = {}
        categorical_cols = ['disaster_type', 'severity', 'urgency']
        
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                # FIT encoders ONLY during training - this is the ONLY place fit() is called
                df[col] = le.fit_transform(df[col].astype(str))
                label_encoders[col] = le
                print(f"'{col}' column encoded successfully.")
                
                # Print mapping for verification
                mapping = dict(zip(le.classes_, le.transform(le.classes_)))
                print(f"Mapping for {col}: {mapping}")
            else:
                print(f"Warning: '{col}' column not found in dataset. Skipping encoding.")

        # --- Feature Selection and Target Separation ---
        
        # Define Input Features (X) based on Volunteer Form inputs
        # These are the variables the model will use to make predictions
        feature_columns = [
            'disaster_type', 
            'severity', 
            'urgency', 
            'affected_count', 
            'injured_count', 
            'missing_count',
            'latitude',
            'longitude'
        ]
        
        # Filter to only include columns that actually exist in the dataframe
        available_features = [col for col in feature_columns if col in df.columns]
        if not available_features:
             print("Error: No feature columns found in dataset.")
        else:
            X = df[available_features]
            print(f"\nInput Features (X) prepared with columns: {available_features}")
            print(X.head())

        # Define Output Targets (Y) - Multi-Output Regression
        # We are predicting multiple continuous variables simultaneously.
        # This requires algorithms that support multi-output regression (e.g., Random Forest, Extra Trees, or generic MultiOutputRegressor wrapper).
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

        # Filter to only include target columns that actually exist
        available_targets = [col for col in target_columns if col in df.columns]
        if not available_targets:
            print("Error: No target columns found in dataset.")
            Y = None
        else:
            Y = df[available_targets]
            print(f"\nOutput Targets (Y) prepared with columns: {available_targets}")
            print(Y.head())
        
        # --- Train-Test Split ---
        print("\n--- Splitting Dataset ---")
        if available_features and Y is not None:
             # Split dataset into training and testing sets
             # test_size=0.2 means 20% of data is used for testing, 80% for training
             # random_state=42 ensures reproducibility of the split
             X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)
             
             print(f"Data split successfully.")
             print(f"Training set size: {X_train.shape[0]} samples")
             print(f"Testing set size: {X_test.shape[0]} samples")

             # --- Model Training ---
             print("\n--- Training Model ---")
             
             # Initialize XGBRegressor model
             # XGBRegressor is a powerful implementation of gradient boosted decision trees
             xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
             
             # Use MultiOutputRegressor to handle multiple target variables simultaneously
             # This wraps the single-output regressor to support multi-output regression
             multi_target_model = MultiOutputRegressor(xgb_model)
             
             print("Training XGBoost MultiOutput Regressor...")
             multi_target_model.fit(X_train, Y_train)
             
             print("Model training completed successfully.")
             
             # --- Model Evaluation ---
             print("\n--- Evaluating Model ---")
             
             # Predict on test data
             Y_pred = multi_target_model.predict(X_test)
             
             # Calculate Mean Absolute Error (MAE)
             # MAE measures the average magnitude of errors in a set of predictions, without considering their direction.
             # Lower MAE values indicate better model performance.
             mae = mean_absolute_error(Y_test, Y_pred, multioutput='raw_values')
             
             print("\nMean Absolute Error (MAE) per target variable:")
             for i, target in enumerate(available_targets):
                 print(f"{target}: {mae[i]:.2f}")
                 
             # Calculate overall Average MAE
             overall_mae = mean_absolute_error(Y_test, Y_pred)
             print(f"\nOverall Average MAE: {overall_mae:.2f}")

             # --- Save Model and Encoders ---
             print("\n--- Saving Artifacts ---")
             
             # Save the trained model
             joblib.dump(multi_target_model, 'idro_requirement_model.pkl')
             print("Model saved as 'idro_requirement_model.pkl'")
             
             # ============================================================
             # CRITICAL: ENCODER FREEZING
             # ============================================================
             # Label encoders MUST be frozen after training and reused during prediction.
             # 
             # WHY FREEZING IS IMPORTANT:
             # 1. Consistency: Ensures the same categorical values map to the same numeric codes
             # 2. Prevents Data Leakage: Avoids re-fitting on new data which would change mappings
             # 3. Handles Unknown Categories: Allows graceful handling of unseen values
             #
             # USAGE DURING PREDICTION:
             # - Load encoders using: encoders = joblib.load('encoders.pkl')
             # - Transform new data using: encoders['disaster_type'].transform(['FLOOD'])
             # - NEVER call fit() or fit_transform() on loaded encoders
             # ============================================================
             
             
             # Save all label encoders in a single file
             try:
                 joblib.dump(label_encoders, 'encoders.pkl')
                 print("\n✅ All Label Encoders saved as 'encoders.pkl' (FROZEN for prediction)")
                 print(f"Encoders saved: {list(label_encoders.keys())}")
                 
                 # ============================================================
                 # ENCODER VALIDATION
                 # ============================================================
                 # Verify that encoders were saved correctly and can be loaded
                 print("\n--- Validating Encoder Integrity ---")
                 
                 # Load encoders to verify they were saved correctly
                 loaded_encoders = joblib.load('encoders.pkl')
                 
                 # Validate each encoder
                 validation_passed = True
                 for col_name, encoder in loaded_encoders.items():
                     print(f"\n📋 Encoder: {col_name}")
                     print(f"   Type: {type(encoder).__name__}")
                     print(f"   Classes: {list(encoder.classes_)}")
                     print(f"   Number of classes: {len(encoder.classes_)}")
                     
                     # Create mapping for verification
                     mapping = {cls: encoder.transform([cls])[0] for cls in encoder.classes_}
                     print(f"   Mapping: {mapping}")
                     
                     # Verify encoder can transform its own classes
                     try:
                         test_transform = encoder.transform(encoder.classes_)
                         expected_values = list(range(len(encoder.classes_)))
                         if list(test_transform) == expected_values:
                             print(f"   ✅ Validation PASSED: Encoded values match expected range [0-{len(encoder.classes_)-1}]")
                         else:
                             print(f"   ❌ Validation FAILED: Encoded values don't match expected range")
                             validation_passed = False
                     except Exception as e:
                         print(f"   ❌ Validation FAILED: Error during transform test: {e}")
                         validation_passed = False
                 
                 if validation_passed:
                     print("\n✅ All encoder validations PASSED")
                 else:
                     print("\n❌ Some encoder validations FAILED")
                     raise ValueError("Encoder validation failed. Training aborted.")
                     
             except Exception as e:
                 print(f"\n❌ CRITICAL ERROR: Failed to save or validate encoders: {e}")
                 print("Training ABORTED. Encoders must be saved successfully.")
                 raise  # Re-raise to stop execution

        else:
            print("Skipping Train-Test Split and Training due to missing features or targets.")

except FileNotFoundError:
    print("Error: The file 'idro_final_training_dataset.csv' was not found.")
except Exception as e:
    print(f"An error occurred: {e}")
