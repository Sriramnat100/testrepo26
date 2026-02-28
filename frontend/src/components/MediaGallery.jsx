import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Image, Video, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export const MediaGallery = ({ media = [] }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [filter, setFilter] = useState("all");

  const filteredMedia = media.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const photoCount = media.filter((m) => m.type === "photo").length;
  const videoCount = media.filter((m) => m.type === "video").length;

  return (
    <div className="space-y-4" data-testid="media-gallery">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          data-testid="filter-all"
        >
          All ({media.length})
        </Button>
        <Button
          variant={filter === "photo" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFilter("photo")}
          data-testid="filter-photos"
        >
          <Image className="w-4 h-4 mr-1" />
          Photos ({photoCount})
        </Button>
        <Button
          variant={filter === "video" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFilter("video")}
          data-testid="filter-videos"
        >
          <Video className="w-4 h-4 mr-1" />
          Videos ({videoCount})
        </Button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <div
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group card-interactive"
                data-testid={`media-item-${item.id}`}
              >
                <img
                  src={item.thumbnail || item.url}
                  alt={item.caption || "Inspection media"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {item.type === "video" && (
                  <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">{item.caption}</p>
                  <p className="text-xs text-white/70">{item.timestamp}</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              <div className="relative">
                <img
                  src={item.url}
                  alt={item.caption || "Inspection media"}
                  className="w-full h-auto max-h-[80vh] object-contain bg-black"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white font-medium">{item.caption}</p>
                  <p className="text-white/70 text-sm">{item.timestamp}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No media found</p>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
