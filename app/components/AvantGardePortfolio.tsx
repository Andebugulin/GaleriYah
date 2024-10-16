"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Camera, Menu, X, ArrowRight, Instagram, Mail } from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const theme = {
  fontFamily: '"Courier New", monospace',
  colorPrimary: "#000000",
  colorAccent: "#FF3300",
  transitionSpeed: "0.01s",
  gridGap: "1px",
};

const AvantGardePortfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [clickedPhoto, setClickedPhoto] = useState({});
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from("photos").select("count");
      console.log("Connection test:", data, error);
    }
    testConnection();
  }, []);

  const fetchPhotos = async () => {
    try {
      console.log("Fetching photos...");
      const { data, error } = await supabase.from("photos").select("*");

      if (error) {
        console.error("Error fetching photos:", error);
        setError(error.message);
      } else {
        console.log("Fetched photos:", data);
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

  const handleClick = (photoId) => {
    setClickedPhoto((prev) => ({
      ...prev,
      [photoId]: !prev[photoId],
    }));
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-50"></div>
      </div>

      {/* Header */}
      <header className="fixed top-5 w-full z-40 mix-blend-difference">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold text-white tracking-widest">
            ANDREI GULIN
          </h1>
        </div>
      </header>

      {/* Full-screen menu */}
      <div
        className={`fixed inset-0 bg-black z-30 transition-transform duration-500 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col justify-center items-center space-y-8 text-white">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setIsMenuOpen(false);
              }}
              className="group text-4xl font-bold tracking-widest hover:text-red-500 transition-colors"
            >
              {category.toUpperCase()}
              <span className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={24} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto pt-24 px-1">
        {/* Photo grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden group"
              onClick={() => handleClick(photo.id)}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover transition-all duration-700"
                style={{
                  filter: clickedPhoto[photo.id]
                    ? "grayscale(100%)"
                    : "grayscale(0%)",
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-500">
                <div className="h-full flex flex-col justify-between p-4 text-white">
                  <h3 className="text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {photo.title}
                  </h3>
                  <p className="text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {photo.category.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

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
