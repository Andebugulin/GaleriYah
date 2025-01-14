import requests
from bs4 import BeautifulSoup
from datetime import datetime
import csv
import time
import re
import uuid

class FlickrParser:
    def __init__(self, base_url):
        self.base_url = base_url
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.photos = []

    def get_page_content(self, url):
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None

    def parse_photo_urls(self):
        content = self.get_page_content(self.base_url)
        if not content:
            return []

        soup = BeautifulSoup(content, 'html.parser')
        photo_elements = soup.find_all('img', src=re.compile(r'staticflickr\.com'))
        
        photo_data = []
        for img in photo_elements:
            src = img.get('src')
            if src:
                image_url = f"https:{src}" if src.startswith('//') else src
                photo_id_match = re.search(r'/(\d+)_', image_url)
                if photo_id_match:
                    photo_id = photo_id_match.group(1)
                    photo_page_url = f"https://www.flickr.com/photos/201748906@N08/{photo_id}/in/dateposted-public/"
                    photo_data.append({
                        'photo_page_url': photo_page_url,
                        'url': image_url  # Changed to match Supabase column name
                    })
        
        return photo_data

    def parse_date(self, date_text):
        try:
            date_str = re.search(r'Taken on (.+)', date_text).group(1)
            date_obj = datetime.strptime(date_str, '%B %d, %Y')
            return date_obj.strftime('%Y-%m-%d')  # Format date as YYYY-MM-DD for Supabase
        except (AttributeError, ValueError):
            return None

    def parse_photo_details(self, photo_data):
        content = self.get_page_content(photo_data['photo_page_url'])
        if not content:
            return None

        soup = BeautifulSoup(content, 'html.parser')
        
        # Parse title
        title_elem = soup.find('h1', class_='photo-title')
        title = title_elem.text.strip() if title_elem else ''

        # Parse description
        desc_elem = soup.find('p', class_='photo-desc')
        description = desc_elem.text.strip() if desc_elem else ''

        # Parse date taken
        date_elem = soup.find('span', class_='date-taken-label')
        date_taken = self.parse_date(date_elem.text.strip()) if date_elem else None

        # Create record matching Supabase schema
        return {
            'id': str(uuid.uuid4()),  # Generate UUID for id column
            'url': photo_data['url'],
            'title': title,
            'category': 'street',  # Default category as per your example
            'description': description,
            'date_taken': date_taken
        }

    def parse_all_photos(self):
        photo_data_list = self.parse_photo_urls()
        total_photos = len(photo_data_list)
        
        print(f"Found {total_photos} photos to parse")
        
        for i, photo_data in enumerate(photo_data_list, 1):
            print(f"Parsing photo {i}/{total_photos}: {photo_data['photo_page_url']}")
            details = self.parse_photo_details(photo_data)
            if details:
                self.photos.append(details)
            time.sleep(1)

    def save_to_csv(self, filename='flickr_photos_supabase.csv'):
        if not self.photos:
            print("No photos to save")
            return

        # Match Supabase column names exactly
        fieldnames = ['id', 'url', 'title', 'category', 'description', 'date_taken']
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.photos)
        
        print(f"Saved {len(self.photos)} photos to {filename}")

def main():
    base_url = "https://www.flickr.com/photos/201748906@N08/with/54260070380/"
    parser = FlickrParser(base_url)
    parser.parse_all_photos()
    parser.save_to_csv()

if __name__ == "__main__":
    main()