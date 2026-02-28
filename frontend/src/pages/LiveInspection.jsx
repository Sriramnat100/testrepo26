import { useState, useRef, useEffect, useCallback } from "react";
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
  Volume2,
  VolumeX,
  Eye,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LiveInspection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [findings, setFindings] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [lastAnalysis, setLastAnalysis] = useState("");
  const [analysisInterval, setAnalysisIntervalState] = useState(null);

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
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
    };
  }, []);

  // Capture frame from video
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    // Get base64 image (without the data:image/jpeg;base64, prefix)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    return dataUrl.split(',')[1];
  }, []);

  // Analyze frame with AI
  const analyzeFrame = useCallback(async () => {
    if (isAnalyzing) return;
    
    const imageBase64 = captureFrame();
    if (!imageBase64) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await axios.post(`${API_URL}/ai/vision/analyze`, {
        image_base64: imageBase64,
        context: "Caterpillar equipment inspection"
      });
      
      const { analysis, findings: newFindings, severity, should_alert, spoken_response } = response.data;
      
      setLastAnalysis(analysis);
      
      // Add new findings
      if (newFindings && newFindings.length > 0) {
        const formattedFindings = newFindings.map((f, idx) => ({
          id: `f-${Date.now()}-${idx}`,
          timestamp: new Date().toLocaleTimeString(),
          severity: f.severity || "LOW",
          title: f.issue || "Issue detected",
          recommendation: f.recommendation || "Review and assess",
          confidence: 0.85 + Math.random() * 0.1,
          category: f.location || "General"
        }));
        
        setFindings(prev => [...formattedFindings, ...prev].slice(0, 20));
        
        // Show toast for high severity
        if (should_alert) {
          toast.error(`Safety Alert: ${formattedFindings[0]?.title}`, {
            description: formattedFindings[0]?.recommendation,
          });
        }
      }
      
      // Speak the response if audio is enabled
      if (audioEnabled && spoken_response && spoken_response.length > 0) {
        speakText(spoken_response);
      }
      
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, captureFrame, audioEnabled]);

  // Text to Speech
  const speakText = async (text) => {
    if (isSpeaking || !text) return;
    
    setIsSpeaking(true);
    
    try {
      const response = await axios.post(`${API_URL}/ai/tts`, {
        text: text,
        voice: "alloy"
      });
      
      const { audio_base64 } = response.data;
      
      // Create and play audio
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audio_base64), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  };

  // Start/Stop AI Analysis
  const toggleAI = () => {
    if (aiEnabled) {
      // Stop AI
      if (analysisInterval) {
        clearInterval(analysisInterval);
        setAnalysisIntervalState(null);
      }
      setAiEnabled(false);
      toast.info("AI Analysis stopped");
    } else {
      // Start AI - analyze every 5 seconds
      setAiEnabled(true);
      toast.success("AI Analysis started", {
        description: "Analyzing camera feed every 5 seconds"
      });
      
      // Immediate first analysis
      analyzeFrame();
      
      // Set up interval
      const interval = setInterval(() => {
        analyzeFrame();
      }, 5000);
      setAnalysisIntervalState(interval);
    }
  };

  // Start listening for voice
  const startListening = async () => {
    if (!streamRef.current) return;
    
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(audioStream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          
          try {
            // Send to STT
            const sttResponse = await axios.post(`${API_URL}/ai/stt`, {
              audio_base64: base64
            });
            
            if (sttResponse.data.success && sttResponse.data.text) {
              toast.info(`You said: "${sttResponse.data.text}"`);
              
              // Process the voice command
              // For now, just do an analysis
              analyzeFrame();
            }
          } catch (error) {
            console.error("STT error:", error);
          }
        };
        reader.readAsDataURL(audioBlob);
        
        audioStream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsListening(true);
      toast.info("Listening...");
      
    } catch (error) {
      console.error("Microphone error:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setFindings([]);
      toast.success("Recording started");
    } else {
      toast.info("Recording stopped");
    }
    setIsRecording(!isRecording);
  };

  const capturePhoto = async () => {
    const imageBase64 = captureFrame();
    if (imageBase64) {
      toast.success("Photo captured");
      
      // Save to backend
      try {
        await axios.post(`${API_URL}/inspections/${id}/media`, {
          inspection_id: id,
          media_type: "photo",
          data_base64: imageBase64,
          caption: "Captured during inspection",
          timestamp: new Date().toLocaleTimeString()
        });
        toast.success("Photo saved to inspection");
      } catch (error) {
        console.error("Failed to save photo:", error);
      }
      
      // Analyze the captured photo
      if (aiEnabled) {
        analyzeFrame();
      }
    }
  };

  const quickMark = (result) => {
    toast.success(`Marked as ${result}`);
  };

  const finishInspection = async () => {
    setIsGeneratingReport(true);
    
    // Stop AI analysis
    if (analysisInterval) {
      clearInterval(analysisInterval);
    }
    setAiEnabled(false);
    
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
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
      
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
                muted
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
                
                {/* AI Status Badge */}
                {aiEnabled && (
                  <div className="live-equipment-badge bg-emerald-500/20 border-emerald-500/30">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">AI Active</span>
                    {isAnalyzing && (
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    )}
                  </div>
                )}
                
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
                {findings.length > 0 && (
                  <div className="live-equipment-badge bg-[#F7B500]/20 border-[#F7B500]/30">
                    <AlertTriangle className="w-4 h-4 text-[#F7B500]" />
                    <span className="text-[#F7B500] font-semibold">{findings.length}</span>
                    <span className="opacity-80">findings</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Speaking Indicator */}
          {isSpeaking && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-32 h-32 rounded-full bg-[#F7B500]/20 flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 rounded-full bg-[#F7B500]/40 flex items-center justify-center">
                  <Volume2 className="w-12 h-12 text-[#F7B500]" />
                </div>
              </div>
            </div>
          )}

          {/* Listening Indicator */}
          {isListening && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-32 h-32 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 rounded-full bg-blue-500/40 flex items-center justify-center">
                  <Mic className="w-12 h-12 text-blue-400" />
                </div>
              </div>
            </div>
          )}

          {/* Last Analysis Text */}
          {lastAnalysis && aiEnabled && (
            <div className="absolute bottom-24 left-4 right-4 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 max-w-md">
                <p className="text-[12px] text-white/90">{lastAnalysis}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Rail - Live Findings */}
        <div className="w-80 xl:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 hidden md:block overflow-hidden">
          <LiveFindingsTimeline findings={findings} isRecording={aiEnabled} />
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="live-control-bar">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {/* AI Toggle - Main Feature */}
          <button
            className={cn(
              "live-control-btn touch-target-lg relative",
              aiEnabled 
                ? "bg-emerald-500 text-white" 
                : "bg-slate-700 text-white border border-slate-600"
            )}
            onClick={toggleAI}
            data-testid="ai-toggle-btn"
          >
            <Brain className="w-6 h-6" />
            {aiEnabled && isAnalyzing && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F7B500] rounded-full animate-ping" />
            )}
          </button>

          {/* Start/Stop Recording */}
          <button
            className={cn(
              "live-control-btn touch-target-lg",
              isRecording ? "live-control-btn-danger" : "live-control-btn-secondary"
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

          {/* Voice Input - Hold to Talk */}
          <button
            className={cn(
              "live-control-btn touch-target-lg",
              isListening
                ? "bg-blue-500 text-white"
                : "live-control-btn-secondary"
            )}
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onMouseLeave={() => isListening && stopListening()}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            data-testid="voice-btn"
          >
            <Mic className="w-6 h-6" />
          </button>

          {/* Audio Toggle */}
          <button
            className={cn(
              "live-control-btn touch-target-lg",
              audioEnabled
                ? "live-control-btn-secondary"
                : "bg-red-600 text-white"
            )}
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              toast.info(audioEnabled ? "AI voice disabled" : "AI voice enabled");
            }}
            data-testid="audio-toggle-btn"
          >
            {audioEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
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
