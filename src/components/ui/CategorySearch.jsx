"use client";
import { useState } from "react";
import { X } from "lucide-react";

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

  const hasInput = searchQuery.trim() !== "" || selectedLetter !== "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-3 border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSearch} className="flex gap-1.5 mb-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="खोजें..."
            className="w-full px-3 py-1.5 pr-8 rounded border border-gray-300 dark:border-gray-600
                       bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200
                       focus:ring-1 focus:ring-pink-500 focus:border-transparent outline-none
                       text-xs transition"
          />
          {hasInput && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5
                         text-gray-400 hover:text-pink-600 transition-colors"
              aria-label="साफ़ करें"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-medium
                     rounded transition shadow-sm text-xs whitespace-nowrap"
        >
          खोजें
        </button>
      </form>

      <div className="flex flex-wrap justify-center gap-1">
        {alphabet.map((letter) => (
          <button
            key={letter}
            type="button"
            onClick={() => handleLetterClick(letter)}
            className={`
              w-6 h-6 sm:w-7 sm:h-7 rounded-full
              flex items-center justify-center
              font-medium text-[10px] sm:text-xs transition-colors
              ${selectedLetter === letter
                ? "bg-pink-600 text-white shadow"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/30 border border-transparent"
              }
            `}
          >
            {letter}
          </button>
        ))}
      </div>

      {selectedLetter && (
        <p className="text-center text-[10px] text-pink-600 dark:text-pink-400 mt-1">
          {selectedLetter} से शुरू
        </p>
      )}
    </div>
  );
}