import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  StopCircle,
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

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
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
    const colors = {
      PASS: "text-green-600",
      FAIL: "text-red-600",
      MONITOR: "text-yellow-600",
    };
    toast.success(`Marked as ${result}`, {
      className: colors[result],
    });
  };

  const finishInspection = async () => {
    setIsGeneratingReport(true);
    
    // Stop recording
    if (isRecording) {
      setIsRecording(false);
    }
    
    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    navigate(`/app/inspections/${id}`);
  };

  // Loading state for report generation
  if (isGeneratingReport) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-gray-900 flex items-center justify-center" data-testid="generating-report">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F9A825] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Generating Report</h2>
          <p className="text-gray-400">
            AI is analyzing findings and creating your inspection report...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-900 flex flex-col" data-testid="live-inspection-page">
      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Video Feed */}
        <div className="flex-1 relative">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center p-8">
                <VideoOff className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-white mb-4">{cameraError}</p>
                <Button
                  variant="outline"
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
              {/* Camera overlay */}
              <div className="camera-overlay absolute inset-0 pointer-events-none" />
            </>
          )}

          {/* Top overlay - Status */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3">
              {isRecording && (
                <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full streaming-indicator">
                  <span className="w-2 h-2 bg-white rounded-full recording-dot" />
                  <span className="text-sm font-medium">REC</span>
                </div>
              )}
              <div className="glass rounded-full px-3 py-1.5 text-sm font-medium text-gray-800">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            {isRecording && (
              <div className="glass rounded-full px-3 py-1.5 text-sm text-gray-800">
                <span className="font-medium">{findings.length}</span> findings detected
              </div>
            )}
          </div>

          {/* Voice indicator */}
          {isVoiceActive && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 rounded-full bg-[#F9A825]/20 flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 rounded-full bg-[#F9A825]/40 flex items-center justify-center">
                  <Mic className="w-12 h-12 text-[#F9A825]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Rail - Live Findings */}
        <div className="w-80 xl:w-96 bg-gray-50 border-l border-gray-200 hidden md:block overflow-hidden">
          <LiveFindingsTimeline findings={findings} isRecording={isRecording} />
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {/* Start/Stop Recording */}
          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full",
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#F9A825] hover:bg-[#F57F17]"
            )}
            onClick={toggleRecording}
            data-testid="record-btn"
          >
            {isRecording ? (
              <StopCircle className="w-6 h-6 text-white" />
            ) : (
              <Video className="w-6 h-6 text-gray-900" />
            )}
          </Button>

          {/* Capture Photo */}
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-14 rounded-full border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
            onClick={capturePhoto}
            data-testid="capture-photo-btn"
          >
            <Camera className="w-6 h-6" />
          </Button>

          {/* Voice Note */}
          <Button
            size="lg"
            variant="outline"
            className={cn(
              "h-14 w-14 rounded-full border-gray-600",
              isVoiceActive
                ? "bg-[#F9A825] text-gray-900 border-[#F9A825]"
                : "bg-gray-800 hover:bg-gray-700 text-white"
            )}
            onMouseDown={() => handleVoiceNote(true)}
            onMouseUp={() => handleVoiceNote(false)}
            onMouseLeave={() => isVoiceActive && handleVoiceNote(false)}
            onTouchStart={() => handleVoiceNote(true)}
            onTouchEnd={() => handleVoiceNote(false)}
            data-testid="voice-note-btn"
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          {/* Identify Part */}
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-14 rounded-full border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
            onClick={identifyPart}
            data-testid="identify-part-btn"
          >
            <Scan className="w-6 h-6" />
          </Button>

          {/* Divider */}
          <div className="w-px h-10 bg-gray-700 mx-2 hidden sm:block" />

          {/* Quick Mark Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4"
              onClick={() => quickMark("PASS")}
              data-testid="mark-pass-btn"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              PASS
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4"
              onClick={() => quickMark("FAIL")}
              data-testid="mark-fail-btn"
            >
              <XCircle className="w-4 h-4 mr-1" />
              FAIL
            </Button>
            <Button
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-full px-4"
              onClick={() => quickMark("MONITOR")}
              data-testid="mark-monitor-btn"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              MONITOR
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-gray-700 mx-2 hidden sm:block" />

          {/* Finish Inspection */}
          <Button
            size="lg"
            className="bg-[#F9A825] hover:bg-[#F57F17] text-gray-900 font-semibold rounded-full px-6"
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
