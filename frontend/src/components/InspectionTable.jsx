import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { Search, Filter, Download, FileText, Link2 } from "lucide-react";

export const InspectionTable = ({ inspections, onSearch, onFilter }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    onFilter?.({ status: value, type: typeFilter });
  };

  const handleTypeFilter = (value) => {
    setTypeFilter(value);
    onFilter?.({ status: statusFilter, type: value });
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm h-full flex flex-col" data-testid="inspections-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Previous Inspections
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-fit"
            data-testid="export-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search inspections..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200"
              data-testid="search-input"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[140px] bg-gray-50" data-testid="status-filter">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pass">PASS</SelectItem>
              <SelectItem value="fail">FAIL</SelectItem>
              <SelectItem value="monitor">MONITOR</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-[160px] bg-gray-50" data-testid="type-filter">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="daily walkaround">Daily Walkaround</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="ta1">TA1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        <Table className="inspection-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Report</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Connect</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.map((inspection) => (
              <TableRow 
                key={inspection.id} 
                className="cursor-pointer"
                data-testid={`inspection-row-${inspection.id}`}
              >
                <TableCell>
                  <button
                    className="text-left hover:text-[#F9A825] font-medium text-gray-900 transition-colors"
                    onClick={() => navigate(`/app/inspections/${inspection.id}`)}
                    data-testid={`inspection-name-${inspection.id}`}
                  >
                    <div>{inspection.equipment_model}</div>
                    <div className="text-xs text-gray-500">{inspection.serial_number}</div>
                  </button>
                </TableCell>
                <TableCell className="text-gray-600">{inspection.date}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-600 hover:text-[#F9A825]"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/inspections/${inspection.id}`);
                    }}
                    data-testid={`view-report-${inspection.id}`}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </TableCell>
                <TableCell>
                  <StatusBadge status={inspection.status} />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-600 hover:text-[#F9A825]"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/inspections/${inspection.id}?tab=connect`);
                    }}
                    data-testid={`find-similar-${inspection.id}`}
                  >
                    <Link2 className="w-4 h-4 mr-1" />
                    Find similar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {inspections.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No inspections found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InspectionTable;
