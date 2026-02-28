import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "./StatusBadge";
import { AlertTriangle, Clock, Pin, Lightbulb, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

export const LiveFindingsTimeline = ({ findings = [], isRecording }) => {
  // Sort findings by severity (HIGH first) and pin safety alerts at top
  const sortedFindings = [...findings].sort((a, b) => {
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const safetyAlerts = sortedFindings.filter((f) => f.severity === "HIGH");
  const otherFindings = sortedFindings.filter((f) => f.severity !== "HIGH");

  return (
    <Card 
      className="bg-white border-gray-200 shadow-sm h-full flex flex-col"
      data-testid="live-findings-timeline"
    >
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            Live Findings
            {isRecording && (
              <span className="flex items-center gap-1.5 text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full recording-dot" />
                Streaming
              </span>
            )}
          </CardTitle>
          <span className="text-xs text-gray-500">{findings.length} found</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {/* Safety Alerts Section */}
            {safetyAlerts.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Pin className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                    Safety Alerts
                  </span>
                </div>
                <div className="space-y-2">
                  {safetyAlerts.map((finding, index) => (
                    <FindingItem key={finding.id || index} finding={finding} isSafetyAlert />
                  ))}
                </div>
              </div>
            )}

            {/* Other Findings */}
            {otherFindings.length > 0 && (
              <div className="space-y-2">
                {safetyAlerts.length > 0 && (
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Other Findings
                  </div>
                )}
                {otherFindings.map((finding, index) => (
                  <FindingItem key={finding.id || index} finding={finding} />
                ))}
              </div>
            )}

            {findings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No findings yet</p>
                <p className="text-xs">Start recording to detect issues</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const FindingItem = ({ finding, isSafetyAlert }) => {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border timeline-item",
        isSafetyAlert
          ? "bg-red-50 border-red-200"
          : "bg-gray-50 border-gray-200"
      )}
      data-testid={`finding-${finding.id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {isSafetyAlert ? (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gray-300" />
          )}
          <span className="font-medium text-sm text-gray-900">{finding.title}</span>
        </div>
        <SeverityBadge severity={finding.severity} />
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {finding.timestamp}
        </span>
        <span className="flex items-center gap-1">
          <Percent className="w-3 h-3" />
          {Math.round(finding.confidence * 100)}% confidence
        </span>
      </div>

      <div className="flex items-start gap-1.5 text-xs text-gray-600 bg-white/50 rounded p-2">
        <Lightbulb className="w-3 h-3 mt-0.5 text-[#F9A825] flex-shrink-0" />
        <span>{finding.recommendation}</span>
      </div>
    </div>
  );
};

export default LiveFindingsTimeline;
