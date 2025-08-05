import { useEffect, useState, useRef } from "react";
import "./Moodsongs.css";
import { RiPauseLine, RiPlayFill } from "@remixicon/react";
const MoodSongs = ({ songs }) => {
  const audioRef = useRef([]);
  const [currentplayingidx, setCurrentPlayingIdx] = useState(null);

  const buttonHandler = (idx) => {
    if (currentplayingidx == null) {
      audioRef.current[idx].play();
      setCurrentPlayingIdx(idx);
    } else if (currentplayingidx != idx) {
      audioRef.current[idx].play();
      audioRef.current[currentplayingidx].pause();
      audioRef.current[currentplayingidx].currentTime = 0;
      setCurrentPlayingIdx(idx);
    } else {
      audioRef.current[currentplayingidx].pause();
      setCurrentPlayingIdx(null);
    }
  };
  return (
    <div className="mood-songs-container">
      <h2>Recommended Songs</h2>

      {songs.map((e, idx) => (
        <div
          key={idx}
          className="song-container"
          onClick={() => {
            buttonHandler(idx);
          }}
        >
          <div className="title">
            <h2>{e.title}</h2>
            <p>{e.artist}</p>
          </div>
          <div>
            <audio
              src={e.audioURL}
              hidden
              onEnded={(idx) => {
                setIsPlaying((prev) => {
                  return prev.map((e, id) => {
                    if (id == idx) return !e;
                    return e;
                  });
                });
              }}
              ref={(elem) => (audioRef.current[idx] = elem)}
            ></audio>
            <div className="play-pause-container">
              {!(currentplayingidx == idx) ? (
                <RiPlayFill className="play-button" />
              ) : (
                <RiPauseLine className="pause-button" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MoodSongs;
