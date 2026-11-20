"""
WearWise AI - Smart Outfit Advisor
FastAPI Backend with Open-Meteo Weather API, SQLite Wardrobe & History DB,
and Google Gemini Gen AI SDK (gemini-2.5-flash).
"""

import os
import json
import sqlite3
import urllib.parse
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

# Load environment variables explicitly from project directory
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(ENV_PATH)

# Model cascade: Ultra-fast low-latency models first to guarantee quick response times
GEMINI_MODELS_CASCADE = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
]

def generate_gemini_content(client, contents, config=None):
    """
    Call Gemini generate_content with automatic fast fallback across active models.
    """
    last_err = None
    for model_name in GEMINI_MODELS_CASCADE:
        try:
            return client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config
            )
        except Exception as e:
            last_err = e
            print(f"Gemini model {model_name} warning: {e}")
            continue
    raise last_err

def get_genai_client():
    """Dynamically get or initialize Google Gen AI Client using current environment."""
    load_dotenv(ENV_PATH, override=True)
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Warning: Failed to initialize Google GenAI Client: {e}")
        return None

# Base Directories & Database Path
DB_PATH = BASE_DIR / "wearwise.db"
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title="WearWise AI - Smart Outfit Advisor",
    description="AI-powered personalized weather & wardrobe advisor",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Curated Garment Images for Visual Breakdown & Wardrobe
# -------------------------------------------------------------
CATEGORY_DEFAULT_IMAGES = {
    # Tops & Outerwear
    "کاپشن": "/static/uploads/black_jacket_nobg.png",
    "پالتو": "https://images.unsplash.com/photo-1663501427185-cbff9dda9d2a?auto=format&fit=crop&w=400&q=80",
    "بارانی": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80",
    "ترنچ": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80",
    "هودی": "https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=400&q=80",
    "پلیور": "https://images.unsplash.com/photo-1769698005544-48bf7610686d?auto=format&fit=crop&w=400&q=80",
    "بافت": "https://images.unsplash.com/photo-1769698005544-48bf7610686d?auto=format&fit=crop&w=400&q=80",
    "دورس": "https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=400&q=80",
    "سویشرت": "https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=400&q=80",
    "پیراهن": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80",
    "تیشرت": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80",
    "پلوشرت": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80",
    "کت تک": "https://images.unsplash.com/photo-1541888627857-37d0cd590eca?auto=format&fit=crop&w=400&q=80",
    "بلیزر": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80",
    "کت و شلوار": "https://images.unsplash.com/photo-1678492861787-54a2a393190b?auto=format&fit=crop&w=400&q=80",
    "جلیقه": "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=400&q=80",
    "وست": "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=400&q=80",
    
    # Bottoms
    "شلوار جین": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80",
    "شلوار کتان": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80",
    "شلوار پارچه‌ای": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80",
    "شلوار اسلش": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=400&q=80",
    "شلوار": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80",
    "دامن": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=400&q=80",
    "شورت": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=400&q=80",
    
    # Footwear
    "کتانی": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80",
    "کفش ورزشی": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=400&q=80",
    "کفش چرم": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80",
    "کفش مجلسی": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80",
    "بوت": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80",
    "نیم‌بوت": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80",
    "کالج": "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=400&q=80",
    "لوفر": "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=400&q=80",
    "صندل": "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=400&q=80",
    "کفش": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80",
    
    # Accessories
    "شال": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=400&q=80",
    "روسری": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=400&q=80",
    "کلاه بافتنی": "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=400&q=80",
    "کلاه نقاب‌دار": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80",
    "کلاه": "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=400&q=80",
    "دستکش": "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=400&q=80",
    "عینک آفتابی": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80",
    "عینک": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80",
    "ساعت": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80",
    "کمربند": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=400&q=80",
    "کیف": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80",
    "کوله‌پشتی": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80",
    "چتر": "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=400&q=80",
    "اکسسوری": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=400&q=80"
}

def get_garment_image(item_name: str, category: str = "") -> str:
    combined = f"{item_name} {category}".lower()
    for key, url in CATEGORY_DEFAULT_IMAGES.items():
        if key in combined:
            return url
    return "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80"

