"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AlbumsPage = ({}) => {
  const scrollContainerRef = useRef(null);
  const [imageWidth, setImageWidth] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleWheel = (e) => {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      };
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, []);

  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchAlbums();
    // Calculate image width based on screen size
    const updateImageWidth = () => {
      const screenWidth = window.innerWidth;
      setImageWidth(screenWidth / 28);
    };
    updateImageWidth();
    window.addEventListener("resize", updateImageWidth);
    return () => window.removeEventListener("resize", updateImageWidth);
  }, []);

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching albums:", error);
        setError(error.message);
      } else {
        setAlbums(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(err.message);
    }
  };

  const handleAlbumClick = (albumId) => {
    router.push(`/album/${albumId}`);
  };

  const getRandomPosition = () => {
    // Generate a random position between -25% and 25% for cropping effect
    return `${Math.floor(Math.random() * 50) - 25}%`;
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white z-50 p-4 flex justify-between items-center border-b border-gray-200">
        <button onClick={() => router.push("/")} className="text-black">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">ALBUMS</h1>
        <div className="w-6"></div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div
          ref={scrollContainerRef}
          className="w-1/2 h-1/2 overflow-x-auto whitespace-nowrap scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {albums.map((album) => (
            <div
              key={album.id}
              className="inline-block h-full cursor-pointer mr-0.5 last:mr-0"
              style={{ width: imageWidth }}
              onClick={() => handleAlbumClick(album.id)}
            >
              <div
                className="relative h-full overflow-hidden"
                style={{ width: "100%" }}
              >
                {album.cover_photo_url ? (
                  <img
                    src={album.cover_photo_url}
                    className="h-full object-cover"
                    style={{
                      width: "auto",
                      position: "relative",
                      top: getRandomPosition(),
                      left: getRandomPosition(),
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-400">
                      {album.title.charAt(0)}
                    </span>
                  </div>
                )}
                {album.isNew && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 uppercase">
                    new
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-500">
        <p className="text-sm">© {new Date().getFullYear()} ANDREI GULIN</p>
      </footer>
    </div>
  );
};

export default AlbumsPage;
