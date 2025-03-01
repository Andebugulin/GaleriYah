"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AlbumsPage = () => {
  const scrollContainerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);
  const [hoveredAlbum, setHoveredAlbum] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchAlbums();
    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

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

  const updateContainerSize = () => {
    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;
    setContainerSize({ width, height });
  };

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

  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black font-sans flex flex-col"
    >
      {/* Header */}
      <motion.header className="bg-black text-white z-50 p-4 flex justify-between items-center border-b border-red-600">
        <button
          onClick={() => router.push("/")}
          className="text-red-600 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">ALBUMS</h1>
        <div className="w-6"></div>
      </motion.header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <motion.div
          ref={scrollContainerRef}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-x-auto whitespace-nowrap scrollbar-hide mb-4"
          style={{
            width: `${containerSize.width}px`,
            height: `${containerSize.height}px`,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {albums.map((album, index) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="inline-block h-full cursor-pointer mr-0.5 last:mr-0"
              style={{ width: `${containerSize.width / 14}px` }}
              onClick={() => handleAlbumClick(album.id)}
              onMouseEnter={() => setHoveredAlbum(album)}
              onMouseLeave={() => setHoveredAlbum(null)}
            >
              <div
                className="relative h-full overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: getRandomColor() }}
              >
                {album.cover_photo_url ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${album.cover_photo_url})`,
                      backgroundPosition: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {album.title.charAt(0).toUpperCase()}
                  </span>
                )}
                {album.isNew && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 uppercase">
                    new
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center p-4"
        >
          {error}
        </motion.div>
      )}

      {/* Footer */}
      <motion.footer
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-0 text-red-600 left-0 right-0 bg-opacity-80 backdrop-blur-sm py-2 px-4 text-center"
      >
        <AnimatePresence>
          {hoveredAlbum && (
            <motion.div>
              <div>{hoveredAlbum.title}</div>
              <div>{formatDate(hoveredAlbum.created_at)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.footer>
    </motion.div>
  );
};

export default AlbumsPage;
