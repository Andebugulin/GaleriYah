"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase';
import { flickrSync } from '@/app/utils/flickrSync';
import PhotoForm from '@/app/components/PhotoForm';

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [flickrUrl, setFlickrUrl] = useState("https://www.flickr.com/photos/201748906@N08/with/54260070380/");
  const [isSyncing, setIsSyncing] = useState(false);
  const [view, setView] = useState('photos'); // 'photos' or 'albums'
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    cover_photo_url: ''
  });
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [isLoadingAlbumPhotos, setIsLoadingAlbumPhotos] = useState(false);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);

  useEffect(() => {
    fetchPhotos();
    fetchAlbums();
    fetchLastSync();
  }, []);

  const fetchLastSync = async () => {
    const lastSyncDate = await flickrSync.getLastSyncDate();
    setLastSync(lastSyncDate);
  };

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('date_taken', { ascending: false });
      
      if (error) throw error;
      setPhotos(data || []);
      setUniqueCategories([...new Set((data || []).map(photo => photo.category).filter(Boolean))]);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const fetchAlbumPhotos = async (albumId) => {
    setIsLoadingAlbumPhotos(true);
    try {
      const { data, error } = await supabase
        .from('album_photos')
        .select('photo_id')
        .eq('album_id', albumId);
      
      if (error) throw error;
      
      const photoIds = data.map(item => item.photo_id);
      setAlbumPhotos(photoIds);
    } catch (error) {
      console.error('Error fetching album photos:', error);
    } finally {
      setIsLoadingAlbumPhotos(false);
    }
  };

  const handleEdit = (photo) => {
    setSelectedPhoto(photo);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      const { error: junctionError } = await supabase
        .from('album_photos')
        .delete()
        .eq('photo_id', id);
        
      if (junctionError) throw junctionError;
      
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchPhotos();
    } catch (error) {
      alert(`Error deleting photo: ${error.message}`);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus({ message: 'Syncing with Flickr...', type: 'info' });
    
    try {
      const result = await flickrSync.syncPhotos(flickrUrl);
      
      if (result.success) {
        setSyncStatus({ 
          message: result.message, 
          type: 'success' 
        });
        fetchPhotos();
        fetchLastSync();
      } else {
        setSyncStatus({ 
          message: `Sync failed: ${result.error?.message || 'Unknown error'}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      setSyncStatus({ 
        message: `Sync error: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveAlbum = async (albumData) => {
    try {
      let albumId;
      
      if (selectedAlbum) {
        // Update existing album
        const { data, error } = await supabase
          .from('albums')
          .update(albumData)
          .eq('id', selectedAlbum.id)
          .select();
          
        if (error) throw error;
        albumId = selectedAlbum.id;
        if (data.length === 0) throw new Error('Album not found.');
      } else {
        // Create new album
        const { data, error } = await supabase
          .from('albums')
          .insert([albumData])
          .select();
          
        if (error) throw error;
        albumId = data[0].id;
        if (!albumId) throw new Error('Failed to create album.');
      }
      
      setShowAlbumForm(false);
      setSelectedAlbum(null);
      setAlbumPhotos([]);
      setShowPhotoSelector(false);
      fetchAlbums();
    } catch (error) {
      alert(`Error saving album: ${error.message}`);
    }
  };

  const handleEditAlbum = async (album) => {
    setSelectedAlbum(album);
    await fetchAlbumPhotos(album.id);
    setShowAlbumForm(true);
  };

  const handleDeleteAlbum = async (id) => {
    if (!confirm('Are you sure you want to delete this album?')) return;
    
    try {
      const { error: junctionError } = await supabase
        .from('album_photos')
        .delete()
        .eq('album_id', id);
        
      if (junctionError) throw junctionError;
      
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchAlbums();
    } catch (error) {
      alert(`Error deleting album: ${error.message}`);
    }
  };

  const handleAddToAlbum = async (photoId, albumId) => {
    try {
      const { error } = await supabase
        .from('album_photos')
        .insert([{
          photo_id: photoId,
          album_id: albumId
        }]);
        
      if (error) {
        if (error.code === '23505') { // Unique violation
          alert('This photo is already in the selected album.');
        } else {
          throw error;
        }
      } else {
        alert('Photo added to album successfully!');
        if (selectedAlbum && selectedAlbum.id === albumId) {
          fetchAlbumPhotos(albumId);
        }
      }
    } catch (error) {
      alert(`Error adding photo to album: ${error.message}`);
    }
  };

  const handleRemoveFromAlbum = async (photoId, albumId) => {
    try {
      const { error } = await supabase
        .from('album_photos')
        .delete()
        .eq('photo_id', photoId)
        .eq('album_id', albumId);
        
      if (error) throw error;
      
      alert('Photo removed from album successfully!');
      fetchAlbumPhotos(albumId);
    } catch (error) {
      alert(`Error removing photo from album: ${error.message}`);
    }
  };

  useEffect(() => {
    if (selectedAlbum) {
      setAlbumForm(selectedAlbum);
    } else {
      setAlbumForm({
        title: '',
        description: '',
        cover_photo_url: ''
      });
      setAlbumPhotos([]);
    }
  }, [selectedAlbum]);

  // Photo selector component with thumbnails
  const PhotoSelector = ({ onSelectPhoto, availablePhotos }) => {
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Add photos to album</label>
          <button
            type="button"
            onClick={() => setShowPhotoSelector(!showPhotoSelector)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showPhotoSelector ? 'Hide photos' : 'Show photos'}
          </button>
        </div>
        
        {showPhotoSelector && (
          <div className="border rounded p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {availablePhotos.map(photo => (
                <div 
                  key={photo.id} 
                  className="relative cursor-pointer hover:opacity-75"
                  onClick={() => {
                    onSelectPhoto(photo.id);
                    setShowPhotoSelector(false);
                  }}
                >
                  <img 
                    src={photo.url} 
                    alt={photo.title || 'Photo'} 
                    className="h-20 w-20 object-cover rounded border hover:border-blue-500"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b truncate">
                    {photo.title || `ID: ${photo.id}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAlbumForm = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      const payload = { ...albumForm };
      // Ensure created_at exists (if user didn't set, keep existing or let DB default)
      if (!payload.created_at) {
        payload.created_at = new Date().toISOString();
      }
      handleSaveAlbum(payload);
    };

    const availablePhotos = photos.filter(photo => !albumPhotos.includes(photo.id));
    const createdDateValue = albumForm.created_at
      ? new Date(albumForm.created_at).toISOString().slice(0, 10)
      : '';

    return (
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">
          {selectedAlbum ? 'Edit Album' : 'Create New Album'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full p-2 border rounded"
              value={albumForm.title || ''}
              onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Album Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={createdDateValue}
              onChange={(e) =>
                setAlbumForm({
                  ...albumForm,
                  created_at: e.target.value
                    ? new Date(e.target.value + 'T00:00:00Z').toISOString()
                    : null
                })
              }
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will set (or update) the album created_at field.
            </p>
          </div>

            <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full p-2 border rounded"
              value={albumForm.description || ''}
              onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cover Photo URL</label>
            <input
              className="w-full p-2 border rounded"
              value={albumForm.cover_photo_url || ''}
              onChange={(e) => setAlbumForm({ ...albumForm, cover_photo_url: e.target.value })}
            />
          </div>

          {selectedAlbum && (
            <div>
              <label className="block text-sm font-medium mb-1">Photos in this album</label>
              {isLoadingAlbumPhotos ? (
                <p>Loading album photos...</p>
              ) : albumPhotos.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {photos
                    .filter(photo => albumPhotos.includes(photo.id))
                    .map(photo => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.url}
                          alt={photo.title || 'Photo'}
                          className="h-20 w-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFromAlbum(photo.id, selectedAlbum.id)}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          title="Remove from album"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-sm text-gray-500">No photos in this album yet.</p>
              )}

              <PhotoSelector
                onSelectPhoto={(photoId) => handleAddToAlbum(photoId, selectedAlbum.id)}
                availablePhotos={availablePhotos}
              />
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save Album
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAlbumForm(false);
                setSelectedAlbum(null);
                setShowPhotoSelector(false);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderAlbumsView = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage Albums</h1>
          <button 
            onClick={() => {
              setSelectedAlbum(null);
              setShowAlbumForm(!showAlbumForm);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {showAlbumForm ? 'Cancel' : 'Create New Album'}
          </button>
        </div>
        
        {showAlbumForm && renderAlbumForm()}
        
        {albums.length > 0 ? (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cover
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {albums.map((album) => (
                  <tr key={album.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {album.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {album.cover_photo_url && (
                        <img 
                          src={album.cover_photo_url} 
                          alt={album.title} 
                          className="h-10 w-10 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(album.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditAlbum(album)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteAlbum(album.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No albums found. Create your first album using the button above.</p>
        )}
      </div>
    );
  };

  const renderPhotosView = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage Photos</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                setSelectedPhoto(null);
                setShowForm(!showForm);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {showForm ? 'Cancel' : 'Add New Photo'}
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold">Sync with Flickr</h2>
          
          {lastSync && (
            <p className="text-sm text-gray-600">
              Last sync: {new Date(lastSync).toLocaleString()}
            </p>
          )}
          
          {syncStatus && (
            <div className={`p-3 rounded text-sm ${
              syncStatus.type === 'success' ? 'bg-green-100 text-green-800' : 
              syncStatus.type === 'error' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {syncStatus.message}
            </div>
          )}
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={flickrUrl}
              onChange={(e) => setFlickrUrl(e.target.value)}
              placeholder="Flickr URL"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
        
        {showForm && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              {selectedPhoto ? 'Edit Photo' : 'Add New Photo'}
            </h2>
            <PhotoForm 
              initialData={selectedPhoto} 
              uniqueCategories={uniqueCategories}
              onSuccess={() => {
                setShowForm(false);
                setSelectedPhoto(null);
                fetchPhotos();
              }}
            />
          </div>
        )}
        
        {isLoading ? (
          <p>Loading photos...</p>
        ) : photos.length > 0 ? (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Add to Album
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {photos.map((photo) => (
                  <tr key={photo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {photo.title || 'Untitled'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {photo.url && (
                        <img 
                          src={photo.url} 
                          alt={photo.title} 
                          className="h-10 w-10 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {photo.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {photo.date_taken ? new Date(photo.date_taken).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {albums.length > 0 && (
                        <select 
                          className="p-1 border rounded"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddToAlbum(photo.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Select album</option>
                          {albums.map(album => (
                            <option key={album.id} value={album.id}>
                              {album.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(photo)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(photo.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No photos found. Add some using the form above or sync with Flickr.</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        <button
          onClick={() => setView('photos')}
          className={`px-4 py-2 ${view === 'photos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Photos
        </button>
        <button
          onClick={() => setView('albums')}
          className={`px-4 py-2 ${view === 'albums' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Albums
        </button>
      </div>
      
      <div className="container mx-auto px-4">
        {view === 'photos' ? renderPhotosView() : renderAlbumsView()}
      </div>
    </div>
  );
}