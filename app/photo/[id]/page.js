"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PhotoDetail({ params }) {
  const router = useRouter();

  const [photo, setPhoto] = useState(null);
  const { id } = params;

  useEffect(() => {
    if (id) {
      fetchPhoto(id);
    }
  }, [id]);

  const fetchPhoto = async (photoId) => {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("id", photoId)
      .single();

    if (error) {
      console.error("Error fetching photo:", error);
    } else {
      setPhoto(data);
    }
  };

  const handleImageClick = () => {
    router.back();
  };

  if (!photo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-4 h-4 bg-black animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans p-4 relative">
      {/* Title and Category */}
      <div className="text-center mb-6">
        <h1 className="text-2xl uppercase tracking-widest font-bold mb-2">
          {photo.title}
        </h1>
        <p className="text-sm uppercase tracking-wider">{photo.category}</p>
      </div>

      {/* Image and Description */}
      <div className="absolute inset-0 flex min-h-screen">
        <div className="w-1/2 p-4 flex items-center justify-center">
          <img
            src={photo.url}
            alt={photo.title}
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain cursor-pointer"
            onClick={handleImageClick}
          />
        </div>
        <div className="flex w-1/2 items-center justify-center p-4">
          <p className="max-w-2xl text-lg leading-relaxed">
            {photo.description}
          </p>
        </div>
      </div>
    </div>
  );
}
