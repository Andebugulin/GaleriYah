<div style="display: flex; justify-content: center;">
    <img src="GaleriYah.png" alt="Image">
</div>


# GaleriYah

An avant-garde photography portfolio application built with Next.js 13, featuring a dynamic grid layout, smooth transitions, and sophisticated image management capabilities.

##  Tech Stack
t commi
- **Frontend Framework**: Next.js 13
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Typography**: Custom Geist font integration
- **Development**: TypeScript
- **Data Management**: Python scripts for Flickr integration

## 📦 Project Structure

```
.
├── app/
│   ├── album/[id]/       # Dynamic album pages
│   ├── albums/           # Albums overview
│   ├── components/       # Reusable components
│   ├── photo/[id]/       # Individual photo views
│   └── fonts/           # Custom font files
├── public/
│   └── assets/          # Static assets
└── scripts/
    └── parse_pictures_from_flickr.py  # Data import utility
```

##  Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/galeriyah.git
   cd galeriyah
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗃 Database Setup

### Schema Structure

#### Photos Table
```sql
create table photos (
    id uuid default uuid_generate_v4() primary key,
    url text not null,
    title text,
    category text,
    description text,
    date_taken date,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
```

#### Albums Table
```sql
create table albums (
    id uuid default uuid_generate_v4() primary key,
    url text not null,
    title text,
    category text,
    description text,
    date_taken date,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
```

#### Album Photos Junction Table
```sql
create table album_photos (
    id uuid default uuid_generate_v4() primary key,
    album_id uuid references albums(id),
    photo_id uuid references photos(id),
    created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Required Fields
- `id`: UUID, automatically generated
- `url`: Text, must not be null

### Optional Fields
- `title`: Text
- `category`: Text
- `description`: Text
- `date_taken`: Date
- `created_at`: Timestamp with timezone, automatically set


### Admin page
- Admin page is located at `https://galeriyah.netlify.app/admin/photos`, you can get there only by typing the URL directly.
- In the supabase dashboard go to "Authentication" -> add your users that will be able to access the admin page, use strong password.
- In the `https://galeriyah.netlify.app/admin/photos` you will see login screen, in order to login you need to use your Supabase credentials (email and password).
- After login you can add photos and easily manage albums.


## Flickr Integration

Admin page includes a syncranization button that will import photos from Flickr to your Supabase database.
in order to use it you need to set up your Flickr account(its free and you can upload up to 1000 photos) and get your photos URL.
in my case it was: `https://www.flickr.com/photos/201748906@N08/with/54260070380/` its basically the URL of the Photostream that contains all your photos in Flickr.

After that press button `Sync Now` and wait until the process is done, it can take a while depending on how many photos you have in Flickr, for me I have around 52 photos and it took around 3 minutes to import them all, because it is a scrapper.



The project includes a Python script (`parse_pictures_from_flickr.py`) that automates the process of importing photos from Flickr to your Supabase database too.

### Prerequisites
```bash
pip install requests beautifulsoup4
```

### Script Features
- Automated photo data extraction from Flickr
- UUID generation for database compatibility
- Metadata parsing (titles, descriptions, dates)
- CSV export for easy database import
- Rate limiting to respect Flickr's servers

### Usage

1. Configure your Flickr URL in the script:
```python
base_url = "https://www.flickr.com/photos/your_account/"
```

2. Run the parser:
```bash
python parse_pictures_from_flickr.py
```

3. Import the generated CSV to Supabase:
```bash
supabase db import -f flickr_photos_supabase.csv
```

### Data Pipeline Flow
1. Script fetches photos from Flickr
2. Parses metadata and generates UUIDs
3. Exports to CSV format
4. CSV imported to Supabase database
5. Next.js frontend connects to Supabase

### Customization
To modify the default category or add additional fields:

1. Edit the photo details parser:
```python
def parse_photo_details(self, photo_data):
    return {
        'id': str(uuid.uuid4()),
        'url': photo_data['url'],
        'title': self._parse_title(soup),
        'category': 'your_default_category',  # Modify this
        'description': self._parse_description(soup),
        'date_taken': self._parse_date(soup)
    }
```

2. Update the CSV fieldnames if adding new columns:
```python
fieldnames = ['id', 'url', 'title', 'category', 'description', 'date_taken']
```

## Design Philosophy

GaleriYah embraces avant-garde design principles while maintaining usability

- **Minimalist Aesthetics**
- **Dynamic Interactions**
- **Responsive Design**
- **Visual Hierarchy**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.io/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling utilities
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Vercel](https://vercel.com/) for hosting and deployment