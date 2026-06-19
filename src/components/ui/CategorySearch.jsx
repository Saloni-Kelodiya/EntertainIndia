"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function CategorySearch({ onSearch, onLetterFilter }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleLetterClick = (letter) => {
    const newLetter = selectedLetter === letter ? "" : letter;
    setSelectedLetter(newLetter);
    setSearchQuery("");
    onLetterFilter?.(newLetter);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedLetter("");
    onSearch?.("");
    onLetterFilter?.("");
  };

  const scrollAlphabet = (direction) => {
    const container = document.getElementById("alphabet-scroll");
    if (!container) return;

    const scrollAmount = window.innerWidth < 640 ? 120 : 200;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-gray-800 dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg 
                    p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">

      {/* शीर्षक */}
      <h2 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-white">
        अपनी पसंद की खोज करें
      </h2>

      {/* सर्च बार */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 sm:gap-2 mb-5 sm:mb-6"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="अपनी पसंद खोजें..."
            className="w-full px-4 py-2.5 sm:py-3 pr-10 rounded-lg bg-white text-gray-900
                       placeholder-gray-400 text-sm sm:text-base
                       focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
          />
          {(searchQuery || selectedLetter) && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1
                         text-gray-400 hover:text-pink-600 transition-colors"
              aria-label="सर्च साफ़ करें"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 
                     bg-pink-600 hover:bg-pink-700 text-white font-semibold 
                     rounded-lg transition shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          खोजें
        </button>
      </form>

      {/* वर्णमाला फ़िल्टर */}
      <div className="relative flex items-center gap-2">

        {/* बायां तीर */}
        <button
          type="button"
          onClick={() => scrollAlphabet("left")}
          className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full 
                     bg-pink-600 hover:bg-pink-700 text-white 
                     flex items-center justify-center shadow-md z-10"
          aria-label="बाईं ओर स्क्रॉल करें"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* वर्णमाला स्क्रॉल */}
        <div
          id="alphabet-scroll"
          className="flex-1 overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-2 px-1 sm:px-2">
            {alphabet.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleLetterClick(letter)}
                className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full 
                            flex items-center justify-center font-semibold 
                            text-xs sm:text-sm transition-all
                  ${selectedLetter === letter
                    ? "bg-pink-600 text-white shadow scale-110"
                    : "bg-white text-pink-600 hover:bg-pink-600 hover:text-white border border-pink-600"
                  }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* दायां तीर */}
        <button
          type="button"
          onClick={() => scrollAlphabet("right")}
          className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full 
                     bg-pink-600 hover:bg-pink-700 text-white 
                     flex items-center justify-center shadow-md z-10"
          aria-label="दाईं ओर स्क्रॉल करें"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}