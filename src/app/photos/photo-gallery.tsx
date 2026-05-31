"use client";

import { useState } from "react";
import { format } from "date-fns";

interface MediaItem {
  id: string;
  url: string;
  videoUrl: string | null;
  mediaType: "PHOTO" | "VIDEO" | "LIVE_PHOTO";
  caption: string | null;
  takenAt: string | Date;
  createdBy: string;
}

function MediaBadge({ type }: { type: string }) {
  if (type === "VIDEO")
    return (
      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">
        ▶ Video
      </span>
    );
  if (type === "LIVE_PHOTO")
    return (
      <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">
        LIVE
      </span>
    );
  return null;
}

export function PhotoGallery({ photos }: { photos: MediaItem[] }) {
  const [selected, setSelected] = useState<MediaItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
        {photos.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="aspect-square relative overflow-hidden bg-gray-100 active:opacity-80 transition-opacity"
          >
            {item.mediaType === "VIDEO" ? (
              <video
                src={item.videoUrl || item.url}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.caption || "Louna"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
            <MediaBadge type={item.mediaType} />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white/70 text-3xl z-50 w-10 h-10 flex items-center justify-center"
          >
            &times;
          </button>

          <div
            className="max-w-full max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selected.mediaType === "VIDEO" ? (
              <video
                src={selected.videoUrl || selected.url}
                className="max-w-full max-h-[80vh] rounded-lg"
                controls
                autoPlay
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.url}
                alt={selected.caption || "Louna"}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            )}
          </div>

          <div
            className="mt-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selected.caption && (
              <p className="text-white text-sm mb-1">{selected.caption}</p>
            )}
            <p className="text-white/50 text-xs">
              {format(new Date(selected.takenAt), "yyyy年M月d日 HH:mm")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
