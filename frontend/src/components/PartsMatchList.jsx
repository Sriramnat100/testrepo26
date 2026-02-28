import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

export const PartsMatchList = ({ parts = [] }) => {
  return (
    <div className="space-y-3" data-testid="parts-match-list">
      {parts.map((part, index) => (
        <Card
          key={part.id}
          className={cn(
            "bg-white border-gray-200 shadow-sm card-interactive",
            index === 0 && "ring-2 ring-[#F9A825]/20"
          )}
          data-testid={`part-${part.id}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {index === 0 && (
                    <Badge className="bg-[#F9A825]/10 text-[#F9A825] border-[#F9A825]/20 text-xs">
                      Best Match
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500 font-mono">
                    #{part.part_number}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{part.part_name}</h4>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-sm text-gray-600">
                      {Math.round(part.fitment_certainty * 100)}% fitment certainty
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {part.compatible_models.map((model) => (
                    <span
                      key={model}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 hover:bg-[#F9A825]/10 hover:border-[#F9A825]"
                data-testid={`add-part-${part.id}`}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to order
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {parts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No parts matches found</p>
        </div>
      )}
    </div>
  );
};

export default PartsMatchList;
