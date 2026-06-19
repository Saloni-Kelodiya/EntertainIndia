"use client";

import React, { useState } from "react";
import { useStore } from "../../store/useStore"; 
import { X, Plus, Trash2, UploadCloud, Users, Layers, FileText, Image as ImageIcon } from "lucide-react";

const CreateWebStoryModal = ({ onClose, user }) => {
  const { token } = useStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // --- 1. FORM DATA ---
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    heroText: "",
    // trandingRank: "",
    featured: false,
    category: "", 

    // SEO Fields
    seo_title: "",
    seo_description: "",
  });

  // Images
  const [thumbnail, setThumbnail] = useState(null);

  // Slides
  const [slides, setSlides] = useState([
    { id: Date.now(), heading: "", description: "", ctaText: "", ctaUrl: "", image: null }
  ]);

  // Cast
  const [cast, setCast] = useState([]);

  // --- 2. UPLOAD HELPER (Article Style - Upload First) ---
  const uploadToStrapi = async (file) => {
    const formData = new FormData();
    formData.append("files", file);

    const response = await fetch("https://admin.entertainindia.com/api/upload", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data[0]; 
  };

  // Thumbnail Handler
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToStrapi(file);
      setThumbnail(uploaded);
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  };

  // Slide Image Handler
  const handleSlideImageChange = async (slideId, file) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToStrapi(file);
      setSlides(slides.map(s => s.id === slideId ? { ...s, image: uploaded } : s));
    } catch (err) { alert(err.message); } finally { setUploading(false); }
  };

  const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")     // Spaces ko hyphen (-) se badle
    .replace(/[^\w-]+/g, "")   // Special characters hataye
    .replace(/--+/g, "-");     // Double hyphen hataye
};

  // --- 3. FORM HANDLERS ---
 const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  setFormData((prev) => {
    const newData = { 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    };

    // AGAR TITLE CHANGE HO RAHA HAI, TOH SLUG BHI UPDATE KARO
    if (name === "title") {
      newData.slug = slugify(value);
    }

    return newData;
  });
};

  const addSlide = () => setSlides([...slides, { id: Date.now(), heading: "", description: "", ctaText: "", ctaUrl: "", image: null }]);
  const removeSlide = (id) => slides.length > 1 && setSlides(slides.filter(s => s.id !== id));
  const updateSlide = (id, field, value) => setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));

  const addCast = () => setCast([...cast, { id: Date.now(), characterName: "", celebrities_profiles: "" }]);
  const removeCast = (id) => setCast(cast.filter(c => c.id !== id));
  const updateCast = (id, field, value) => setCast(cast.map(c => c.id === id ? { ...c, [field]: value } : c));

  // --- 4. FINAL SUBMIT ---
  // --- 4. FINAL SUBMIT (Modified for Draft Support) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!thumbnail) return alert("Please upload a thumbnail.");
    if (slides.some(s => !s.image)) return alert("Please ensure every slide contains an image.");

    setLoading(true);

    try {
      const payload = {
        data: {
          title: formData.title,
          slug: formData.slug,
          heroText: formData.heroText,
          featured: formData.featured,
          category: formData.category,
          
          // 🔥 DRAFT LOGIC: publishedAt ko explicitly null rakha hai
          // Isse Strapi ise 'Published' nahi karega, sirf 'Draft' banayega.
          publishedAt: null, 

          // Check karein aapka Strapi field name 'author' hai ya 'auther' 
          // (Strapi default 'author' use karta hai, aapne auther likha tha)
           auther: user.id,
          thumbnail: thumbnail.id,

          // SEO Fields
          seo_title: formData.seo_title || formData.title,
          seo_description: formData.seo_description || formData.heroText,

          // Slides Array
          slides: slides.map(s => ({
            heading: s.heading || "",
            description: s.description || "",
            ctaText: s.ctaText || "",
            ctaUrl: s.ctaUrl || "",
            image: s.image.id
          })),

          // Cast Array
          cast: cast.map(c => ({
            characterName: c.characterName,
          }))
        }
      };

      console.log("Submitting as Draft:", payload);

      const response = await fetch("https://admin.entertainindia.com/api/web-stories", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || "Server Error");
      }

      // Alert message thoda change kiya hai taaki confusion na ho
      alert("Web Story Saved as Draft! 🚀 Check your Strapi admin.");
      onClose();

    } catch (err) {
      console.error("Submit Error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (img) => img ? (img.url.startsWith("http") ? img.url : `https://admin.entertainindia.com${img.url}`) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div className="bg-gray-900 border border-gray-700 w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-2xl flex flex-col shadow-2xl">
            
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">✨ Create Web Story</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full text-gray-400"><X size={20} /></button>
                </div>
                <div className="flex px-4 gap-1">
                    {[{ id: 'basic', label: 'Basic Info', icon: FileText }, { id: 'slides', label: 'Slides', icon: Layers }, { id: 'cast', label: 'Cast', icon: Users }, { id: 'seo', label: 'SEO', icon: UploadCloud }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-purple-500 text-purple-400 bg-gray-800' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900/50">
                
                {/* --- TAB 1: BASIC INFO --- */}
               {activeTab === 'basic' && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
    <div className="md:col-span-2 space-y-4">
      {/* Title Input */}
      <div>
        <label className="text-xs text-gray-400 uppercase font-bold">Title *</label>
        <input 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          placeholder="Enter story title..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Slug Input (Auto-filled) */}
       <div>
          <label className="text-xs text-gray-400 uppercase font-bold">Slug *</label>
          <input 
            name="slug" 
            value={formData.slug} 
            onChange={handleChange} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white" 
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">Hero Text</label>
          <input 
            name="heroText" 
            value={formData.heroText} 
            onChange={handleChange} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* 🔥 UPDATED CATEGORY DROPDOWN */}
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">Category</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500"
          >
            <option value="">Select Category</option>
            <option value="all">All</option>
            <option value="trending">Trending</option>
            <option value="box-office">Box Office</option>
            <option value="celebrity">Celebrity</option>
            <option value="fashion">Fashion</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="events">Events</option>
            <option value="exclusive">Exclusive</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer bg-gray-800 p-3 rounded-lg border border-gray-700 w-full">
            <input 
              type="checkbox" 
              name="featured" 
              checked={formData.featured} 
              onChange={handleChange} 
              className="w-5 h-5 accent-purple-600" 
            />
            <span className="text-white">Featured Story</span>
          </label>
        </div>
      </div>
    </div>
    
    {/* Thumbnail Section */}
    <div className="space-y-2">
      <label className="text-xs text-gray-400 uppercase font-bold">Thumbnail *</label>
      <div className="relative h-64 bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center overflow-hidden hover:border-purple-500 transition-colors">
        {uploading && !thumbnail ? (
          <span className="text-purple-400 animate-pulse text-sm">Uploading Image...</span>
        ) : thumbnail ? (
          <img src={getImageUrl(thumbnail)} className="w-full h-full object-cover" alt="Thumbnail" />
        ) : (
          <div className="text-center text-gray-500">
            <ImageIcon size={32} className="mx-auto mb-2 text-gray-600"/>
            <span className="text-xs">Click or Drag Image</span>
          </div>
        )}
        <input type="file" onChange={handleThumbnailChange} className="absolute inset-0 opacity-0 cursor-pointer" />
      </div>
    </div>
  </div>
)}

                {/* --- TAB 2: SLIDES --- */}
                {activeTab === 'slides' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center"><h3 className="text-white font-bold">Slides ({slides.length})</h3><button type="button" onClick={addSlide} className="text-purple-400 text-sm hover:underline">+ Add Slide</button></div>
                        <div className="grid grid-cols-1 gap-4">
                            {slides.map((slide, index) => (
                                <div key={slide.id} className="flex gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
                                    <div className="w-24 h-32 bg-gray-900 relative rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-gray-700">
                                        {slide.image ? <img src={getImageUrl(slide.image)} className="w-full h-full object-cover" /> : <div className="text-center text-gray-500 text-xs">Upload</div>}
                                        <input type="file" onChange={(e) => handleSlideImageChange(slide.id, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between"><span className="text-xs font-bold text-gray-400">SLIDE #{index + 1}</span><button type="button" onClick={() => removeSlide(slide.id)} className="text-red-400"><Trash2 size={16}/></button></div>
                                        <input placeholder="Heading" value={slide.heading} onChange={(e) => updateSlide(slide.id, 'heading', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                                        <textarea placeholder="Description" rows="2" value={slide.description} onChange={(e) => updateSlide(slide.id, 'description', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                                        <div className="grid grid-cols-2 gap-2"><input placeholder="CTA Text" value={slide.ctaText} onChange={(e) => updateSlide(slide.id, 'ctaText', e.target.value)} className="bg-gray-900 border border-gray-600 rounded p-2 text-white text-xs" /><input placeholder="CTA URL" value={slide.ctaUrl} onChange={(e) => updateSlide(slide.id, 'ctaUrl', e.target.value)} className="bg-gray-900 border border-gray-600 rounded p-2 text-white text-xs" /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB 3: CAST --- */}
                {activeTab === 'cast' && (
                    <div className="space-y-6 animate-in fade-in">
                         <div className="flex justify-between items-center"><h3 className="text-white font-bold">Cast & Crew</h3><button type="button" onClick={addCast} className="text-blue-400 text-sm hover:underline">+ Add Member</button></div>
                         {cast.map((c, index) => (
                             <div key={c.id} className="flex gap-2 items-center bg-gray-800 p-2 rounded">
                                 <input placeholder="Character Name" value={c.characterName} onChange={(e) => updateCast(c.id, 'characterName', e.target.value)} className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                                 <button type="button" onClick={() => removeCast(c.id)} className="text-red-400 p-2"><Trash2 size={16}/></button>
                             </div>
                         ))}
                    </div>
                )}

                {/* --- TAB 4: SEO --- */}
                {activeTab === 'seo' && (
                    <div className="space-y-4 animate-in fade-in max-w-2xl">
                        <div><label className="text-xs text-gray-400 uppercase font-bold">SEO Title</label><input name="seo_title" value={formData.seo_title} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white" /></div>
                        <div><label className="text-xs text-gray-400 uppercase font-bold">SEO Description</label><textarea name="seo_description" rows="4" value={formData.seo_description} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white" /></div>
                    </div>
                )}
            </form>

            <div className="p-5 border-t border-gray-700 bg-gray-800 flex justify-end gap-4">
                <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-300 hover:text-white">Cancel</button>
                <button onClick={handleSubmit} disabled={loading || uploading} className="px-8 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg disabled:opacity-50">{loading ? "Publishing..." : "Publish Story"}</button>
            </div>
        </div>
    </div>
  );
};

export default CreateWebStoryModal;