# Moody Player (Full-Stack)

A full-stack application that acts as a music player. It detects a user's mood via a webcam and suggests songs from a curated playlist based on that mood.

## Features

### Frontend (React)
- **Mood Detection:** Uses the `face-api.js` library to detect the user's emotion from a live webcam feed.
- **Dynamic UI:** The UI is controlled by the detected mood, which is used to fetch a list of songs from the backend.
- **User Controls:** Buttons to start and stop the camera, giving the user control over their privacy.

### Backend (Express.js & Python)
- **File Upload:** Handles audio file uploads via a REST API.
- **Mood Analysis:** Uses a custom machine learning model built with `librosa` and `scikit-learn` to analyze the audio and classify its mood.
- **REST API:** Provides endpoints for fetching songs based on a given mood.
- **Database:** Stores song data (title, artist, audio URL, mood) in MongoDB using Mongoose.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (v14 or higher) & npm
- [Python](https://www.python.org/downloads/) (v3.8 or higher) & pip
- [MongoDB](https://www.mongodb.com/try/download/community) (local or a cloud service like Atlas)
- A **GitHub** account

## Installation

1.  **Clone the repository:**
    ```bash
    git clone [your-repo-url]
    cd your-project-name
    ```

2.  **Install Node.js dependencies (for both frontend and backend):**
    ```bash
    npm install
    cd frontend && npm install && cd ..
    ```

3.  **Install Python dependencies:**
    ```bash
    # This installs the libraries needed for audio analysis and machine learning
    pip install librosa numpy scikit-learn
    ```

## Configuration

1.  **Environment Variables:** Create a `.env` file in the root directory of your project. Add your database and ImageKit credentials.

    ```env
    PORT=3000

    MONGODB_URL=your_mongodb_connection_string

    # ImageKit Credentials
    IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
    IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
    IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
    ```

2.  **Train the Mood Detection Model:**
    This is a crucial step. You need to train the model on your dataset to get accurate mood predictions.

    - **Prepare your dataset:** Ensure your `dataset/` folder has subdirectories for each mood (`happy`, `sad`, `angry`, `neutral`), with a sufficient number of MP3 files in each.
    - **Run the training script:** From your project's root directory, run the Python training script. This will create a `mood_classifier.pkl` file in the `src/utils` folder.

    ```bash
    python src/utils/train_model.py
    ```

## Running the Application

To run the application locally, you will need to start both the backend server and the frontend development server.

1.  **Start the Backend Server:**
    ```bash
    npm start
    ```
    This will start the server on the port defined in your `.env` file (default is `3000`).

2.  **Start the Frontend Development Server:**
    ```bash
    cd frontend
    npm run dev  # or npm start depending on your frontend setup
    ```
    This will start the React application, which will communicate with your backend.

## API Endpoints

The backend exposes a simple REST API for managing songs.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/songs` | Uploads a new song, analyzes its mood, and saves it to the database. |
| `GET` | `/songs?mood=<mood>` | Fetches a list of songs filtered by mood. |

## Acknowledgements

This project was built with the help of the following excellent libraries:
- **Frontend:** `React`, `face-api.js`, `axios`
- **Backend:** `Express`, `multer`, `librosa`, `scikit-learn`, `Mongoose`, `ImageKit`
