import { useState } from "react";

import "./App.css";
import FaceDetection from "./components/FaceDetection";
import MoodSongs from "./components/MoodSongs";

function App() {
  const [songs, setSongs] = useState([]);
  return (
    <>
      <FaceDetection setSongs={setSongs} />
      <MoodSongs songs={songs} />
    </>
  );
}

export default App;