# -------------------------------------------------------------
# Database Management
# -------------------------------------------------------------
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Wardrobe Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS wardrobe (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            color TEXT NOT NULL,
            season TEXT NOT NULL,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name, category, color)
        );
    """)

    # Ensure image_url column exists
    try:
        cursor.execute("ALTER TABLE wardrobe ADD COLUMN image_url TEXT")
    except Exception:
        pass
    
    # Outfit History & Favorites Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city TEXT NOT NULL,
            weather_summary TEXT,
            reason TEXT,
            umbrella INTEGER DEFAULT 0,
            outfits_json TEXT NOT NULL,
            is_favorite INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Pre-seed initial wardrobe items if table is empty
    cursor.execute("SELECT COUNT(*) FROM wardrobe")
    count = cursor.fetchone()[0]
    if count == 0:
        sample_items = [
            ("تیشرت آستین کوتاه نخی", "تیشرت", "سفید", "تابستان", CATEGORY_DEFAULT_IMAGES["تیشرت"]),
            ("شلوار جین راسته", "شلوار", "آبی کلاسیک", "چهارفصل", CATEGORY_DEFAULT_IMAGES["شلوار"]),
            ("هودی پنبه‌ای کلاه‌دار", "هودی", "طوسی تیره", "پاییز", CATEGORY_DEFAULT_IMAGES["هودی"]),
            ("کاپشن بادی مشکی کلاه‌دار", "کاپشن", "مشکی", "زمستان", "/static/uploads/black_jacket_nobg.png"),
            ("پیراهن کتان آکسفورد", "پیراهن", "سرمه‌ای", "چهارفصل", CATEGORY_DEFAULT_IMAGES["پیراهن"]),
            ("کتانی ورزشی تنفس‌پذیر", "کفش", "سفید و طوسی", "چهارفصل", CATEGORY_DEFAULT_IMAGES["کتانی"]),
            ("شلوار کتان رسمی", "شلوار", "کرم خاکی", "چهارفصل", CATEGORY_DEFAULT_IMAGES["شلوار"]),
            ("پالتو پشمی شیک", "پالتو", "شکلاتی", "پاییز و زمستان", CATEGORY_DEFAULT_IMAGES["پالتو"]),
            ("بارانی ضدآب سبک", "بارانی", "سرمه‌ای", "پاییز و بهار", CATEGORY_DEFAULT_IMAGES["بارانی"]),
            ("شال‌گردن بافتنی", "اکسسوری", "کرم", "زمستان", CATEGORY_DEFAULT_IMAGES["شال"])
        ]
        cursor.executemany(
            "INSERT OR IGNORE INTO wardrobe (name, category, color, season, image_url) VALUES (?, ?, ?, ?, ?)",
            sample_items
        )

    # Populate any missing image_url in existing rows
    cursor.execute("SELECT id, name, category, color, image_url FROM wardrobe WHERE image_url IS NULL OR image_url = ''")
    empty_img_rows = cursor.fetchall()
    for row in empty_img_rows:
        img = get_garment_image(row["name"], row["category"])
        cursor.execute("UPDATE wardrobe SET image_url = ? WHERE id = ?", (img, row["id"]))
    
    # User Profile Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            gender TEXT DEFAULT 'unisex',
            age_group TEXT DEFAULT 'young_adult',
            fit_pref TEXT DEFAULT 'regular',
            temp_sensitivity TEXT DEFAULT 'normal',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("INSERT OR IGNORE INTO user_profile (id, gender, age_group, fit_pref, temp_sensitivity) VALUES (1, 'unisex', 'young_adult', 'regular', 'normal')")

    # Cloud Sync Table for cross-device sync
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cloud_sync (
            sync_id TEXT PRIMARY KEY,
            data_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.commit()
    conn.close()

# Initialize DB on module load
init_db()

# -------------------------------------------------------------
# WMO Weather Codes & Descriptions
# -------------------------------------------------------------
WMO_CODES = {
    0: ("آفتابی و صاف", "sunny", "☀️"),
    1: ("عمدتاً صاف و ملایم", "mostly_sunny", "🌤️"),
    2: ("نیمه‌ابری", "partly_cloudy", "⛅"),
    3: ("تمام‌ابری و گرفته", "overcast", "☁️"),
    45: ("مه‌آلود", "foggy", "🌫️"),
    48: ("مه غلیظ و منجمد", "freezing_fog", "🌫️"),
    51: ("نم‌نم باران ملایم", "drizzle", "🌦️"),
    53: ("باران ملایم پراکنده", "drizzle", "🌦️"),
    55: ("باران ریز متراکم", "drizzle", "🌧️"),
    56: ("نم‌نم باران یخ‌زننده", "freezing_drizzle", "🌧️"),
    57: ("باران یخی مداوم", "freezing_drizzle", "🌧️"),
    61: ("باران سبک و یکنواخت", "light_rain", "🌧️"),
    63: ("بارش باران متوسط", "moderate_rain", "🌧️"),
    65: ("بارش شدید باران", "heavy_rain", "🌧️"),
    66: ("باران منجمد سبک", "freezing_rain", "❄️🌧️"),
    67: ("باران منجمد سنگین", "freezing_rain", "❄️🌧️"),
    71: ("بارش خفیف برف", "light_snow", "🌨️"),
    73: ("بارش ملایم برف", "moderate_snow", "🌨️"),
    75: ("بارش سنگین برف", "heavy_snow", "❄️"),
    77: ("دانه‌های ریز برف", "snow_grains", "❄️"),
    80: ("رگبار پراکنده باران", "rain_showers", "🌦️"),
    81: ("رگبار باران متوسط", "rain_showers", "🌧️"),
    82: ("رگبار شدید و سیل‌آسا", "violent_rain_showers", "⛈️"),
    85: ("رگبار پراکنده برف", "snow_showers", "🌨️"),
    86: ("رگبار سنگین برف", "heavy_snow_showers", "❄️"),
    95: ("رعد و برق همراه با باران", "thunderstorm", "⛈️"),
    96: ("طوفان همراه با تگرگ سبک", "thunderstorm_hail", "⛈️"),
    99: ("طوفان شدید همراه با تگرگ درشت", "severe_thunderstorm", "⛈️"),
}

def decode_weather(code: int):
    return WMO_CODES.get(code, ("هوای متغیر", "partly_cloudy", "⛅"))

# -------------------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------------------
class WardrobeItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    category: Optional[str] = "سایر"
    color: Optional[str] = "متناسب"
    season: Optional[str] = "چهارفصل"
    image_url: Optional[str] = None

class BulkWardrobeCreate(BaseModel):
    items: List[WardrobeItemCreate]

class OutfitItem(BaseModel):
    name: str
    items: List[str]
    from_wardrobe: List[str] = Field(default_factory=list)
    general_suggestions: List[str] = Field(default_factory=list)
    time_of_day: str
    why: str
    image_query: str

class RecommendationOutput(BaseModel):
    summary: str
    reason: str
    umbrella: bool
    outfits: List[OutfitItem]

class UserProfileModel(BaseModel):
    gender: str = "unisex"  # male, female, unisex
    age_group: str = "young_adult"  # teen, young_adult, adult, senior
    fit_pref: str = "regular"  # slim, regular, oversized
    temp_sensitivity: str = "normal"  # cold_sensitive, normal, warm_sensitive

class RecommendationRequest(BaseModel):
    weather: Dict[str, Any]
    style: str = "Mixed"  # Mixed, Casual, Sport, Formal
    use_wardrobe: bool = True
    city: str = "تهران"
    destination: Optional[str] = "محل کار / اداری"
    gender: Optional[str] = "unisex"
    age_group: Optional[str] = "young_adult"
    fit_pref: Optional[str] = "regular"
    temp_sensitivity: Optional[str] = "normal"
    language: Optional[str] = "fa"
    variation_seed: Optional[int] = None

# -------------------------------------------------------------
# City Search & Autocomplete (Persian & English)
# -------------------------------------------------------------
POPULAR_CITIES = [
    {
        "name": "تهران",
        "name_en": "Tehran",
        "country": "ایران",
        "admin1": "استان تهران",
        "latitude": 35.69439,
        "longitude": 51.42151
    },
    {
        "name": "مشهد",
        "name_en": "Mashhad",
        "country": "ایران",
        "admin1": "خراسان رضوی",
        "latitude": 36.297,
        "longitude": 59.6062
    },
    {
        "name": "اصفهان",
        "name_en": "Isfahan",
        "country": "ایران",
        "admin1": "اصفهان",
        "latitude": 32.6546,
        "longitude": 51.668
    },
    {
        "name": "شیراز",
        "name_en": "Shiraz",
        "country": "ایران",
        "admin1": "فارس",
        "latitude": 29.5918,
        "longitude": 52.5837
    },
    {
        "name": "تبریز",
        "name_en": "Tabriz",
        "country": "ایران",
        "admin1": "آذربایجان شرقی",
        "latitude": 38.08,
        "longitude": 46.2919
    },
    {
        "name": "کرج",
        "name_en": "Karaj",
        "country": "ایران",
        "admin1": "البرز",
        "latitude": 35.8327,
        "longitude": 50.9915
    },
    {
        "name": "رشت",
        "name_en": "Rasht",
        "country": "ایران",
        "admin1": "گیلان",
        "latitude": 37.2808,
        "longitude": 49.5832
    },
    {
        "name": "اهواز",
        "name_en": "Ahvaz",
        "country": "ایران",
        "admin1": "خوزستان",
        "latitude": 31.3183,
        "longitude": 48.6706
    },
    {
        "name": "قم",
        "name_en": "Qom",
        "country": "ایران",
        "admin1": "قم",
        "latitude": 34.6401,
        "longitude": 50.8764
    },
    {
        "name": "کرمانشاه",
        "name_en": "Kermanshah",
        "country": "ایران",
        "admin1": "کرمانشاه",
        "latitude": 34.3142,
        "longitude": 47.065
    },
    {
        "name": "ارومیه",
        "name_en": "Urmia",
        "country": "ایران",
        "admin1": "آذربایجان غربی",
        "latitude": 37.5527,
        "longitude": 45.0761
    },
    {
        "name": "یزد",
        "name_en": "Yazd",
        "country": "ایران",
        "admin1": "یزد",
        "latitude": 31.8974,
        "longitude": 54.3569
    },
    {
        "name": "زاهدان",
        "name_en": "Zahedan",
        "country": "ایران",
        "admin1": "سیستان و بلوچستان",
        "latitude": 29.4963,
        "longitude": 60.8629
    },
    {
        "name": "همدان",
        "name_en": "Hamadan",
        "country": "ایران",
        "admin1": "همدان",
        "latitude": 34.7989,
        "longitude": 48.515
    },
    {
        "name": "کرمان",
        "name_en": "Kerman",
        "country": "ایران",
        "admin1": "کرمان",
        "latitude": 30.2839,
        "longitude": 57.0788
    },
    {
        "name": "اردبیل",
        "name_en": "Ardabil",
        "country": "ایران",
        "admin1": "اردبیل",
        "latitude": 38.2498,
        "longitude": 48.2933
    },
    {
        "name": "بندرعباس",
        "name_en": "Bandar Abbas",
        "country": "ایران",
        "admin1": "هرمزگان",
        "latitude": 27.1832,
        "longitude": 56.2666
    },
    {
        "name": "اراک",
        "name_en": "Arak",
        "country": "ایران",
        "admin1": "مرکزی",
        "latitude": 34.0917,
        "longitude": 49.6892
    },
    {
        "name": "زنجان",
        "name_en": "Zanjan",
        "country": "ایران",
        "admin1": "زنجان",
        "latitude": 36.6736,
        "longitude": 48.4787
    },
    {
        "name": "سنندج",
        "name_en": "Sanandaj",
        "country": "ایران",
        "admin1": "کردستان",
        "latitude": 35.3219,
        "longitude": 46.9862
    },
    {
        "name": "قزوین",
        "name_en": "Qazvin",
        "country": "ایران",
        "admin1": "قزوین",
        "latitude": 36.2688,
        "longitude": 50.0041
    },
    {
        "name": "خرم‌آباد",
        "name_en": "Khorramabad",
        "country": "ایران",
        "admin1": "لرستان",
        "latitude": 33.4878,
        "longitude": 48.3558
    },
    {
        "name": "گرگان",
        "name_en": "Gorgan",
        "country": "ایران",
        "admin1": "گلستان",
        "latitude": 36.8427,
        "longitude": 54.4439
    },
    {
        "name": "ساری",
        "name_en": "Sari",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.5633,
        "longitude": 53.0601
    },
    {
        "name": "بجنورد",
        "name_en": "Bojnurd",
        "country": "ایران",
        "admin1": "خراسان شمالی",
        "latitude": 37.4747,
        "longitude": 57.329
    },
    {
        "name": "بوشهر",
        "name_en": "Bushehr",
        "country": "ایران",
        "admin1": "بوشهر",
        "latitude": 28.9234,
        "longitude": 50.8203
    },
    {
        "name": "بیرجند",
        "name_en": "Birjand",
        "country": "ایران",
        "admin1": "خراسان جنوبی",
        "latitude": 32.8663,
        "longitude": 59.2211
    },
    {
        "name": "ایلام",
        "name_en": "Ilam",
        "country": "ایران",
        "admin1": "ایلام",
        "latitude": 33.6374,
        "longitude": 46.4227
    },
    {
        "name": "شهرکرد",
        "name_en": "Shahrekord",
        "country": "ایران",
        "admin1": "چهارمحال و بختیاری",
        "latitude": 32.3256,
        "longitude": 50.8644
    },
    {
        "name": "سمنان",
        "name_en": "Semnan",
        "country": "ایران",
        "admin1": "سمنان",
        "latitude": 35.5769,
        "longitude": 53.397
    },
    {
        "name": "یاسوج",
        "name_en": "Yasuj",
        "country": "ایران",
        "admin1": "کهگیلویه و بویراحمد",
        "latitude": 30.6684,
        "longitude": 51.5876
    },
    {
        "name": "کیش",
        "name_en": "Kish",
        "country": "ایران",
        "admin1": "هرمزگان",
        "latitude": 26.5578,
        "longitude": 54.0194
    },
    {
        "name": "قشم",
        "name_en": "Qeshm",
        "country": "ایران",
        "admin1": "هرمزگان",
        "latitude": 26.9581,
        "longitude": 56.2719
    },
    {
        "name": "کاشان",
        "name_en": "Kashan",
        "country": "ایران",
        "admin1": "اصفهان",
        "latitude": 33.985,
        "longitude": 51.41
    },
    {
        "name": "نیشابور",
        "name_en": "Neyshabur",
        "country": "ایران",
        "admin1": "خراسان رضوی",
        "latitude": 36.2133,
        "longitude": 58.7958
    },
    {
        "name": "بابل",
        "name_en": "Babol",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.5513,
        "longitude": 52.6789
    },
    {
        "name": "آمل",
        "name_en": "Amol",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.4696,
        "longitude": 52.3507
    },
    {
        "name": "لاهیجان",
        "name_en": "Lahijan",
        "country": "ایران",
        "admin1": "گیلان",
        "latitude": 37.207,
        "longitude": 50.0034
    },
    {
        "name": "انزلی",
        "name_en": "Bandar Anzali",
        "country": "ایران",
        "admin1": "گیلان",
        "latitude": 37.4747,
        "longitude": 49.4622
    },
    {
        "name": "چالوس",
        "name_en": "Chaloos",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.655,
        "longitude": 51.4204
    },
    {
        "name": "رامسر",
        "name_en": "Ramsar",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.9174,
        "longitude": 50.6681
    },
    {
        "name": "نوشهر",
        "name_en": "Nowshahr",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.6496,
        "longitude": 51.496
    },
    {
        "name": "آستارا",
        "name_en": "Astara",
        "country": "ایران",
        "admin1": "گیلان",
        "latitude": 38.4294,
        "longitude": 48.8719
    },
    {
        "name": "آبادان",
        "name_en": "Abadan",
        "country": "ایران",
        "admin1": "خوزستان",
        "latitude": 30.3392,
        "longitude": 48.3043
    },
    {
        "name": "دزفول",
        "name_en": "Dezful",
        "country": "ایران",
        "admin1": "خوزستان",
        "latitude": 32.3811,
        "longitude": 48.4058
    },
    {
        "name": "بروجرد",
        "name_en": "Borujerd",
        "country": "ایران",
        "admin1": "لرستان",
        "latitude": 33.8973,
        "longitude": 48.7516
    },
    {
        "name": "ساوه",
        "name_en": "Saveh",
        "country": "ایران",
        "admin1": "مرکزی",
        "latitude": 35.0213,
        "longitude": 50.3566
    },
    {
        "name": "شاهرود",
        "name_en": "Shahroud",
        "country": "ایران",
        "admin1": "سمنان",
        "latitude": 36.4182,
        "longitude": 54.9763
    },
    {
        "name": "سبزوار",
        "name_en": "Sabzevar",
        "country": "ایران",
        "admin1": "خراسان رضوی",
        "latitude": 36.2126,
        "longitude": 57.6789
    },
    {
        "name": "مراغه",
        "name_en": "Maragheh",
        "country": "ایران",
        "admin1": "آذربایجان شرقی",
        "latitude": 37.3917,
        "longitude": 46.2392
    },
    {
        "name": "مهاباد",
        "name_en": "Mahabad",
        "country": "ایران",
        "admin1": "آذربایجان غربی",
        "latitude": 36.7631,
        "longitude": 45.7222
    },
    {
        "name": "خوی",
        "name_en": "Khoy",
        "country": "ایران",
        "admin1": "آذربایجان غربی",
        "latitude": 38.5503,
        "longitude": 44.9525
    },
    {
        "name": "رفسنجان",
        "name_en": "Rafsanjan",
        "country": "ایران",
        "admin1": "کرمان",
        "latitude": 30.4067,
        "longitude": 55.9939
    },
    {
        "name": "سیرجان",
        "name_en": "Sirjan",
        "country": "ایران",
        "admin1": "کرمان",
        "latitude": 29.452,
        "longitude": 55.6814
    },
    {
        "name": "چابهار",
        "name_en": "Chabahar",
        "country": "ایران",
        "admin1": "سیستان و بلوچستان",
        "latitude": 25.2919,
        "longitude": 60.643
    },
    {
        "name": "سقز",
        "name_en": "Saqqez",
        "country": "ایران",
        "admin1": "کردستان",
        "latitude": 36.2499,
        "longitude": 46.2733
    },
    {
        "name": "مریوان",
        "name_en": "Marivan",
        "country": "ایران",
        "admin1": "کردستان",
        "latitude": 35.5269,
        "longitude": 46.176
    },
    {
        "name": "بانه",
        "name_en": "Baneh",
        "country": "ایران",
        "admin1": "کردستان",
        "latitude": 35.9975,
        "longitude": 45.8853
    },
    {
        "name": "بوکان",
        "name_en": "Bukan",
        "country": "ایران",
        "admin1": "آذربایجان غربی",
        "latitude": 36.5208,
        "longitude": 46.2089
    },
    {
        "name": "تنکابن",
        "name_en": "Tonekabon",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.8163,
        "longitude": 50.8738
    },
    {
        "name": "قائم‌شهر",
        "name_en": "Qaem Shahr",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.4639,
        "longitude": 52.8597
    },
    {
        "name": "بابلسر",
        "name_en": "Babolsar",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.7024,
        "longitude": 52.6578
    },
    {
        "name": "گنبد کاووس",
        "name_en": "Gonbad-e Kavus",
        "country": "ایران",
        "admin1": "گلستان",
        "latitude": 37.25,
        "longitude": 55.1672
    },
    {
        "name": "لنگرود",
        "name_en": "Langerud",
        "country": "ایران",
        "admin1": "گیلان",
        "latitude": 37.197,
        "longitude": 50.1536
    },
    {
        "name": "دماوند",
        "name_en": "Damavand",
        "country": "ایران",
        "admin1": "تهران",
        "latitude": 35.7178,
        "longitude": 52.065
    },
    {
        "name": "شهریار",
        "name_en": "Shahriar",
        "country": "ایران",
        "admin1": "تهران",
        "latitude": 35.6597,
        "longitude": 51.0592
    },
    {
        "name": "اسلامشهر",
        "name_en": "Eslamshahr",
        "country": "ایران",
        "admin1": "تهران",
        "latitude": 35.5392,
        "longitude": 51.2349
    },
    {
        "name": "ورامین",
        "name_en": "Varamin",
        "country": "ایران",
        "admin1": "تهران",
        "latitude": 35.3242,
        "longitude": 51.6464
    },
    {
        "name": "نجف‌آباد",
        "name_en": "Najafabad",
        "country": "ایران",
        "admin1": "اصفهان",
        "latitude": 32.6341,
        "longitude": 51.3667
    },
    {
        "name": "شاهین‌شهر",
        "name_en": "Shahin Shahr",
        "country": "ایران",
        "admin1": "اصفهان",
        "latitude": 32.8647,
        "longitude": 51.5475
    },
    {
        "name": "استانبول",
        "name_en": "Istanbul",
        "country": "ترکیه",
        "admin1": "استانبول",
        "latitude": 41.0082,
        "longitude": 28.9784
    },
    {
        "name": "دبی",
        "name_en": "Dubai",
        "country": "امارات",
        "admin1": "دبی",
        "latitude": 25.2048,
        "longitude": 55.2708
    },
    {
        "name": "باکو",
        "name_en": "Baku",
        "country": "جمهوری آذربایجان",
        "admin1": "باکو",
        "latitude": 40.4093,
        "longitude": 49.8671
    },
    {
        "name": "تفلیس",
        "name_en": "Tbilisi",
        "country": "گرجستان",
        "admin1": "تفلیس",
        "latitude": 41.7151,
        "longitude": 44.8271
    },
    {
        "name": "ایروان",
        "name_en": "Yerevan",
        "country": "ارمنستان",
        "admin1": "ایروان",
        "latitude": 40.1792,
        "longitude": 44.4991
    },
    {
        "name": "لندن",
        "name_en": "London",
        "country": "بریتانیا",
        "admin1": "انگلستان",
        "latitude": 51.5074,
        "longitude": -0.1278
    },
    {
        "name": "پاریس",
        "name_en": "Paris",
        "country": "فرانسه",
        "admin1": "ایل-دو-فرانس",
        "latitude": 48.8566,
        "longitude": 2.3522
    },
    {
        "name": "نیویورک",
        "name_en": "New York",
        "country": "آمریکا",
        "admin1": "نیویورک",
        "latitude": 40.7128,
        "longitude": -74.006
    },
    {
        "name": "تورنتو",
        "name_en": "Toronto",
        "country": "کانادا",
        "admin1": "انتاریو",
        "latitude": 43.6532,
        "longitude": -79.3832
    },
    {
        "name": "برلین",
        "name_en": "Berlin",
        "country": "آلمان",
        "admin1": "برلین",
        "latitude": 52.52,
        "longitude": 13.405
    }
]

def normalize_persian_py(text: str) -> str:
    if not text:
        return ""
    t = text.strip().lower()
    t = re.sub(r"[​‌‍﻿]", "", t)
    t = t.replace("ي", "ی").replace("ك", "ک").replace("آ", "ا").replace("أ", "ا").replace("إ", "ا")
    t = t.replace("ة", "ه").replace("ؤ", "و")
    t = re.sub(r"[ً-ٟ]", "", t)
    return re.sub(r"\s+", " ", t)

@app.get("/api/cities")
def search_cities(q: Optional[str] = Query(None)):
    """
    Search cities in Persian and English with autocomplete list.
    Supports queries like 'تهران', 'Tehran', 'Isfahan', 'اصفهان', 'Dubai', etc.
    """
    query = (q or "").strip()
    if not query:
        return POPULAR_CITIES[:8]

    q_norm = normalize_persian_py(query)
    q_lower = query.lower()
    matches = []

    # 1. Match local curated cities with Persian normalization
    for c in POPULAR_CITIES:
        c_norm_name = normalize_persian_py(c["name"])
        c_norm_admin = normalize_persian_py(c.get("admin1", ""))
        c_norm_country = normalize_persian_py(c.get("country", ""))
        en_name = c["name_en"].lower()
        if (q_norm in c_norm_name or 
            c_norm_name in q_norm or
            q_lower in en_name or 
            q_norm in c_norm_admin or
            q_norm in c_norm_country):
            matches.append(c)

    # 2. Query Open-Meteo Geocoding in Persian (&language=fa)
    try:
        with httpx.Client(timeout=3.5) as client:
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(query)}&count=10&language=fa&format=json"
            res = client.get(geo_url)
            if res.status_code == 200:
                data = res.json()
                for r in data.get("results", []):
                    lat = r.get("latitude")
                    lon = r.get("longitude")
                    if lat is None or lon is None:
                        continue
                    # Avoid duplicates
                    if not any(abs(m["latitude"] - lat) < 0.05 and abs(m["longitude"] - lon) < 0.05 for m in matches):
                        name = r.get("name", query)
                        country = r.get("country", "")
                        admin1 = r.get("admin1", "")
                        matches.append({
                            "name": name,
                            "name_en": name,
                            "country": country,
                            "admin1": admin1,
                            "latitude": lat,
                            "longitude": lon
                        })
    except Exception as e:
        print(f"Geocoding error for query '{query}': {e}")

    return matches[:10]

def find_nearest_city(lat: float, lon: float) -> Optional[dict]:
    """Find closest city from curated list within ~50km."""
    closest = None
    min_dist = float("inf")
    for c in POPULAR_CITIES:
        dist = (c["latitude"] - lat)**2 + (c["longitude"] - lon)**2
        if dist < min_dist:
            min_dist = dist
            closest = c
    if min_dist < 0.35:
        return closest
    return None

# -------------------------------------------------------------
# User Profile Endpoints
# -------------------------------------------------------------
@app.get("/api/profile")
def get_user_profile():
    """Retrieve user profile (gender, age_group, fit_pref, temp_sensitivity)."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT gender, age_group, fit_pref, temp_sensitivity FROM user_profile WHERE id = 1")
    row = c.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {"gender": "unisex", "age_group": "young_adult", "fit_pref": "regular", "temp_sensitivity": "normal"}

