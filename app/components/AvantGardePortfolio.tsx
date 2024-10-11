"use client";

import React, { useState, useEffect } from "react";
import { Camera, Menu, X, ArrowRight, Instagram, Mail } from "lucide-react";

const theme = {
  fontFamily: '"Courier New", monospace',
  colorPrimary: "#000000",
  colorAccent: "#FF3300",
  transitionSpeed: "0.01s",
  gridGap: "1px",
};

const photos = [
  {
    id: 1,
    url: "https://d15lrsitp7y7u.cloudfront.net/wp-content/uploads/2018/06/maxresdefault.jpg",
    title: "URBAN DECAY",
    category: "street",
  },
  {
    id: 2,
    url: "https://images.freeskatemag.com/wp-content/uploads/2022/12/01183807/boing.jpg",
    title: "NEON NIGHTS",
    category: "portrait",
  },
  {
    id: 3,
    url: "https://www.jenkemmag.com/home/wp-content/uploads/2024/03/BsFlip-Milan-scaled.jpg",
    title: "CONCRETE WAVES",
    category: "abstract",
  },
  {
    id: 4,
    url: "https://images-wp.stockx.com/news/wp-content/uploads/2019/05/Screen-Shot-2019-05-31-at-3.01.36-PM.png",
    title: "STATIC MOTION",
    category: "street",
  },
  {
    id: 5,
    url: "/assets/me_smoky.jpg",
    title: "DIGITAL DREAMS",
    category: "portrait",
  },
  {
    id: 6,
    url: "https://quartersnacks.com/wp-content/uploads/2024/04/rat-ratz-who-said-what-vince.jpg",
    title: "ACID RAIN",
    category: "abstract",
  },
  {
    id: 7,
    url: "https://quartersnacks.com/wp-content/uploads/2021/12/rat-ratz-6.jpg",
    title: "STATIC MOTION",
    category: "street",
  },
  {
    id: 8,
    url: "https://www.skateboarding.com/.image/ar_4:3%2Cc_fill%2Ccs_srgb%2Cq_auto:eco%2Cw_1200/MjAwNDA2NzAyODgzODc0MTY4/screen-shot-2023-08-28-at-21744-pm.png",
    title: "DIGITAL DREAMS",
    category: "portrait",
  },
  {
    id: 9,
    url: "https://place.tv/wp-content/uploads/2020/10/place-19-scaled.jpg",
    title: "ACID RAIN",
    category: "abstract",
  },
];

const AvantGardePortfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [clickedPhoto, setClickedPhoto] = useState({});

  const categories = [
    "all",
    ...(new Set(photos.map((photo) => photo.category)) as any),
  ];

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
      <footer className="mt-6 pb-6 text-center text-gray-500">
        <p className="font-mono text-sm">
          © {new Date().getFullYear()} ANDREI GULIN
        </p>
      </footer>
    </div>
  );
};

export default AvantGardePortfolio;
