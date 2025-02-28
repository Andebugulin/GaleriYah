import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';

// This is a server-side utility to parse Flickr content
export async function processFlickrPhotos(baseUrl) {
  try {
    // Fetch the main page
    const mainResponse = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!mainResponse.ok) {
      throw new Error(`Failed to fetch Flickr page: ${mainResponse.statusText}`);
    }
    
    const mainHtml = await mainResponse.text();
    const mainDom = new JSDOM(mainHtml);
    const document = mainDom.window.document;
    
    // Find all photo elements
    const photoElements = Array.from(document.querySelectorAll('img[src*="staticflickr.com"]'));
    
    // Extract initial photo data
    const photoDataList = photoElements.map(img => {
      const src = img.getAttribute('src');
      const imageUrl = src.startsWith('//') ? `https:${src}` : src;
      
      // Extract photo ID from URL
      const photoIdMatch = imageUrl.match(/\/(\d+)_/);
      if (!photoIdMatch) return null;
      
      const photoId = photoIdMatch[1];
      const photoPageUrl = `https://www.flickr.com/photos/201748906@N08/${photoId}/in/dateposted-public/`;
      
      return {
        photoPageUrl,
        url: imageUrl
      };
    }).filter(Boolean);
    
    // Process each photo to get details
    const processedPhotos = [];
    
    for (const photoData of photoDataList) {
      try {
        // Fetch individual photo page
        const photoResponse = await fetch(photoData.photoPageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!photoResponse.ok) {
          console.warn(`Failed to fetch photo page: ${photoResponse.statusText}`);
          continue;
        }
        
        const photoHtml = await photoResponse.text();
        const photoDom = new JSDOM(photoHtml);
        const photoDoc = photoDom.window.document;
        
        // Parse title
        const titleElem = photoDoc.querySelector('.photo-title');
        const title = titleElem ? titleElem.textContent.trim() : '';
        
        // Parse description
        const descElem = photoDoc.querySelector('.photo-desc');
        const description = descElem ? descElem.textContent.trim() : '';
        
        // Parse date taken
        const dateElem = photoDoc.querySelector('.date-taken-label');
        let dateTaken = null;
        
        if (dateElem) {
          const dateText = dateElem.textContent.trim();
          const dateMatch = dateText.match(/Taken on (.+)/);
          
          if (dateMatch) {
            const dateParts = new Date(dateMatch[1]);
            dateTaken = dateParts.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          }
        }
        
        // Add to processed photos
        processedPhotos.push({
          id: uuidv4(),
          url: photoData.url,
          title,
          category: 'street', // Default category
          description,
          date_taken: dateTaken
        });
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing photo ${photoData.photoPageUrl}:`, error);
      }
    }
    
    return processedPhotos;
  } catch (error) {
    console.error('Error in processFlickrPhotos:', error);
    throw error;
  }
}