@app.post("/api/profile")
def update_user_profile(profile: UserProfileModel):
    """Save user profile to database."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("""
        UPDATE user_profile 
        SET gender = ?, age_group = ?, fit_pref = ?, temp_sensitivity = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
    """, (profile.gender, profile.age_group, profile.fit_pref, profile.temp_sensitivity))
    conn.commit()
    conn.close()
    return {"success": True, "message": "پروفایل با موفقیت به‌روزرسانی شد."}

# -------------------------------------------------------------
# Location Auto-Detection Endpoint
# -------------------------------------------------------------
@app.get("/api/weather/detect-location")
def detect_location(request: Request):
    """Auto-detect location from IP or nearest local node."""
    try:
        with httpx.Client(timeout=3.5) as client:
            res = client.get("http://ip-api.com/json/?fields=status,country,city,lat,lon")
            if res.status_code == 200:
                data = res.json()
                if data.get("status") == "success":
                    lat = data.get("lat")
                    lon = data.get("lon")
                    city = data.get("city")
                    country = data.get("country")
                    nearest = find_nearest_city(lat, lon)
                    name_fa = nearest["name"] if nearest else city
                    return {
                        "success": True,
                        "city": name_fa,
                        "city_en": city,
                        "country": country,
                        "latitude": lat,
                        "longitude": lon
                    }
    except Exception as e:
        print(f"IP Geolocation error: {e}")
        
    return {
        "success": True,
        "city": "تهران",
        "city_en": "Tehran",
        "country": "ایران",
        "latitude": 35.69439,
        "longitude": 51.42151
    }

# -------------------------------------------------------------
# Weather Endpoints (Open-Meteo)
# -------------------------------------------------------------
@app.get("/api/weather")
def get_weather(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    city: Optional[str] = None
):
    """
    Fetch comprehensive weather data from Open-Meteo including current conditions
    and hourly progression (Morning, Afternoon, Evening, Night).
    """
    with httpx.Client(timeout=10.0) as http_client:
        target_lat = lat
        target_lon = lon
        city_display_name = city or "تهران"

        # If lat and lon provided without city name, reverse match to nearest known city
        if target_lat is not None and target_lon is not None and not city:
            nearest = find_nearest_city(target_lat, target_lon)
            if nearest:
                city_display_name = nearest["name"]

        # If city provided or lat/lon missing, geocode city
        if (target_lat is None or target_lon is None) and city:
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(city)}&count=1&language=fa&format=json"
            geo_res = http_client.get(geo_url)
            if geo_res.status_code == 200:
                geo_data = geo_res.json()
                if geo_data.get("results"):
                    result = geo_data["results"][0]
                    target_lat = result["latitude"]
                    target_lon = result["longitude"]
                    city_display_name = result.get("name", city)

        # Fallback coordinates (Tehran)
        if target_lat is None or target_lon is None:
            target_lat = 35.6892
            target_lon = 51.3890
            city_display_name = city or "تهران"

        # Fetch Open-Meteo Forecast
        forecast_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={target_lat}&longitude={target_lon}&"
            f"current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&"
            f"hourly=temperature_2m,precipitation_probability,weather_code&"
            f"timezone=auto"
        )
        
        try:
            forecast_res = http_client.get(forecast_url)
            if forecast_res.status_code != 200:
                print(f"Open-Meteo returned status {forecast_res.status_code}: {forecast_res.text}")
                raise HTTPException(status_code=502, detail=f"خطا در دریافت اطلاعات آب‌وهوا از Open-Meteo: {forecast_res.text}")
            weather_data = forecast_res.json()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"خطای ارتباط با سرور هواشناسی: {str(e)}")

        current = weather_data.get("current", {})
        hourly = weather_data.get("hourly", {})

        current_code = current.get("weather_code", 0)
        desc, slug, icon = decode_weather(current_code)

        # Parse Hourly Progression: Morning (08:00), Afternoon (14:00), Evening (20:00), Night (23:00)
        hourly_times = hourly.get("time", [])
        hourly_temps = hourly.get("temperature_2m", [])
        hourly_precip = hourly.get("precipitation_probability", [])
        hourly_codes = hourly.get("weather_code", [])

        periods = {
            "morning": {"title": "صبح (۰۸:۰۰)", "hour": 8, "temp": None, "precip": 0, "desc": "صاف", "icon": "☀️"},
            "afternoon": {"title": "ظهر (۱۴:۰۰)", "hour": 14, "temp": None, "precip": 0, "desc": "صاف", "icon": "☀️"},
            "evening": {"title": "عصر (۲۰:۰۰)", "hour": 20, "temp": None, "precip": 0, "desc": "صاف", "icon": "🌤️"},
            "night": {"title": "شب (۲۳:۰۰)", "hour": 23, "temp": None, "precip": 0, "desc": "صاف", "icon": "🌙"},
        }

        # Match closest hours from today's forecast
        for i, t_str in enumerate(hourly_times[:24]):
            try:
                dt = datetime.fromisoformat(t_str)
                h = dt.hour
                for p_key, p_val in periods.items():
                    if h == p_val["hour"] and p_val["temp"] is None and i < len(hourly_temps):
                        p_val["temp"] = round(hourly_temps[i], 1)
                        p_val["precip"] = hourly_precip[i] if i < len(hourly_precip) else 0
                        p_code = hourly_codes[i] if i < len(hourly_codes) else 0
                        p_desc, _, p_icon = decode_weather(p_code)
                        p_val["desc"] = p_desc
                        p_val["icon"] = p_icon
            except Exception:
                continue

        # Fill any missing periods with fallback estimation
        curr_temp = round(current.get("temperature_2m", 20.0), 1)
        for p_key, p_val in periods.items():
            if p_val["temp"] is None:
                offset = {"morning": -2, "afternoon": 3, "evening": -1, "night": -4}.get(p_key, 0)
                p_val["temp"] = round(curr_temp + offset, 1)
                p_val["desc"] = desc
                p_val["icon"] = icon

        # Overall Day Trends
        first_24_temps = hourly_temps[:24] if hourly_temps else [curr_temp]
        first_24_precips = hourly_precip[:24] if hourly_precip else [0]
        max_temp = round(max(first_24_temps), 1)
        min_temp = round(min(first_24_temps), 1)
        max_precip_chance = max(first_24_precips) if first_24_precips else 0
        will_rain = (current.get("precipitation", 0) > 0.1) or (max_precip_chance >= 35)

        return {
            "city": city_display_name,
            "latitude": target_lat,
            "longitude": target_lon,
            "current": {
                "temperature": curr_temp,
                "apparent_temperature": round(current.get("apparent_temperature", curr_temp), 1),
                "humidity": current.get("relative_humidity_2m", 45),
                "wind_speed": round(current.get("wind_speed_10m", 5.0), 1),
                "precipitation": current.get("precipitation", 0.0),
                "weather_code": current_code,
                "description": desc,
                "icon": icon,
                "slug": slug,
            },
            "day_summary": {
                "max_temp": max_temp,
                "min_temp": min_temp,
                "temp_difference": round(max_temp - min_temp, 1),
                "max_precip_chance": max_precip_chance,
                "rain_alert": will_rain,
            },
            "timeline": list(periods.values())
        }

# -------------------------------------------------------------
# Wardrobe Management Endpoints (SQLite + Gemini Vision)
# -------------------------------------------------------------
@app.get("/api/wardrobe")
def list_wardrobe():
    """Retrieve all wardrobe items with images."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, category, color, season, image_url, created_at FROM wardrobe ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/wardrobe")
