"use client";

import { useState } from "react";
import { format } from "date-fns";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  takenAt: string | Date;
  createdBy: string;
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<Photo | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelected(photo)}
            className="aspect-square relative overflow-hidden bg-gray-100 active:opacity-80 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption || "Louna"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
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

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.url}
            alt={selected.caption || "Louna"}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

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
