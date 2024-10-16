"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Plus } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PhotoDetail({ params }) {
  const router = useRouter();

  const [photo, setPhoto] = useState(null);
  const { id } = params;
  const [showInfo, setShowInfo] = useState(false);

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

  if (!photo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-4 h-4 bg-black animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between p-4">
      <div className="text-center">
        <h1 className="text-2xl uppercase tracking-widest font-bold mb-2">
          {photo.title}
        </h1>
        <p className="text-sm uppercase tracking-wider">{photo.category}</p>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <img
          src={photo.url}
          alt={photo.title}
          className="max-w-full max-h-[70vh] object-contain"
        />
      </div>

      <div className="text-center mt-4">
        <p className="text-sm mb-2">{photo.description}</p>
        <p className="text-xs uppercase tracking-wider">{photo.year}</p>
      </div>
    </div>
  );
}
