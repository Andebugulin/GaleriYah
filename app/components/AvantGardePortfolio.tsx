"use client";

import React, { useState, useEffect } from "react";
import { Camera, Menu, X, ArrowRight, Instagram, Mail } from "lucide-react";

// Theme configuration
const theme = {
  fontFamily: '"Courier New", monospace',
  colorPrimary: "#000000",
  colorAccent: "#FF3300",
  transitionSpeed: "0.4s",
  gridGap: "1px",
};

// Sample photo data - replace with your actual photos
const photos = [
  {
    id: 1,
    url: "https://static.insales-cdn.com/r/0iM6CoslFT0/rs:fit:600:600:1/plain/files/1/3434/35253610/original/2x33_831a403d90d1feebbf8bce805bac8bd1.jpg@webp",
    title: "URBAN DECAY",
    category: "street",
  },
  {
    id: 2,
    url: "https://static.insales-cdn.com/r/0iM6CoslFT0/rs:fit:600:600:1/plain/files/1/3434/35253610/original/2x33_831a403d90d1feebbf8bce805bac8bd1.jpg@webp",
    title: "NEON NIGHTS",
    category: "portrait",
  },
  {
    id: 3,
    url: "https://static.insales-cdn.com/r/0iM6CoslFT0/rs:fit:600:600:1/plain/files/1/3434/35253610/original/2x33_831a403d90d1feebbf8bce805bac8bd1.jpg@webp",
    title: "CONCRETE WAVES",
    category: "abstract",
  },
  {
    id: 4,
    url: "https://static.insales-cdn.com/r/0iM6CoslFT0/rs:fit:600:600:1/plain/files/1/3434/35253610/original/2x33_831a403d90d1feebbf8bce805bac8bd1.jpg@webp",
    title: "STATIC MOTION",
    category: "street",
  },
  {
    id: 5,
    url: "https://static.insales-cdn.com/r/0iM6CoslFT0/rs:fit:600:600:1/plain/files/1/3434/35253610/original/2x33_831a403d90d1feebbf8bce805bac8bd1.jpg@webp",
    title: "DIGITAL DREAMS",
    category: "portrait",
  },
  {
    id: 6,
    url: "https://static.insales-cdn.com/r/0iM6CoslFT0/rs:fit:600:600:1/plain/files/1/3434/35253610/original/2x33_831a403d90d1feebbf8bce805bac8bd1.jpg@webp",
    title: "ACID RAIN",
    category: "abstract",
  },
];

const AvantGardePortfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredPhoto, setHoveredPhoto] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const categories = [
    "all",
    ...(new Set(photos.map((photo) => photo.category)) as any),
  ];

  const filteredPhotos =
    activeCategory === "all"
      ? photos
      : photos.filter((photo) => photo.category === activeCategory);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1IiBkPSJNMCAwaDMwMHYzMDBIMHoiLz48L3N2Zz4=')] opacity-50"></div>
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
        {/* Dynamic text based on scroll */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          <h2
            className="text-[20vw] font-bold text-black opacity-5 whitespace-nowrap"
            style={{ transform: `translateX(${-scrollPosition * 0.5}px)` }}
          >
            PHOTOGRAPHY
          </h2>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden group"
              onMouseEnter={() => setHoveredPhoto(photo.id)}
              onMouseLeave={() => setHoveredPhoto(0)}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover transition-all duration-700 filter grayscale hover:grayscale-0"
                style={{
                  transform:
                    hoveredPhoto === photo.id ? "scale(1.05)" : "scale(1)",
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-500">
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
      <footer className="mt-16 pb-8 text-center text-gray-500">
        <p className="font-mono text-sm">
          © {new Date().getFullYear()} ANDREI GULIN
        </p>
      </footer>
    </div>
  );
};

export default AvantGardePortfolio;
