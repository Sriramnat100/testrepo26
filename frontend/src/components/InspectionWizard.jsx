import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, ChevronLeft, ChevronRight, ClipboardCheck, Shield, Wrench, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const EQUIPMENT_OPTIONS = [
  { model: "CAT 320 Excavator", serial: "CAT0320X", type: "Excavator" },
  { model: "CAT 336 Excavator", serial: "CAT0336X", type: "Excavator" },
  { model: "CAT D6 Dozer", serial: "CAT0D6X", type: "Dozer" },
  { model: "CAT D8 Dozer", serial: "CAT0D8X", type: "Dozer" },
  { model: "CAT 966 Wheel Loader", serial: "CAT0966X", type: "Wheel Loader" },
  { model: "CAT 980 Wheel Loader", serial: "CAT0980X", type: "Wheel Loader" },
  { model: "CAT 745 Articulated Truck", serial: "CAT0745X", type: "Articulated Truck" },
];

const INSPECTION_TYPES = [
  {
    id: "daily-walkaround",
    name: "Daily Walkaround",
    description: "Quick daily check of critical systems",
    icon: ClipboardCheck,
    duration: "15-20 min",
  },
  {
    id: "safety",
    name: "Safety",
    description: "Comprehensive safety inspection",
    icon: Shield,
    duration: "45-60 min",
  },
  {
    id: "ta1",
    name: "TA1",
    description: "Technical assessment level 1",
    icon: Wrench,
    duration: "2-3 hours",
  },
];

const steps = [
  { id: 1, name: "Equipment" },
  { id: 2, name: "Type" },
  { id: 3, name: "Review" },
];

export const InspectionWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    equipment_model: "",
    serial_number: "",
    customer: "",
    location: "",
    inspection_type: "",
  });

  const handleEquipmentSelect = (model) => {
    const equipment = EQUIPMENT_OPTIONS.find((e) => e.model === model);
    if (equipment) {
      setFormData((prev) => ({
        ...prev,
        equipment_model: equipment.model,
        serial_number: equipment.serial + Math.random().toString().slice(2, 7),
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Start inspection - navigate to live page with mock ID
      const mockId = `insp-${Date.now().toString(36)}`;
      navigate(`/app/inspections/${mockId}/live`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.equipment_model && formData.customer && formData.location;
      case 2:
        return formData.inspection_type;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors wizard-step",
                    currentStep > step.id
                      ? "completed bg-green-500 text-white"
                      : currentStep === step.id
                      ? "active bg-[#F9A825] text-gray-900"
                      : "bg-gray-200 text-gray-500"
                  )}
                  data-testid={`wizard-step-${step.id}`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium",
                    currentStep >= step.id ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-24 sm:w-32 h-1 mx-4 rounded",
                    currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-6">
              {/* Step 1: Equipment Selection */}
              {currentStep === 1 && (
                <div className="space-y-6" data-testid="step-equipment">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      Select Equipment
                    </h2>
                    <p className="text-sm text-gray-500">
                      Choose the equipment you want to inspect
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="equipment">Equipment Model</Label>
                      <Select
                        value={formData.equipment_model}
                        onValueChange={handleEquipmentSelect}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="equipment-select">
                          <SelectValue placeholder="Search and select equipment..." />
                        </SelectTrigger>
                        <SelectContent>
                          {EQUIPMENT_OPTIONS.map((equipment) => (
                            <SelectItem key={equipment.model} value={equipment.model}>
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-gray-400" />
                                {equipment.model}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.equipment_model && (
                      <div>
                        <Label htmlFor="serial">Serial Number</Label>
                        <Input
                          id="serial"
                          value={formData.serial_number}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              serial_number: e.target.value,
                            }))
                          }
                          className="mt-1.5 bg-gray-50"
                          data-testid="serial-input"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="customer">Customer</Label>
                      <Input
                        id="customer"
                        placeholder="e.g., BuildCo Industries"
                        value={formData.customer}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            customer: e.target.value,
                          }))
                        }
                        className="mt-1.5"
                        data-testid="customer-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Dallas, TX"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="mt-1.5"
                        data-testid="location-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Inspection Type */}
              {currentStep === 2 && (
                <div className="space-y-6" data-testid="step-type">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      Select Inspection Type
                    </h2>
                    <p className="text-sm text-gray-500">
                      Choose the type of inspection to perform
                    </p>
                  </div>

                  <RadioGroup
                    value={formData.inspection_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, inspection_type: value }))
                    }
                    className="space-y-3"
                  >
                    {INSPECTION_TYPES.map((type) => (
                      <Label
                        key={type.id}
                        htmlFor={type.id}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                          formData.inspection_type === type.name
                            ? "border-[#F9A825] bg-[#F9A825]/5"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        data-testid={`inspection-type-${type.id}`}
                      >
                        <RadioGroupItem value={type.name} id={type.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <type.icon className="w-5 h-5 text-[#F9A825]" />
                            <span className="font-semibold text-gray-900">
                              {type.name}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {type.duration}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {type.description}
                          </p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6" data-testid="step-review">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      Review & Start
                    </h2>
                    <p className="text-sm text-gray-500">
                      Confirm the details before starting the inspection
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Equipment</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formData.equipment_model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Serial Number</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formData.serial_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Customer</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formData.customer}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formData.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Inspection Type</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formData.inspection_type}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F9A825]/10 border border-[#F9A825]/20 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Ready to start!</strong> Once you begin, the AI will assist
                      you in capturing findings in real-time. Make sure you have good
                      lighting and a stable camera position.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  data-testid="wizard-back-btn"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-[#F9A825] hover:bg-[#F57F17] text-gray-900"
                  data-testid="wizard-next-btn"
                >
                  {currentStep === 3 ? "Start Inspection" : "Next"}
                  {currentStep !== 3 && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-gray-200 shadow-sm sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">
                Inspection Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Equipment
                </span>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {formData.equipment_model || "Not selected"}
                </p>
              </div>
              {formData.serial_number && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Serial
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {formData.serial_number}
                  </p>
                </div>
              )}
              {formData.customer && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Customer
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {formData.customer}
                  </p>
                </div>
              )}
              {formData.location && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Location
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {formData.location}
                  </p>
                </div>
              )}
              {formData.inspection_type && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Type
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {formData.inspection_type}
                  </p>
                </div>
              )}
              {!formData.equipment_model && (
                <p className="text-sm text-gray-400 italic">
                  Fill in the form to see your inspection details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InspectionWizard;
