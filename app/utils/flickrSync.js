// app/utils/flickrSync.js
import { supabase } from './supabase';

export const flickrSync = {
  async getLastSyncDate() {
    const { data, error } = await supabase
      .from('sync_metadata')
      .select('last_sync')
      .eq('sync_type', 'flickr')
      .single();
    
    if (error) {
      console.error('Error fetching last sync date:', error);
      return null;
    }
    
    return data?.last_sync;
  },
  
  async updateLastSyncDate() {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('sync_metadata')
      .update({ last_sync: now })
      .eq('sync_type', 'flickr');
    
    if (error) {
      console.error('Error updating sync date:', error);
    }
    
    return now;
  },
  
  async getExistingPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('url, id')
      .order('date_taken', { ascending: false });
    
    if (error) {
      console.error('Error fetching existing photos:', error);
      return [];
    }
    
    return data || [];
  },
  
  async fetchFlickrPhotos(baseUrl = "https://www.flickr.com/photos/201748906@N08/with/54260070380/") {
    try {
      // This is a server-side function but we're running it in the browser for this example
      // In production, this should be an API route or serverless function
      const response = await fetch('/api/fetch-flickr-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ baseUrl }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Flickr photos: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in fetchFlickrPhotos:', error);
      return [];
    }
  },
  
  async syncPhotos(baseUrl) {
    // 1. Get existing photos from Supabase
    const existingPhotos = await this.getExistingPhotos();
    const existingUrls = new Set(existingPhotos.map(photo => photo.url));
    
    // 2. Fetch photos from Flickr
    const flickrPhotos = await this.fetchFlickrPhotos(baseUrl);
    
    // 3. Filter to only new photos
    const newPhotos = flickrPhotos.filter(photo => !existingUrls.has(photo.url));
    
    // 4. Insert new photos into Supabase
    if (newPhotos.length > 0) {
      const { data, error } = await supabase
        .from('photos')
        .insert(newPhotos);
      
      if (error) {
        console.error('Error inserting new photos:', error);
        return { success: false, error, added: 0 };
      }

      if (data) {
        console.log('Inserted new photos');
      }

    }
    
    // 5. Update sync date
    await this.updateLastSyncDate();
    
    return {
      success: true,
      added: newPhotos.length,
      total: flickrPhotos.length,
      message: `Added ${newPhotos.length} new photos out of ${flickrPhotos.length} from Flickr.`
    };
  }
};