import React, { useRef, useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Volume1,
  ChevronRight, 
  ListMusic, 
  Gauge 
} from "lucide-react";
import "./viewer.css";

export default function AudioReader({
  tracks = [],
  activeTrackIndex = 0,
  onTrackSelect,
  bookName = "ReadersFM Audio Book",
  themeColor = "#10b981",
  coverUrl = "/audio_book_cover.png",
  toast,
}) {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(activeTrackIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const audioRef = useRef(null);
  const scrubberRef = useRef(null);

  const activeTrack = tracks[currentTrackIdx] || {
    title: "Unknown Audio Track",
    author: "Unknown Author",
    url: "",
  };

  const notify = {
    info: (msg) => (toast?.info ? toast.info(msg) : console.log("Info:", msg)),
    success: (msg) => (toast?.success ? toast.success(msg) : console.log("Success:", msg)),
    error: (msg) => (toast?.error ? toast.error(msg) : console.error("Error:", msg)),
  };

  // Sync index with prop
  useEffect(() => {
    setCurrentTrackIdx(activeTrackIndex);
  }, [activeTrackIndex]);

  // Load saved progress on track URL change
  useEffect(() => {
    if (!audioRef.current || !activeTrack.url) return;
    const savedPos = localStorage.getItem(`rfm_audio_pos_${activeTrack.url}`);
    if (savedPos) {
      const parsedPos = parseFloat(savedPos);
      audioRef.current.currentTime = parsedPos;
      setCurrentTime(parsedPos);
    } else {
      setCurrentTime(0);
    }
  }, [activeTrack.url]);

  // Handle track changing
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.playbackRate = playbackSpeed;
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.log("Play failed: ", err));
      }
    }
  }, [currentTrackIdx]);

  // Sync playing state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        setIsPlaying(false);
        console.log("Playback failed:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Format time (e.g. 02:45)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Skip handlers
  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
      notify.info("Skipped forward 10 seconds");
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
      notify.info("Skipped backward 10 seconds");
    }
  };

  const handleSkipForward30 = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, duration);
      notify.info("Skipped forward 30 seconds");
    }
  };

  const handleSkipBackward30 = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 30, 0);
      notify.info("Skipped backward 30 seconds");
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      setCurrentTime(cur);
      if (activeTrack.url) {
        localStorage.setItem(`rfm_audio_pos_${activeTrack.url}`, cur.toString());
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      // Ensure we fetch progress if metadata was loaded later
      const savedPos = localStorage.getItem(`rfm_audio_pos_${activeTrack.url}`);
      if (savedPos) {
        const parsedPos = parseFloat(savedPos);
        audioRef.current.currentTime = parsedPos;
        setCurrentTime(parsedPos);
      }
    }
  };

  const handleScrubberChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      if (activeTrack.url) {
        localStorage.setItem(`rfm_audio_pos_${activeTrack.url}`, newTime.toString());
      }
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
      audioRef.current.volume = nextMute ? 0 : volume;
    }
    notify.info(nextMute ? "Audio muted" : "Audio unmuted");
  };

  const handleSpeedChange = (e) => {
    const rate = parseFloat(e.target.value);
    setPlaybackSpeed(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    notify.success(`Playback speed: ${rate}x`);
  };

  const handleTrackChange = (idx) => {
    setCurrentTrackIdx(idx);
    setIsPlaying(true);
    if (onTrackSelect) {
      onTrackSelect(tracks[idx], idx);
    }
    notify.success(`Playing track: ${tracks[idx]?.title || "Chapter"}`);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={20} />;
    if (volume < 0.4) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  // Scrubber percentage calculation for color tracking
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <div className="va_audio-player-container">
      <audio
        ref={audioRef}
        src={activeTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          notify.info("Track finished playing");
          // Clear position on complete
          if (activeTrack.url) {
            localStorage.removeItem(`rfm_audio_pos_${activeTrack.url}`);
          }
          // Autoplay next track if available
          if (currentTrackIdx + 1 < tracks.length) {
            handleTrackChange(currentTrackIdx + 1);
          }
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --primary: ${themeColor} !important;
          }
        `
      }} />

      <div className="va_audio-player-wrapper">
        {/* Left Side: Stunning Rotating Vinyl Art */}
        <div className="va_img-section">
          <div className={`va_vinyl-disc-back ${isPlaying ? "playing" : ""}`} />
          <div className="va_vinyl-center-dot" />
          <img 
            className="va_cover-art" 
            src={coverUrl || "/audio_book_cover.png"} 
            alt={bookName} 
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600";
            }}
          />
        </div>

        {/* Right Side: Title, Details & Premium Controls */}
        <div className="va_player-section">
          <div className="va_audio-title">{activeTrack.title}</div>
          <div className="va_audio-author">{activeTrack.author || bookName}</div>

          {/* Timeline progress */}
          <div className="va_progress-container">
            <input
              ref={scrubberRef}
              type="range"
              className="va_scrubber"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleScrubberChange}
              style={{
                background: `linear-gradient(to right, var(--primary) ${progressPercent}%, rgba(15, 23, 42, 0.08) ${progressPercent}%)`
              }}
            />
            <div className="va_time-row">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playing Controls */}
          <div className="va_controls-group">
            {/* Skip back 30s */}
            <button 
              className="va_control-btn" 
              onClick={handleSkipBackward30}
              title="Skip back 30s"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}
            >
              <RotateCcw size={16} />
              <span style={{ fontSize: "0.6rem", fontWeight: "800", opacity: 0.8 }}>30s</span>
            </button>

            {/* Skip back 10s */}
            <button 
              className="va_control-btn" 
              onClick={handleSkipBackward}
              title="Skip back 10s"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}
            >
              <RotateCcw size={16} />
              <span style={{ fontSize: "0.6rem", fontWeight: "800", opacity: 0.8 }}>10s</span>
            </button>

            <button 
              className="va_control-btn play-btn" 
              onClick={() => {
                setIsPlaying(!isPlaying);
                notify.info(isPlaying ? "Playback paused" : "Playback started");
              }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: "4px" }} />}
            </button>

            {/* Skip forward 10s */}
            <button 
              className="va_control-btn" 
              onClick={handleSkipForward}
              title="Skip forward 10s"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}
            >
              <RotateCw size={16} />
              <span style={{ fontSize: "0.6rem", fontWeight: "800", opacity: 0.8 }}>10s</span>
            </button>

            {/* Skip forward 30s */}
            <button 
              className="va_control-btn" 
              onClick={handleSkipForward30}
              title="Skip forward 30s"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}
            >
              <RotateCw size={16} />
              <span style={{ fontSize: "0.6rem", fontWeight: "800", opacity: 0.8 }}>30s</span>
            </button>
          </div>

          {/* Settings Row: Playlist, Speed, and Volume */}
          <div className="va_settings-row">
            {/* Playlist Track Selection Dropdown */}
            {tracks.length > 1 ? (
              <div className="va_speed-selector">
                <ListMusic size={16} />
                <select 
                  value={currentTrackIdx}
                  onChange={(e) => handleTrackChange(parseInt(e.target.value))}
                >
                  {tracks.map((t, idx) => (
                    <option key={idx} value={idx}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}

            {/* Playback Speed selector */}
            <div className="va_speed-selector">
              <Gauge size={16} />
              <select 
                value={playbackSpeed}
                onChange={handleSpeedChange}
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1.0x (Normal)</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2.0x (Fast)</option>
              </select>
            </div>

            {/* Volume sliders */}
            <div className="va_volume-section">
              <button 
                className="va_control-btn" 
                onClick={toggleMute}
                style={{ padding: "6px" }}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {getVolumeIcon()}
              </button>
              <input
                type="range"
                className="va_volume-slider"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{
                  background: `linear-gradient(to right, var(--primary) ${volumePercent}%, rgba(15, 23, 42, 0.08) ${volumePercent}%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
