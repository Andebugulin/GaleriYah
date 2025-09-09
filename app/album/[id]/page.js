"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AlbumDetail({ params }) {
  const router = useRouter();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [hoveredPhoto, setHoveredPhoto] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      .eq("album_id", albumId)

    if (error) {
      console.error("Error fetching album photos:", error);
    } else {
      console.log(data);
      // Sorting photos by a unique property like ID or created_at date
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
    // Create different size patterns
    const patterns = {
      large: "col-span-2 row-span-2",
      tall: "col-span-1 row-span-2",
      wide: "col-span-2 row-span-1",
      normal: "col-span-1 row-span-1",
    };

    // Create a repeating pattern
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
    // Create a deterministic but seemingly random rotation based on the index
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
    <div className="min-h-screen bg-black font-sans flex flex-col">
      {/* Header */}
      <header className="fixed w-full bg-black z-50 p-4 flex justify-between items-center border-b border-red-600">
        <button
          onClick={() => router.push("/albums")}
          className="text-red-600 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1
          className="text-xl font-bold tracking-[0.5em] uppercase text-white transform  "
          style={{
            transform: `translateX(${scrollPosition * 0.1}px)`,
          }}
        >
          {album.title}
        </h1>
        <div className="w-6"></div>
      </header>
      {/* Updated main content with modern hover effects */}
      <main className="flex-grow pt-20 px-4 pb-16 overflow-hidden bg-black">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 max-w-7xl mx-auto">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`relative overflow-hidden ${getPhotoClassName(
                index
              )} transform transition-all  ease-out`}
              onClick={() => handlePhotoClick(photo.id)}
              onMouseEnter={() => setHoveredPhoto(photo)}
              onMouseLeave={() => setHoveredPhoto(null)}
              style={{
                transform:
                  hoveredPhoto?.id === photo.id
                    ? `scale(1.02) rotate(${getRandomRotation(index)}deg)`
                    : `rotate(${getRandomRotation(index)}deg)`,
              }}
            >
              <div className="group relative w-full h-full aspect-square cursor-pointer">
                {/* Base image */}
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-all  ease-out
                    group-hover:grayscale group-hover:contrast-125 group-hover:brightness-90"
                />

                {/* Modern overlay effects */}
                <div
                  className="absolute inset-0 transition-all  ease-out
                  bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                  opacity-0 group-hover:opacity-100"
                >
                  {/* Glitch effect line */}
                  <div className="absolute bg-black mix-blend-overlay transform translate-x-full"></div>

                  {/* Content container */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 overflow-hidden">
                    {/* Title with split effect */}
                    <h3
                      className="text-2xl font-bold text-white mb-2 transform translate-y-full 
                      group-hover:translate-y-0   ease-out"
                    >
                      <span className="inline-block overflow-hidden">
                        <span
                          className="inline-block transform translate-y-full 
                          group-hover:translate-y-0  "
                        >
                          {photo.title}
                        </span>
                      </span>
                    </h3>

                    {/* Date with fade-slide effect */}
                    <p
                      className="font-mono text-sm text-white/80 transform translate-y-8 
                      group-hover:translate-y-0 ease-out "
                    >
                      {formatDate(photo.date_taken)}
                    </p>

                    {/* Modern accent lines */}
                    <div className="absolute bottom-0 left-0 w-full h-[1px] flex">
                      <div
                        className="w-1/3 h-full bg-red-600 transform origin-left scale-x-0 
                        group-hover:scale-x-100   ease-out"
                      ></div>
                      <div
                        className="w-1/3 h-full bg-white transform origin-left scale-x-0 
                        group-hover:scale-x-100   ease-out"
                      ></div>
                      <div
                        className="w-1/3 h-full bg-red-600 transform origin-left scale-x-0 
                        group-hover:scale-x-100   ease-out"
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Noise texture overlay */}
                <div
                  className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj4NCjxmaWx0ZXIgaWQ9ImEiIHg9IjAiIHk9IjAiPg0KPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPg0KPC9maWx0ZXI+DQo8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIwLjA1Ii8+DQo8L3N2Zz4=')] 
                  opacity-0 group-hover:opacity-30 transition-opacity  pointer-events-none"
                ></div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 backdrop-blur-sm py-2 px-4 text-center border-t border-red-600">
        <div className="max-w-7xl mx-auto">
          <p className="text-white font-mono text-sm">{album.description}</p>
        </div>
      </footer>
    </div>
  );
}
