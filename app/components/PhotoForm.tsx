"use client";

import React, { useState } from "react";
import { supabase } from "../utils/supabase";

const PhotoForm = ({ initialData = {} }) => {
  const [form, setForm] = useState(initialData || {
    title: '',
    url: '',
    category: '',
    description: '',
    date_taken: '',
    // Add other fields as needed
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    
    try {
      const { error } = await supabase
        .from('photos')
        .upsert([form]);
        
      if (error) throw error;
      setMessage("Photo saved successfully!");
      if (!initialData.id) {
        // Clear form if it was a new entry
        setForm({});
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input 
          className="w-full p-2 border rounded"
          value={form.title || ''} 
          onChange={(e) => setForm({...form, title: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea 
          className="w-full p-2 border rounded"
          value={form.description || ''} 
          onChange={(e) => setForm({...form, description: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <textarea 
          className="w-full p-2 border rounded"
          value={form.category || ''} 
          onChange={(e) => setForm({...form, category: e.target.value})}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Image URL</label>
        <input 
          className="w-full p-2 border rounded"
          value={form.url || ''} 
          onChange={(e) => setForm({...form, url: e.target.value})}
          required
        />
      </div>
      
      {message && (
        <div className={`p-2 rounded ${message.startsWith('Error') ? 'bg-red-100' : 'bg-green-100'}`}>
          {message}
        </div>
      )}
      
      <button 
        type="submit" 
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Photo'}
      </button>
    </form>
  );
};

export default PhotoForm;