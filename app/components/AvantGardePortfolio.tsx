"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Menu, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const theme = {
  fontFamily: '"Futura", "Helvetica", sans-serif',
  colorPrimary: "#000000",
  colorAccent: "#ff0000",
  transitionSpeed: "0.3s",
  gridGap: "1px",
};

const AvantGardePortfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase.from("photos").select("*");

      if (error) {
        console.error("Error fetching photos:", error);
        setError(error.message);
      } else {
        setPhotos(data);
        const uniqueCategories = [
          "all",
          ...new Set(data.map((photo) => photo.category)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(err.message);
    }
  };

  const filteredPhotos =
    activeCategory === "all"
      ? photos
      : photos.filter((photo) => photo.category === activeCategory);

  const handlePhotoClick = (photo) => {
    router.push(`/photo/${photo.id}`);
  };

  const handleAlbumsClick = () => {
    router.push("/albums");
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-40 border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold tracking-widest">ANDREI GULIN</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* Full-screen menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-30">
          <div className="h-full flex flex-col justify-center items-center space-y-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setIsMenuOpen(false);
                }}
                className="group text-4xl font-bold tracking-widest hover:text-yellow-500 hover:bg-black"
              >
                {category.toUpperCase()}
                <span className="inline-block ml-2 opacity-0 group-hover:opacity-100">
                  <ArrowRight size={24} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container mx-auto pt-24 px-1">
        {/* Photo grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden group cursor-pointer"
              onClick={() => handlePhotoClick(photo)}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:grayscale"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0">
                <div className="h-full flex flex-col justify-center items-center p-4 text-[#ED1C24] text-center">
                  <h3 className="text-2xl font-bold w-full opacity-0 group-hover:opacity-100">
                    <span className="inline-block bg-black">{photo.title}</span>
                  </h3>
                  <p className="text-lg font-mono opacity-0 group-hover:opacity-100">
                    <span className="inline-block bg-black">
                      {photo.category.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Flat Supreme-inspired Albums Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleAlbumsClick}
          className="bg-white text-black font-bold text-xl py-2 px-4 hover:bg-black hover:text-[#ED1C24]"
        >
          ALBUMS
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-8 pb-8 text-center text-gray-500">
        <p className="font-mono text-sm">
          © {new Date().getFullYear()} ANDREI GULIN
        </p>
      </footer>
    </div>
  );
};

export default AvantGardePortfolio;
