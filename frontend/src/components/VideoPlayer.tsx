import { useState, useRef, useEffect } from "react";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    RotateCcw,
    RotateCw,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface VideoPlayerProps {
    src: string;
    onProgressUpdate?: (progress: number) => void;
    onEnded?: () => void;
}

const VideoPlayer = ({ src, onProgressUpdate, onEnded }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeRate, setActiveRate] = useState(1);
    const [actionFeedback, setActionFeedback] = useState<string | null>(null);

    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const triggerFeedback = (type: string) => {
        setActionFeedback(type);
        if (feedbackTimeoutRef.current)
            clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = setTimeout(
            () => setActionFeedback(null),
            500,
        );
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (playing) {
                videoRef.current.pause();
                triggerFeedback("pause");
            } else {
                videoRef.current.play();
                triggerFeedback("play");
            }
            setPlaying(!playing);
        }
    };

    const handlePlaybackRateChange = (rate: number) => {
        setActiveRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setCurrentTime(current);
            if (videoRef.current.buffered.length > 0) {
                const bufferedEnd = videoRef.current.buffered.end(
                    videoRef.current.buffered.length - 1,
                );
                setBuffered(bufferedEnd);
            }
            if (total > 0 && onProgressUpdate) {
                onProgressUpdate(current / total);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            videoRef.current.playbackRate = activeRate;
        }
    };

    const handleSeek = (value: number[]) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            videoRef.current.muted = newMuted;
            triggerFeedback(newMuted ? "muted" : "volume");
        }
    };

    const skip = (amount: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += amount;
            triggerFeedback(amount > 0 ? "forward" : "backward");
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current
                .requestFullscreen()
                .catch((err) => toast.error(err.message));
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                document.activeElement instanceof HTMLTextAreaElement ||
                document.activeElement instanceof HTMLInputElement
            )
                return;
            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    togglePlay();
                    break;
                case "KeyF":
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case "KeyM":
                    toggleMute();
                    break;
                case "KeyJ":
                    skip(-10);
                    break;
                case "KeyL":
                    skip(10);
                    break;
                case "ArrowRight":
                    skip(5);
                    break;
                case "ArrowLeft":
                    skip(-5);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    handleVolumeChange([Math.min(volume + 0.1, 1)]);
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    handleVolumeChange([Math.max(volume - 0.1, 0)]);
                    break;
            }
            if (e.key >= "0" && e.key <= "9") {
                if (videoRef.current && duration) {
                    videoRef.current.currentTime =
                        duration * (parseInt(e.key) / 10);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [playing, isFullscreen, volume, duration, isMuted, activeRate]);

    useEffect(() => {
        const handleFullscreenChange = () =>
            setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () =>
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
    }, []);

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current)
            clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 2500);
    };

    const formatTime = (time: number) => {
        if (!time) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return (
        <div
            ref={containerRef}
            className={`relative aspect-video ${isFullscreen ? "rounded-none" : "rounded-2xl sm:rounded-3xl shadow-elevated"} overflow-hidden bg-black ring-1 ring-border group transition-all duration-500`}
            onMouseMove={handleMouseMove}
        >
            <video
                ref={videoRef}
                key={src}
                src={src}
                className="w-full h-full object-contain cursor-pointer"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={onEnded}
                onClick={(e) => {
                    if (e.detail === 1) togglePlay();
                }}
                onDoubleClick={toggleFullscreen}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
            />
            {!playing && !actionFeedback && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-2xl scale-110 animate-in zoom-in duration-300">
                        <Play
                            size={32}
                            fill="currentColor"
                            className="ml-1"
                        />
                    </div>
                </div>
            )}
            {actionFeedback && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center animate-out fade-out zoom-out duration-500">
                        {actionFeedback === "play" && (
                            <Play
                                size={32}
                                fill="currentColor"
                            />
                        )}
                        {actionFeedback === "pause" && (
                            <Pause
                                size={32}
                                fill="currentColor"
                            />
                        )}
                        {actionFeedback === "forward" && (
                            <RotateCw size={32} />
                        )}
                        {actionFeedback === "backward" && (
                            <RotateCcw size={32} />
                        )}
                        {actionFeedback === "volume" && (
                            <Volume2 size={32} />
                        )}
                        {actionFeedback === "muted" && (
                            <VolumeX size={32} />
                        )}
                    </div>
                </div>
            )}
            <div
                className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500 flex flex-col gap-4 ${showControls || !playing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
                <div className="relative group/seekbar px-2">
                    <div className="relative h-1 w-full bg-white/20 rounded-full overflow-hidden transition-all group-hover/seekbar:h-2">
                        <div
                            className="absolute inset-y-0 left-0 bg-white/30"
                            style={{
                                width: `${(buffered / duration) * 100}%`,
                            }}
                        />
                        <div
                            className="absolute inset-y-0 left-0 bg-primary"
                            style={{
                                width: `${(currentTime / duration) * 100}%`,
                            }}
                        />
                    </div>
                    <Slider
                        value={[currentTime]}
                        max={duration}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="absolute inset-0 h-full opacity-0 cursor-pointer z-10"
                    />
                </div>
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-primary transition-colors"
                        >
                            {playing ? (
                                <Pause
                                    size={22}
                                    fill="currentColor"
                                />
                            ) : (
                                <Play
                                    size={22}
                                    fill="currentColor"
                                />
                            )}
                        </button>
                        <div className="flex items-center gap-2 group/vol">
                            <button
                                onClick={toggleMute}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX size={20} />
                                ) : (
                                    <Volume2 size={20} />
                                )}
                            </button>
                            <div className="w-0 group-hover/vol:w-20 transition-all duration-300 overflow-hidden">
                                <Slider
                                    value={[
                                        isMuted
                                            ? 0
                                            : volume,
                                    ]}
                                    max={1}
                                    step={0.01}
                                    onValueChange={
                                        handleVolumeChange
                                    }
                                    className="w-20"
                                />
                            </div>
                        </div>
                        <span className="text-[11px] font-bold tabular-nums">
                            {formatTime(currentTime)} /{" "}
                            {formatTime(duration)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group/speed">
                            <div className="absolute bottom-full right-0 w-full h-4 bg-transparent pointer-events-auto" />
                            <button className="text-[10px] font-bold text-white/70 hover:text-white px-2 py-1 rounded bg-white/10 transition-all relative z-10">
                                {activeRate}x
                            </button>
                            <div className="absolute bottom-[calc(100%+8px)] right-0 w-24 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/speed:opacity-100 group-hover/speed:translate-y-0 group-hover/speed:pointer-events-auto transition-all z-30">
                                <div className="p-1.5 flex flex-col gap-0.5">
                                    {[0.5, 1, 1.5, 2].map(
                                        (rate) => (
                                            <button
                                                key={rate}
                                                onClick={() =>
                                                    handlePlaybackRateChange(
                                                        rate,
                                                    )
                                                }
                                                className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${activeRate === rate ? "bg-primary text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                                            >
                                                {rate === 1
                                                    ? "Normal"
                                                    : `${rate}x`}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleFullscreen}
                            className="text-white/70 hover:text-white transition-colors"
                        >
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
