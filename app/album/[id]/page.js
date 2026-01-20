"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Grid3x3, LayoutGrid, Film } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AlbumDetail({ params }) {
  const router = useRouter();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [hoveredPhoto, setHoveredPhoto] = useState(null);
  const [, setScrollPosition] = useState(0);
  const [viewMode, setViewMode] = useState("story"); // 'grid', 'album', 'story'
  const [storyIndex, setStoryIndex] = useState(0);
  const containerRef = useRef(null);
  const { id } = params;

  useEffect(() => {
    if (id) {
      fetchAlbum(id);
      fetchAlbumPhotos(id);
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    const handleKeyDown = (e) => {
      if (viewMode === "story") {
        if (
          e.key === "ArrowRight" ||
          e.key === " " ||
          e.key === "d" ||
          e.key === "l"
        ) {
          e.preventDefault();
          setStoryIndex((prev) => Math.min(prev + 1, photos.length - 1));
        } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "h") {
          e.preventDefault();
          setStoryIndex((prev) => Math.max(prev - 1, 0));
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewMode, photos.length]);

  const fetchAlbum = async (albumId) => {
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .eq("id", albumId)
      .single();

    if (error) {
      console.error("Error fetching album:", error);
    } else {
      setAlbum(data);
    }
  };

  const fetchAlbumPhotos = async (albumId) => {
    const { data, error } = await supabase
      .from("album_photos")
      .select("photos(*)")
      .eq("album_id", albumId);

    if (error) {
      console.error("Error fetching album photos:", error);
    } else {
      const sortedPhotos = data
        .map((item) => item.photos)
        .sort((a, b) => new Date(a.date_taken) - new Date(b.date_taken));
      setPhotos(sortedPhotos);
    }
  };

  const handlePhotoClick = (photoId) => {
    router.push(`/photo/${photoId}`);
  };

  const getPhotoClassName = (index) => {
    const patterns = {
      large: "col-span-2 row-span-2",
      tall: "col-span-1 row-span-2",
      wide: "col-span-2 row-span-1",
      normal: "col-span-1 row-span-1",
    };

    const position = index % 8;
    switch (position) {
      case 0:
        return patterns.large;
      case 3:
        return patterns.tall;
      case 5:
        return patterns.wide;
      default:
        return patterns.normal;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRandomRotation = (index) => {
    const rotations = [-2, -1, 0, 1, 2];
    return rotations[index % rotations.length];
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-4 h-4 bg-red-600 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black font-sans flex flex-col"
      style={
        viewMode === "story"
          ? {
              overflow: "hidden",
              height: "100vh",
              width: "100vw",
              position: "fixed",
            }
          : {}
      }
    >
      {/* Header */}
      <header className="fixed w-full bg-black z-50 p-4 flex justify-between items-center border-b border-red-600">
        <button
          onClick={() => router.push("/albums")}
          className="text-red-600 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-xl font-bold tracking-[0.5em] uppercase text-white">
          {album.title}
        </h1>

        {/* View mode selector */}
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode("grid")}
            className={`transition-colors ${
              viewMode === "grid"
                ? "text-white"
                : "text-red-600 hover:text-white"
            }`}
            title="Grid View"
          >
            <Grid3x3 size={20} />
          </button>
          <button
            onClick={() => setViewMode("album")}
            className={`transition-colors ${
              viewMode === "album"
                ? "text-white"
                : "text-red-600 hover:text-white"
            }`}
            title="Album View"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("story")}
            className={`transition-colors ${
              viewMode === "story"
                ? "text-white"
                : "text-red-600 hover:text-white"
            }`}
            title="Story View"
          >
            <Film size={20} />
          </button>
        </div>
      </header>

      {/* Main content - Grid Mode */}
      {viewMode === "grid" && (
        <main className="flex-grow pt-20 px-4 pb-16 overflow-hidden bg-black">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 max-w-7xl mx-auto">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative overflow-hidden aspect-square cursor-pointer group"
                onClick={() => handlePhotoClick(photo.id)}
                onMouseEnter={() => setHoveredPhoto(photo)}
                onMouseLeave={() => setHoveredPhoto(null)}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className={`w-full h-full object-cover transition-all duration-500
                    ${
                      hoveredPhoto?.id === photo.id
                        ? "grayscale contrast-125 brightness-90 scale-110"
                        : "scale-100"
                    }`}
                />

                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent
                  transition-opacity duration-300 ${
                    hoveredPhoto?.id === photo.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-lg font-bold">
                      {photo.title}
                    </h3>
                    <p className="text-white/70 text-sm font-mono">
                      {formatDate(photo.date_taken)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Main content - Album Mode */}
      {viewMode === "album" && (
        <main className="flex-grow pt-20 px-4 pb-16 overflow-hidden bg-black">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-7xl mx-auto">
            {photos.map((photo, index) => {
              const rotation = getRandomRotation(index);
              const isHovered = hoveredPhoto?.id === photo.id;

              return (
                <div
                  key={photo.id}
                  className={`relative overflow-hidden ${getPhotoClassName(
                    index
                  )}`}
                  onClick={() => handlePhotoClick(photo.id)}
                  onMouseEnter={() => setHoveredPhoto(photo)}
                  onMouseLeave={() => setHoveredPhoto(null)}
                  style={{
                    transform: `rotate(${rotation}deg) translateZ(0)`,
                    willChange: "transform",
                  }}
                >
                  <div className="group relative w-full h-full aspect-square cursor-pointer">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className={`w-full h-full transition-all duration-500 ease-out
                        ${
                          isHovered
                            ? "grayscale contrast-125 brightness-90"
                            : ""
                        }
                        ${
                          photo.width > 800 || photo.height > 800
                            ? "object-cover"
                            : "object-contain"
                        }
                      `}
                      style={{
                        imageRendering: "high-quality",
                        backfaceVisibility: "hidden",
                        transform: "translateZ(0)",
                      }}
                    />

                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                        transition-opacity duration-300 ${
                          isHovered ? "opacity-100" : "opacity-0"
                        }`}
                    >
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <h3
                          className="text-2xl font-bold text-white mb-2 transform transition-transform duration-300"
                          style={{
                            transform: isHovered
                              ? "translateY(0)"
                              : "translateY(20px)",
                          }}
                        >
                          {photo.title}
                        </h3>

                        <p
                          className="font-mono text-sm text-white/80 transform transition-transform duration-300 delay-75"
                          style={{
                            transform: isHovered
                              ? "translateY(0)"
                              : "translateY(20px)",
                          }}
                        >
                          {formatDate(photo.date_taken)}
                        </p>

                        <div className="absolute bottom-0 left-0 w-full h-[1px] flex mt-4">
                          <div
                            className="w-1/3 h-full bg-red-600 transform origin-left transition-transform duration-500"
                            style={{
                              transform: isHovered ? "scaleX(1)" : "scaleX(0)",
                            }}
                          />
                          <div
                            className="w-1/3 h-full bg-white transform origin-left transition-transform duration-500 delay-75"
                            style={{
                              transform: isHovered ? "scaleX(1)" : "scaleX(0)",
                            }}
                          />
                          <div
                            className="w-1/3 h-full bg-red-600 transform origin-left transition-transform duration-500 delay-150"
                            style={{
                              transform: isHovered ? "scaleX(1)" : "scaleX(0)",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj4NCjxmaWx0ZXIgaWQ9ImEiIHg9IjAiIHk9IjAiPg0KPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPg0KPC9maWx0ZXI+DQo8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIwLjA1Ii8+DQo8L3N2Zz4=')] 
                      opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* Main content - Story Mode */}
      {viewMode === "story" && (
        <main
          ref={containerRef}
          className="flex-grow pt-20 pb-16 bg-black h-screen overflow-hidden"
        >
          {/* Navigation hint at top */}
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-white/50 text-sm font-mono text-center z-50">
            <div className="mb-2">
              USE ARROWS / SPACE / WASD / HJKL TO NAVIGATE
            </div>
          </div>

          <div className="h-full flex items-center justify-center px-4 overflow-hidden">
            {photos.map((photo, index) => {
              const isActive = index === storyIndex;

              return (
                <div
                  key={photo.id}
                  className="absolute transition-all duration-300 ease-out cursor-pointer"
                  onClick={() => handlePhotoClick(photo.id)}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "scale(1)" : "scale(0.95)",
                    zIndex: isActive ? 50 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <div
                    className="relative"
                    style={{ maxWidth: "95vw", maxHeight: "85vh" }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-contain"
                      style={{
                        imageRendering: "high-quality",
                        maxHeight: "85vh",
                      }}
                    />

                    {isActive && (
                      <div className="absolute -bottom-20 left-0 right-0 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wider uppercase">
                          {photo.title}
                        </h2>
                        <p className="text-lg md:text-xl text-red-600 font-mono">
                          {formatDate(photo.date_taken)}
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <div className="h-[2px] w-16 bg-red-600"></div>
                          <span className="text-white/50 text-sm font-mono">
                            {index + 1} / {photos.length}
                          </span>
                          <div className="h-[2px] w-16 bg-red-600"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scroll indicator */}
          <div className="fixed right-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-2 z-50">
            {photos.map((_, index) => (
              <div
                key={index}
                className={`w-1 transition-all duration-300 ${
                  index === storyIndex
                    ? "h-8 bg-red-600"
                    : index < storyIndex
                    ? "h-2 bg-white/30"
                    : "h-2 bg-white/10"
                }`}
              />
            ))}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 backdrop-blur-sm py-2 px-4 text-center border-t border-red-600">
        <div className="max-w-7xl mx-auto">
          <p className="text-white font-mono text-sm">{album.description}</p>
        </div>
      </footer>
    </div>
  );
}