def add_wardrobe_item(item: WardrobeItemCreate):
    """Add a clothing item to the wardrobe with preview image and duplicate update."""
    conn = get_db_connection()
    cursor = conn.cursor()
    name = (item.name or "لباس جدید").strip()
    category = (item.category or "سایر").strip()
    color = (item.color or "متناسب").strip()
    season = (item.season or "چهارفصل").strip()
    img_url = item.image_url or get_garment_image(name, category)
    try:
        cursor.execute(
            "INSERT INTO wardrobe (name, category, color, season, image_url) VALUES (?, ?, ?, ?, ?)",
            (name, category, color, season, img_url)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return {
            "id": new_id,
            "name": name,
            "category": category,
            "color": color,
            "season": season,
            "image_url": img_url,
            "message": "آیتم با موفقیت به کمد شما افزوده شد."
        }
    except sqlite3.IntegrityError:
        cursor.execute(
            "UPDATE wardrobe SET image_url = ?, season = ? WHERE name = ? AND category = ? AND color = ?",
            (img_url, season, name, category, color)
        )
        cursor.execute("SELECT id FROM wardrobe WHERE name = ? AND category = ? AND color = ?", (name, category, color))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return {
            "id": row[0] if row else None,
            "name": name,
            "category": category,
            "color": color,
            "season": season,
            "image_url": img_url,
            "message": "این لباس در کمد شما موجود بود و تصویر آن به‌روزرسانی شد."
        }

@app.post("/api/wardrobe/bulk")
def add_wardrobe_items_bulk(payload: BulkWardrobeCreate):
    """Add multiple clothing items to the wardrobe in a single transaction."""
    if not payload.items:
        raise HTTPException(status_code=400, detail="لیست آیتم‌ها خالی است.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    added_items = []
    updated_items = []

    for item in payload.items:
        name = (item.name or "لباس جدید").strip()
        cat = (item.category or "سایر").strip()
        color = (item.color or "متناسب").strip()
        season = (item.season or "چهارفصل").strip()
        img_url = item.image_url or get_garment_image(name, cat)

        try:
            cursor.execute(
                "INSERT INTO wardrobe (name, category, color, season, image_url) VALUES (?, ?, ?, ?, ?)",
                (name, cat, color, season, img_url)
            )
            new_id = cursor.lastrowid
            added_items.append({
                "id": new_id,
                "name": name,
                "category": cat,
                "color": color,
                "season": season,
                "image_url": img_url
            })
        except sqlite3.IntegrityError:
            cursor.execute(
                "UPDATE wardrobe SET image_url = ?, season = ? WHERE name = ? AND category = ? AND color = ?",
                (img_url, season, name, cat, color)
            )
            cursor.execute("SELECT id FROM wardrobe WHERE name = ? AND category = ? AND color = ?", (name, cat, color))
            row = cursor.fetchone()
            if row:
                updated_items.append({
                    "id": row[0],
                    "name": name,
                    "category": cat,
                    "color": color,
                    "season": season,
                    "image_url": img_url,
                    "is_updated": True
                })

    conn.commit()
    conn.close()

    total_count = len(added_items) + len(updated_items)
    return {
        "success": True,
        "added_count": len(added_items),
        "updated_count": len(updated_items),
        "items": added_items + updated_items,
        "message": f"{total_count} لباس با موفقیت در کمد شخصی شما ذخیره شد."
    }

def analyze_image_heuristics(image_bytes: bytes, filename: str = "") -> Dict[str, str]:
    """
    Intelligent image analysis combining filename keywords, image aspect ratio,
    and dominant color extraction from pixels.
    """
    try:
        from PIL import Image
        import io
        import numpy as np

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = img.size
        ratio = h / max(1, w)

        # 1. Sample center region for true garment color
        center = img.crop((int(w * 0.2), int(h * 0.2), int(w * 0.8), int(h * 0.8)))
        arr = np.array(center)
        mean_rgb = arr.mean(axis=(0, 1))
        r, g, b = float(mean_rgb[0]), float(mean_rgb[1]), float(mean_rgb[2])
        brightness = (r * 299 + g * 587 + b * 114) / 1000

        # Dominant Color Detection
        if brightness < 60:
            color = "مشکی"
        elif brightness > 210:
            color = "سفید"
        elif abs(r - g) < 18 and abs(r - b) < 18:
            color = "طوسی تیره" if brightness < 120 else "طوسی روشن"
        elif b > r + 15 and b > g + 10:
            color = "سرمه‌ای" if brightness < 100 else "آبی"
        elif r > g + 25 and r > b + 25:
            color = "زرشکی" if brightness < 110 else "قرمز"
        elif g > r + 15 and g > b + 15:
            color = "سبز زیتونی"
        elif r > 140 and g > 120 and b < 100:
            color = "کرم / خاکی"
        elif r > 100 and g < 70 and b < 50:
            color = "قهوه‌ای"
        else:
            color = "تیره" if brightness < 110 else "روشن"

        # 2. Check filename cues first for high-confidence identification
        fn_lower = (filename or "").lower()
        fn_category = None
        fn_color = None

        if any(k in fn_lower for k in ["hoodie", "هودی", "sweatshirt", "دورس"]):
            fn_category = "هودی"
        elif any(k in fn_lower for k in ["jean", "jeans", "denim", "شلوار", "pant", "pants", "trousers", "chinos", "کتان", "اسلش"]):
            fn_category = "شلوار"
        elif any(k in fn_lower for k in ["shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "کفش", "کتانی", "بوت", "نیم‌بوت"]):
            fn_category = "کفش"
        elif any(k in fn_lower for k in ["jacket", "puffer", "کاپشن", "پافر", "بادگیر"]):
            fn_category = "کاپشن"
        elif any(k in fn_lower for k in ["coat", "trench", "پالتو", "بارانی", "بارونی", "اورکت"]):
            fn_category = "پالتو"
        elif any(k in fn_lower for k in ["tshirt", "t-shirt", "tee", "تیشرت", "پلوشرت"]):
            fn_category = "تیشرت"
        elif any(k in fn_lower for k in ["shirt", "پیراهن", "بلوز"]):
            fn_category = "پیراهن"
        elif any(k in fn_lower for k in ["sweater", "knit", "knitwear", "پلیور", "بافت", "ژاکت"]):
            fn_category = "پلیور"
        elif any(k in fn_lower for k in ["blazer", "suit", "کت", "کت تک"]):
            fn_category = "کت تک"
        elif any(k in fn_lower for k in ["hat", "cap", "scarf", "belt", "watch", "bag", "کلاه", "شال", "کیف", "ساعت", "کمربند"]):
            fn_category = "اکسسوری"

        if any(k in fn_lower for k in ["black", "مشکی", "dark"]):
            fn_color = "مشکی"
        elif any(k in fn_lower for k in ["white", "سفید"]):
            fn_color = "سفید"
        elif any(k in fn_lower for k in ["gray", "grey", "طوسی", "خاکستری"]):
            fn_color = "طوسی"
        elif any(k in fn_lower for k in ["navy", "سرمه‌ای"]):
            fn_color = "سرمه‌ای"
        elif any(k in fn_lower for k in ["blue", "آبی"]):
            fn_color = "آبی"
        elif any(k in fn_lower for k in ["cream", "beige", "کرم", "خاکی"]):
            fn_color = "کرم"
        elif any(k in fn_lower for k in ["brown", "قهوه‌ای"]):
            fn_color = "قهوه‌ای"
        elif any(k in fn_lower for k in ["red", "قرمز", "زرشکی"]):
            fn_color = "زرشکی" if brightness < 110 else "قرمز"
        elif any(k in fn_lower for k in ["green", "سبز", "olive", "زیتونی"]):
            fn_color = "سبز زیتونی"

        final_color = fn_color or color

        # 3. Shape & Geometry-based classification if filename didn't specify category
        if fn_category:
            category = fn_category
        else:
            if ratio >= 1.35:
                category = "شلوار"
            elif ratio <= 0.78:
                category = "کفش"
            else:
                if brightness > 180:
                    category = "تیشرت"
                elif b > r + 15 and b > g + 10:
                    category = "پیراهن"
                elif brightness < 80:
                    category = "هودی" if ratio > 0.95 else "کاپشن"
                else:
                    category = "پلیور"

        # Name synthesis
        if category == "شلوار":
            if "آبی" in final_color or "سرمه‌ای" in final_color:
                name = f"شلوار جین {final_color}"
            elif "کرم" in final_color or "خاکی" in final_color:
                name = f"شلوار کتان {final_color}"
            else:
                name = f"شلوار راسته {final_color}"
            season = "چهارفصل"
        elif category == "کفش":
            if "سفید" in final_color:
                name = "کتانی سفید ورزشی"
            elif "قهوه‌ای" in final_color:
                name = f"نیم‌بوت چرم {final_color}"
            else:
                name = f"کفش چرم {final_color}"
            season = "چهارفصل"
        elif category == "کاپشن":
            name = f"کاپشن گرم {final_color}"
            season = "زمستان"
        elif category == "پالتو":
            name = f"پالتو کلاسیک {final_color}"
            season = "پاییز و زمستان"
        elif category == "هودی":
            name = f"هودی دورس {final_color}"
            season = "پاییز و زمستان"
        elif category == "پلیور":
            name = f"پلیور بافت {final_color}"
            season = "پاییز و زمستان"
        elif category == "تیشرت":
            name = f"تیشرت نخی {final_color}"
            season = "تابستان"
        elif category == "پیراهن":
            name = f"پیراهن کتان {final_color}"
            season = "بهار و تابستان"
        else:
            name = f"اکسسوری {final_color}"
            season = "چهارفصل"

        return {
            "name": name,
            "category": category,
            "color": final_color,
            "season": season
        }
    except Exception as e:
        print(f"Heuristics analysis error: {e}")
        return {
            "name": "لباس اساسی کمد",
            "category": "سایر",
            "color": "مشکی",
            "season": "چهارفصل"
        }

def analyze_clothing_image(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    filename: str = ""
) -> Tuple[Dict[str, str], bool]:
    """
    Analyzes a clothing image using Gemini Vision when available,
    falling back to enhanced visual heuristics.
    """
    genai_client = get_genai_client()
    if genai_client:
        try:
            import io
            from PIL import Image
            from google.genai import types

            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            pil_img.thumbnail((768, 768), Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            pil_img.save(buf, format="JPEG", quality=80)
            fast_bytes = buf.getvalue()

            part = types.Part.from_bytes(data=fast_bytes, mime_type="image/jpeg")
            prompt = (
                "You are an expert fashion stylist and computer vision garment identifier.\n"
                "Look closely at the clothing garment or accessory in this photo with great attention to detail.\n"
                "Extract a full, rich, descriptive Persian name (5 to 9 words) that includes:\n"
                "- Exact garment type (تیشرت, پیراهن دکمه‌دار, ساعت مچی, کفش کتانی, شلوار جین, هودی, کاپشن)\n"
                "- Cut/fit (اوورسایز, راسته, اسلیم, لانگ, بگ, مام‌استایل)\n"
                "- Collar/sleeve details (یقه گرد, یقه هفت, دکمه‌دار, آستین کوتاه, آستین بلند, کلاه‌دار, زیپ‌دار)\n"
                "- Material/texture (نخی پنبه‌ای, کتان, جین, چرم, بافت, استیل)\n"
                "- Pattern/print (ساده مینیمال, چاپ گرافیکی, چهارخانه, راه‌راه, لوگودار)\n"
                "- Exact color and shade (مشکی مات, سفید شیری, سرمه‌ای تیره, طوسی ملانژ, زیتونی)\n"
                "RULE FOR T-SHIRT VS SHIRT:\n"
                "- If the item is casual crewneck/v-neck/polo/t-shirt/tee, category MUST be 'تیشرت' and name MUST begin with 'تیشرت ...'.\n"
                "- 'پیراهن' is reserved ONLY for formal button-down collared dress shirts.\n"
                "Return a JSON object with:\n"
                "- 'name': Complete, highly descriptive Persian name with all visual attributes\n"
                "- 'category': One of ['تیشرت', 'پیراهن', 'شلوار', 'کفش', 'اکسسوری', 'هودی', 'پلیور', 'کاپشن', 'پالتو']\n"
                "- 'color': Exact color nuance\n"
                "- 'season': One of ['بهار و تابستان', 'تابستان', 'پاییز و زمستان', 'زمستان', 'چهارفصل']\n"
                "- 'details': Key distinguishing visual details\n"
                "- 'style': Style (e.g. کژوال روزمره, اسپرت, رسمی, استریت‌ویر)\n"
                "Return JSON ONLY."
            )

            response = generate_gemini_content(
                client=genai_client,
                contents=[part, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            text = response.text.strip()
            if text.startswith("```"):
                text = text.strip("`").replace("json\n", "", 1).strip()
            parsed = json.loads(text)
            if isinstance(parsed, list) and len(parsed) > 0:
                item = parsed[0]
            elif isinstance(parsed, dict) and "items" in parsed and len(parsed["items"]) > 0:
                item = parsed["items"][0]
            elif isinstance(parsed, dict) and "name" in parsed:
                item = parsed
            else:
                item = None

            if item and item.get("name") and item.get("category"):
                return {
                    "name": str(item["name"]).strip(),
                    "category": str(item.get("category", "سایر")).strip(),
                    "color": str(item.get("color", "متناسب")).strip(),
                    "season": str(item.get("season", "چهارفصل")).strip()
                }, True
        except Exception as e:
            print(f"Gemini Vision call failed, switching to visual heuristics: {e}")

    fallback = analyze_image_heuristics(image_bytes, filename)
    return fallback, False

@app.post("/api/wardrobe/bulk-upload")
def upload_clothing_photos_bulk(files: List[UploadFile] = File(...)):
    """
    Upload and analyze multiple clothing photos in a batch.
    Processes each photo with Gemini Vision and smart feature extraction,
    removes background, and registers them into the user's wardrobe.
    """
    if not files:
        raise HTTPException(status_code=400, detail="هیچ فایلی ارسال نشده است.")
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="حداکثر ۲۰ عکس را می‌توانید به صورت همزمان آپلود کنید.")

    import uuid
    import concurrent.futures

    file_data_list = []
    valid_exts = (".jpg", ".jpeg", ".png", ".webp", ".heic", ".bmp")
    for f in files:
        ctype = (f.content_type or "").lower()
        fname = (f.filename or "").lower()
        if not ctype.startswith("image/") and not any(fname.endswith(ext) for ext in valid_exts):
            continue
        try:
            content = f.file.read()
            if 0 < len(content) <= 15 * 1024 * 1024:
                file_data_list.append((f.filename or "garment.jpg", ctype or "image/jpeg", content))
        except Exception as e:
            print(f"Error reading file {f.filename}: {e}")

    if not file_data_list:
        raise HTTPException(status_code=400, detail="هیچ فایل تصویری معتبری برای پردازش یافت نشد.")

    def process_single_file(item_tuple):
        fname, ctype, img_bytes = item_tuple
        try:
            detected, gemini_ok = analyze_clothing_image(img_bytes, mime_type=ctype, filename=fname)
            clean_bytes, mime = remove_background_cv(img_bytes)
            ext = "png" if mime == "image/png" else "jpg"
            upload_fn = f"{uuid.uuid4().hex[:12]}.{ext}"
            upload_file_path = STATIC_DIR / "uploads" / upload_fn
            try:
                with open(upload_file_path, "wb") as f_out:
                    f_out.write(clean_bytes)
                saved_url = f"/static/uploads/{upload_fn}"
            except Exception:
                saved_url = get_garment_image(detected["name"], detected["category"])

            return {
                "name": detected["name"],
                "category": detected["category"],
                "color": detected["color"],
                "season": detected["season"],
                "image_url": saved_url,
                "filename": fname,
                "gemini_used": gemini_ok
            }
        except Exception as err:
            print(f"Error processing single file {fname}: {err}")
            return None

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(4, len(file_data_list))) as executor:
        processed_items = list(executor.map(process_single_file, file_data_list))

    conn = get_db_connection()
    cursor = conn.cursor()

    for item in processed_items:
        if not item:
            continue
        name = item["name"]
        cat = item["category"]
        color = item["color"]
        season = item["season"]
        img_url = item["image_url"]

        try:
            cursor.execute(
                "INSERT INTO wardrobe (name, category, color, season, image_url) VALUES (?, ?, ?, ?, ?)",
                (name, cat, color, season, img_url)
            )
            item_id = cursor.lastrowid
            results.append({
                "id": item_id,
                "name": name,
                "category": cat,
                "color": color,
                "season": season,
                "image_url": img_url,
                "filename": item["filename"]
            })
        except sqlite3.IntegrityError:
            cursor.execute(
                "UPDATE wardrobe SET image_url = ?, season = ? WHERE name = ? AND category = ? AND color = ?",
                (img_url, season, name, cat, color)
            )
            cursor.execute("SELECT id FROM wardrobe WHERE name = ? AND category = ? AND color = ?", (name, cat, color))
            row = cursor.fetchone()
            if row:
                results.append({
                    "id": row[0],
                    "name": name,
                    "category": cat,
                    "color": color,
                    "season": season,
                    "image_url": img_url,
                    "filename": item["filename"],
                    "is_updated": True
                })

    conn.commit()
    conn.close()

    return {
        "success": True,
        "total_files": len(files),
        "saved_count": len(results),
        "items": results,
        "message": f"{len(results)} لباس با موفقیت تحلیل و به کمد شما افزوده شد."
    }

@app.delete("/api/wardrobe/{item_id}")
def delete_wardrobe_item(item_id: int):
    """Delete a clothing item from the wardrobe."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM wardrobe WHERE id = ?", (item_id,))
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    if changes == 0:
        raise HTTPException(status_code=404, detail="آیتم موردنظر در کمد یافت نشد.")
    return {"message": "آیتم با موفقیت حذف شد.", "id": item_id}

def remove_background_cv(image_bytes: bytes) -> tuple[bytes, str]:
    """
    Isolate garment from background using OpenCV GrabCut and contrast cues.
    Returns (png_bytes, mime_type) with transparent background.
    """
    try:
        import cv2
        import numpy as np

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return image_bytes, "image/jpeg"

        h, w = img.shape[:2]
        max_dim = 900
        scale = 1.0
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            img_proc = cv2.resize(img, (int(w * scale), int(h * scale)))
        else:
            img_proc = img.copy()

        sh, sw = img_proc.shape[:2]
        mask = np.zeros((sh, sw), np.uint8)
        rect = (int(sw * 0.05), int(sh * 0.08), int(sw * 0.90), int(sh * 0.88))
        bgdModel = np.zeros((1, 65), np.float64)
        fgdModel = np.zeros((1, 65), np.float64)

        cv2.grabCut(img_proc, mask, rect, bgdModel, fgdModel, 4, cv2.GC_INIT_WITH_RECT)

        # Background color thresholding refinement
        gray = cv2.cvtColor(img_proc, cv2.COLOR_BGR2GRAY)
        corners = [
            gray[:15, :15].mean(),
            gray[:15, -15:].mean(),
            gray[-15:, :15].mean(),
            gray[-15:, -15:].mean()
        ]
        corner_mean = float(np.mean(corners))
        if corner_mean > 150:  # Light background (e.g. tiles, white walls)
            mask[gray > (corner_mean - 25)] = cv2.GC_BGD
        elif corner_mean < 50:  # Dark background
            mask[gray < (corner_mean + 20)] = cv2.GC_BGD

        # Discard top 8% (hangers/hooks)
        mask[:int(sh * 0.08), :] = cv2.GC_BGD

        cv2.grabCut(img_proc, mask, None, bgdModel, fgdModel, 2, cv2.GC_INIT_WITH_MASK)

        final_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype('uint8')
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        final_mask = cv2.morphologyEx(final_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        final_mask = cv2.morphologyEx(final_mask, cv2.MORPH_OPEN, kernel, iterations=1)
        final_mask_blur = cv2.GaussianBlur(final_mask, (5, 5), 0)

        if scale != 1.0:
            mask_orig = cv2.resize(final_mask_blur, (w, h), interpolation=cv2.INTER_LINEAR)
        else:
            mask_orig = final_mask_blur

        b, g, r = cv2.split(img)
        rgba = [b, g, r, mask_orig]
        dst = cv2.merge(rgba)

        # Crop tightly to garment
        coords = cv2.findNonZero(mask_orig)
        if coords is not None:
            x, y, bw, bh = cv2.boundingRect(coords)
            pad = 15
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(w, x + bw + pad)
            y2 = min(h, y + bh + pad)
            if (x2 - x1) > 50 and (y2 - y1) > 50:
                dst = dst[y1:y2, x1:x2]

        success, encoded_png = cv2.imencode('.png', dst)
        if success:
            return encoded_png.tobytes(), "image/png"
        return image_bytes, "image/jpeg"
    except Exception as e:
        print(f"Background removal notice: {e}")
        return image_bytes, "image/jpeg"

# -------------------------------------------------------------
# Settings & API Key Endpoints
# -------------------------------------------------------------
class ApiKeyUpdate(BaseModel):
    api_key: str = Field(..., min_length=10, max_length=200)

@app.get("/api/settings/status")
def get_settings_status():
    """Check whether Gemini API is active."""
    client = get_genai_client()
    return {
        "gemini_configured": client is not None
    }

@app.post("/api/settings/api-key")
def update_api_key(payload: ApiKeyUpdate):
    """Save Gemini API key securely to .env file and reload."""
    key = payload.api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="کلید API نمی‌تواند خالی باشد.")

    try:
        # Read or create .env file
        lines = []
        if ENV_PATH.exists():
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                lines = f.readlines()

        new_lines = []
        key_found = False
        for line in lines:
            if line.startswith("GEMINI_API_KEY="):
                new_lines.append(f"GEMINI_API_KEY={key}\n")
                key_found = True
            else:
                new_lines.append(line)

        if not key_found:
            new_lines.append(f"\nGEMINI_API_KEY={key}\n")

        with open(ENV_PATH, "w", encoding="utf-8") as f:
            f.writelines(new_lines)

        os.environ["GEMINI_API_KEY"] = key
        load_dotenv(ENV_PATH, override=True)

        # Test initialization
        client = get_genai_client()
        if not client:
            raise HTTPException(status_code=400, detail="فرمت کلید نامعتبر است یا کلاینت راه‌اندازی نشد.")

        return {
            "success": True,
            "message": "کلید Google Gemini با موفقیت تنظیم و فعال گردید."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در ذخیره کلید: {str(e)}")

@app.post("/api/wardrobe/upload-photo")
def upload_clothing_photo(file: UploadFile = File(...), auto_save: bool = Form(True)):
    """
    Upload a clothing photo and detect visible clothing items, colors, and categories.
    Pre-compresses image for instant transfer and uses strict 12-second timeout
    to guarantee no hanging or waiting.
    """
    import concurrent.futures

    ctype = (file.content_type or "").lower()
    fname = (file.filename or "").lower()
    valid_exts = (".jpg", ".jpeg", ".png", ".webp", ".heic", ".bmp")
    if not ctype.startswith("image/") and not any(fname.endswith(ext) for ext in valid_exts):
        raise HTTPException(status_code=400, detail="لطفاً فقط فایل تصویری آپلود کنید.")

    image_bytes = file.file.read()
    if len(image_bytes) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="حجم فایل نباید بیش از ۱۵ مگابایت باشد.")

    # 1. Pre-optimize image resolution to ~768px for lightning-fast processing
    try:
        from PIL import Image
        import io
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        pil_img.thumbnail((768, 768), Image.Resampling.LANCZOS)
        out_buf = io.BytesIO()
        pil_img.save(out_buf, format="JPEG", quality=80)
        fast_bytes = out_buf.getvalue()
        fast_mime = "image/jpeg"
    except Exception:
        fast_bytes = image_bytes
        fast_mime = ctype or "image/jpeg"

    detected, gemini_used = analyze_clothing_image(image_bytes, mime_type=ctype or "image/jpeg", filename=file.filename or "garment.jpg")
    detected_items = [detected]

    # 3. Remove background and isolate garment as clean PNG
    import uuid
    clean_bytes, mime = remove_background_cv(fast_bytes)
    ext = "png" if mime == "image/png" else "jpg"
    upload_fn = f"{uuid.uuid4().hex[:12]}.{ext}"
    upload_file_path = STATIC_DIR / "uploads" / upload_fn
    try:
        with open(upload_file_path, "wb") as f:
            f.write(clean_bytes)
        saved_img_url = f"/static/uploads/{upload_fn}"
    except Exception:
        saved_img_url = "/static/uploads/black_jacket_nobg.png"

    for it in detected_items:
        it["image_url"] = saved_img_url

    # 4. Save to database if auto_save is True
    added_items = []
    if auto_save:
        conn = get_db_connection()
        cursor = conn.cursor()
        for item in detected_items:
            name = str(item.get("name", "لباس جدید")).strip()
            cat = str(item.get("category", "سایر")).strip()
            color = str(item.get("color", "نامشخص")).strip()
            season = str(item.get("season", "چهارفصل")).strip()
            img_to_save = item.get("image_url") or saved_img_url
            try:
                cursor.execute(
                    "INSERT INTO wardrobe (name, category, color, season, image_url) VALUES (?, ?, ?, ?, ?)",
                    (name, cat, color, season, img_to_save)
                )
                item_id = cursor.lastrowid
                added_items.append({"id": item_id, "name": name, "category": cat, "color": color, "season": season, "image_url": img_to_save})
            except sqlite3.IntegrityError:
                # Duplicate, fetch existing ID and update image_url
                cursor.execute("SELECT id FROM wardrobe WHERE name = ? AND category = ? AND color = ?", (name, cat, color))
                row = cursor.fetchone()
                existing_id = row[0] if row else None
                if existing_id:
                    cursor.execute("UPDATE wardrobe SET image_url = ? WHERE id = ?", (img_to_save, existing_id))
                added_items.append({"id": existing_id, "name": name, "category": cat, "color": color, "season": season, "image_url": img_to_save, "is_existing": True})

        conn.commit()
        conn.close()

    msg = ""
    if gemini_used:
        msg = f"هوش مصنوعی Gemini Vision لباس را با موفقیت شناسایی و به کمد افزود ({detected_items[0].get('name')})."
    else:
        msg = (
            f"لباس به عنوان «{detected_items[0].get('name')}» بر اساس پردازش هوشمند تصویر تشخیص داده شد. "
            f"(جهت فعال‌سازی بینایی پیشرفته Gemini، کلید API را در تنظیمات وارد نمایید)."
        )

    return {
        "success": True,
        "gemini_used": gemini_used,
        "detected_count": len(detected_items),
        "items": added_items if added_items else detected_items,
        "message": msg
    }

# -------------------------------------------------------------
# Smart Garment Classification & Outfit Structure Sanitizer
# -------------------------------------------------------------
def classify_item(name: str, category: str = "") -> str:
    n = (name or "").lower().replace('ي', 'ی').replace('ك', 'ک')
    c = (category or "").lower().replace('ي', 'ی').replace('ك', 'ک')

    # 1. Outerwear (Check first so 'کت جین' or 'کاپشن کلاه‌دار' are always OUTERWEAR!)
    if any(k in n for k in ['کاپشن', 'پالتو', 'بارانی', 'ترنچ', 'پافر', 'بادگیر', 'اورکت', 'کت تک', 'کت چرم', 'کت جین', 'کت اسپرت', 'جلیقه']) or c in ['کاپشن', 'پالتو']:
        return 'OUTERWEAR'

    # 2. Warm Tops (pullover, hoodie, sweatshirt, knitwear)
    if any(k in n for k in ['پلیور', 'هودی', 'بافت', 'دورس', 'سویشرت', 'ژاکت', 'یقه اسکی']) or c in ['پلیور', 'هودی', 'بافت', 'دورس']:
        return 'WARM_TOP'

    # 3. Base Tops (t-shirt, button-down shirt, polo, blouse)
    if any(k in n for k in ['تیشرت', 'تی‌شرت', 'پلوشرت', 'پولوشرت', 'پیراهن', 'شومیز', 'تاپ', 'بلوز']) or c in ['تیشرت', 'پیراهن', 'شومیز']:
        return 'BASE_TOP'

    # 4. Footwear
    if any(k in n for k in ['کفش', 'کتانی', 'بوت', 'نیم‌بوت', 'صندل', 'لوفر', 'اسنیکرز', 'پوتین']) or c in ['کفش', 'کتانی', 'shoes']:
        return 'SHOES'

    # 5. Bottoms (pants, jeans, skirts)
    if any(k in n for k in ['شلوار', 'دامن', 'اسلش', 'شلوارک']) or c in ['شلوار', 'دامن']:
        return 'BOTTOM'
    if any(k in n for k in ['جین', 'کتان', 'بگ', 'مام استایل', 'کارگو']):
        return 'BOTTOM'

    # 6. Accessories (hats, watches, glasses, belts, bags, scarves)
    is_hat = ('کلاه' in n) and ('کلاه‌دار' not in n) and ('کلاه دار' not in n)
    if is_hat or any(k in n for k in ['ساعت', 'عینک', 'دستبند', 'کیف', 'کمربند', 'گردنبند', 'شال گردن', 'شال‌گردن']) or c in ['اکسسوری', 'accessory']:
        return 'ACCESSORY'

    return 'OTHER'

def sanitize_outfits_structure(outfits: List[Dict[str, Any]], wardrobe_names: Optional[List[str]] = None, gender: str = "unisex") -> List[Dict[str, Any]]:
    """
    Enforces strict, realistic fashion rules:
    - AT MOST 1 Warm Top (NEVER 2 pullovers or pullover + hoodie together).
    - AT MOST 1 Outerwear (NEVER 2 jackets/coats).
    - EXACTLY 1 Bottom (NEVER 2 pants, never 0 pants).
    - EXACTLY 1 Pair of Shoes (NEVER 2 shoes, never 0 shoes).
    - AT MOST 1 Accessory.
    """
    if not outfits or not isinstance(outfits, list):
        return outfits
    wardrobe_set = set(w.strip() for w in (wardrobe_names or []))

    sanitized = []
    for outfit in outfits:
        if not isinstance(outfit, dict):
            sanitized.append(outfit)
            continue

        from_w = set(w.strip() for w in outfit.get('from_wardrobe', []))
        items = list(outfit.get('items', []))
        if not items and (outfit.get('from_wardrobe') or outfit.get('general_suggestions')):
            items = list(outfit.get('from_wardrobe') or []) + list(outfit.get('general_suggestions') or [])

        slots = {'BASE_TOP': [], 'WARM_TOP': [], 'OUTERWEAR': [], 'BOTTOM': [], 'SHOES': [], 'ACCESSORY': [], 'OTHER': []}
        for it in items:
            cat = classify_item(it)
            slots[cat].append(it)

        final_items = []

        # 1. Warm Top: At most 1 (NO TWO PULLOVERS/SWEATERS EVER)
        chosen_warm = None
        if slots['WARM_TOP']:
            w_warm = [x for x in slots['WARM_TOP'] if x in from_w or x in wardrobe_set]
            chosen_warm = w_warm[0] if w_warm else slots['WARM_TOP'][0]

        # 2. Base Top: At most 1
        chosen_base = None
        if slots['BASE_TOP']:
            w_base = [x for x in slots['BASE_TOP'] if x in from_w or x in wardrobe_set]
            chosen_base = w_base[0] if w_base else slots['BASE_TOP'][0]
        elif len(slots['WARM_TOP']) > 1 and not chosen_base:
            # If 2 warm tops and no base top, replace the duplicate with an inner shirt (NO word pullover!)
            chosen_base = 'بلوز نخی زنانه' if gender == 'female' else 'پیراهن آستین بلند نخی'

        if chosen_base:
            final_items.append(chosen_base)
        if chosen_warm:
            final_items.append(chosen_warm)

        # 3. Bottom: Exactly 1
        if slots['BOTTOM']:
            w_btm = [x for x in slots['BOTTOM'] if x in from_w or x in wardrobe_set]
            final_items.append(w_btm[0] if w_btm else slots['BOTTOM'][0])
        else:
            final_items.append('شلوار پارچه‌ای یا دامن' if gender == 'female' else 'شلوار جین کلاسیک')

        # 4. Outerwear: At most 1
        if slots['OUTERWEAR']:
            w_out = [x for x in slots['OUTERWEAR'] if x in from_w or x in wardrobe_set]
            final_items.append(w_out[0] if w_out else slots['OUTERWEAR'][0])

        # 5. Shoes: Exactly 1
        if slots['SHOES']:
            w_shoe = [x for x in slots['SHOES'] if x in from_w or x in wardrobe_set]
            final_items.append(w_shoe[0] if w_shoe else slots['SHOES'][0])
        else:
            final_items.append('کتانی راحت چرم')

        # 6. Accessory: At most 1
        if slots['ACCESSORY']:
            w_acc = [x for x in slots['ACCESSORY'] if x in from_w or x in wardrobe_set]
            final_items.append(w_acc[0] if w_acc else slots['ACCESSORY'][0])

        new_from_w = [x for x in final_items if x in from_w or x in wardrobe_set]
        new_gen_s = [x for x in final_items if x not in new_from_w]

        outfit['items'] = final_items
        outfit['from_wardrobe'] = new_from_w
        outfit['general_suggestions'] = new_gen_s
        sanitized.append(outfit)

    return sanitized

# -------------------------------------------------------------
# Smart Fallback Recommender (Ensures 100% Reliability)
# -------------------------------------------------------------
def generate_fallback_recommendations(
    weather: Dict[str, Any],
    style: str,
    wardrobe_items: List[Dict[str, Any]],
    use_wardrobe: bool,
    city: str,
    destination: str = "محل کار / روزمره",
    gender: str = "unisex",
    age_group: str = "young_adult",
    fit_pref: str = "regular",
    temp_sensitivity: str = "normal",
    language: str = "fa",
    variation_seed: Optional[int] = None
) -> Dict[str, Any]:
    curr = weather.get("current", {})
    temp = curr.get("temperature", 20)
    wind = curr.get("wind_speed", 5)
    humidity = curr.get("humidity", 40)
    precip = curr.get("precipitation", 0)
    day_summary = weather.get("day_summary", {})
    rain_alert = day_summary.get("rain_alert", False) or precip > 0

    # Temperature sensitivity adjustment
    effective_temp = temp
    if temp_sensitivity == "cold_sensitive":
        effective_temp -= 3  # Suggest warmer layers
    elif temp_sensitivity == "warm_sensitive":
        effective_temp += 3  # Suggest lighter layers

    wardrobe_names = [w["name"] for w in wardrobe_items] if use_wardrobe else []

    # Weather analysis
    if effective_temp < 10:
        weather_level = "سرد و زمستانی" if language == "fa" else "Cold Winter"
    elif effective_temp < 20:
        weather_level = "خنک و پاییزی" if language == "fa" else "Mild Autumn"
    else:
        weather_level = "گرم و مطبوع" if language == "fa" else "Warm & Pleasant"

    umbrella_needed = rain_alert or (precip > 0.2)
    is_cold = (effective_temp < 15)

    # Gender-specific piece suggestions
    is_female = (gender == "female")
    is_male = (gender == "male")

    dest_label = destination or "محل کار"

    # Multilingual summaries
    if language == "en":
        summary = f"Today's weather in {city} is {weather_level} with temperatures around {temp}°C."
        if rain_alert:
            summary += " Rain expected; carrying an umbrella or water-resistant jacket is recommended."
        reason = (
            f"Tailored for {dest_label} with {style} styling. "
            f"Considering temperature ({temp}°C), {humidity}% humidity, and {wind} km/h wind, "
            f"these outfits provide optimal comfort and aesthetic balance for a {fit_pref} fit."
        )
    elif language == "tr":
        summary = f"{city} için bugünkü hava yaklaşık {temp}°C ve {weather_level}."
        if rain_alert:
            summary += " Yağmur ihtimali var; şemsiye veya su geçirmez mont önerilir."
        reason = (
            f"{dest_label} hedefi ve {style} stili için özel olarak tasarlandı. "
            f"Sıcaklık ({temp}°C), %{humidity} nem ve {wind} km/s rüzgar dikkate alınmıştır."
        )
    elif language == "ar":
        summary = f"الطقس اليوم في {city} هو {weather_level} بدرجة حرارة حوالي {temp} مئوية."
        if rain_alert:
            summary += " يُتوقع هطول أمطار؛ يُنصح بحمل مظلة أو معطف واقٍ من المطر."
        reason = (
            f"مُصمم خصيصاً لوجهة ({dest_label}) بأسلوب {style}. "
            f"مع الأخذ في الاعتبار درجة الحرارة ({temp}°C) والرطوبة {humidity}% وسرعة الرياح {wind} كم/س."
        )
    else:
        summary = f"هوای امروز {city} {weather_level} با دمای حدود {temp} درجه سانتی‌گراد است."
        if rain_alert:
            summary += " احتمال بارش باران وجود دارد؛ حتماً چتر یا پوشش ضدآب همراه داشته باشید."
        reason = (
            f"طراحی شده ویژه مقصد ({dest_label}) با استایل {style}. "
            f"با توجه به دمای فعلی ({temp}°C)، رطوبت {humidity}% و سرعت باد {wind} کیلومتر بر ساعت، "
            f"این ست‌ها حداکثر آسایش و تعادل دمایی را برای فرم پوشش {fit_pref} فراهم می‌کنند."
        )

    # 3 Distinct Outfits based on destination & gender
    jacket_item = "کاپشن بادی مشکی" if is_male else ("کاپشن زنانه شیک" if is_female else "کاپشن گرم")
    coat_item = "پالتو پشمی کلاسیک" if is_male else ("پالتو یا ترنچ زنانه" if is_female else "پالتو شیک")
    mid_item = "هودی پنبه‌ای" if is_male else ("بافت اورسایز" if is_female else "پلیور کژوال")

    # Seed-based variation
    v_offset = (variation_seed or 0) % 3

    outfit_1_name = f"ست ۱: استایل ویژه {dest_label}" if language == "fa" else f"Outfit 1: Tailored for {dest_label}"
    outfit_2_name = f"ست ۲: لایه‌بندی شیک {weather_level}" if language == "fa" else f"Outfit 2: Elegant Layering"
    outfit_3_name = f"ست ۳: ترکیب آزاد و مدرن" if language == "fa" else f"Outfit 3: Modern Casual Fusion"

    # Group wardrobe by category to maximize actual wardrobe usage
    tops = [w for w in wardrobe_names if any(k in w for k in ["تیشرت", "پیراهن", "هودی", "پلیور", "بافت", "دورس", "تاپ"])]
    bottoms = [w for w in wardrobe_names if any(k in w for k in ["شلوار", "جین", "کتان", "اسلش", "دامن"])]
    outer = [w for w in wardrobe_names if any(k in w for k in ["کاپشن", "پالتو", "بارانی", "پافر", "کت"])]
    shoes = [w for w in wardrobe_names if any(k in w for k in ["کفش", "کتانی", "بوت", "نیم‌بوت"])]
    accessories = [w for w in wardrobe_names if any(k in w for k in ["ساعت", "عینک", "کلاه", "شال", "کیف", "کمربند"])]

    def pick_item(arr, idx):
        return arr[idx % len(arr)] if arr else None

    def make_outfit(name, time_str, top_i, btm_i, out_i, shoe_i, acc_i, why_str, img_q):
        from_w = []
        gen_s = []

        top = pick_item(tops, top_i)
        if top: 
            from_w.append(top)
        else: 
            gen_s.append("پیراهن کتان آکسفورد" if is_cold else "تیشرت نخی")

        btm = pick_item(bottoms, btm_i)
        if btm: 
            from_w.append(btm)
        else: 
            gen_s.append("شلوار کتان راسته")

        if is_cold or rain_alert or outer:
            out_piece = pick_item(outer, out_i)
            if out_piece: 
                from_w.append(out_piece)
            elif is_cold or rain_alert: 
                gen_s.append(jacket_item)

        shoe = pick_item(shoes, shoe_i)
        if shoe: 
            from_w.append(shoe)
        else: 
            gen_s.append("کتانی سفید چرم" if is_cold else "کتانی یا کفش راحت")

        # Accessory: At most one tasteful item if available in wardrobe
        acc = pick_item(accessories, acc_i)
        if acc: 
            from_w.append(acc)

        return {
            "name": name,
            "items": from_w + gen_s,
            "from_wardrobe": from_w,
            "general_suggestions": gen_s,
            "time_of_day": time_str,
            "why": why_str,
            "image_query": img_q
        }

    outfits = [
        make_outfit(
            outfit_1_name,
            "صبح تا بعدازظهر" if language == "fa" else "Morning to Afternoon",
            0, 0, 0, 0, 0,
            f"انتخابی کاربردی برای حضور در {dest_label} چیده‌شده با اولویت قطعی لباس‌های کمد شما.",
            f"{gender} professional {style.lower()} outfit for {dest_label} styled on fashion mannequin boutique display"
        ),
        make_outfit(
            outfit_2_name,
            "عصر و شب" if language == "fa" else "Evening & Night",
            1, 1, 1, 1, 1,
            "طراحی لایه‌ای برای ساعات خنک‌تر با استفاده از تنوع لباس‌های موجود در کمد شما.",
            f"{gender} elegant {style.lower()} coat outfit {dest_label} dressed on tailor mannequin dummy atelier"
        ),
        make_outfit(
            outfit_3_name,
            "تمام ساعات روز" if language == "fa" else "All-Day Versatile",
            2, 2, 2, 2, 2,
            "ترکیبی راحت، پرانرژی و جذاب برگرفته از قطعات کمد شخصی شما.",
            f"{gender} trendy urban streetwear {style.lower()} set displayed on boutique dress form mannequin"
        )
    ]

    for o in outfits:
        if not o["items"]:
            o["items"] = ["پیراهن کتان", "شلوار راسته", "کفش راحتی"]
            o["general_suggestions"] = ["پیراهن کتان", "شلوار راسته", "کفش راحتی"]
        if not o["from_wardrobe"] and use_wardrobe and wardrobe_names:
            o["from_wardrobe"] = [wardrobe_names[0]]
            if wardrobe_names[0] not in o["items"]:
                o["items"].insert(0, wardrobe_names[0])

    sanitized_outfits = sanitize_outfits_structure(outfits, wardrobe_names=wardrobe_names, gender=gender)

    return {
        "summary": summary,
        "reason": reason,
        "umbrella": umbrella_needed,
        "outfits": sanitized_outfits
    }

# -------------------------------------------------------------
# AI Recommendation Engine (Gemini API with Structured Output)
# -------------------------------------------------------------
@app.post("/api/recommend")
def get_outfit_recommendations(req: RecommendationRequest):
    """
    Generate 3 tailored outfit recommendations using Google Gemini (gemini-2.5-flash)
    based on real-time weather and personal wardrobe.
    Strictly distinguishes from_wardrobe vs general_suggestions.
    """
    # 1. Fetch user wardrobe if enabled
    wardrobe_list = []
    if req.use_wardrobe:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, category, color, season FROM wardrobe")
        wardrobe_list = [dict(r) for r in cursor.fetchall()]
        conn.close()

    result = None

    # 2. Try Gemini API if client configured
    genai_client = get_genai_client()
    if genai_client:
        try:
            from google.genai import types

            wardrobe_text = ""
            if req.use_wardrobe and wardrobe_list:
                wardrobe_items_str = "\n".join([
                    f"- {w['name']} (دسته‌بندی: {w['category']}، رنگ: {w['color']}، فصل: {w['season']})"
                    for w in wardrobe_list
                ])
                wardrobe_text = f"User's Wardrobe Items:\n{wardrobe_items_str}"
            else:
                wardrobe_text = "The user has no items or has disabled personal wardrobe mode. Suggest complete outfits solely from general recommendations."

            weather_context = json.dumps(req.weather, ensure_ascii=False, indent=2)

            lang_code = req.language or "fa"
            lang_instruct = {
                "en": "All user-facing text (summary, reason, outfit names, time_of_day, why) MUST be in natural, polite English.",
                "tr": "All user-facing text (summary, reason, outfit names, time_of_day, why) MUST be in natural, polite Turkish (Türkçe).",
                "ar": "All user-facing text (summary, reason, outfit names, time_of_day, why) MUST be in natural, polite Arabic (العربية).",
                "fa": "All user-facing text (summary, reason, outfit names, time_of_day, why) MUST be in natural, polite Persian (Farsi)."
            }.get(lang_code, "All user-facing text MUST be in natural, polite Persian (Farsi).")

            system_instruction = (
                "You are WearWise AI, an expert high-end personal fashion advisor. "
                "Analyze the provided weather conditions (current temperature, apparent feels-like temperature, "
                "humidity, wind speed, precipitation, and hourly shifts across morning, afternoon, evening, and night). "
                "Recommend 3 distinct, practical, and highly stylish clothing combinations tailored for the specified style and destination.\n\n"
                "STRICT GROUNDING RULE:\n"
                "You must strictly distinguish between items already in the user's wardrobe and new items.\n"
                "- 'from_wardrobe': ONLY items that are verbatim present in the provided User's Wardrobe Items list. "
                "NEVER invent or claim an item is in the wardrobe if it is not in the provided list!\n"
                "- 'general_suggestions': Additional items recommended to complete or complement the outfit.\n"
                "- 'items': The union of from_wardrobe and general_suggestions.\n"
                "- 'umbrella': Boolean flag (true/false) indicating whether an umbrella or rain-resistant coat is recommended.\n"
                "- 'image_query': Highly detailed English fashion photography query describing the complete outfit styled on a boutique fashion mannequin or tailor dress form (e.g., 'men navy tailored blazer white oxford shirt beige chinos brown oxford shoes styled on tailor dummy mannequin boutique display').\n\n"
                f"{lang_instruct} 'image_query' MUST always be in English."
            )

            dest = req.destination or "محل کار / اداری"
            gender = req.gender or "unisex"
            age = req.age_group or "young_adult"
            fit = req.fit_pref or "regular"
            sens = req.temp_sensitivity or "normal"
            v_seed = req.variation_seed or 0

            prompt = (
                f"City: {req.city}\n"
                f"Destination / Activity: {dest}\n"
                f"Style Preference: {req.style}\n"
                f"User Profile: Gender={gender}, Age Group={age}, Fit Preference={fit}, Temperature Sensitivity={sens}\n"
                f"Variation Seed: {v_seed} (Generate completely fresh, diverse and non-repetitive combinations)\n"
                f"Weather Data:\n{weather_context}\n\n"
                f"{wardrobe_text}\n\n"
                "CREATIVE DIVERSITY & ANTI-DUPLICATION RULE:\n"
                "- Do NOT repeat previous suggestions. Ensure Outfit 1 is the primary destination look, Outfit 2 is an alternative weather-layering look, and Outfit 3 is a creative distinct silhouette.\n"
                "- STRICT FASHION REALISM RULE (ZERO TOLERANCE FOR DUPLICATES):\n"
                "  * NEVER combine two pullovers, two sweaters, or a pullover and a hoodie together in one outfit! Every outfit can have AT MOST ONE warm knitwear/mid-layer (one pullover OR one hoodie).\n"
                "  * NEVER combine two jackets or two coats together.\n"
                "  * NEVER combine two bottoms/pants together.\n"
                "  * Standard composition per outfit: EXACTLY 1 Bottom + EXACTLY 1 Pair of Shoes + AT MOST 1 Base Top (T-shirt/Shirt) + AT MOST 1 Mid-layer (Pullover/Hoodie) + AT MOST 1 Outerwear (Jacket/Coat) + AT MOST 1 Accessory.\n"
                "- Tailor garment choices (e.g. women vs men attire) accurately to the specified Gender.\n\n"
                "Generate the complete structured outfit recommendations according to the schema."
            )

            response = generate_gemini_content(
                client=genai_client,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=RecommendationOutput,
                    temperature=0.75
                )
            )

            response_json = json.loads(response.text)
            result = response_json

        except Exception as e:
            print(f"Gemini API Recommendation error: {e}")
            # Fall through to resilient fallback generator

    # 3. Fallback if Gemini was not available or encountered an issue
    if not result:
        result = generate_fallback_recommendations(
            weather=req.weather,
            style=req.style,
            wardrobe_items=wardrobe_list,
            use_wardrobe=req.use_wardrobe,
            city=req.city,
            destination=req.destination or "محل کار",
            gender=req.gender or "unisex",
            age_group=req.age_group or "young_adult",
            fit_pref=req.fit_pref or "regular",
            temp_sensitivity=req.temp_sensitivity or "normal",
            language=req.language or "fa",
            variation_seed=req.variation_seed
        )

    # Guarantee strict fashion rules (NO duplicate pullovers, jackets, or pants)
    if result and "outfits" in result:
        result["outfits"] = sanitize_outfits_structure(
            result["outfits"],
            wardrobe_names=[w.get("name") for w in wardrobe_list],
            gender=req.gender or "unisex"
        )

    # Enrich each outfit with individual garment photos & wardrobe indicators
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT id, name, category, color, image_url FROM wardrobe")
        all_wardrobe = [dict(r) for r in c.fetchall()]
        conn.close()

        for outfit in result.get("outfits", []):
            pieces = []
            wardrobe_names = [w.strip() for w in outfit.get("from_wardrobe", [])]
            general_names = [g.strip() for g in outfit.get("general_suggestions", [])]
            raw_items = outfit.get("items", []) or (wardrobe_names + general_names)

            seen_slots = set()
            for item_name in raw_items:
                item_clean = item_name.strip()
                item_slot = classify_item(item_clean)
                if item_slot == "WARM_TOP":
                    if "WARM_TOP" in seen_slots:
                        continue
                    seen_slots.add("WARM_TOP")

                matched = next((w for w in all_wardrobe if w["name"] == item_clean or item_clean in w["name"]), None)
                is_w = (item_clean in wardrobe_names) or (matched is not None and not general_names)
                
                if matched and matched.get("image_url"):
                    img = matched["image_url"]
                else:
                    img = get_garment_image(item_clean)

                pieces.append({
                    "name": item_clean,
                    "is_wardrobe": is_w,
                    "image_url": img
                })

            outfit["pieces"] = pieces
    except Exception as e:
        print(f"Error enriching outfit pieces: {e}")

    # 4. Save to SQLite History
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO history (city, weather_summary, reason, umbrella, outfits_json, is_favorite)
            VALUES (?, ?, ?, ?, ?, 0)
            """,
            (
                req.city,
                result.get("summary", ""),
                result.get("reason", ""),
                1 if result.get("umbrella", False) else 0,
                json.dumps(result.get("outfits", []), ensure_ascii=False)
            )
        )
        conn.commit()
        history_id = cursor.lastrowid
        conn.close()
        result["history_id"] = history_id
    except Exception as db_err:
        print(f"Error saving history to database: {db_err}")
        result["history_id"] = None

    return result

# -------------------------------------------------------------
# History & Favorites Endpoints
# -------------------------------------------------------------
@app.get("/api/history")
def get_history(favorites_only: bool = False):
    """Retrieve saved outfit recommendation history."""
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT id, city, weather_summary, reason, umbrella, outfits_json, is_favorite, created_at FROM history"
    if favorites_only:
        query += " WHERE is_favorite = 1"
    query += " ORDER BY id DESC LIMIT 20"
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        item = dict(row)
        try:
            item["outfits"] = json.loads(item["outfits_json"])
        except Exception:
            item["outfits"] = []
        item["umbrella"] = bool(item["umbrella"])
        item["is_favorite"] = bool(item["is_favorite"])
        del item["outfits_json"]
        results.append(item)

    return results

@app.post("/api/history/{history_id}/favorite")
def toggle_favorite(history_id: int):
    """Toggle favorite status of a recommendation."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_favorite FROM history WHERE id = ?", (history_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="پیشنهاد موردنظر در تاریخچه یافت نشد.")

    new_fav = 0 if row["is_favorite"] else 1
    cursor.execute("UPDATE history SET is_favorite = ? WHERE id = ?", (new_fav, history_id))
    conn.commit()
    conn.close()

    return {"id": history_id, "is_favorite": bool(new_fav)}

@app.delete("/api/history/{history_id}")
def delete_history_item(history_id: int):
    """Delete a history record."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM history WHERE id = ?", (history_id,))
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    if changes == 0:
        raise HTTPException(status_code=404, detail="آیتم یافت نشد.")
    return {"message": "تاریخچه حذف شد.", "id": history_id}

# -------------------------------------------------------------
# Cross-Device Cloud Sync API Endpoints
# -------------------------------------------------------------
class CloudSyncPushRequest(BaseModel):
    sync_id: str
    gemini_api_key: Optional[str] = None
    wardrobe: Optional[List[Dict[str, Any]]] = None
    profile: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, Any]]] = None
    timestamp: Optional[str] = None
    exported_at: Optional[str] = None

    class Config:
        extra = "allow"

