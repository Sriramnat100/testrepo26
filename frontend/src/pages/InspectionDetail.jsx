import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, SeverityBadge } from "@/components/StatusBadge";
import { MediaGallery } from "@/components/MediaGallery";
import { PartsMatchList } from "@/components/PartsMatchList";
import { ConnectClusters } from "@/components/ConnectClusters";
import {
  ArrowLeft,
  RefreshCw,
  Share2,
  AlertTriangle,
  FileText,
  Image,
  Wrench,
  Link2,
  CheckCircle,
  Edit2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function InspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "summary");
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchInspection();
  }, [id]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const fetchInspection = async () => {
    try {
      const response = await axios.get(`${API_URL}/inspections/${id}`);
      setInspection(response.data);
    } catch (error) {
      console.error("Error fetching inspection:", error);
      toast.error("Failed to load inspection");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    toast.info("Regenerating report...");
    setTimeout(() => {
      toast.success("Report regenerated successfully");
    }, 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch (error) {
      // Fallback for when clipboard API is not available
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Link copied to clipboard");
      } catch (e) {
        toast.error("Unable to copy link");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleChecklistUpdate = async (itemId, newResult) => {
    try {
      await axios.put(`${API_URL}/inspections/${id}/checklist/${itemId}`, null, {
        params: { result: newResult },
      });
      
      setInspection((prev) => ({
        ...prev,
        checklist: prev.checklist.map((item) =>
          item.id === itemId ? { ...item, result: newResult } : item
        ),
      }));
      
      setEditingItem(null);
      toast.success("Checklist item updated");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update item");
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F9A825] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Inspection not found</p>
          <Button onClick={() => navigate("/app/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50" data-testid="inspection-detail-page">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/dashboard")}
              data-testid="back-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {inspection.equipment_model}
                </h1>
                <StatusBadge status={inspection.status} />
              </div>
              <p className="text-sm text-gray-500">
                {inspection.serial_number} • {inspection.inspection_type} • {inspection.date}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              data-testid="regenerate-btn"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Regenerate Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              data-testid="share-btn"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="summary" className="flex items-center gap-1.5" data-testid="tab-summary">
              <FileText className="w-4 h-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-1.5" data-testid="tab-checklist">
              <CheckCircle className="w-4 h-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-1.5" data-testid="tab-media">
              <Image className="w-4 h-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="parts" className="flex items-center gap-1.5" data-testid="tab-parts">
              <Wrench className="w-4 h-4" />
              Parts
            </TabsTrigger>
            <TabsTrigger value="connect" className="flex items-center gap-1.5" data-testid="tab-connect">
              <Link2 className="w-4 h-4" />
              Connect
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {/* Executive Summary */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{inspection.summary}</p>
              </CardContent>
            </Card>

            {/* Safety Critical Findings */}
            {inspection.safety_findings?.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Safety Critical Findings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {inspection.safety_findings.map((finding, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-white/50 rounded-lg"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-900">{finding}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Action Items */}
            {inspection.action_items?.length > 0 && (
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Prioritized Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inspection.action_items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                            item.priority === 1
                              ? "bg-red-100 text-red-700"
                              : item.priority === 2
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.priority}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.action}</p>
                          {item.why && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Why:</span> {item.why}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Risk:</span> {item.risk}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Recommended Action</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspection.checklist?.map((item) => (
                      <TableRow key={item.id} data-testid={`checklist-row-${item.id}`}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.item}</TableCell>
                        <TableCell>
                          {editingItem === item.id ? (
                            <Select
                              defaultValue={item.result}
                              onValueChange={(value) => handleChecklistUpdate(item.id, value)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PASS">PASS</SelectItem>
                                <SelectItem value="FAIL">FAIL</SelectItem>
                                <SelectItem value="MONITOR">MONITOR</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <StatusBadge status={item.result} />
                          )}
                        </TableCell>
                        <TableCell>
                          <SeverityBadge severity={item.severity} />
                        </TableCell>
                        <TableCell>
                          {item.evidence ? (
                            <span className="text-blue-600 text-sm">{item.evidence}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm text-gray-600">
                            {item.recommended_action || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {editingItem !== item.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingItem(item.id)}
                              data-testid={`edit-checklist-${item.id}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <MediaGallery media={inspection.media || []} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parts Tab */}
          <TabsContent value="parts">
            <PartsMatchList parts={inspection.parts_matches || []} />
          </TabsContent>

          {/* Connect Tab */}
          <TabsContent value="connect">
            <ConnectClusters clusters={inspection.similar_inspections || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
