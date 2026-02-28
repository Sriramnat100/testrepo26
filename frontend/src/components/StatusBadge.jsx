import { cn } from "@/lib/utils";

const statusConfig = {
  PASS: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
  },
  FAIL: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
  MONITOR: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  Draft: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
  },
  "In Progress": {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  Submitted: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-200",
  },
};

export const StatusBadge = ({ status, className }) => {
  const config = statusConfig[status] || statusConfig.Draft;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border status-badge",
        config.bg,
        config.text,
        config.border,
        className
      )}
      data-testid={`status-badge-${status?.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {status}
    </span>
  );
};

const severityConfig = {
  HIGH: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  MEDIUM: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
  },
  LOW: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    dot: "bg-green-500",
  },
};

export const SeverityBadge = ({ severity, className }) => {
  const config = severityConfig[severity] || severityConfig.LOW;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        config.bg,
        config.text,
        config.border,
        className
      )}
      data-testid={`severity-badge-${severity?.toLowerCase()}`}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {severity}
    </span>
  );
};

export default StatusBadge;