@app.post("/api/sync/push")
def sync_push(req: CloudSyncPushRequest):
    """Save full user wardrobe, profile, and settings into the cloud_sync table under a unique sync_id."""
    sync_id = req.sync_id.strip()
    if not sync_id:
        raise HTTPException(status_code=400, detail="شناسه همگام‌سازی (sync_id) نمی‌تواند خالی باشد.")
    
    payload_dict = {
        "sync_id": sync_id,
        "gemini_api_key": req.gemini_api_key or "",
        "wardrobe": req.wardrobe or [],
        "profile": req.profile or {},
        "settings": req.settings or {},
        "history": req.history or [],
        "timestamp": req.timestamp or req.exported_at or datetime.now().isoformat()
    }
    payload_str = json.dumps(payload_dict, ensure_ascii=False)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO cloud_sync (sync_id, data_json, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(sync_id) DO UPDATE SET
            data_json = excluded.data_json,
            updated_at = CURRENT_TIMESTAMP
    """, (sync_id, payload_str))
    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "sync_id": sync_id,
        "items_count": len(req.wardrobe or []),
        "message": "اطلاعات با موفقیت در فضای ابری ذخیره شد."
    }

@app.get("/api/sync/pull")
def sync_pull(sync_id: str):
    """Retrieve synced wardrobe, profile, and settings for a given sync_id."""
    sync_id = sync_id.strip()
    if not sync_id:
        raise HTTPException(status_code=400, detail="شناسه همگام‌سازی معتبر نیست.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json, updated_at FROM cloud_sync WHERE sync_id = ?", (sync_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="هیچ داده‌ای برای این شناسه همگام‌سازی یافت نشد.")
    
    try:
        data = json.loads(row["data_json"])
    except Exception:
        data = {}
    
    return {
        "status": "success",
        "sync_id": sync_id,
        "data": data,
        "updated_at": row["updated_at"]
    }

@app.get("/api/sync/export-full")
def sync_export_full():
    """Export complete server wardrobe, profile, and history as a JSON backup."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wardrobe ORDER BY id DESC")
    wardrobe = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM user_profile WHERE id = 1")
    prof_row = cursor.fetchone()
    profile = dict(prof_row) if prof_row else {}
    
    cursor.execute("SELECT * FROM history ORDER BY id DESC LIMIT 50")
    history = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    return {
        "app": "WearWise AI",
        "version": "3.3",
        "exported_at": datetime.now().isoformat(),
        "wardrobe": wardrobe,
        "profile": profile,
        "history": history
    }

