"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usersAPI } from "../lib/api/users";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setAuthors(data?.users || []);
    } catch (err) {
      console.error("Error fetching authors:", err);
      setError("Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading authors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchAuthors}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Our Writers</h1>
        <p className="text-gray-600 mb-10">
          Discover talented writers and their inspiring work
        </p>

        {authors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No authors found.</p>
            <button
              onClick={fetchAuthors}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {authors.map((author) => (
              <Link
                key={author.id}
           href={`/author/${author.username || author.id}`}
                className="block group"
              >
                <div className="border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 bg-white hover:border-blue-200 hover:-translate-y-1">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-2xl font-bold text-blue-700 mb-4 group-hover:scale-105 transition-transform">
                      {author.name?.charAt(0) || author.username?.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="w-full">
                      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {author.name || author.username}
                      </h2>
                      
                      {author.email && (
                        <p className="text-gray-500 text-sm mt-1 truncate">
                          {author.email}
                        </p>
                      )}

                      {author.bio && (
                        <div className="mt-4">
                          <p className="text-gray-600 text-sm line-clamp-3">
                            {Array.isArray(author.bio)
                              ? author.bio[0]?.children?.[0]?.text || "No bio available"
                              : author.bio}
                          </p>
                        </div>
                      )}

                      {/* View Profile Button */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <span className="inline-flex items-center text-blue-600 text-sm font-medium">
                          View Profile
                          <svg
                            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            Showing {authors.length} authors • Click any card to view details
          </p>
        </div>
      </div>
    </div>
  );
}