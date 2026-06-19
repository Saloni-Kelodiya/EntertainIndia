'use client';
import { useState } from 'react';

export default function CategoryTabs({ categories, onCategoryChange, activeCategory }) {
  const [selected, setSelected] = useState(activeCategory || categories[0]?.value);

  const handleTabClick = (categoryValue) => {
    setSelected(categoryValue);
    if (onCategoryChange) {
      onCategoryChange(categoryValue);
    }
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 p-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => handleTabClick(category.value)}
            className={`
                  pb-1 font-semibold text-sm whitespace-nowrap transition-all duration-200
                  ${selected === category.value
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }
                `}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}