@app.post("/api/sync/import-full")
def sync_import_full(data: Dict[str, Any]):
    """Import a complete backup and merge/replace wardrobe items on server."""
    wardrobe = data.get("wardrobe", [])
    profile = data.get("profile", {})
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Update profile if present
    if profile:
        cursor.execute("""
            INSERT INTO user_profile (id, gender, age_group, fit_pref, temp_sensitivity, updated_at)
            VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                gender = excluded.gender,
                age_group = excluded.age_group,
                fit_pref = excluded.fit_pref,
                temp_sensitivity = excluded.temp_sensitivity,
                updated_at = CURRENT_TIMESTAMP
        """, (
            profile.get("gender", "unisex"),
            profile.get("age_group", "young_adult"),
            profile.get("fit_pref", "regular"),
            profile.get("temp_sensitivity", "normal")
        ))
    
    # Insert or update wardrobe items
    imported_count = 0
    for item in wardrobe:
        name = (item.get("name") or "").strip()
        if not name:
            continue
        cursor.execute("SELECT id FROM wardrobe WHERE name = ?", (name,))
        existing = cursor.fetchone()
        img = item.get("image_url") or get_garment_image(name, item.get("category", "Tops"))
        if existing:
            cursor.execute("""
                UPDATE wardrobe
                SET category = ?, color = ?, season = ?, image_url = ?
                WHERE id = ?
            """, (
                item.get("category", "Tops"),
                item.get("color", "سیاه"),
                item.get("season", "all"),
                img,
                existing["id"]
            ))
        else:
            cursor.execute("""
                INSERT INTO wardrobe (name, category, color, season, image_url)
                VALUES (?, ?, ?, ?, ?)
            """, (
                name,
                item.get("category", "Tops"),
                item.get("color", "سیاه"),
                item.get("season", "all"),
                img
            ))
        imported_count += 1
        
    conn.commit()
    conn.close()
    return {"status": "success", "imported_count": imported_count, "message": f"{imported_count} لباس با موفقیت همگام‌سازی شد."}

# -------------------------------------------------------------
# Static Files & Frontend Routing
# -------------------------------------------------------------
# Ensure static & uploads directory exists
STATIC_DIR.mkdir(exist_ok=True)
(STATIC_DIR / "uploads").mkdir(parents=True, exist_ok=True)

# Mount static folder
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
def serve_index():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "WearWise AI Backend is operational. Static frontend is initializing."}
