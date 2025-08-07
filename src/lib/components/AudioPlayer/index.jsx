import React, { useEffect } from "react"; 
import { useRef, useState } from "react";
import { FaPlay, FaPause, FaUndo} from "react-icons/fa";
import './styles.scss';
import { CiVolume, CiVolumeHigh } from "react-icons/ci";
import { IoVolumeMediumSharp, IoVolumeMute } from "react-icons/io5";
import { MdError } from "react-icons/md";

export default function AudioPlayer({src, shouldResetPlayback, onResetHandled}){
    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const lastVolumeRef = useRef(0.8);
    const [isLoaded, setIsLoaded] = useState(true);

    
    useEffect(() => {
        if (!shouldResetPlayback) return;
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();

        if (audio.volume === 0) {
            const restored = lastVolumeRef.current > 0 ? lastVolumeRef.current : 1;
            audio.volume = restored;
            setVolume(restored);
        }

        audio.currentTime = 0;
        setCurrentTime(0);
        setIsPlaying(false);
        setHasEnded(false);
        onResetHandled();
    }, [shouldResetPlayback]);

    function togglePlay(){
        const audio = audioRef.current;
        if(!audio) return;

        if (audio.volume === 0) {
            const restored = lastVolumeRef.current > 0 ? lastVolumeRef.current : 1;
            audio.volume = restored;
            setVolume(restored);
        }

        if(isPlaying){
            audio.pause();
        }else{
            audio.play();
        }
        setIsPlaying(!isPlaying);
    }

    function handleEnded(){
        setIsPlaying(false);
        setHasEnded(true);
    }

    function restart(){
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.volume === 0) {
            const restored = lastVolumeRef.current > 0 ? lastVolumeRef.current : 1;
            audio.volume = restored;
            setVolume(restored)
        }

        audio.currentTime = 0;
        setCurrentTime(0);
        setIsPlaying(true);
        setHasEnded(false);
        setTimeout(() => {
            audio.play();
        }, 1000);
    }

    function formatTime(time){
        return new Date(time *1000).toISOString().substring(14,19);
    }

    function handleTimeUpdate(){
        const audio = audioRef.current;
        if(audio){
            setCurrentTime(audio.currentTime);
        }
    }

    function handleLoadedMetadata(){
        const audio = audioRef.current;
        if(audio){
            setDuration(audio.duration);
        }
    }

    function handleVolumeChange(event) {
        const audio = audioRef.current;
        if (!audio) return;
        const newVolume = parseFloat(event.target.value);
        audio.volume = newVolume;
        setVolume(newVolume);
        if (newVolume > 0) lastVolumeRef.current = newVolume;
    }

      function handleToggleVolume() {
        const audio = audioRef.current;
        if (!audio) return;
    
        if (volume === 0) {
            const restored = lastVolumeRef.current > 0 ? lastVolumeRef.current : 1;
            audio.volume = restored;
            setVolume(restored);
        } else {
            lastVolumeRef.current = volume;
            audio.volume = 0;
            setVolume(0);
        }
    }

    function handleSeek(event){
        const audio = audioRef.current;
        const width = progressRef.current.clientWidth;
        const clickX =  event.nativeEvent.offsetX;
        const newTime = (clickX/width) * duration;
        audio.currentTime = newTime;
    }

    function handleError(event){
        console.error("error trying to load file:", event);
        setIsLoaded(false);
    }

    function renderControls(){
        return (
            <>
                <div className="main-controls">
                    {!hasEnded ? (
                        <button className="control-btn" onClick={togglePlay}>
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>
                    ) : (
                        <button className="control-btn" onClick={restart}>
                            <FaUndo />
                        </button>
                    )}

                    <section className="time-section">
                        <label className="time">{formatTime(currentTime)}</label>

                        <div className="progress-bar" ref={progressRef} onClick={handleSeek}>
                            <div
                                className="progress"
                                style={{width: `${(currentTime / duration) * 100}%`}} 
                            />
                        </div>

                        <label className="time">{formatTime(duration)}</label>

                    </section>
                </div>
                
                <div className="audio-control">
                    <button 
                        onClick={handleToggleVolume} 
                        className={volume > 0.0 ? 'unmute-button' : 'mute-button'}
                    >
                        <IoVolumeMute />
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="volume-slider"
                        title="Volume"
                    />
                </div>
            </>
        )
    }

    function renderErrorMessage(){
        return (
            <div className="error-message">
                <MdError />
                <label>Failed to load audio file - contact support</label>
            </div>
        );
    }

    function renderAudioSources(){
        return (
            src.startsWith('http') ? (
                <source src={src} type="audio/mpeg" />
            ) : (
                <>
                    <source src={src + ".mp3"} type="audio/mpeg" />
                    <source src={src + ".ogg"} type="audio/ogg" />
                    <source src={src + ".wav"} type="audio/wav" />
                </>
            )
        )
    }

    useEffect(() => {
        const slider = document.querySelector('.volume-slider');
        if (slider) {
          slider.style.setProperty('--val', volume * 100);
        }
      }, [volume]);

    return (

        
        <div className="audio-player">
            {
                isLoaded ? (
                    renderControls()
                )
                : (
                    renderErrorMessage()
                )
            }      
            
            <audio 
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onError={handleError}
            >
                {renderAudioSources()}
            </audio>
        </div>
    );
}
