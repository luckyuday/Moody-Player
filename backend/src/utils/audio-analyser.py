# utils/analyze_audio.py

import sys
import librosa
import numpy as np
import json
import pickle
import os

model_path = os.path.join(os.path.dirname(__file__), 'mood_classifier.pkl')

try:
    with open(model_path, 'rb') as f:
        loaded_data = pickle.load(f)
        classifier = loaded_data['model']
        scaler = loaded_data['scaler']
except FileNotFoundError:
    print(json.dumps({"error": f"Pre-trained model file '{model_path}' not found."}), file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(json.dumps({"error": f"Error loading model: {str(e)}"}), file=sys.stderr)
    sys.exit(1)

def analyze_audio(file_path):
    try:
        y, sr = librosa.load(file_path, sr=None, mono=True) 
        
        mel_spectrogram = librosa.feature.melspectrogram(y=y, sr=sr)
        mean_mel_spectrogram = np.mean(mel_spectrogram, axis=1)

        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mean_mfccs = np.mean(mfccs, axis=1)

        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        mean_chroma = np.mean(chroma, axis=1)

        rms_energy = librosa.feature.rms(y=y)
        mean_energy = np.mean(rms_energy)
        
        # --- THE FIX IS HERE: Define the missing variables ---
        zero_crossing_rate = np.mean(librosa.feature.zero_crossing_rate(y=y))
        spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
        spectral_rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))

        features_vector = np.concatenate([
            np.array([tempo]).flatten(),
            np.array([mean_energy]).flatten(),
            np.array([zero_crossing_rate]).flatten(),
            np.array([spectral_centroid]).flatten(),
            np.array([spectral_rolloff]).flatten(),
            mean_chroma.flatten(),
            mean_mfccs.flatten(),
            mean_mel_spectrogram.flatten()
        ]).reshape(1, -1)
        
        features_vector_scaled = scaler.transform(features_vector)

        predicted_mood = classifier.predict(features_vector_scaled)[0]
        
        results = {
            "tempo": float(tempo),
            "mean_energy": float(mean_energy),
            "mood": predicted_mood,
        }

        print(json.dumps(results))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}), file=sys.stderr)
        sys.exit(1)
        
    audio_file_path = sys.argv[1]
    analyze_audio(audio_file_path)