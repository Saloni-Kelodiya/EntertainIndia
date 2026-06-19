"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { articlesAPI, categoriesAPI, tagsAPI, moviesAPI, genresAPI } from "../../lib/api";

// Dynamic import for markdown editor (to avoid SSR issues)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const CreateArticleModal = ({ onClose, user, editData }) => {
  const isEdit = !!editData; 
    const [formData, setFormData] = useState({
    MainCategory: "",  
    title: "",
    slug: "article-1",
    summary: "",
    body: "",
    meta_description: "",
    primary_image_alt: "",
    hero_image: null,
    category: "",
    tags: [],
    reading_time: 5,
    language: "en",
    featured: false,
    sponsored: false,
    sponsor_meta: "",
    typecontent: "",
    movie: [],
    related_to: "",
    releaseYear: "",
    rating: "",
    watchingPlatform: "",
    // genres: [],
    pros_1: "",
    pros_2: "",
    cons_1: "",
    cons_2: "",
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [movies, setMovies] = useState([]);
  // const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [editorHeight, setEditorHeight] = useState(400);

  const [tagSearch, setTagSearch] = useState("");
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // Yeh search text ke hisaab se tags ko filter karega
  const filteredTags = tags.filter(tag => 
    tag?.name?.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Fetch all required data in parallel
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [cats, tgs, movs, gens] = await Promise.all([
          categoriesAPI.getAll().catch(() => []),
          tagsAPI.getAll().catch(() => []),
          moviesAPI.getAll({ pageSize: 100 }).catch(() => ({ movies: [] })),
          // genresAPI.getAll().catch(() => [])
        ]);
        
        setCategories(cats);
        setTags(tgs);
        setMovies(movs.movies || []);
        // setGenres(gens);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchAllData();
  }, []);


  // Function to handle body image uploads
const handleBodyImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploadingImage(true);
  try {
    const uploaded = await articlesAPI.uploadImage(file);
    const baseUrl = process.env.STRAPI_BACKEND_URL || "http://localhost:1337";
    const imageUrl = uploaded.url.startsWith('http') ? uploaded.url : `${baseUrl}${uploaded.url}`;

    // Markdown syntax for image
    const imageMarkdown = `\n![image](${imageUrl})\n`;
    
    // Body mein add karna (End mein ya cursor position par)
    setFormData(prev => ({
      ...prev,
      body: prev.body + imageMarkdown
    }));

    setMessage("✅ Image added to content!");
  } catch (err) {
    setMessage(`❌ Failed: ${err.message}`);
  } finally {
    setUploadingImage(false);
  }
};


  useEffect(() => {
  if (editData) {
    setFormData({
      ...editData, // Saara purana data bhar dega
      category: editData.category?.id || "", // ID nikaalni padegi
      tags: editData.tags?.map(t => t.id) || [], // Tag IDs ka array
      movie: editData.movie?.map(m => m.id) || [], // Movie IDs ka array
      hero_image: editData.hero_image?.id ? { id: editData.hero_image.id } : null,
    });
  }
}, [editData]);
  // Handle text, checkbox, select inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle markdown editor changes
  const handleMarkdownChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      body: value || "",
    }));
  };

  // Handle image upload via file input
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploaded = await articlesAPI.uploadImage(file);

      setFormData((prev) => ({
        ...prev,
        hero_image: { id: uploaded.id },
      }));

      setMessage("✅ Image uploaded successfully!");
    } catch (err) {
      console.error("Image upload failed:", err);
      setMessage(`❌ Image upload failed: ${err.message}`);
      setFormData((prev) => ({
        ...prev,
        hero_image: null,
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  // Auto-generate slug
  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title) || "article-1",
    }));
  };

  // Handle tags toggle - stores direct IDs
  const handleTagToggle = (tagId) => {
    const id = parseInt(tagId);
    setFormData((prev) => {
      const exists = prev.tags.includes(id);
      if (exists) {
        return { ...prev, tags: prev.tags.filter((tId) => tId !== id) };
      } else {
        return { ...prev, tags: [...prev.tags, id] };
      }
    });
  };

  const handleMovieToggle = (movieId) => {
    const id = parseInt(movieId);
    setFormData((prev) => {
      const exists = prev.movie.includes(id);
      if (exists) {
        return { ...prev, movie: prev.movie.filter((mId) => mId !== id) };
      } else {
        return { ...prev, movie: [...prev.movie, id] };
      }
    });
  };

  // Check functions
  const isTagSelected = (tagId) => formData.tags.includes(tagId);
  // const isGenreSelected = (genreId) => formData.genres.includes(genreId);
  const isMovieSelected = (movieId) => formData.movie.includes(movieId);

  // Get selected item names for display
  const getSelectedTagNames = () => {
    return formData.tags.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      // Yeh direct name ya nested name dono ko pakad lega
      return tag?.name || tag?.attributes?.name || "Unknown Tag";
    }).filter(Boolean);
  };



  const getSelectedMovieNames = () => {
    return formData.movie.map(movieId => {
      const movie = movies.find(m => m.id === movieId);
      return movie?.title;
    }).filter(Boolean);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const isEditMode = !!editData; 
    const token = localStorage.getItem("token");
    const baseUrl = process.env.STRAPI_BACKEND_URL || "http://localhost:1337";

    // 1. Article Data object taiyar karo (Data cleaning ke saath)
    const articleData = {
      MainCategory: formData.MainCategory || null,
      title: formData.title,
      slug: formData.slug,
      summary: formData.summary,
      body: formData.body,
      meta_description: formData.meta_description || null,
      primary_image_alt: formData.primary_image_alt || null,
      reading_time: parseInt(formData.reading_time) || 5,
      category: formData.category ? parseInt(formData.category) : null,
      hero_image: formData.hero_image?.id || null,
      featured: Boolean(formData.featured),
      sponsored: Boolean(formData.sponsored),
      sponsor_meta: formData.sponsor_meta || null,
      language: formData.language || "en",
      typecontent: formData.typecontent || null,
      movie: formData.movie && formData.movie.length > 0 ? formData.movie : [],
      related_to: formData.related_to || null,
      releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : null,
      rating: formData.rating ? parseFloat(formData.rating) : null,
      watchingPlatform: formData.watchingPlatform || null,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      pros_1: formData.pros_1 || null,
      pros_2: formData.pros_2 || null,
      cons_1: formData.cons_1 || null,
      cons_2: formData.cons_2 || null,
    };

    // 2. URL aur HTTP Method ka logic (Yahi crash fix karta hai)
    let url = `${baseUrl}/api/articles`;
    let method = "POST"; // Default naye article ke liye

    if (isEditMode && editData) {
      // Agar editData hai, sirf tabhi ID access karo
      const articleId = editData.documentId || editData.id;
      url = `${baseUrl}/api/articles/${articleId}`;
      method = "PUT"; // Update ke liye PUT
    } else {
      // Naya article hai toh logged-in user ko Author banao
      if (user && user.id) {
        articleData.Authors = [user.id];
      }
    }

    // 
    
    // 3. API Call (Fetch API ka use)
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: articleData }),
    });

    const responseData = await res.json();

    // 4. Response handle karo
    if (!res.ok) {
      const errorMsg = responseData.error?.message || "Strapi API error occurred";
      throw new Error(errorMsg);
    }

    // 5. Success UI Feedback
    const actionText = isEditMode ? "updated" : "created";
    setMessage(`✅ Article ${actionText} successfully!`);

    // Modal ko thodi der baad band karo
    setTimeout(() => {
      onClose();
    }, 1500);

  } catch (error) {
    console.error("Submission Error Details:", error);
    setMessage(`❌ Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  // Display current hero image info
  const renderHeroImageInfo = () => {
    if (!formData.hero_image) return null;

    if (typeof formData.hero_image === "object" && formData.hero_image.id) {
      return (
        <div className="mt-2 p-2 bg-green-900/30 rounded text-green-300 text-sm">
          ✓ Image uploaded (ID: {formData.hero_image.id})
        </div>
      );
    }

    return null;
  };

  // Editor height adjust buttons
  const EditorHeightControls = () => (
    <div className="flex gap-2 mb-2">
      <button
        type="button"
        onClick={() => setEditorHeight(300)}
        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
      >
        Small
      </button>
      <button
        type="button"
        onClick={() => setEditorHeight(400)}
        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
      >
        Medium
      </button>
      <button
        type="button"
        onClick={() => setEditorHeight(500)}
        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
      >
        Large
      </button>
      <button
        type="button"
        onClick={() => setEditorHeight(600)}
        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
      >
        X-Large
      </button>
    </div>
  );

  // Content type options - EXACT ENUM VALUES
  const contentTypeOptions = [
    { value: "", label: "Choose here" },
    { value: "LatestNews", label: "Latest News" },
    { value: "CelebrityNews", label: "Celebrity News" },
    { value: "ViralNews", label: "Viral News" },
    { value: "review", label: "Review" },
  ];

  // Watching platform options - EXACT ENUM VALUES
  const platformOptions = [
    { value: "", label: "Choose here" },
    { value: "Netflix", label: "Netflix" },
    { value: "Prime", label: "Amazon Prime" },
    { value: "Hotstar", label: "Hotstar" },
    { value: "SonyLiv", label: "SonyLiv" },
    { value: "JioCinema", label: "JioCinema" },
  ];

  // Related to options - EXACT ENUM VALUES
  const relatedToOptions = [
    { value: "", label: "Choose here" },
    { value: "Movie Reviews", label: "Movie Reviews" },
    { value: "Music", label: "Music" },
    { value: "Fashion", label: "Fashion" },
    { value: "Awards", label: "Awards" },
    { value: "Product Reviews", label: "Product Reviews" },
  ];

  const mainCategoryOptions = [
  { value: "", label: "Select Type" },
  { value: "news", label: "News" },
  { value: "article", label: "Article" },
];

// Sirf English aur Hindi options
const languageOptions = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Create New Article</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg mb-4 ${
              message.includes("✅")
                ? "bg-green-900 text-green-200"
                : "bg-red-900 text-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="p-4 ">
    <label className="block mb-2 text-sm font-bold text-white uppercase tracking-wider">
      Content Classification *
    </label>
    <select
      name="MainCategory"
      value={formData.MainCategory}
      onChange={handleChange}
      className="w-full p-3 rounded-lg bg-gray-700 border-2 border-blue-500/50 text-white font-semibold focus:border-blue-400 outline-non"
      required
      disabled={loading}
    >
      {mainCategoryOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <p className="mt-1 text-xs text-gray-400">
      Select whether this is a General News item or a Detailed Article.
    </p>
  </div>
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Title * (max. 80 characters)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleTitleChange}
                maxLength={80}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                required
                disabled={loading}
              />
            </div>
          </div>
         

          {/* Summary */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Summary * (max. 200 characters)
            </label>
            <textarea
              rows="3"
              name="summary"
              value={formData.summary || ""}
              onChange={handleChange}
              maxLength={200}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
              required
              disabled={loading}
            />
          </div>

          {/* Content Editor */}
          <div className="flex justify-between items-center mb-2">
  <label className="text-sm font-medium text-gray-300">Content (Markdown)</label>
  
  {/* Naya Button for Body Images */}
  <div className="relative">
    <input 
      type="file" 
      id="body-img" 
      className="hidden" 
      onChange={handleBodyImageUpload}
      accept="image/*"
    />
    <label 
      htmlFor="body-img" 
      className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
    >
      🖼️ Add Image in Text
    </label>
  </div>
</div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Content (Markdown) * (min. 500 characters)
              </label>
              <span className="text-xs text-gray-400">
                {formData.body.length} characters
              </span>
            </div>

            <EditorHeightControls />

            <div
              className="border border-gray-600 rounded-lg overflow-hidden"
              data-color-mode="dark"
            >
              <MDEditor
                value={formData.body || ""}
                onChange={handleMarkdownChange}
                height={editorHeight}
                preview="live"
                visibleDragbar={false}
                textareaProps={{
                  placeholder: "Write your article here (minimum 500 characters)...",
                }}
              />
            </div>

            {formData.body.length < 500 && (
              <div className="mt-2 text-xs text-yellow-400">
                Minimum 500 characters required. Current: {formData.body.length}
              </div>
            )}
          </div>

          

          {/* SEO Fields */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Meta Description
            </label>
            <textarea
              rows="2"
              name="meta_description"
              value={formData.meta_description || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
              disabled={loading}
            />
          </div>

          {/* Image Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Hero Image
                {uploadingImage && (
                  <span className="ml-2 text-yellow-400">(Uploading...)</span>
                )}
              </label>
              <input
                type="file"
                name="hero_image"
                onChange={handleImageChange}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading || uploadingImage}
                accept="image/*"
              />
              {renderHeroImageInfo()}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Image Alt Text
              </label>
              <input
                type="text"
                name="primary_image_alt"
                value={formData.primary_image_alt || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading}
                placeholder="Description for the hero image"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Category
            </label>
            <select
              name="category"
              value={formData.category|| ""}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
              disabled={loading}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags - CHECKBOX STYLE */}
         {/* Tags - MOVIE STYLE SELECTION */}
{/* Tags - SEARCHABLE DROPDOWN */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Tags (Search & Select)
            </label>
            
            {/* Selected Tags Display (Pills) */}
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tagId => {
                const tag = tags.find(t => t.id === tagId);
                if (!tag) return null;
                return (
                  <span 
                    key={tag.id} 
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-500/50 text-blue-200 text-xs rounded-full"
                  >
                    {tag.name}
                    <button 
                      type="button" 
                      onClick={() => handleTagToggle(tag.id)}
                      className="hover:text-red-400 ml-1 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search to add tags (e.g., Salman Khan)..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              onFocus={() => setIsTagDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsTagDropdownOpen(false), 200)} // Timeout taaki click register ho sake
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />

            {/* Dropdown List */}
            {isTagDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      onClick={() => {
                        handleTagToggle(tag.id);
                        setTagSearch(""); // Select karne ke baad search bar clear kar do
                      }}
                      className={`p-3 cursor-pointer transition-colors text-sm border-b border-gray-700/50 last:border-0 ${
                        isTagSelected(tag.id) 
                          ? "bg-blue-900/40 text-blue-300" 
                          : "text-gray-200 hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{tag.name}</span>
                        {isTagSelected(tag.id) && <span>✓</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-400">
                    No tags found matching "{tagSearch}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Movie - MULTIPLE CHECKBOXES */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Movie (Select Multiple)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-2 max-h-60 overflow-y-auto p-2 bg-gray-900/30 rounded-lg">
              {movies.map((mov) => (
                <div 
                  key={mov.id} 
                  onClick={() => handleMovieToggle(mov.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    isMovieSelected(mov.id)
                      ? "bg-blue-900/30 border-blue-500"
                      : "bg-gray-800 hover:bg-gray-700 border-gray-700"
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                      isMovieSelected(mov.id) 
                        ? "bg-blue-500" 
                        : "bg-gray-700 border border-gray-600"
                    }`}>
                      {isMovieSelected(mov.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span className="text-gray-200 text-sm">{mov.title}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-400">
              Click movies to select/deselect multiple
            </div>
            {formData.movie.length > 0 && (
              <div className="mt-3 p-2 bg-blue-900/20 rounded border border-blue-800/30">
                <div className="text-sm font-medium text-blue-300 mb-1">
                  Selected Movies ({formData.movie.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {getSelectedMovieNames().map((name, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-800/40 rounded text-sm text-blue-200">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content Type - ENUM */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Content Type
            </label>
            <select
              name="typecontent"
              value={formData.typecontent}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
              disabled={loading}
            >
              {contentTypeOptions.map((option) => (
                <option key={option.value} value={option.value || ""}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

       
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Related To
            </label>
            <select
              name="related_to"
              value={formData.related_to ||""}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
              disabled={loading}
            >
              {relatedToOptions.map((option) => (
                <option key={option.value} value={option.value || ""}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Movie Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Release Year
              </label>
              <input
                type="number"
                name="releaseYear"
                value={formData.releaseYear || ""}
                onChange={handleChange}
                min="1900"
                max="2100"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Rating
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating || ""}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.1"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Watching Platform - ENUM
              </label>
              <select
                name="watchingPlatform"
                value={formData.watchingPlatform || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading}
              >
                {platformOptions.map((option) => (
                  <option key={option.value} value={option.value || ""}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Reading Time (minutes)
              </label>
              <input
                type="number"
                name="reading_time"
                value={formData.reading_time || ""}
                onChange={handleChange}
                min="1"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading}
              />
            </div>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Pros 1
              </label>
              <input
                type="text"
                name="pros_1"
                value={formData.pros_1 || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Pros 2
              </label>
              <input
                type="text"
                name="pros_2"
                value={formData.pros_2 || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Cons 1
              </label>
              <input
                type="text"
                name="cons_1"
                value={formData.cons_1 || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Cons 2
              </label>
              <input
                type="text"
                name="cons_2"
                value={formData.cons_2 || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading}
              />
            </div>
          </div>

          {/* Language Selection */}
<div>
  <label className="block mb-2 text-sm font-medium text-gray-300">
    Language
  </label>
  <select
    name="language"
    value={formData.language}
    onChange={handleChange}
    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
    disabled={loading}
  >
    {languageOptions.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
</div>

          {/* Featured & Sponsored Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Featured</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="sponsored"
                checked={formData.sponsored}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Sponsored</span>
            </label>
          </div>

          {/* Sponsor Meta */}
          {formData.sponsored && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Sponsor Information
              </label>
              <input
                type="text"
                name="sponsor_meta"
                value={formData.sponsor_meta || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                disabled={loading}
                placeholder="Sponsor name or details"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              Cancel
            </button>
           <button
  type="submit"
  disabled={loading || uploadingImage || formData.body.length < 500}
  className="..."
>
  {loading
    ? (isEdit ? "Updating..." : "Creating...")
    : uploadingImage
    ? "Uploading Image..."
    : (isEdit ? "Update Article" : "Create Article")}
</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticleModal;