import { NextResponse } from 'next/server';
import { processFlickrPhotos } from '@/app/utils/flickrProcessor';

export async function POST(request) {
  try {
    const { baseUrl } = await request.json();
    
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Missing baseUrl parameter' },
        { status: 400 }
      );
    }

    const photos = await processFlickrPhotos(baseUrl);
    
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error processing Flickr photos:', error);
    return NextResponse.json(
      { error: 'Failed to process Flickr photos' },
      { status: 500 }
    );
  }
}