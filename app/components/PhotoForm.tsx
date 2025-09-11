"use client";

import React, { useState } from "react";
import { supabase } from "../utils/supabase";

type InitialData = {
  id?: string;
  title: string;
  url: string;
  category: string;
  description: string;
  date_taken: string;
  // Add other fields as needed
};

const PhotoForm = ({ initialData = {} as InitialData, uniqueCategories = [] as string[] }) => {
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

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    
    try {
      const { error } = await supabase
        .from('photos')
        .upsert([form]);
        
      if (error) throw error;
      setMessage("Photo saved successfully!");
      if (!form.id) {  // Check form.id instead of initialData.id
        setForm({
          title: '',
          url: '',
          category: '',
          description: '',
          date_taken: '',
        });
      }
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      }
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
          className="w-full p-2 border rounded mb-2"
          value={form.category || ''} 
          onChange={(e) => setForm({...form, category: e.target.value})}
        />
        <div className="flex flex-wrap gap-2">
          {uniqueCategories.map((category: string) => (
        <button
          key={category}
          type="button"
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setForm({ ...form, category })}
        >
          {category}
        </button>
          ))}
        </div>
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
      {form.url && (
        <div className="mt-4">
          <img 
        src={form.url} 
        alt="Preview" 
        className="max-w-full h-auto border rounded"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Date Taken</label>
        <input 
          className="w-full p-2 border rounded"
          value={form.date_taken || ''} 
          onChange={(e) => setForm({...form, date_taken: e.target.value})}
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