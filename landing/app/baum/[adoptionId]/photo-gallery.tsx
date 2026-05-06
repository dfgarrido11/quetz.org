"use client";

import { useState, useEffect, useCallback } from "react";

interface PhotoGalleryProps {
  photos: string[];
  altPrefix: string;
}

export function PhotoGallery({ photos, altPrefix }: PhotoGalleryProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const close = useCallback(() => setLightboxSrc(null), []);

  useEffect(() => {
    if (!lightboxSrc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxSrc, close]);

  const isMulti = photos.length > 1;

  return (
    <>
      <style>{`
        .photo-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 600px) {
          .photo-grid.multi {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .photo-thumb {
          width: 100%;
          height: auto;
          display: block;
          cursor: zoom-in;
          transition: opacity 0.15s;
        }
        .photo-thumb:hover { opacity: 0.88; }
        .photo-lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.92);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .photo-lightbox-img {
          max-width: 95vw;
          max-height: 92vh;
          object-fit: contain;
          border-radius: 8px;
          cursor: default;
          box-shadow: 0 8px 48px rgba(0,0,0,0.6);
        }
        .photo-lightbox-close {
          position: absolute;
          top: 16px;
          right: 20px;
          color: white;
          font-size: 36px;
          line-height: 1;
          cursor: pointer;
          background: none;
          border: none;
          padding: 4px 8px;
          opacity: 0.8;
        }
        .photo-lightbox-close:hover { opacity: 1; }
      `}</style>

      <div className={`photo-grid${isMulti ? " multi" : ""}`}>
        {photos.map((src, idx) => (
          <div
            key={idx}
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            }}
          >
            <img
              src={src}
              alt={`${altPrefix} — Foto ${idx + 1}`}
              className="photo-thumb"
              onClick={() => setLightboxSrc(src)}
            />
          </div>
        ))}
      </div>

      {lightboxSrc && (
        <div className="photo-lightbox-overlay" onClick={close}>
          <button
            className="photo-lightbox-close"
            onClick={close}
            aria-label="Schließen"
          >
            ×
          </button>
          <img
            src={lightboxSrc}
            alt="Vollbild"
            className="photo-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
