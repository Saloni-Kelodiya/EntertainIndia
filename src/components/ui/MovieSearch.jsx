"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MovieSearch({ onSearch, onLetterFilter }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleLetterClick = (letter) => {
    const newLetter = selectedLetter === letter ? "" : letter;
    setSelectedLetter(newLetter);
    setSearchQuery("");
    if (onLetterFilter) {
      onLetterFilter(newLetter);
    }
  };

  const scrollAlphabet = (direction) => {
    const container = document.getElementById("alphabet-scroll");
    if (container) {
      const scrollAmount = 200;
      const newPosition = container.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      container.scrollTo({ left: newPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-gray-800 dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">
        Search Your Favourite Movies
      </h2>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-2 mb-6 px-2 sm:px-0"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Your Favourite Movies"
          className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 placeholder-gray-400
               focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
        />

        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold
               rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Search
        </button>
      </form>


      {/* Alphabet Filter with Scroll */}
      <div className="relative flex items-center gap-2">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => scrollAlphabet("left")}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center transition-all shadow-md z-10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          id="alphabet-scroll"
          className="flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="flex gap-2 px-1 py-1">
            {alphabet.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleLetterClick(letter)}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${selectedLetter === letter
                  ? "bg-pink-600 text-white shadow-lg scale-110"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                  }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollAlphabet("right")}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center transition-all shadow-md z-10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}