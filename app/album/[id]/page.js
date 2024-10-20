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
  const { id } = params;

  useEffect(() => {
    if (id) {
      fetchAlbum(id);
      fetchAlbumPhotos(id);
    }
  }, [id]);

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
      setPhotos(data.map((item) => item.photos));
    }
  };

  const handlePhotoClick = (photoId) => {
    router.push(`/photo/${photoId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toString().split("T")[0];
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-4 h-4 bg-black animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white z-50 p-4 flex justify-between items-center border-b border-gray-200">
        <button onClick={() => router.push("/albums")} className="text-black">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold uppercase">{album.title}</h1>
        <div className="w-6"></div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square cursor-pointer"
              onClick={() => handlePhotoClick(photo.id)}
              onMouseEnter={() => setHoveredPhoto(photo)}
              onMouseLeave={() => setHoveredPhoto(null)}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="text-red text-lg font-bold uppercase tracking-widest bg-red px-4 py-2">
                  View
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-80 backdrop-blur-sm py-2 px-4 text-center">
        {hoveredPhoto ? (
          <div>
            <div className="font-bold">{hoveredPhoto.title}</div>
            <div className="text-sm">{formatDate(hoveredPhoto.created_at)}</div>
          </div>
        ) : (
          <div>{album.description}</div>
        )}
      </footer>
    </div>
  );
}
