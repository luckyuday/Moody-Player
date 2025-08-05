# utils/train_model.py

import librosa
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler

DATASET_PATH = 'dataset/'
MOODS = ['happy', 'sad', 'angry', 'neutral']

def extract_features_from_file(file_path):
    try:
        y_audio, sr = librosa.load(file_path, sr=None, mono=True)
        
        mel_spectrogram = librosa.feature.melspectrogram(y=y_audio, sr=sr)
        mean_mel_spectrogram = np.mean(mel_spectrogram, axis=1)

        tempo, _ = librosa.beat.beat_track(y=y_audio, sr=sr)
        
        mfccs = librosa.feature.mfcc(y=y_audio, sr=sr, n_mfcc=13)
        mean_mfccs = np.mean(mfccs, axis=1)

        chroma = librosa.feature.chroma_stft(y=y_audio, sr=sr)
        mean_chroma = np.mean(chroma, axis=1)

        rms_energy = np.mean(librosa.feature.rms(y=y_audio))

        zero_crossing_rate = np.mean(librosa.feature.zero_crossing_rate(y=y_audio))
        spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y_audio, sr=sr))
        spectral_rolloff = np.mean(librosa.feature.spectral_rolloff(y=y_audio, sr=sr))
        
        return np.concatenate([
            np.array([tempo]).flatten(),
            np.array([rms_energy]).flatten(),
            np.array([zero_crossing_rate]).flatten(),
            np.array([spectral_centroid]).flatten(),
            np.array([spectral_rolloff]).flatten(),
            mean_chroma.flatten(),
            mean_mfccs.flatten(),
            mean_mel_spectrogram.flatten() 
        ])
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

X = []
y = []

print("Starting feature extraction from dataset...")

for mood in MOODS:
    mood_dir = os.path.join(DATASET_PATH, mood)
    if not os.path.exists(mood_dir):
        print(f"Warning: Directory '{mood_dir}' not found. Skipping.")
        continue
    for file_name in os.listdir(mood_dir):
        if file_name.endswith('.mp3'):
            file_path = os.path.join(mood_dir, file_name)
            features = extract_features_from_file(file_path)
            if features is not None:
                X.append(features)
                y.append(mood)
                print(f"Extracted features for {file_path} ({mood})")

if len(X) > 0:
    X = np.array(X)
    y = np.array(y)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    print("\nTraining the model...")
    classifier = LogisticRegression(max_iter=1000, random_state=42)
    classifier.fit(X_train, y_train)
    
    y_pred = classifier.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy on test set: {accuracy * 100:.2f}%")

    model_path = os.path.join(os.path.dirname(__file__), 'mood_classifier.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump({'model': classifier, 'scaler': scaler}, f)
        
    print(f"Training complete. Model and scaler saved as '{model_path}'")
else:
    print("No data found in the dataset folder. Please check your paths.")