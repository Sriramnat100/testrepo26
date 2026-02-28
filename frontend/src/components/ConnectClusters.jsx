import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, ChevronRight, Layers } from "lucide-react";

export const ConnectClusters = ({ clusters = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3" data-testid="connect-clusters">
      {clusters.map((cluster) => (
        <Card
          key={cluster.id}
          className="bg-white border-gray-200 shadow-sm card-interactive"
          data-testid={`cluster-${cluster.id}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {cluster.title}
                  </h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">
                    {cluster.count} similar
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {cluster.summary}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0"
                onClick={() => navigate(`/app/inspections/${cluster.id}`)}
                data-testid={`view-cluster-${cluster.id}`}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {clusters.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Link2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No similar inspections found</p>
        </div>
      )}
    </div>
  );
};

export default ConnectClusters;
