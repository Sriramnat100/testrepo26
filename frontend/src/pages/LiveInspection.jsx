import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LiveFindingsTimeline } from "@/components/LiveFindingsTimeline";
import {
  Video,
  VideoOff,
  Camera,
  Mic,
  MicOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Scan,
  Square,
  Truck,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock findings that appear during "live" inspection
const MOCK_FINDINGS = [
  {
    id: "f1",
    timestamp: "10:23:45",
    severity: "HIGH",
    title: "Hydraulic Leak Detected",
    recommendation: "Immediately shut down and replace high-pressure line",
    confidence: 0.95,
    category: "Hydraulics",
  },
  {
    id: "f2",
    timestamp: "10:25:12",
    severity: "MEDIUM",
    title: "Side Mirror Cracked",
    recommendation: "Replace mirror before next shift",
    confidence: 0.98,
    category: "Safety Equipment",
  },
  {
    id: "f3",
    timestamp: "10:28:33",
    severity: "LOW",
    title: "Minor Rust on Step Rails",
    recommendation: "Schedule touch-up paint during next service",
    confidence: 0.87,
    category: "Structural",
  },
];

export default function LiveInspection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [findings, setFindings] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: 1280, height: 720 },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Unable to access camera. Please grant permission.");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Simulate AI finding detection when recording
  useEffect(() => {
    if (!isRecording) return;

    let findingIndex = 0;
    const interval = setInterval(() => {
      if (findingIndex < MOCK_FINDINGS.length) {
        const newFinding = {
          ...MOCK_FINDINGS[findingIndex],
          timestamp: new Date().toLocaleTimeString(),
        };
        setFindings((prev) => [...prev, newFinding]);
        
        if (newFinding.severity === "HIGH") {
          toast.error(`Safety Alert: ${newFinding.title}`, {
            description: newFinding.recommendation,
          });
        }
        findingIndex++;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setFindings([]);
      toast.success("Recording started", {
        description: "AI is now analyzing the video feed",
      });
    } else {
      toast.info("Recording stopped");
    }
    setIsRecording(!isRecording);
  };

  const capturePhoto = () => {
    toast.success("Photo captured", {
      description: "Image saved to inspection media",
    });
  };

  const handleVoiceNote = (active) => {
    setIsVoiceActive(active);
    if (active) {
      toast.info("Recording voice note...");
    } else {
      toast.success("Voice note saved");
    }
  };

  const identifyPart = () => {
    toast.info("Scanning for parts...", {
      description: "AI is identifying the component",
    });
    setTimeout(() => {
      toast.success("Part identified: Hydraulic Cylinder", {
        description: "Part #5I-4461 - 97% match confidence",
      });
    }, 2000);
  };

  const quickMark = (result) => {
    toast.success(`Marked as ${result}`);
  };

  const finishInspection = async () => {
    setIsGeneratingReport(true);
    
    if (isRecording) {
      setIsRecording(false);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    navigate(`/app/inspections/${id}`);
  };

  // Loading state for report generation
  if (isGeneratingReport) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-slate-900 flex items-center justify-center" data-testid="generating-report">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F7B500] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-[22px] font-bold text-white mb-2">Generating Report</h2>
          <p className="text-slate-400 text-[14px]">
            AI is analyzing findings and creating your inspection report...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-900 flex flex-col" data-testid="live-inspection-page">
      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Video Feed */}
        <div className="flex-1 relative bg-black">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <div className="text-center p-8">
                <VideoOff className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-white mb-4 text-[15px]">{cameraError}</p>
                <Button
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover"
                data-testid="camera-feed"
              />
              {/* Gradient overlays */}
              <div className="gradient-fade-down absolute inset-x-0 top-0 h-32 pointer-events-none" />
              <div className="gradient-fade-up absolute inset-x-0 bottom-0 h-48 pointer-events-none" />
            </>
          )}

          {/* Top overlay - Equipment Info & Status */}
          <div className="live-overlay-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Equipment Badge */}
                <div className="live-equipment-badge">
                  <Truck className="w-4 h-4" />
                  <span>CAT D6 Dozer</span>
                  <span className="opacity-60">•</span>
                  <span className="font-mono text-[12px] opacity-80">CAT0D6X67890</span>
                </div>
                
                {/* Recording Badge */}
                {isRecording && (
                  <div className="streaming-badge">
                    <span className="streaming-dot" />
                    <span>REC</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Time */}
                <div className="live-equipment-badge">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{currentTime}</span>
                </div>
                
                {/* Findings Counter */}
                {isRecording && findings.length > 0 && (
                  <div className="live-equipment-badge bg-[#F7B500]/20 border-[#F7B500]/30">
                    <AlertTriangle className="w-4 h-4 text-[#F7B500]" />
                    <span className="text-[#F7B500] font-semibold">{findings.length}</span>
                    <span className="opacity-80">findings</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voice indicator */}
          {isVoiceActive && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 rounded-full bg-[#F7B500]/20 flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 rounded-full bg-[#F7B500]/40 flex items-center justify-center">
                  <Mic className="w-12 h-12 text-[#F7B500]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Rail - Live Findings */}
        <div className="w-80 xl:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 hidden md:block overflow-hidden">
          <LiveFindingsTimeline findings={findings} isRecording={isRecording} />
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="live-control-bar">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {/* Start/Stop Recording */}
          <button
            className={cn(
              "live-control-btn touch-target-lg",
              isRecording ? "live-control-btn-danger" : "live-control-btn-primary"
            )}
            onClick={toggleRecording}
            data-testid="record-btn"
          >
            {isRecording ? (
              <Square className="w-6 h-6" fill="currentColor" />
            ) : (
              <Video className="w-6 h-6" />
            )}
          </button>

          {/* Capture Photo */}
          <button
            className="live-control-btn live-control-btn-secondary touch-target-lg"
            onClick={capturePhoto}
            data-testid="capture-photo-btn"
          >
            <Camera className="w-6 h-6" />
          </button>

          {/* Voice Note */}
          <button
            className={cn(
              "live-control-btn touch-target-lg",
              isVoiceActive
                ? "live-control-btn-primary"
                : "live-control-btn-secondary"
            )}
            onMouseDown={() => handleVoiceNote(true)}
            onMouseUp={() => handleVoiceNote(false)}
            onMouseLeave={() => isVoiceActive && handleVoiceNote(false)}
            onTouchStart={() => handleVoiceNote(true)}
            onTouchEnd={() => handleVoiceNote(false)}
            data-testid="voice-note-btn"
          >
            <Mic className="w-6 h-6" />
          </button>

          {/* Identify Part */}
          <button
            className="live-control-btn live-control-btn-secondary touch-target-lg"
            onClick={identifyPart}
            data-testid="identify-part-btn"
          >
            <Scan className="w-6 h-6" />
          </button>

          {/* Divider */}
          <div className="w-px h-10 bg-slate-700 mx-1 hidden sm:block" />

          {/* Quick Mark Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              className="live-quick-mark bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => quickMark("PASS")}
              data-testid="mark-pass-btn"
            >
              <CheckCircle className="w-4 h-4" />
              PASS
            </button>
            <button
              className="live-quick-mark bg-red-600 hover:bg-red-700 text-white"
              onClick={() => quickMark("FAIL")}
              data-testid="mark-fail-btn"
            >
              <XCircle className="w-4 h-4" />
              FAIL
            </button>
            <button
              className="live-quick-mark bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => quickMark("MONITOR")}
              data-testid="mark-monitor-btn"
            >
              <AlertTriangle className="w-4 h-4" />
              MONITOR
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-slate-700 mx-1 hidden sm:block" />

          {/* Finish Inspection */}
          <Button
            size="lg"
            className="h-12 bg-[#F7B500] hover:bg-[#E5A800] text-slate-900 font-semibold rounded-full px-6 text-[14px]"
            onClick={finishInspection}
            data-testid="finish-inspection-btn"
          >
            Finish Inspection
          </Button>
        </div>
      </div>
    </div>
  );
}
