// Normalizes Persian and Arabic letters, diacritics and spaces
function normalizePersianText(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .trim()
        .toLowerCase()
        .replace(/[​‌‍﻿]/g, '')
        .replace(/[ي]/g, 'ی')
        .replace(/[ك]/g, 'ک')
        .replace(/[آأإ]/g, 'ا')
        .replace(/[ة]/g, 'ه')
        .replace(/[ؤ]/g, 'و')
        .replace(/[ًٌٍَُِّ]/g, '')
        .replace(/\s+/g, ' ');
}

/**
 * WearWise AI - Frontend Application
 * Multilingual, Multi-Theme, Profile-Aware & Destination-Driven Smart Outfit Advisor
 */

// Application State
const state = {
    city: 'تهران',
    lat: null,
    lon: null,
    weather: null,
    style: 'Mixed',
    destination: 'محل کار / اداری',
    useWardrobe: true,
    wardrobe: [],
    currentRecommendations: null,
    history: [],
    selectedPhotoFile: null,
    activeCategoryFilter: 'all',
    historyOnlyFavorites: false,
    geminiConfigured: false,
    detectedImageUrl: null,
    theme: localStorage.getItem('wearwise_theme') || 'indigo',
    lang: localStorage.getItem('wearwise_lang') || 'fa',
    variationSeed: 0,
    activeMannequinOutfitIndex: 0,
    activeMannequinPhotoIndex: 0,
    bulkUploadFiles: [],
    parsedBulkItems: [],
    profile: {
        gender: 'unisex',
        age_group: 'young_adult',
        fit_pref: 'regular',
        temp_sensitivity: 'normal'
    }
};

// Multilingual Translations (I18N)
const I18N = {
    fa: {
        brandTagline: 'دستیار هوشمند استایل مبتنی بر آب‌وهوا و کمد شخصی',
        searchPlaceholder: 'جستجوی شهر (فارسی یا انگلیسی...)',
        myLocation: 'موقعیت من',
        destinationLabel: 'مقصد / برنامه:',
        styleLabel: 'سبک استایل:',
        wardrobeToggleLabel: 'کمد شخصی من',
        myProfile: 'پروفایل من',
        aiBtnText: 'هوش مصنوعی',
        tabRecommendations: 'پیشنهادات استایل',
        tabWardrobe: 'کمد لباس من',
        tabHistory: 'تاریخچه و نشان‌شده‌ها',
        generateBtn: 'پیشنهاد ست لباس با هوش مصنوعی',
        generateHint: 'بر اساس تحلیل همزمان آب‌وهوای امروز، دمای متغیر و کمد لباس شما',
        regenerateBtn: '🔄 پیشنهادهای دیگر (تولید ست‌های تازه)',
        regenerateHint: 'ترکیب‌ها و لایه‌بندی‌های متنوع دیگر متناسب با سلیقه، جنسیت و مقصد شما',
        piecesTitle: '👔 اجزای این ست با تصویر:',
        inWardrobe: '✓ در کمد شما',
        suggestion: '+ پیشنهاد تکمیلی',
        whyLabel: 'علت پیشنهاد:',
        umbrellaNeeded: '☔ چتر یا پوشش ضدآب حتماً همراه داشته باشید',
        umbrellaNotNeeded: '☀️ بدون نیاز به چتر در طول روز',
        mannequinBadge: '👗 نمایش ست تن مانکن'
    },
    en: {
        brandTagline: 'Smart Outfit Advisor powered by Real-Time Weather & Wardrobe',
        searchPlaceholder: 'Search city (English or Persian)...',
        myLocation: 'My Location',
        destinationLabel: 'Destination / Plan:',
        styleLabel: 'Style Preference:',
        wardrobeToggleLabel: 'My Wardrobe',
        myProfile: 'My Profile',
        aiBtnText: 'Gemini AI',
        tabRecommendations: 'Outfit Recommendations',
        tabWardrobe: 'My Wardrobe',
        tabHistory: 'History & Favorites',
        generateBtn: 'Generate Outfits with AI',
        generateHint: 'Based on real-time weather forecast, shifts across the day, and your wardrobe',
        regenerateBtn: '🔄 Get Other Outfits (New Styles)',
        regenerateHint: 'Alternative combinations tailored to your occasion, gender and style',
        piecesTitle: '👔 Garment Pieces Breakdown:',
        inWardrobe: '✓ In Your Wardrobe',
        suggestion: '+ Suggested Piece',
        whyLabel: 'Why this outfit:',
        umbrellaNeeded: '☔ Umbrella or waterproof coat strongly recommended',
        umbrellaNotNeeded: '☀️ No umbrella needed throughout the day',
        mannequinBadge: '👗 Mannequin Display'
    },
    tr: {
        brandTagline: 'Hava Durumu ve Kişisel Dolap Tabanlı Akıllı Kombin Danışmanı',
        searchPlaceholder: 'Şehir ara (Türkçe, İngilizce veya Farsça)...',
        myLocation: 'Konumum',
        destinationLabel: 'Gidilecek Yer / Plan:',
        styleLabel: 'Stil Tercihi:',
        wardrobeToggleLabel: 'Kişisel Dolabım',
        myProfile: 'Profilim',
        aiBtnText: 'Yapay Zeka',
        tabRecommendations: 'Kombin Önerileri',
        tabWardrobe: 'Gardırobum',
        tabHistory: 'Geçmiş ve Favoriler',
        generateBtn: 'Yapay Zeka ile Kombin Oluştur',
        generateHint: 'Bugünkü hava durumu ve gardırobunuzun analizine göre',
        regenerateBtn: '🔄 Farklı Kombinler Getir (Yenile)',
        regenerateHint: 'Planınıza, cinsiyetinize ve tercihinize uygun alternatif kombinler',
        piecesTitle: '👔 Kombin Parçaları:',
        inWardrobe: '✓ Dolabınızda Var',
        suggestion: '+ Tamamlayıcı Parça',
        whyLabel: 'Öneri Sebebi:',
        umbrellaNeeded: '☔ Şemsiye veya su geçirmez mont önerilir',
        umbrellaNotNeeded: '☀️ Gün boyunca şemsiyeye gerek yok',
        mannequinBadge: '👗 Manken Üzerinde'
    },
    ar: {
        brandTagline: 'المستشار الذكي لتنسيق الملابس حسب الطقس وخزانة ملابسك',
        searchPlaceholder: 'ابحث عن المدينة...',
        myLocation: 'موقعي الحالي',
        destinationLabel: 'الوجهة / النشاط:',
        styleLabel: 'نمط اللبس:',
        wardrobeToggleLabel: 'خزانتي الخاصة',
        myProfile: 'ملفي الشخصي',
        aiBtnText: 'الذكاء الاصطناعي',
        tabRecommendations: 'تنسيقات الملابس',
        tabWardrobe: 'خزانة ملابسي',
        tabHistory: 'السجل والمفضلة',
        generateBtn: 'اقتراح ستيلات بالذكاء الاصطناعي',
        generateHint: 'بناءً على طقس اليوم وتقلبات درجات الحرارة وخزانتك',
        regenerateBtn: '🔄 اقتراحات أخرى (ستيلات جديدة)',
        regenerateHint: 'تنسيقات بديلة ومميزة تناسب وجهتك وجنسك',
        piecesTitle: '👔 قطع هذا الطقم بالصور:',
        inWardrobe: '✓ متوفر في خزانتك',
        suggestion: '+ اقتراح تكميلي',
        whyLabel: 'سبب الاختيار:',
        umbrellaNeeded: '☔ يُنصح بشدة بحمل مظلة أو معطف واقٍ',
        umbrellaNotNeeded: '☀️ لا حاجة للمظلة خلال اليوم',
        mannequinBadge: '👗 عرض الطقم على مانيكان'
    }
};

// Default garment photos for individual pieces
const DEFAULT_GARMENT_IMAGES = {
    'کاپشن': '/static/uploads/black_jacket_nobg.png',
    'پالتو': 'https://images.unsplash.com/photo-1663501427185-cbff9dda9d2a?auto=format&fit=crop&w=400&q=80',
    'بارانی': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80',
    'ترنچ': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80',
    'هودی': 'https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=400&q=80',
    'پلیور': 'https://images.unsplash.com/photo-1769698005544-48bf7610686d?auto=format&fit=crop&w=400&q=80',
    'بافت': 'https://images.unsplash.com/photo-1769698005544-48bf7610686d?auto=format&fit=crop&w=400&q=80',
    'دورس': 'https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=400&q=80',
    'پیراهن': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
    'تیشرت': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    'پلوشرت': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    'کت تک': 'https://images.unsplash.com/photo-1541888627857-37d0cd590eca?auto=format&fit=crop&w=400&q=80',
    'بلیزر': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
    'کت و شلوار': 'https://images.unsplash.com/photo-1678492861787-54a2a393190b?auto=format&fit=crop&w=400&q=80',
    'جلیقه': 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=400&q=80',
    'شلوار جین': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    'شلوار کتان': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80',
    'شلوار پارچه‌ای': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
    'شلوار اسلش': 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=400&q=80',
    'شلوار': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    'دامن': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=400&q=80',
    'شورت': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=400&q=80',
    'کتانی': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80',
    'کفش ورزشی': 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=400&q=80',
    'کفش چرم': 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80',
    'بوت': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80',
    'نیم‌بوت': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80',
    'کالج': 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=400&q=80',
    'صندل': 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=400&q=80',
    'کفش': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80',
    'شال': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=400&q=80',
    'روسری': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=400&q=80',
    'کلاه بافتنی': 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=400&q=80',
    'کلاه نقاب‌دار': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80',
    'کلاه': 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=400&q=80',
    'دستکش': 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=400&q=80',
    'عینک آفتابی': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80',
    'ساعت': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80',
    'کمربند': 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=400&q=80',
    'کیف': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80',
    'کوله‌پشتی': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
    'چتر': 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=400&q=80',
    'اکسسوری': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=400&q=80'
};

function getGarmentFallbackImage(name, category = '') {
    const text = `${name} ${category}`.toLowerCase();
    for (const [k, url] of Object.entries(DEFAULT_GARMENT_IMAGES)) {
        if (text.includes(k.toLowerCase())) return url;
    }
    return 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80';
}

// High-Resolution Mannequin & Dress Form Fashion Matrix
// Strictly 100% verified photography of clothes styled on fashion mannequins, tailor dummies & boutique dress forms
const MANNEQUIN_FASHION_GALLERY = {
    male: {
        puffer: [
            'https://images.unsplash.com/photo-1769698005544-48bf7610686d?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1766619882669-b02ac877978c?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=85'
        ],
        overcoat: [
            'https://images.unsplash.com/photo-1663501427185-cbff9dda9d2a?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=85'
        ],
        hoodie: [
            'https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1769944508939-4cefc07d6511?auto=format&fit=crop&w=900&q=85'
        ],
        knitwear: [
            'https://images.unsplash.com/photo-1769698005544-48bf7610686d?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1766619882669-b02ac877978c?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=85'
        ],
        formal: [
            'https://images.unsplash.com/photo-1678492861787-54a2a393190b?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1541888627857-37d0cd590eca?auto=format&fit=crop&w=900&q=85'
        ],
        sport: [
            'https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1773832077520-52144131f01f?auto=format&fit=crop&w=900&q=85'
        ],
        casual: [
            'https://images.unsplash.com/photo-1766619882669-b02ac877978c?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1773832077520-52144131f01f?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=85'
        ]
    },
    female: {
        puffer: [
            'https://images.unsplash.com/photo-1769698005544-48bf7610686d?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=85'
        ],
        overcoat: [
            'https://images.unsplash.com/photo-1663501427185-cbff9dda9d2a?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=85'
        ],
        hoodie: [
            'https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=85'
        ],
        knitwear: [
            'https://images.unsplash.com/photo-1769698005544-48bf7610686d?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1766619882669-b02ac877978c?auto=format&fit=crop&w=900&q=85'
        ],
        formal: [
            'https://images.unsplash.com/photo-1678492861787-54a2a393190b?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1541888627857-37d0cd590eca?auto=format&fit=crop&w=900&q=85'
        ],
        sport: [
            'https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1773832077520-52144131f01f?auto=format&fit=crop&w=900&q=85'
        ],
        casual: [
            'https://images.unsplash.com/photo-1773832077520-52144131f01f?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1769944508939-4cefc07d6511?auto=format&fit=crop&w=900&q=85'
        ]
    },
    unisex: {
        puffer: [
            'https://images.unsplash.com/photo-1769698005544-48bf7610686d?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1766619882669-b02ac877978c?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=85'
        ],
        overcoat: [
            'https://images.unsplash.com/photo-1663501427185-cbff9dda9d2a?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=85'
        ],
        hoodie: [
            'https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=85'
        ],
        knitwear: [
            'https://images.unsplash.com/photo-1769698005544-48bf7610686d?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1766619882669-b02ac877978c?auto=format&fit=crop&w=900&q=85'
        ],
        formal: [
            'https://images.unsplash.com/photo-1678492861787-54a2a393190b?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1541888627857-37d0cd590eca?auto=format&fit=crop&w=900&q=85'
        ],
        sport: [
            'https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1773832077520-52144131f01f?auto=format&fit=crop&w=900&q=85'
        ],
        casual: [
            'https://images.unsplash.com/photo-1766619882669-b02ac877978c?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1773832077520-52144131f01f?auto=format&fit=crop&w=900&q=85',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=85'
        ]
    }
};

// Backward-compatibility alias
const NATURAL_FASHION_GALLERY = MANNEQUIN_FASHION_GALLERY;

// DOM Elements
const DOM = {
    // Header & Controls
    cityInput: document.getElementById('cityInput'),
    cityDropdown: document.getElementById('cityDropdown'),
    searchBtn: document.getElementById('searchBtn'),
    gpsBtn: document.getElementById('gpsBtn'),
    gpsBtnText: document.getElementById('gpsBtnText'),
    destinationSelect: document.getElementById('destinationSelect'),
    destLabel: document.getElementById('destLabel'),
    styleSelect: document.getElementById('styleSelect'),
    styleLabel: document.getElementById('styleLabel'),
    wardrobeToggle: document.getElementById('wardrobeToggle'),
    wardrobeToggleLabel: document.getElementById('wardrobeToggleLabel'),
    wardrobeBadgeCount: document.getElementById('wardrobeBadgeCount'),
    profileBtn: document.getElementById('profileBtn'),
    profileStatusText: document.getElementById('profileStatusText'),
    themeSelect: document.getElementById('themeSelect'),
    langSelect: document.getElementById('langSelect'),
    brandTagline: document.querySelector('.brand-tagline'),
    
    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Weather Elements
    weatherCityName: document.getElementById('weatherCityName'),
    weatherUpdateTime: document.getElementById('weatherUpdateTime'),
    currentWeatherIcon: document.getElementById('currentWeatherIcon'),
    currentTemp: document.getElementById('currentTemp'),
    apparentTemp: document.getElementById('apparentTemp'),
    weatherDesc: document.getElementById('weatherDesc'),
    humidityVal: document.getElementById('humidityVal'),
    windVal: document.getElementById('windVal'),
    precipVal: document.getElementById('precipVal'),
    umbrellaStatus: document.getElementById('umbrellaStatus'),
    timelineCards: document.getElementById('timelineCards'),

    // Recommendations
    generateBtn: document.getElementById('generateBtn'),
    generateHint: document.querySelector('.generate-hint'),
    recommendationsContainer: document.getElementById('recommendationsContainer'),
    aiSummaryCard: document.getElementById('aiSummaryCard'),
    aiSummaryText: document.getElementById('aiSummaryText'),
    aiReasonText: document.getElementById('aiReasonText'),
    umbrellaBanner: document.getElementById('umbrellaBanner'),
    outfitsGrid: document.getElementById('outfitsGrid'),
    regenerateBar: document.getElementById('regenerateBar'),
    regenerateOutfitsBtn: document.getElementById('regenerateOutfitsBtn'),
    regenerateBtnText: document.getElementById('regenerateBtnText'),
    refreshHintText: document.getElementById('refreshHintText'),

    // Wardrobe Management
    totalWardrobeItems: document.getElementById('totalWardrobeItems'),
    cleanAllBgBtn: document.getElementById('cleanAllBgBtn'),
    modeVisionBtn: document.getElementById('modeVisionBtn'),
    modeBulkUploadBtn: document.getElementById('modeBulkUploadBtn'),
    modeBulkTextBtn: document.getElementById('modeBulkTextBtn'),
    modeManualBtn: document.getElementById('modeManualBtn'),
    visionForm: document.getElementById('visionForm'),
    bulkUploadForm: document.getElementById('bulkUploadForm'),
    bulkDropZone: document.getElementById('bulkDropZone'),
    bulkPhotoInput: document.getElementById('bulkPhotoInput'),
    bulkFilesPreviewWrap: document.getElementById('bulkFilesPreviewWrap'),
    bulkSelectedCount: document.getElementById('bulkSelectedCount'),
    bulkThumbGrid: document.getElementById('bulkThumbGrid'),
    bulkClearFilesBtn: document.getElementById('bulkClearFilesBtn'),
    bulkProgressWrap: document.getElementById('bulkProgressWrap'),
    bulkProgressBar: document.getElementById('bulkProgressBar'),
    bulkProgressText: document.getElementById('bulkProgressText'),
    bulkUploadSubmitBtn: document.getElementById('bulkUploadSubmitBtn'),
    bulkTextForm: document.getElementById('bulkTextForm'),
    bulkTextInput: document.getElementById('bulkTextInput'),
    bulkTextParseBtn: document.getElementById('bulkTextParseBtn'),
    bulkTextSubmitDirectBtn: document.getElementById('bulkTextSubmitDirectBtn'),
    bulkParsedTableWrap: document.getElementById('bulkParsedTableWrap'),
    bulkParsedTableBody: document.getElementById('bulkParsedTableBody'),
    bulkParsedCount: document.getElementById('bulkParsedCount'),
    bulkSaveParsedBtn: document.getElementById('bulkSaveParsedBtn'),
    manualForm: document.getElementById('manualForm'),
    dropZone: document.getElementById('dropZone'),
    clothingPhotoInput: document.getElementById('clothingPhotoInput'),
    dropZonePrompt: document.getElementById('dropZonePrompt'),
    dropZonePreview: document.getElementById('dropZonePreview'),
    previewImg: document.getElementById('previewImg'),
    confirmUploadBtn: document.getElementById('confirmUploadBtn'),
    cancelUploadBtn: document.getElementById('cancelUploadBtn'),
    detectionResultBox: document.getElementById('detectionResultBox'),
    detectionBadge: document.getElementById('detectionBadge'),
    detectionNote: document.getElementById('detectionNote'),
    detectedDetailsBox: document.getElementById('detectedDetailsBox'),
    detectedDetailsText: document.getElementById('detectedDetailsText'),
    detectedStyleBadge: document.getElementById('detectedStyleBadge'),
    detectedName: document.getElementById('detectedName'),
    detectedCategory: document.getElementById('detectedCategory'),
    detectedColor: document.getElementById('detectedColor'),
    detectedSeason: document.getElementById('detectedSeason'),
    saveDetectedBtn: document.getElementById('saveDetectedBtn'),
    discardDetectedBtn: document.getElementById('discardDetectedBtn'),
    categoryFilters: document.getElementById('categoryFilters'),
    wardrobeGrid: document.getElementById('wardrobeGrid'),

    // History & Favorites
    historyList: document.getElementById('historyList'),
    historyAllBtn: document.getElementById('historyAllBtn'),
    historyFavBtn: document.getElementById('historyFavBtn'),

    // Profile Modal
    profileModal: document.getElementById('profileModal'),
    closeProfileModal: document.getElementById('closeProfileModal'),
    cancelProfileBtn: document.getElementById('cancelProfileBtn'),
    saveProfileBtn: document.getElementById('saveProfileBtn'),

    // Mannequin Showcase Modal
    mannequinModal: document.getElementById('mannequinModal'),
    mannequinModalTitle: document.getElementById('mannequinModalTitle'),
    closeMannequinModal: document.getElementById('closeMannequinModal'),
    closeMannequinBtn: document.getElementById('closeMannequinBtn'),
    mannequinModalImg: document.getElementById('mannequinModalImg'),
    cycleMannequinAngleBtn: document.getElementById('cycleMannequinAngleBtn'),
    cycleMannequinBtnBottom: document.getElementById('cycleMannequinBtnBottom'),
    mannequinPhotoCounter: document.getElementById('mannequinPhotoCounter'),
    mannequinModalTime: document.getElementById('mannequinModalTime'),
    mannequinModalGender: document.getElementById('mannequinModalGender'),
    mannequinModalPieces: document.getElementById('mannequinModalPieces'),
    mannequinModalWhy: document.getElementById('mannequinModalWhy'),

    // API Key Modal
    apiKeyBtn: document.getElementById('apiKeyBtn'),
    apiStatusDot: document.getElementById('apiStatusDot'),
    apiStatusText: document.getElementById('apiStatusText'),
    apiKeyModal: document.getElementById('apiKeyModal'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    cancelApiKeyBtn: document.getElementById('cancelApiKeyBtn'),
    closeApiKeyModal: document.getElementById('closeApiKeyModal'),

    // Cloud Sync Modal
    syncModalBtn: document.getElementById('syncModalBtn'),
    syncModal: document.getElementById('syncModal'),
    closeSyncModal: document.getElementById('closeSyncModal'),
    closeSyncModalBtn: document.getElementById('closeSyncModalBtn'),
    syncKeyInput: document.getElementById('syncKeyInput'),
    generateSyncKeyBtn: document.getElementById('generateSyncKeyBtn'),
    copySyncLinkBtn: document.getElementById('copySyncLinkBtn'),
    pushSyncBtn: document.getElementById('pushSyncBtn'),
    pullSyncBtn: document.getElementById('pullSyncBtn'),
    autoSyncCheckbox: document.getElementById('autoSyncCheckbox'),
    syncStatusBadge: document.getElementById('syncStatusBadge'),
    generateQrBtn: document.getElementById('generateQrBtn'),
    syncQrContainer: document.getElementById('syncQrContainer'),
    syncQrImg: document.getElementById('syncQrImg'),
    syncQrPlaceholder: document.getElementById('syncQrPlaceholder'),
    syncQrHint: document.getElementById('syncQrHint'),
    exportBackupBtn: document.getElementById('exportBackupBtn'),
    importBackupBtn: document.getElementById('importBackupBtn'),
    importBackupFile: document.getElementById('importBackupFile'),
    copySyncCodeBtn: document.getElementById('copySyncCodeBtn'),
    pasteSyncCodeBtn: document.getElementById('pasteSyncCodeBtn'),
    syncCodeExportContainer: document.getElementById('syncCodeExportContainer'),
    syncCodeExportArea: document.getElementById('syncCodeExportArea'),
    copyExportedCodeBtn: document.getElementById('copyExportedCodeBtn'),
    copySuccessNotice: document.getElementById('copySuccessNotice'),
    syncCodeImportArea: document.getElementById('syncCodeImportArea'),
    applySyncCodeBtn: document.getElementById('applySyncCodeBtn'),

    // Loading & Toast
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingTitle: document.getElementById('loadingTitle'),
    loadingMsg: document.getElementById('loadingMsg'),
    toastContainer: document.getElementById('toastContainer')
};

// -------------------------------------------------------------
// Language & Theme Management
// -------------------------------------------------------------
function applyLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('wearwise_lang', lang);
    const isRtl = (lang === 'fa' || lang === 'ar');
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    const t = I18N[lang] || I18N.fa;
    if (DOM.brandTagline) DOM.brandTagline.textContent = t.brandTagline;
    if (DOM.cityInput) DOM.cityInput.placeholder = t.searchPlaceholder;
    if (DOM.gpsBtnText) DOM.gpsBtnText.textContent = t.myLocation;
    if (DOM.destLabel) DOM.destLabel.textContent = t.destinationLabel;
    if (DOM.styleLabel) DOM.styleLabel.textContent = t.styleLabel;
    if (DOM.wardrobeToggleLabel) DOM.wardrobeToggleLabel.textContent = t.wardrobeToggleLabel;
    if (DOM.profileStatusText) DOM.profileStatusText.textContent = t.myProfile;
    if (DOM.apiStatusText) DOM.apiStatusText.textContent = t.aiBtnText;
    if (DOM.generateBtn) {
        const span = DOM.generateBtn.querySelector('span');
        if (span) span.textContent = t.generateBtn;
    }
    if (DOM.generateHint) DOM.generateHint.textContent = t.generateHint;
    if (DOM.regenerateBtnText) DOM.regenerateBtnText.textContent = t.regenerateBtn;
    if (DOM.refreshHintText) DOM.refreshHintText.textContent = t.refreshHint;
    if (DOM.langSelect) DOM.langSelect.value = lang;

    // Tabs labels
    if (DOM.tabButtons && DOM.tabButtons.length >= 3) {
        DOM.tabButtons[0].querySelector('span').textContent = t.tabRecommendations;
        DOM.tabButtons[1].querySelector('span').innerHTML = `${t.tabWardrobe} (<span id="wardrobeBadgeCount">${state.wardrobe.length}</span>)`;
        DOM.tabButtons[2].querySelector('span').textContent = t.tabHistory;
    }
}

function applyTheme(theme) {
    state.theme = theme;
    localStorage.setItem('wearwise_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (DOM.themeSelect) DOM.themeSelect.value = theme;
}

// -------------------------------------------------------------
// Toast & Loading Helpers
// -------------------------------------------------------------
function extractApiErrorMessage(errData, fallbackMessage = 'خطا در انجام عملیات') {
    if (!errData) return fallbackMessage;
    if (typeof errData === 'string') return errData;
    if (typeof errData.detail === 'string') return errData.detail;
    if (Array.isArray(errData.detail) && errData.detail.length > 0) {
        const item = errData.detail[0];
        if (typeof item === 'string') return item;
        if (item && item.msg) {
            const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : '';
            return `خطای مشخصات ${field ? '(' + field + ')' : ''}: ${item.msg}`;
        }
    }
    if (typeof errData.message === 'string') return errData.message;
    return fallbackMessage;
}

function showToast(message, type = 'info') {
    let msgText = message;
    if (typeof msgText !== 'string') {
        try {
            msgText = JSON.stringify(message);
        } catch (_) {
            msgText = 'عملیات با موفقیت انجام شد';
        }
    }
    if (!msgText || msgText.includes('[object Object]')) {
        msgText = type === 'error' ? 'خطا در ثبت یا ارتباط با سرور. لطفاً مجدداً تلاش کنید.' : 'عملیات با موفقیت انجام شد.';
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '•'}</span>
        <span class="toast-msg">${msgText}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showLoading(title = 'در حال پردازش با هوش مصنوعی...', msg = 'لطفاً کمی صبر کنید') {
    DOM.loadingTitle.textContent = title;
    DOM.loadingMsg.textContent = msg;
    DOM.loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    DOM.loadingOverlay.style.display = 'none';
}

// -------------------------------------------------------------
// Environment Detection (Local FastAPI vs Static GitHub Pages)
// -------------------------------------------------------------
function isStaticHost() {
    return (
        window.location.protocol === 'file:' ||
        window.location.hostname.endsWith('github.io') ||
        window.location.hostname.endsWith('pages.dev') ||
        window.location.hostname.endsWith('vercel.app') ||
        window.location.hostname.endsWith('netlify.app') ||
        (window.location.port !== '8000' && window.location.port !== '')
    );
}

// Comprehensive Iranian Cities & Global Hubs Database
const STATIC_CITIES_TABLE = [
    {
        "name": "تهران",
        "name_en": "Tehran",
        "country": "ایران",
        "admin1": "استان تهران",
        "latitude": 35.69439,
        "longitude": 51.42151,
        "lat": 35.69439,
        "lon": 51.42151
    },
    {
        "name": "مشهد",
        "name_en": "Mashhad",
        "country": "ایران",
        "admin1": "خراسان رضوی",
        "latitude": 36.297,
        "longitude": 59.6062,
        "lat": 36.297,
        "lon": 59.6062
    },
    {
        "name": "اصفهان",
        "name_en": "Isfahan",
        "country": "ایران",
        "admin1": "اصفهان",
        "latitude": 32.6546,
        "longitude": 51.668,
        "lat": 32.6546,
        "lon": 51.668
    },
    {
        "name": "شیراز",
        "name_en": "Shiraz",
        "country": "ایران",
        "admin1": "فارس",
        "latitude": 29.5918,
        "longitude": 52.5837,
        "lat": 29.5918,
        "lon": 52.5837
    },
    {
        "name": "تبریز",
        "name_en": "Tabriz",
        "country": "ایران",
        "admin1": "آذربایجان شرقی",
        "latitude": 38.08,
        "longitude": 46.2919,
        "lat": 38.08,
        "lon": 46.2919
    },
    {
        "name": "کرج",
        "name_en": "Karaj",
        "country": "ایران",
        "admin1": "البرز",
        "latitude": 35.8327,
        "longitude": 50.9915,
        "lat": 35.8327,
        "lon": 50.9915
    },
    {
        "name": "رشت",
        "name_en": "Rasht",
        "country": "ایران",
        "admin1": "گیلان",
        "latitude": 37.2808,
        "longitude": 49.5832,
        "lat": 37.2808,
        "lon": 49.5832
    },
    {
        "name": "اهواز",
        "name_en": "Ahvaz",
        "country": "ایران",
        "admin1": "خوزستان",
        "latitude": 31.3183,
        "longitude": 48.6706,
        "lat": 31.3183,
        "lon": 48.6706
    },
    {
        "name": "قم",
        "name_en": "Qom",
        "country": "ایران",
        "admin1": "قم",
        "latitude": 34.6401,
        "longitude": 50.8764,
        "lat": 34.6401,
        "lon": 50.8764
    },
    {
        "name": "کرمانشاه",
        "name_en": "Kermanshah",
        "country": "ایران",
        "admin1": "کرمانشاه",
        "latitude": 34.3142,
        "longitude": 47.065,
        "lat": 34.3142,
        "lon": 47.065
    },
    {
        "name": "ارومیه",
        "name_en": "Urmia",
        "country": "ایران",
        "admin1": "آذربایجان غربی",
        "latitude": 37.5527,
        "longitude": 45.0761,
        "lat": 37.5527,
        "lon": 45.0761
    },
    {
        "name": "یزد",
        "name_en": "Yazd",
        "country": "ایران",
        "admin1": "یزد",
        "latitude": 31.8974,
        "longitude": 54.3569,
        "lat": 31.8974,
        "lon": 54.3569
    },
    {
        "name": "زاهدان",
        "name_en": "Zahedan",
        "country": "ایران",
        "admin1": "سیستان و بلوچستان",
        "latitude": 29.4963,
        "longitude": 60.8629,
        "lat": 29.4963,
        "lon": 60.8629
    },
    {
        "name": "همدان",
        "name_en": "Hamadan",
        "country": "ایران",
        "admin1": "همدان",
        "latitude": 34.7989,
        "longitude": 48.515,
        "lat": 34.7989,
        "lon": 48.515
    },
    {
        "name": "کرمان",
        "name_en": "Kerman",
        "country": "ایران",
        "admin1": "کرمان",
        "latitude": 30.2839,
        "longitude": 57.0788,
        "lat": 30.2839,
        "lon": 57.0788
    },
    {
        "name": "اردبیل",
        "name_en": "Ardabil",
        "country": "ایران",
        "admin1": "اردبیل",
        "latitude": 38.2498,
        "longitude": 48.2933,
        "lat": 38.2498,
        "lon": 48.2933
    },
    {
        "name": "بندرعباس",
        "name_en": "Bandar Abbas",
        "country": "ایران",
        "admin1": "هرمزگان",
        "latitude": 27.1832,
        "longitude": 56.2666,
        "lat": 27.1832,
        "lon": 56.2666
    },
    {
        "name": "اراک",
        "name_en": "Arak",
        "country": "ایران",
        "admin1": "مرکزی",
        "latitude": 34.0917,
        "longitude": 49.6892,
        "lat": 34.0917,
        "lon": 49.6892
    },
    {
        "name": "زنجان",
        "name_en": "Zanjan",
        "country": "ایران",
        "admin1": "زنجان",
        "latitude": 36.6736,
        "longitude": 48.4787,
        "lat": 36.6736,
        "lon": 48.4787
    },
    {
        "name": "سنندج",
        "name_en": "Sanandaj",
        "country": "ایران",
        "admin1": "کردستان",
        "latitude": 35.3219,
        "longitude": 46.9862,
        "lat": 35.3219,
        "lon": 46.9862
    },
    {
        "name": "قزوین",
        "name_en": "Qazvin",
        "country": "ایران",
        "admin1": "قزوین",
        "latitude": 36.2688,
        "longitude": 50.0041,
        "lat": 36.2688,
        "lon": 50.0041
    },
    {
        "name": "خرم‌آباد",
        "name_en": "Khorramabad",
        "country": "ایران",
        "admin1": "لرستان",
        "latitude": 33.4878,
        "longitude": 48.3558,
        "lat": 33.4878,
        "lon": 48.3558
    },
    {
        "name": "گرگان",
        "name_en": "Gorgan",
        "country": "ایران",
        "admin1": "گلستان",
        "latitude": 36.8427,
        "longitude": 54.4439,
        "lat": 36.8427,
        "lon": 54.4439
    },
    {
        "name": "ساری",
        "name_en": "Sari",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.5633,
        "longitude": 53.0601,
        "lat": 36.5633,
        "lon": 53.0601
    },
    {
        "name": "بجنورد",
        "name_en": "Bojnurd",
        "country": "ایران",
        "admin1": "خراسان شمالی",
        "latitude": 37.4747,
        "longitude": 57.329,
        "lat": 37.4747,
        "lon": 57.329
    },
    {
        "name": "بوشهر",
        "name_en": "Bushehr",
        "country": "ایران",
        "admin1": "بوشهر",
        "latitude": 28.9234,
        "longitude": 50.8203,
        "lat": 28.9234,
        "lon": 50.8203
    },
    {
        "name": "بیرجند",
        "name_en": "Birjand",
        "country": "ایران",
        "admin1": "خراسان جنوبی",
        "latitude": 32.8663,
        "longitude": 59.2211,
        "lat": 32.8663,
        "lon": 59.2211
    },
    {
        "name": "ایلام",
        "name_en": "Ilam",
        "country": "ایران",
        "admin1": "ایلام",
        "latitude": 33.6374,
        "longitude": 46.4227,
        "lat": 33.6374,
        "lon": 46.4227
    },
    {
        "name": "شهرکرد",
        "name_en": "Shahrekord",
        "country": "ایران",
        "admin1": "چهارمحال و بختیاری",
        "latitude": 32.3256,
        "longitude": 50.8644,
        "lat": 32.3256,
        "lon": 50.8644
    },
    {
        "name": "سمنان",
        "name_en": "Semnan",
        "country": "ایران",
        "admin1": "سمنان",
        "latitude": 35.5769,
        "longitude": 53.397,
        "lat": 35.5769,
        "lon": 53.397
    },
    {
        "name": "یاسوج",
        "name_en": "Yasuj",
        "country": "ایران",
        "admin1": "کهگیلویه و بویراحمد",
        "latitude": 30.6684,
        "longitude": 51.5876,
        "lat": 30.6684,
        "lon": 51.5876
    },
    {
        "name": "کیش",
        "name_en": "Kish",
        "country": "ایران",
        "admin1": "هرمزگان",
        "latitude": 26.5578,
        "longitude": 54.0194,
        "lat": 26.5578,
        "lon": 54.0194
    },
    {
        "name": "قشم",
        "name_en": "Qeshm",
        "country": "ایران",
        "admin1": "هرمزگان",
        "latitude": 26.9581,
        "longitude": 56.2719,
        "lat": 26.9581,
        "lon": 56.2719
    },
    {
        "name": "کاشان",
        "name_en": "Kashan",
        "country": "ایران",
        "admin1": "اصفهان",
        "latitude": 33.985,
        "longitude": 51.41,
        "lat": 33.985,
        "lon": 51.41
    },
    {
        "name": "نیشابور",
        "name_en": "Neyshabur",
        "country": "ایران",
        "admin1": "خراسان رضوی",
        "latitude": 36.2133,
        "longitude": 58.7958,
        "lat": 36.2133,
        "lon": 58.7958
    },
    {
        "name": "بابل",
        "name_en": "Babol",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.5513,
        "longitude": 52.6789,
        "lat": 36.5513,
        "lon": 52.6789
    },
    {
        "name": "آمل",
        "name_en": "Amol",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.4696,
        "longitude": 52.3507,
        "lat": 36.4696,
        "lon": 52.3507
    },
    {
        "name": "لاهیجان",
        "name_en": "Lahijan",
        "country": "ایران",
        "admin1": "گیلان",
        "latitude": 37.207,
        "longitude": 50.0034,
        "lat": 37.207,
        "lon": 50.0034
    },
    {
        "name": "انزلی",
        "name_en": "Bandar Anzali",
        "country": "ایران",
        "admin1": "گیلان",
        "latitude": 37.4747,
        "longitude": 49.4622,
        "lat": 37.4747,
        "lon": 49.4622
    },
    {
        "name": "چالوس",
        "name_en": "Chaloos",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.655,
        "longitude": 51.4204,
        "lat": 36.655,
        "lon": 51.4204
    },
    {
        "name": "رامسر",
        "name_en": "Ramsar",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.9174,
        "longitude": 50.6681,
        "lat": 36.9174,
        "lon": 50.6681
    },
    {
        "name": "نوشهر",
        "name_en": "Nowshahr",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.6496,
        "longitude": 51.496,
        "lat": 36.6496,
        "lon": 51.496
    },
    {
        "name": "آستارا",
        "name_en": "Astara",
        "country": "ایران",
        "admin1": "گیلان",
        "latitude": 38.4294,
        "longitude": 48.8719,
        "lat": 38.4294,
        "lon": 48.8719
    },
    {
        "name": "آبادان",
        "name_en": "Abadan",
        "country": "ایران",
        "admin1": "خوزستان",
        "latitude": 30.3392,
        "longitude": 48.3043,
        "lat": 30.3392,
        "lon": 48.3043
    },
    {
        "name": "دزفول",
        "name_en": "Dezful",
        "country": "ایران",
        "admin1": "خوزستان",
        "latitude": 32.3811,
        "longitude": 48.4058,
        "lat": 32.3811,
        "lon": 48.4058
    },
    {
        "name": "بروجرد",
        "name_en": "Borujerd",
        "country": "ایران",
        "admin1": "لرستان",
        "latitude": 33.8973,
        "longitude": 48.7516,
        "lat": 33.8973,
        "lon": 48.7516
    },
    {
        "name": "ساوه",
        "name_en": "Saveh",
        "country": "ایران",
        "admin1": "مرکزی",
        "latitude": 35.0213,
        "longitude": 50.3566,
        "lat": 35.0213,
        "lon": 50.3566
    },
    {
        "name": "شاهرود",
        "name_en": "Shahroud",
        "country": "ایران",
        "admin1": "سمنان",
        "latitude": 36.4182,
        "longitude": 54.9763,
        "lat": 36.4182,
        "lon": 54.9763
    },
    {
        "name": "سبزوار",
        "name_en": "Sabzevar",
        "country": "ایران",
        "admin1": "خراسان رضوی",
        "latitude": 36.2126,
        "longitude": 57.6789,
        "lat": 36.2126,
        "lon": 57.6789
    },
    {
        "name": "مراغه",
        "name_en": "Maragheh",
        "country": "ایران",
        "admin1": "آذربایجان شرقی",
        "latitude": 37.3917,
        "longitude": 46.2392,
        "lat": 37.3917,
        "lon": 46.2392
    },
    {
        "name": "مهاباد",
        "name_en": "Mahabad",
        "country": "ایران",
        "admin1": "آذربایجان غربی",
        "latitude": 36.7631,
        "longitude": 45.7222,
        "lat": 36.7631,
        "lon": 45.7222
    },
    {
        "name": "خوی",
        "name_en": "Khoy",
        "country": "ایران",
        "admin1": "آذربایجان غربی",
        "latitude": 38.5503,
        "longitude": 44.9525,
        "lat": 38.5503,
        "lon": 44.9525
    },
    {
        "name": "رفسنجان",
        "name_en": "Rafsanjan",
        "country": "ایران",
        "admin1": "کرمان",
        "latitude": 30.4067,
        "longitude": 55.9939,
        "lat": 30.4067,
        "lon": 55.9939
    },
    {
        "name": "سیرجان",
        "name_en": "Sirjan",
        "country": "ایران",
        "admin1": "کرمان",
        "latitude": 29.452,
        "longitude": 55.6814,
        "lat": 29.452,
        "lon": 55.6814
    },
    {
        "name": "چابهار",
        "name_en": "Chabahar",
        "country": "ایران",
        "admin1": "سیستان و بلوچستان",
        "latitude": 25.2919,
        "longitude": 60.643,
        "lat": 25.2919,
        "lon": 60.643
    },
    {
        "name": "سقز",
        "name_en": "Saqqez",
        "country": "ایران",
        "admin1": "کردستان",
        "latitude": 36.2499,
        "longitude": 46.2733,
        "lat": 36.2499,
        "lon": 46.2733
    },
    {
        "name": "مریوان",
        "name_en": "Marivan",
        "country": "ایران",
        "admin1": "کردستان",
        "latitude": 35.5269,
        "longitude": 46.176,
        "lat": 35.5269,
        "lon": 46.176
    },
    {
        "name": "بانه",
        "name_en": "Baneh",
        "country": "ایران",
        "admin1": "کردستان",
        "latitude": 35.9975,
        "longitude": 45.8853,
        "lat": 35.9975,
        "lon": 45.8853
    },
    {
        "name": "بوکان",
        "name_en": "Bukan",
        "country": "ایران",
        "admin1": "آذربایجان غربی",
        "latitude": 36.5208,
        "longitude": 46.2089,
        "lat": 36.5208,
        "lon": 46.2089
    },
    {
        "name": "تنکابن",
        "name_en": "Tonekabon",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.8163,
        "longitude": 50.8738,
        "lat": 36.8163,
        "lon": 50.8738
    },
    {
        "name": "قائم‌شهر",
        "name_en": "Qaem Shahr",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.4639,
        "longitude": 52.8597,
        "lat": 36.4639,
        "lon": 52.8597
    },
    {
        "name": "بابلسر",
        "name_en": "Babolsar",
        "country": "ایران",
        "admin1": "مازندران",
        "latitude": 36.7024,
        "longitude": 52.6578,
        "lat": 36.7024,
        "lon": 52.6578
    },
    {
        "name": "گنبد کاووس",
        "name_en": "Gonbad-e Kavus",
        "country": "ایران",
        "admin1": "گلستان",
        "latitude": 37.25,
        "longitude": 55.1672,
        "lat": 37.25,
        "lon": 55.1672
    },
    {
        "name": "لنگرود",
        "name_en": "Langerud",
        "country": "ایران",
        "admin1": "گیلان",
        "latitude": 37.197,
        "longitude": 50.1536,
        "lat": 37.197,
        "lon": 50.1536
    },
    {
        "name": "دماوند",
        "name_en": "Damavand",
        "country": "ایران",
        "admin1": "تهران",
        "latitude": 35.7178,
        "longitude": 52.065,
        "lat": 35.7178,
        "lon": 52.065
    },
    {
        "name": "شهریار",
        "name_en": "Shahriar",
        "country": "ایران",
        "admin1": "تهران",
        "latitude": 35.6597,
        "longitude": 51.0592,
        "lat": 35.6597,
        "lon": 51.0592
    },
    {
        "name": "اسلامشهر",
        "name_en": "Eslamshahr",
        "country": "ایران",
        "admin1": "تهران",
        "latitude": 35.5392,
        "longitude": 51.2349,
        "lat": 35.5392,
        "lon": 51.2349
    },
    {
        "name": "ورامین",
        "name_en": "Varamin",
        "country": "ایران",
        "admin1": "تهران",
        "latitude": 35.3242,
        "longitude": 51.6464,
        "lat": 35.3242,
        "lon": 51.6464
    },
    {
        "name": "نجف‌آباد",
        "name_en": "Najafabad",
        "country": "ایران",
        "admin1": "اصفهان",
        "latitude": 32.6341,
        "longitude": 51.3667,
        "lat": 32.6341,
        "lon": 51.3667
    },
    {
        "name": "شاهین‌شهر",
        "name_en": "Shahin Shahr",
        "country": "ایران",
        "admin1": "اصفهان",
        "latitude": 32.8647,
        "longitude": 51.5475,
        "lat": 32.8647,
        "lon": 51.5475
    },
    {
        "name": "استانبول",
        "name_en": "Istanbul",
        "country": "ترکیه",
        "admin1": "استانبول",
        "latitude": 41.0082,
        "longitude": 28.9784,
        "lat": 41.0082,
        "lon": 28.9784
    },
    {
        "name": "دبی",
        "name_en": "Dubai",
        "country": "امارات",
        "admin1": "دبی",
        "latitude": 25.2048,
        "longitude": 55.2708,
        "lat": 25.2048,
        "lon": 55.2708
    },
    {
        "name": "باکو",
        "name_en": "Baku",
        "country": "جمهوری آذربایجان",
        "admin1": "باکو",
        "latitude": 40.4093,
        "longitude": 49.8671,
        "lat": 40.4093,
        "lon": 49.8671
    },
    {
        "name": "تفلیس",
        "name_en": "Tbilisi",
        "country": "گرجستان",
        "admin1": "تفلیس",
        "latitude": 41.7151,
        "longitude": 44.8271,
        "lat": 41.7151,
        "lon": 44.8271
    },
    {
        "name": "ایروان",
        "name_en": "Yerevan",
        "country": "ارمنستان",
        "admin1": "ایروان",
        "latitude": 40.1792,
        "longitude": 44.4991,
        "lat": 40.1792,
        "lon": 44.4991
    },
    {
        "name": "لندن",
        "name_en": "London",
        "country": "بریتانیا",
        "admin1": "انگلستان",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "lat": 51.5074,
        "lon": -0.1278
    },
    {
        "name": "پاریس",
        "name_en": "Paris",
        "country": "فرانسه",
        "admin1": "ایل-دو-فرانس",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "lat": 48.8566,
        "lon": 2.3522
    },
    {
        "name": "نیویورک",
        "name_en": "New York",
        "country": "آمریکا",
        "admin1": "نیویورک",
        "latitude": 40.7128,
        "longitude": -74.006,
        "lat": 40.7128,
        "lon": -74.006
    },
    {
        "name": "تورنتو",
        "name_en": "Toronto",
        "country": "کانادا",
        "admin1": "انتاریو",
        "latitude": 43.6532,
        "longitude": -79.3832,
        "lat": 43.6532,
        "lon": -79.3832
    },
    {
        "name": "برلین",
        "name_en": "Berlin",
        "country": "آلمان",
        "admin1": "برلین",
        "latitude": 52.52,
        "longitude": 13.405,
        "lat": 52.52,
        "lon": 13.405
    }
];

function decodeWmoCodeClientSide(code) {
    const map = {
        0: ['صاف و آفتابی', 'clear', '☀️'],
        1: ['عمدتاً صاف و ملایم', 'mainly_clear', '🌤️'],
        2: ['کمی تا نیمه‌ابری', 'partly_cloudy', '⛅'],
        3: ['تمام ابری', 'overcast', '☁️'],
        45: ['مه‌آلود', 'foggy', '🌫️'],
        48: ['مه غلیظ و یخبندان', 'foggy', '🌫️'],
        51: ['نم‌نم باران ملایم', 'drizzle', '🌦️'],
        53: ['باران خفیف', 'drizzle', '🌦️'],
        55: ['نم‌نم باران پیوسته', 'drizzle', '🌦️'],
        61: ['بارش باران ملایم', 'rainy', '🌧️'],
        63: ['بارش باران', 'rainy', '🌧️'],
        65: ['بارش باران شدید', 'rainy', '🌧️'],
        71: ['بارش برف ملایم', 'snowy', '🌨️'],
        73: ['بارش برف', 'snowy', '🌨️'],
        75: ['بارش برف سنگین', 'snowy', '❄️'],
        80: ['رگبار پراکنده باران', 'showers', '🌦️'],
        81: ['رگبار باران', 'showers', '🌧️'],
        82: ['رگبار شدید باران', 'showers', '🌧️'],
        95: ['رعد و برق و طوفان', 'thunderstorm', '⚡']
    };
    return map[code] || ['هوای متغیر', 'partly_cloudy', '⛅'];
}

async function fetchWeatherClientSide(cityName, targetLat, targetLon) {
    let lat = targetLat;
    let lon = targetLon;
    let finalCity = cityName || 'تهران';

    if (lat === null || lon === null || lat === undefined || lon === undefined) {
        const found = STATIC_CITIES_TABLE.find(c => 
            c.name.includes(finalCity) || finalCity.includes(c.name) ||
            c.name_en.toLowerCase() === finalCity.toLowerCase()
        );
        if (found) {
            lat = found.lat;
            lon = found.lon;
            finalCity = found.name;
        } else {
            try {
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(finalCity)}&count=1&format=json`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.results && geoData.results.length > 0) {
                        lat = geoData.results[0].latitude;
                        lon = geoData.results[0].longitude;
                        finalCity = geoData.results[0].name;
                    }
                }
            } catch (_) {}
        }
    }

    if (lat === null || lon === null || lat === undefined || lon === undefined) {
        lat = 35.69439;
        lon = 51.42151;
        finalCity = 'تهران';
    }

    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation,weather_code&timezone=auto`;
    const res = await fetch(openMeteoUrl);
    if (!res.ok) throw new Error('خطا در ارتباط با سرور هواشناسی');
    const data = await res.json();

    const curr = data.current || {};
    const [desc, slug, icon] = decodeWmoCodeClientSide(curr.weather_code || 0);

    const hourly = data.hourly || {};
    const temps = (hourly.temperature_2m || []).slice(0, 24);
    const precips = (hourly.precipitation || []).slice(0, 24);
    const codes = (hourly.weather_code || []).slice(0, 24);

    const maxTemp = temps.length ? Math.round(Math.max(...temps)) : Math.round(curr.temperature_2m || 15);
    const minTemp = temps.length ? Math.round(Math.min(...temps)) : Math.round(curr.temperature_2m || 10);
    const hasRain = (curr.precipitation || 0) > 0.2 || precips.some(p => p > 0.3) || [51,53,55,61,63,65,80,81,82,95].includes(curr.weather_code);

    const timelineSlots = [
        { title: "صبح (۰۸:۰۰)", hour: 8 },
        { title: "ظهر (۱۴:۰۰)", hour: 14 },
        { title: "عصر (۲۰:۰۰)", hour: 20 },
        { title: "شب (۲۳:۰۰)", hour: 23 }
    ];

    const timeline = timelineSlots.map(slot => {
        const hTemp = temps[slot.hour] !== undefined ? Math.round(temps[slot.hour]) : Math.round(curr.temperature_2m || 15);
        const hCode = codes[slot.hour] !== undefined ? codes[slot.hour] : curr.weather_code;
        const [hDesc, , hIcon] = decodeWmoCodeClientSide(hCode);
        const hPrecip = precips[slot.hour] ? Math.round(precips[slot.hour] * 20) : 0;
        return {
            title: slot.title,
            hour: slot.hour,
            temp: hTemp,
            precip: Math.min(100, Math.max(0, hPrecip)),
            desc: hDesc,
            icon: hIcon
        };
    });

    return {
        city: finalCity,
        latitude: lat,
        longitude: lon,
        current: {
            temperature: Math.round(curr.temperature_2m || 15),
            apparent_temperature: Math.round(curr.apparent_temperature || curr.temperature_2m || 14),
            humidity: Math.round(curr.relative_humidity_2m || 40),
            wind_speed: Math.round(curr.wind_speed_10m || 5),
            precipitation: curr.precipitation || 0,
            weather_code: curr.weather_code || 0,
            description: desc,
            icon: icon
        },
        day_summary: {
            max_temp: maxTemp,
            min_temp: minTemp,
            temp_difference: maxTemp - minTemp,
            max_precip_chance: hasRain ? 60 : 10,
            rain_alert: hasRain
        },
        timeline: timeline
    };
}

function getInitialWardrobeSeed() {
    return [
        { id: 1, name: "کاپشن بادی مشکی کلاه‌دار", category: "کاپشن", color: "مشکی", season: "زمستان", image_url: "https://images.unsplash.com/photo-1766619882669-b02ac877978c?auto=format&fit=crop&w=400&q=80" },
        { id: 2, name: "شلوار جین تیره راسته", category: "شلوار", color: "سرمه‌ای", season: "چهارفصل", image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80" },
        { id: 3, name: "هودی دورس طوسی پنبه‌ای", category: "هودی", color: "طوسی", season: "پاییز و زمستان", image_url: "https://images.unsplash.com/photo-1707593377592-2a84a1a85c09?auto=format&fit=crop&w=400&q=80" },
        { id: 4, name: "کتانی ورزشی سفید نایک", category: "کفش", color: "سفید", season: "چهارفصل", image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80" }
    ];
}

function safeSetLocalWardrobe(items) {
    if (!Array.isArray(items)) return;
    try {
        localStorage.setItem('wearwise_wardrobe_items', JSON.stringify(items));
    } catch (e) {
        console.warn('localStorage quota reached, optimizing image sizes:', e);
        try {
            const optimized = items.map(it => ({
                ...it,
                image_url: (it.image_url && !it.image_url.startsWith('data:'))
                    ? it.image_url
                    : getGarmentFallbackImage(it.name, it.category)
            }));
            localStorage.setItem('wearwise_wardrobe_items', JSON.stringify(optimized));
        } catch (_) {}
    }
}

function getLocalWardrobe() {
    const raw = localStorage.getItem('wearwise_wardrobe_items');
    if (!raw) {
        const seed = getInitialWardrobeSeed();
        safeSetLocalWardrobe(seed);
        return seed;
    }
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : getInitialWardrobeSeed();
    } catch (_) {
        return getInitialWardrobeSeed();
    }
}

function getLocalHistory() {
    const raw = localStorage.getItem('wearwise_history_items');
    try {
        return raw ? JSON.parse(raw) : [];
    } catch (_) {
        return [];
    }
}

function saveLocalHistory(rec) {
    const history = getLocalHistory();
    const item = {
        id: rec.history_id || Date.now(),
        city: state.city,
        weather_summary: rec.summary,
        reason: rec.reason,
        umbrella: rec.umbrella ? 1 : 0,
        outfits_json: JSON.stringify(rec.outfits),
        is_favorite: 0,
        created_at: new Date().toISOString()
    };
    history.unshift(item);
    localStorage.setItem('wearwise_history_items', JSON.stringify(history.slice(0, 50)));
}

// ============================================================
// Canvas-Based Client-Side Background Removal (Flood-Fill BFS)
// ============================================================
async function removeBackgroundFromDataUrl(dataUrl) {
    return new Promise((resolve) => {
        // Safe check: Only process valid local data URLs, avoid remote CORS issues completely
        if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
            return resolve(dataUrl);
        }

        const img = new Image();
        img.onload = () => {
            try {
                // Resize to max 280px to guarantee instant execution (10ms) and lightweight storage
                const maxDim = 280;
                let w = img.width || 280;
                let h = img.height || 280;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                const imgData = ctx.getImageData(0, 0, w, h);
                const data = imgData.data;

                // Sample border pixels across all 4 edges to detect background color
                const borderSamples = [];
                const stepX = Math.max(1, Math.floor(w / 30));
                const stepY = Math.max(1, Math.floor(h / 30));

                for (let x = 0; x < w; x += stepX) {
                    const topIdx = (0 * w + x) * 4;
                    borderSamples.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);
                    const botIdx = ((h - 1) * w + x) * 4;
                    borderSamples.push([data[botIdx], data[botIdx + 1], data[botIdx + 2]]);
                }
                for (let y = 0; y < h; y += stepY) {
                    const leftIdx = (y * w + 0) * 4;
                    borderSamples.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);
                    const rightIdx = (y * w + (w - 1)) * 4;
                    borderSamples.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
                }

                if (borderSamples.length === 0) return resolve(dataUrl);

                let avgR = 0, avgG = 0, avgB = 0;
                for (const s of borderSamples) {
                    avgR += s[0];
                    avgG += s[1];
                    avgB += s[2];
                }
                avgR /= borderSamples.length;
                avgG /= borderSamples.length;
                avgB /= borderSamples.length;

                function colorDiff(r, g, b, tr, tg, tb) {
                    const dr = r - tr;
                    const dg = g - tg;
                    const db = b - tb;
                    return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
                }

                let maxBorderDist = 0;
                for (const s of borderSamples) {
                    const dist = colorDiff(s[0], s[1], s[2], avgR, avgG, avgB);
                    if (dist > maxBorderDist) maxBorderDist = dist;
                }
                const threshold = Math.max(28, Math.min(75, maxBorderDist * 1.3 + 20));

                // BFS Flood Fill from outer edges
                const visited = new Uint8Array(w * h);
                const queue = new Int32Array(w * h);
                let qHead = 0;
                let qTail = 0;

                function checkAndEnqueue(x, y) {
                    const pos = y * w + x;
                    if (visited[pos]) return;
                    const idx = pos * 4;
                    if (colorDiff(data[idx], data[idx + 1], data[idx + 2], avgR, avgG, avgB) <= threshold) {
                        visited[pos] = 1;
                        queue[qTail++] = pos;
                    }
                }

                for (let x = 0; x < w; x++) {
                    checkAndEnqueue(x, 0);
                    checkAndEnqueue(x, h - 1);
                }
                for (let y = 0; y < h; y++) {
                    checkAndEnqueue(0, y);
                    checkAndEnqueue(w - 1, y);
                }

                while (qHead < qTail) {
                    const curr = queue[qHead++];
                    const cx = curr % w;
                    const cy = Math.floor(curr / w);

                    const neighbors = [
                        cx > 0 ? curr - 1 : -1,
                        cx < w - 1 ? curr + 1 : -1,
                        cy > 0 ? curr - w : -1,
                        cy < h - 1 ? curr + w : -1
                    ];

                    for (let n = 0; n < 4; n++) {
                        const nPos = neighbors[n];
                        if (nPos === -1 || visited[nPos]) continue;
                        const idx = nPos * 4;
                        if (colorDiff(data[idx], data[idx + 1], data[idx + 2], avgR, avgG, avgB) <= threshold) {
                            visited[nPos] = 1;
                            queue[qTail++] = nPos;
                        }
                    }
                }

                // Transparent background
                for (let p = 0; p < w * h; p++) {
                    if (visited[p]) {
                        data[p * 4 + 3] = 0;
                    }
                }

                // Edge smoothing
                for (let y = 1; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        const pos = y * w + x;
                        if (!visited[pos]) {
                            if (visited[pos - 1] || visited[pos + 1] || visited[pos - w] || visited[pos + w]) {
                                const idx = pos * 4;
                                const diff = colorDiff(data[idx], data[idx + 1], data[idx + 2], avgR, avgG, avgB);
                                if (diff < threshold * 1.3) {
                                    const factor = Math.max(0.18, (diff - threshold) / (threshold * 0.3));
                                    data[idx + 3] = Math.round(data[idx + 3] * factor);
                                }
                            }
                        }
                    }
                }

                ctx.putImageData(imgData, 0, 0);
                let resultUrl = canvas.toDataURL('image/png');
                try {
                    const webpUrl = canvas.toDataURL('image/webp', 0.85);
                    if (webpUrl && webpUrl.startsWith('data:image/webp') && webpUrl.length < resultUrl.length) {
                        resultUrl = webpUrl;
                    }
                } catch (_) {}
                resolve(resultUrl);
            } catch (err) {
                console.warn('removeBackgroundFromDataUrl fallback:', err);
                resolve(dataUrl);
            }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

async function cleanAllWardrobeBackgrounds() {
    if (!state.wardrobe || state.wardrobe.length === 0) {
        showToast('کمد شما در حال حاضر خالی است.', 'warning');
        return;
    }

    const localUploads = state.wardrobe.filter(item => item.image_url && item.image_url.startsWith('data:image/'));
    if (localUploads.length === 0) {
        showToast('عکس‌های پیش‌فرض کمد قبلاً شفاف و آماده هستند. این دکمه برای حذف پس‌زمینه عکس‌هایی است که خودتان آپلود می‌کنید.', 'info');
        return;
    }

    showLoading('در حال حذف پس‌زمینه عکس‌های کمد...', `پردازش هوشمند ${localUploads.length} تصویر اختصاصی`);

    let cleanedCount = 0;
    try {
        for (let i = 0; i < state.wardrobe.length; i++) {
            const item = state.wardrobe[i];
            if (item.image_url && item.image_url.startsWith('data:image/')) {
                try {
                    const cleanPng = await removeBackgroundFromDataUrl(item.image_url);
                    if (cleanPng && cleanPng.length > 50) {
                        item.image_url = cleanPng;
                        cleanedCount++;
                    }
                } catch (e) {
                    console.warn(`Could not clean background for ${item.name}:`, e);
                }
            }
        }

        safeSetLocalWardrobe(state.wardrobe);
        renderWardrobe();
        showToast(`✨ پس‌زمینه ${cleanedCount} لباس در کمد با موفقیت حذف و شفاف شد!`, 'success');
        triggerAutoSync();
    } catch (err) {
        console.error('cleanAllWardrobeBackgrounds error:', err);
        showToast('خطا در فرآیند حذف پس‌زمینه: ' + (err.message || 'خطای غیرمنتظره'), 'error');
    } finally {
        hideLoading();
    }
}
window.cleanAllWardrobeBackgrounds = cleanAllWardrobeBackgrounds;

// ============================================================
// Intelligent Wardrobe Fuzzy Matching Function
// ============================================================
function findMatchingWardrobeItem(itemName, wardrobeList) {
    if (!itemName || !Array.isArray(wardrobeList) || wardrobeList.length === 0) return null;
    const cleanStr = (s) => (s || '').trim().toLowerCase().replace(/[،\-–—_().]/g, ' ');
    const target = cleanStr(itemName);
    const targetWords = target.split(/\s+/).filter(w => w.length > 1);
    const targetIsWarm = ['پلیور', 'هودی', 'بافت', 'دورس', 'سویشرت'].some(k => target.includes(k));

    // 1. Direct equality or substring
    for (const w of wardrobeList) {
        if (!w || !w.name) continue;
        const wn = cleanStr(w.name);
        const wCat = cleanStr(w.category || '');
        const wIsWarm = ['پلیور', 'هودی', 'بافت', 'دورس', 'سویشرت'].some(k => wn.includes(k) || wCat.includes(k));

        // Strict guard: Non-warm items (shirts, t-shirts, pants) must never match a pullover/hoodie!
        if (!targetIsWarm && wIsWarm) continue;
        if (targetIsWarm && !wIsWarm) continue;

        if (wn === target || wn.includes(target) || target.includes(wn)) {
            return w;
        }
    }

    // 2. Garment type & keyword overlap scoring
    const garmentTypes = ['تیشرت', 'پیراهن', 'شلوار', 'کاپشن', 'پالتو', 'بارانی', 'هودی', 'پلیور', 'بافت', 'دورس', 'کتانی', 'کفش', 'بوت', 'نیم‌بوت', 'صندل', 'ساعت', 'عینک', 'کلاه', 'شال', 'کیف', 'کمربند', 'جلیقه', 'کت'];
    
    let bestMatch = null;
    let highestScore = 0;

    for (const w of wardrobeList) {
        if (!w || !w.name) continue;
        const wn = cleanStr(w.name);
        const wCategory = cleanStr(w.category || '');
        const wIsWarm = ['پلیور', 'هودی', 'بافت', 'دورس', 'سویشرت'].some(k => wn.includes(k) || wCategory.includes(k));

        if (!targetIsWarm && wIsWarm) continue;
        if (targetIsWarm && !wIsWarm) continue;

        const wWords = wn.split(/\s+/).filter(x => x.length > 1);

        let score = 0;
        // Check if both share the garment type keyword
        for (const type of garmentTypes) {
            if (target.includes(type) && (wn.includes(type) || wCategory.includes(type))) {
                score += 6;
                break;
            }
        }

        // Count overlapping words
        for (const tw of targetWords) {
            if (wWords.includes(tw)) {
                score += 2;
            }
        }

        if (score > highestScore && score >= 5) {
            highestScore = score;
            bestMatch = w;
        }
    }

    return bestMatch;
}

// ============================================================
// Intelligent Wardrobe Item Classification & Sanitizer Engine
// ============================================================
function classifyGarmentItem(name, category = '') {
    const n = (name || '').toLowerCase().replace('ي', 'ی').replace('ك', 'ک');
    const c = (category || '').toLowerCase().replace('ي', 'ی').replace('ك', 'ک');

    // 1. Outerwear (Check first so 'کت جین' or 'کاپشن کلاه‌دار' are always OUTERWEAR!)
    if (['کاپشن', 'پالتو', 'بارانی', 'ترنچ', 'پافر', 'بادگیر', 'اورکت', 'کت تک', 'کت چرم', 'کت جین', 'کت اسپرت', 'جلیقه'].some(k => n.includes(k)) || ['کاپشن', 'پالتو'].includes(c)) {
        return 'OUTERWEAR';
    }

    // 2. Warm Tops (pullover, hoodie, sweatshirt, knitwear)
    if (['پلیور', 'هودی', 'بافت', 'دورس', 'سویشرت', 'ژاکت', 'یقه اسکی'].some(k => n.includes(k)) || ['پلیور', 'هودی', 'بافت', 'دورس'].includes(c)) {
        return 'WARM_TOP';
    }

    // 3. Base Tops (t-shirt, button-down shirt, polo, blouse)
    if (['تیشرت', 'تی‌شرت', 'پلوشرت', 'پولوشرت', 'پیراهن', 'شومیز', 'تاپ', 'بلوز'].some(k => n.includes(k)) || ['تیشرت', 'پیراهن', 'شومیز'].includes(c)) {
        return 'BASE_TOP';
    }

    // 4. Footwear
    if (['کفش', 'کتانی', 'بوت', 'نیم‌بوت', 'صندل', 'لوفر', 'اسنیکرز', 'پوتین'].some(k => n.includes(k)) || ['کفش', 'کتانی', 'shoes'].includes(c)) {
        return 'SHOES';
    }

    // 5. Bottoms (pants, jeans, skirts)
    if (['شلوار', 'دامن', 'اسلش', 'شلوارک'].some(k => n.includes(k)) || ['شلوار', 'دامن'].includes(c)) {
        return 'BOTTOM';
    }
    if (['جین', 'کتان', 'بگ', 'مام استایل', 'کارگو'].some(k => n.includes(k))) {
        return 'BOTTOM';
    }

    // 6. Accessories (hats, watches, glasses, belts, bags, scarves)
    const isHat = n.includes('کلاه') && !n.includes('کلاه‌دار') && !n.includes('کلاه دار');
    if (isHat || ['ساعت', 'عینک', 'دستبند', 'کیف', 'کمربند', 'گردنبند', 'شال گردن', 'شال‌گردن'].some(k => n.includes(k)) || ['اکسسوری', 'accessory'].includes(c)) {
        return 'ACCESSORY';
    }

    return 'OTHER';
}

function sanitizeOutfitsStructure(outfits, wardrobeList = null) {
    if (!Array.isArray(outfits) || outfits.length === 0) return outfits;
    
    const wardrobeNames = Array.isArray(wardrobeList) ? wardrobeList.map(w => (w?.name || '').trim()) : [];
    const wardrobeSet = new Set(wardrobeNames);
    const gender = (state.profile?.gender || 'unisex').toLowerCase();

    return outfits.map(outfit => {
        if (!outfit || typeof outfit !== 'object') return outfit;
        
        const fromWSet = new Set(Array.isArray(outfit.from_wardrobe) ? outfit.from_wardrobe.map(x => (x || '').trim()) : []);
        let items = Array.isArray(outfit.items) ? [...outfit.items] : [];
        if (items.length === 0) {
            items = [...(outfit.from_wardrobe || []), ...(outfit.general_suggestions || [])];
        }

        const slots = {
            BASE_TOP: [],
            WARM_TOP: [],
            OUTERWEAR: [],
            BOTTOM: [],
            SHOES: [],
            ACCESSORY: [],
            OTHER: []
        };

        items.forEach(it => {
            const cat = classifyGarmentItem(it);
            slots[cat].push(it);
        });

        const finalItems = [];

        // 1. Warm Top: At most 1 (NO TWO PULLOVERS/SWEATERS EVER)
        let chosenWarm = null;
        if (slots.WARM_TOP.length > 0) {
            const wWarm = slots.WARM_TOP.filter(x => fromWSet.has(x) || wardrobeSet.has(x));
            chosenWarm = wWarm.length > 0 ? wWarm[0] : slots.WARM_TOP[0];
        }

        // 2. Base Top: At most 1
        let chosenBase = null;
        if (slots.BASE_TOP.length > 0) {
            const wBase = slots.BASE_TOP.filter(x => fromWSet.has(x) || wardrobeSet.has(x));
            chosenBase = wBase.length > 0 ? wBase[0] : slots.BASE_TOP[0];
        } else if (slots.WARM_TOP.length > 1 && !chosenBase) {
            // If there were 2 warm tops and no base top, substitute the duplicate with an inner shirt (NO word pullover!)
            chosenBase = (gender === 'female') ? 'بلوز نخی زنانه' : 'پیراهن آستین بلند نخی';
        }

        if (chosenBase) finalItems.push(chosenBase);
        if (chosenWarm) finalItems.push(chosenWarm);

        // 3. Bottom: Exactly 1
        if (slots.BOTTOM.length > 0) {
            const wBtm = slots.BOTTOM.filter(x => fromWSet.has(x) || wardrobeSet.has(x));
            finalItems.push(wBtm.length > 0 ? wBtm[0] : slots.BOTTOM[0]);
        } else {
            finalItems.push(gender === 'female' ? 'شلوار پارچه‌ای یا دامن شیک' : 'شلوار جین کلاسیک');
        }

        // 4. Outerwear: At most 1
        if (slots.OUTERWEAR.length > 0) {
            const wOut = slots.OUTERWEAR.filter(x => fromWSet.has(x) || wardrobeSet.has(x));
            finalItems.push(wOut.length > 0 ? wOut[0] : slots.OUTERWEAR[0]);
        }

        // 5. Shoes: Exactly 1
        if (slots.SHOES.length > 0) {
            const wShoe = slots.SHOES.filter(x => fromWSet.has(x) || wardrobeSet.has(x));
            finalItems.push(wShoe.length > 0 ? wShoe[0] : slots.SHOES[0]);
        } else {
            finalItems.push('کتانی راحت یا نیم‌بوت');
        }

        // 6. Accessory: At most 1
        if (slots.ACCESSORY.length > 0) {
            const wAcc = slots.ACCESSORY.filter(x => fromWSet.has(x) || wardrobeSet.has(x));
            finalItems.push(wAcc.length > 0 ? wAcc[0] : slots.ACCESSORY[0]);
        }

        const newFromW = finalItems.filter(x => fromWSet.has(x) || wardrobeSet.has(x));
        const newGenS = finalItems.filter(x => !newFromW.includes(x));

        return {
            ...outfit,
            items: finalItems,
            from_wardrobe: newFromW,
            general_suggestions: newGenS
        };
    });
}

function generateClientSideRecommendations() {
    const weather = state.weather;
    const curr = weather?.current || {};
    const temp = curr.temperature || 18;
    const isRain = weather?.day_summary?.rain_alert || (curr.precipitation || 0) > 0.2;
    const gender = state.profile?.gender || 'unisex';
    const dest = state.destination || 'محل کار / اداری';

    const isCold = temp < 14;
    const isMild = temp >= 14 && temp < 22;

    const wardrobe = (state.useWardrobe && Array.isArray(state.wardrobe)) ? state.wardrobe : [];
    const wardrobeNames = wardrobe.map(w => w.name);

    // Group wardrobe by category
    const tops = wardrobe.filter(w => {
        const cat = w.category || '';
        const n = w.name || '';
        return cat === 'تیشرت' || cat === 'پیراهن' || cat === 'هودی' || cat === 'پلیور' ||
               n.includes('تیشرت') || n.includes('پیراهن') || n.includes('پلیور') || n.includes('هودی') || n.includes('دورس') || n.includes('تاپ') || n.includes('بلوز');
    });

    const bottoms = wardrobe.filter(w => {
        const cat = w.category || '';
        const n = w.name || '';
        return cat === 'شلوار' || n.includes('شلوار') || n.includes('جین') || n.includes('کتان') || n.includes('اسلش') || n.includes('دامن');
    });

    const outer = wardrobe.filter(w => {
        const cat = w.category || '';
        const n = w.name || '';
        return cat === 'کاپشن' || cat === 'پالتو' || n.includes('کاپشن') || n.includes('پالتو') || n.includes('بارانی') || n.includes('پافر') || n.includes('کت') || n.includes('بادگیر');
    });

    const shoes = wardrobe.filter(w => {
        const cat = w.category || '';
        const n = w.name || '';
        return cat === 'کفش' || n.includes('کفش') || n.includes('کتانی') || n.includes('بوت') || n.includes('نیم‌بوت') || n.includes('صندل');
    });

    const accessories = wardrobe.filter(w => {
        const cat = w.category || '';
        const n = w.name || '';
        return cat === 'اکسسوری' || n.includes('ساعت') || n.includes('عینک') || n.includes('کلاه') || n.includes('شال') || n.includes('کیف') || n.includes('کمربند');
    });

    // Helper to safely pick an item without going out of bounds
    const pick = (arr, index) => arr.length > 0 ? arr[index % arr.length].name : null;

    // Helper to build a clean outfit
    const buildOutfit = (title, timeOfDay, topIdx, bottomIdx, outerIdx, shoeIdx, accIdx, whyText) => {
        const selectedFromWardrobe = [];
        const externalSuggestions = [];

        // 1. Top from wardrobe
        const topItem = pick(tops, topIdx);
        if (topItem) {
            selectedFromWardrobe.push(topItem);
        } else {
            externalSuggestions.push(isCold ? "هودی دورس گرم" : (isMild ? "پیراهن آستین بلند" : "تیشرت نخی خنک"));
        }

        // 2. Bottom from wardrobe
        const bottomItem = pick(bottoms, bottomIdx);
        if (bottomItem) {
            selectedFromWardrobe.push(bottomItem);
        } else {
            externalSuggestions.push(dest.includes('رسمی') || dest.includes('اداری') ? "شلوار کتان راسته" : "شلوار جین کلاسیک");
        }

        // 3. Outerwear (if cold, rainy or available in wardrobe)
        if (isCold || isRain || outer.length > 0) {
            const outerItem = pick(outer, outerIdx);
            if (outerItem) {
                selectedFromWardrobe.push(outerItem);
            } else if (isCold || isRain) {
                externalSuggestions.push(isRain ? "بارانی یا کاپشن ضدآب" : "کاپشن گرم زمستانه");
            }
        }

        // 4. Shoes from wardrobe
        const shoeItem = pick(shoes, shoeIdx);
        if (shoeItem) {
            selectedFromWardrobe.push(shoeItem);
        } else {
            externalSuggestions.push(isCold ? "نیم‌بوت راحت" : "کتانی ورزشی سفید");
        }

        // 5. Accessories from wardrobe (At most 1 tasteful accessory per outfit)
        const accItem = pick(accessories, accIdx);
        if (accItem) {
            selectedFromWardrobe.push(accItem);
        }

        // Standard, realistic outfit composition: Top + Bottom + Shoes + (Optional Outerwear) + (Optional Accessory)
        const allItems = [...selectedFromWardrobe, ...externalSuggestions];
        return {
            name: title,
            time_of_day: timeOfDay,
            items: allItems,
            from_wardrobe: selectedFromWardrobe,
            general_suggestions: externalSuggestions,
            why: whyText
        };
    };

    const outfits = [
        buildOutfit(
            `ست ۱: ترکیب آراسته برای ${dest}`,
            "صبح تا ظهر",
            0, 0, 0, 0, 0,
            `ترکیب هوشمندانه متناسب با مقصد (${dest}) و هماهنگ با دمای ${temp} درجه سانتی‌گراد، با استفاده حداکثری از لباس‌های موجود در کمد شما.`
        ),
        buildOutfit(
            `ست ۲: لایه‌بندی منعطف ${isCold ? 'گرم' : 'کژوال'}`,
            "ظهر تا عصر",
            1, 1, 1, 1, 1,
            `استایلی شیک و متناوب برای تغییرات احتمالی دما در طول روز با استفاده از تنوع لباس‌های کمد شخصی شما.`
        ),
        buildOutfit(
            `ست ۳: استایل آزاد و راحت شهری`,
            "عصر و شب",
            2, 2, 2, 2, 2,
            `ترکیبی جذاب و پرانرژی برای ساعات استراحت، دورهمی یا فعالیت‌های عصرگاهی برگرفته از قطعات کمد شما.`
        )
    ];

    return {
        summary: `هوای امروز ${state.city} ${curr.description} با دمای حدود ${temp}°C است.`,
        reason: `طراحی شده ویژه مقصد (${dest}) و استایل ${state.style}. این ست‌ها با اولویت قطعی لباس‌های موجود در کمد شخصی شما چیده شده‌اند.`,
        umbrella: isRain,
        outfits: sanitizeOutfitsStructure(outfits, wardrobe),
        history_id: Date.now()
    };
}

// -------------------------------------------------------------
// Weather Service Integration
// -------------------------------------------------------------
async function fetchWeather(city = null, lat = null, lon = null) {
    let url = '/api/weather?';
    if (lat !== null && lon !== null) {
        url += `lat=${lat}&lon=${lon}`;
        if (city) url += `&city=${encodeURIComponent(city)}`;
    } else if (city) {
        url += `city=${encodeURIComponent(city)}`;
    } else {
        url += `city=${encodeURIComponent(state.city)}`;
    }

    try {
        if (!isStaticHost()) {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                state.weather = data;
                state.city = data.city;
                state.lat = data.latitude;
                state.lon = data.longitude;
                renderWeather(data);
                return data;
            }
        }
    } catch (_) {}

    // Direct Client-Side Open-Meteo Fetch for GitHub Pages
    try {
        const data = await fetchWeatherClientSide(city || state.city, lat, lon);
        state.weather = data;
        state.city = data.city;
        state.lat = data.latitude;
        state.lon = data.longitude;
        renderWeather(data);
        return data;
    } catch (err) {
        console.error('Weather fetch error:', err);
        showToast('مشکلی در برقراری ارتباط با سرویس هواشناسی پیش آمد.', 'error');
        return null;
    }
}

function renderWeather(data) {
    const current = data.current;
    DOM.weatherCityName.textContent = data.city;
    DOM.cityInput.value = data.city;
    
    const now = new Date();
    DOM.weatherUpdateTime.textContent = `بروزرسانی: ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;

    DOM.currentWeatherIcon.textContent = current.icon;
    DOM.currentTemp.textContent = current.temperature;
    DOM.apparentTemp.textContent = current.apparent_temperature;
    DOM.weatherDesc.textContent = current.description;
    
    DOM.humidityVal.textContent = `${current.humidity}%`;
    DOM.windVal.textContent = `${current.wind_speed} km/h`;
    DOM.precipVal.textContent = `${current.precipitation} mm`;

    const rainAlert = data.day_summary.rain_alert;
    DOM.umbrellaStatus.textContent = rainAlert ? 'ضروری ☔' : 'نیاز نیست ☀️';
    DOM.umbrellaStatus.style.color = rainAlert ? '#f59e0b' : '#10b981';

    // Render Timeline Cards
    renderTimeline(data.timeline);
}

function renderTimeline(timeline) {
    DOM.timelineCards.innerHTML = '';
    timeline.forEach(item => {
        const card = document.createElement('div');
        card.className = 'timeline-card';
        card.innerHTML = `
            <span class="timeline-title">${item.title}</span>
            <span class="timeline-icon">${item.icon}</span>
            <span class="timeline-temp">${item.temp !== null ? item.temp + '°' : '--'}</span>
            <span class="timeline-desc" title="${item.desc}">${item.desc}</span>
            <span class="timeline-precip">احتمال بارش: ${item.precip}%</span>
        `;
        DOM.timelineCards.appendChild(card);
    });
}

// -------------------------------------------------------------
// Wardrobe Management Service
// -------------------------------------------------------------
async function loadWardrobe() {
    try {
        let items = null;
        if (!isStaticHost()) {
            const res = await fetch('/api/wardrobe');
            if (res.ok) {
                items = await res.json();
            }
        }
        if (!items) {
            items = getLocalWardrobe();
        }
        state.wardrobe = items;
        renderWardrobe(items);
        
        DOM.totalWardrobeItems.textContent = items.length;
        if (DOM.wardrobeBadgeCount) {
            DOM.wardrobeBadgeCount.textContent = items.length;
        }
    } catch (err) {
        console.warn('Backend wardrobe fetch failed, using local storage:', err);
        const items = getLocalWardrobe();
        state.wardrobe = items;
        renderWardrobe(items);
        DOM.totalWardrobeItems.textContent = items.length;
        if (DOM.wardrobeBadgeCount) DOM.wardrobeBadgeCount.textContent = items.length;
    }
}

function renderWardrobe(items) {
    DOM.wardrobeGrid.innerHTML = '';
    
    let filtered = items;
    if (state.activeCategoryFilter !== 'all') {
        filtered = items.filter(item => {
            const cat = (item.category || '').toLowerCase();
            const filter = state.activeCategoryFilter.toLowerCase();
            return cat.includes(filter) || filter.includes(cat);
        });
    }

    if (filtered.length === 0) {
        DOM.wardrobeGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👕</div>
                <p>هیچ لباسی در این دسته‌بندی یافت نشد.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'wardrobe-card glass-card';
        const displayImg = item.image_url || getGarmentFallbackImage(item.name, item.category);

        card.innerHTML = `
            <div class="wardrobe-card-img-wrap">
                <img class="wardrobe-card-img" 
                     src="${displayImg}" 
                     alt="${item.name}" 
                     loading="lazy" 
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80';">
            </div>
            <div class="wardrobe-card-body">
                <div class="wardrobe-card-top">
                    <span class="wardrobe-card-name" title="${item.name}">${item.name}</span>
                    <button class="btn-del" title="حذف این لباس" onclick="deleteWardrobeItem(${item.id})">🗑️</button>
                </div>
                <div class="wardrobe-card-meta">
                    <span class="meta-tag category-tag">${item.category}</span>
                    <span class="meta-tag color-tag">رنگ: ${item.color}</span>
                    <span class="meta-tag">فصل: ${item.season}</span>
                </div>
            </div>
        `;
        DOM.wardrobeGrid.appendChild(card);
    });
}

async function deleteWardrobeItem(id) {
    if (!confirm('آیا از حذف این لباس از کمد خود اطمینان دارید؟')) return;
    try {
        if (!isStaticHost()) {
            const res = await fetch(`/api/wardrobe/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('لباس با موفقیت از کمد حذف شد.', 'success');
                await loadWardrobe();
                triggerAutoSync();
                return;
            }
        }
    } catch (_) {}

    const items = getLocalWardrobe().filter(w => w.id != id);
    safeSetLocalWardrobe(items);
    showToast('لباس با موفقیت از کمد حذف شد.', 'success');
    await loadWardrobe();
    triggerAutoSync();
}

// -------------------------------------------------------------
// AI Outfit Recommendations
// -------------------------------------------------------------
async function callGeminiRecommendationClientSide(apiKey) {
    const models = [
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.8-flash'
    ];

    const weather = state.weather;
    const curr = weather?.current || {};
    const temp = curr.temperature || 18;
    const dest = state.destination || 'محل کار / اداری';
    const wardrobe = (state.useWardrobe && Array.isArray(state.wardrobe)) ? state.wardrobe : [];
    
    let wardrobeText = "کمد کاربر خالی است یا حالت کمد غیرفعال است.";
    if (wardrobe.length > 0) {
        wardrobeText = wardrobe.map((w, i) => `${i + 1}. "${w.name}" (دسته: ${w.category || 'سایر'}، رنگ: ${w.color || '-'}، فصل: ${w.season || 'چهارفصل'})`).join('\n');
    }

    const ageGroupLabel = (state.profile?.age_group === 'teen') ? 'نوجوان' :
                          (state.profile?.age_group === 'adult') ? 'بزرگسال' :
                          (state.profile?.age_group === 'senior') ? 'پیشکسوت' : 'جوان';
    const genderLabel = (state.profile?.gender === 'female') ? 'زنانه' :
                        (state.profile?.gender === 'male') ? 'مردانه' : 'یونیسکس / عمومی';

    const prompt = `شما مشاور ارشد استایل و هوش مصنوعی WearWise هستید.
وظیفه شما چیدن ۳ ست لباس کاملاً استاندارد، واقعی و شیک، متناسب با آب‌وهوا، سن و سلیقه کاربر است.

اطلاعات شرایط:
- شهر: ${state.city}
- وضعیت آب‌وهوا: ${curr.description || 'صاف'}، دمای فعلی: ${temp}°C
- رده سنی کاربر: ${ageGroupLabel} (${state.profile?.age_group || 'young_adult'})
- جنسیت: ${genderLabel}
- مقصد / موقعیت: ${dest}
- سبک استایل درخواستی: ${state.style}

لیست کامل لباس‌های موجود در کمد شخصی کاربر:
${wardrobeText}

قوانین حیاتی ترکیب استاندارد و واقع‌گرایانه ست‌ها:
۱. هر ست باید یک ترکیب کامل، استاندارد و قابل پوشیدن در جامعه باشد و دقیقاً شامل اجزای زیر باشد:
   - دقیقاً ۱ عدد بالاتنه (تیشرت، پیراهن، هودی یا پلیور)
   - دقیقاً ۱ عدد پایین‌تنه (شلوار جین، کتان یا پارچه‌ای)
   - دقیقاً ۱ جفت کفش (کتانی، نیم‌بوت یا کفش چرم)
   - در صورت هوای سرد یا بارانی (دمای کمتر از ۱۵ درجه)، حداکثر ۱ عدد روپوش (کاپشن، پالتو یا بارانی)
   - حداکثر ۱ عدد اکسسوری متناسب (مانند ساعت مچی یا عینک)
۲. خط قرمزهای مد و استایل (ممنوعیت‌های قطعی):
   - به هیچ وجه و تحت هیچ شرایطی نباید دو تا پلیور، دو تا بافت، یا یک پلیور و یک هودی باهم در یک ست قرار گیرند! هر ست حداکثر ۱ بالاتنه گرم (فقط ۱ پلیور یا ۱ هودی) دارد.
   - به هیچ وجه نباید در یک ست دو کاپشن، دو پالتو یا دو شلوار قرار گیرد!
   - هرگز نباید ستی بدون شلوار یا بدون کفش پیشنهاد داده شود!
   - هرگز نباید ستی بدون لباس اصلی و صرفاً از اکسسوری (مثلاً ساعت خالی) ساخته شود!
۳. اگر در کمد شخصی کاربر برای بخش‌هایی (مانند شلوار یا کفش) لباسی وجود ندارد، حتماً یک آیتم تکمیلی بسیار شیک، استاندارد و متناسب با سن ${ageGroupLabel} و رنگ لباس‌های کمد او در general_suggestions پیشنهاد دهید تا ست ۱۰۰٪ کامل شود.
۴. لباس‌های موجود در کمد شخصی کاربر اولویت قطعی دارند و نام آن‌ها باید دقیقاً همانند لیست بالا در from_wardrobe قرار گیرد.
۵. ۳ ست متنوع با حس‌وحال متفاوت متناسب با موقعیت ${dest} طراحی کنید.

خروجی منحصراً در قالب JSON زیر به زبان فارسی برگردانده شود (بدون هیچ مارک‌داون یا توضیح اضافی):
{
  "summary": "توصیف مختصر آب‌وهوا و توصیه کلی پوشش به زبان فارسی",
  "reason": "دلیل و منطق هماهنگی ست‌ها با دمای ${temp} درجه و موقعیت ${dest}",
  "umbrella": ${weather?.day_summary?.rain_alert ? 'true' : 'false'},
  "outfits": [
    {
      "name": "نام جذاب و شیک ست",
      "time_of_day": "صبح تا ظهر",
      "items": ["نام تمام آیتم‌های ست"],
      "from_wardrobe": ["نام دقیق لباس‌هایی که از کمد کاربر انتخاب شده‌اند"],
      "general_suggestions": ["اقلام تکمیلی ضروری که در کمد نبود (در صورت نیاز)"],
      "why": "توضیح کوتاه چرایی هماهنگی و زیبایی این ست"
    }
  ]
}`;

    const bodyData = JSON.stringify({
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            temperature: 0.2
        }
    });

    for (const model of models) {
        const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const candidateUrls = [directUrl, `https://corsproxy.io/?${encodeURIComponent(directUrl)}`];

        for (const url of candidateUrls) {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: bodyData
                });
                if (res.ok) {
                    const json = await res.json();
                    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleaned);
                    if (parsed && parsed.outfits && parsed.outfits.length > 0) {
                        parsed.history_id = Date.now();
                        return parsed;
                    }
                }
            } catch (err) {
                console.warn(`Gemini recommendation call failed on ${url}:`, err);
            }
        }
    }
    throw new Error('Gemini recommendation call returned no valid result');
}

async function generateRecommendations(isAlternative = false) {
    if (!state.weather) {
        showToast('ابتدا وضعیت آب‌وهوا را دریافت کنید.', 'error');
        return;
    }

    const t = I18N[state.lang] || I18N.fa;
    showLoading(
        isAlternative ? 'در حال تولید ست‌های تازه و جدید...' : 'در حال فراخوانی هوش مصنوعی...',
        'ترکیب هوشمندانه لباس‌های کمد شما با شرایط آب‌وهوا و مقصد'
    );

    try {
        if (!isStaticHost()) {
            const payload = {
                weather: state.weather,
                style: state.style,
                destination: state.destination,
                use_wardrobe: state.useWardrobe,
                city: state.city,
                gender: state.profile.gender,
                age_group: state.profile.age_group,
                fit_pref: state.profile.fit_pref,
                temp_sensitivity: state.profile.temp_sensitivity,
                language: state.lang,
                variation_seed: state.variationSeed
            };

            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.outfits)) {
                    data.outfits = sanitizeOutfitsStructure(data.outfits, state.wardrobe);
                }
                state.currentRecommendations = data;
                renderRecommendations(data);
                showToast(isAlternative ? 'ست‌های پیشنهادی تازه با موفقیت ایجاد شدند!' : 'پیشنهادات ست لباس آماده شد!', 'success');
                return;
            }
        }
    } catch (err) {
        console.warn('Backend recommendation error, switching to client-side recommender:', err);
    }

    // 1. Try Gemini Client-Side if API key is present
    const apiKey = localStorage.getItem('wearwise_gemini_key');
    if (apiKey && apiKey.trim().length > 10) {
        try {
            const aiRec = await callGeminiRecommendationClientSide(apiKey.trim());
            if (aiRec && aiRec.outfits && aiRec.outfits.length > 0) {
                aiRec.outfits = sanitizeOutfitsStructure(aiRec.outfits, state.wardrobe);
                state.currentRecommendations = aiRec;
                renderRecommendations(aiRec);
                saveLocalHistory(aiRec);
                showToast(isAlternative ? 'ست‌های پیشنهادی تازه با هوش مصنوعی ایجاد شدند!' : 'پیشنهادات ست لباس بر اساس کمد شخصی شما آماده شد!', 'success');
                hideLoading();
                return;
            }
        } catch (aiErr) {
            console.warn('Client-side Gemini recommendation note, using wardrobe algorithm:', aiErr);
        }
    }

    // 2. Client-Side Recommender (Priority: 100% User Wardrobe)
    try {
        const clientRec = generateClientSideRecommendations();
        state.currentRecommendations = clientRec;
        renderRecommendations(clientRec);
        saveLocalHistory(clientRec);
        showToast(isAlternative ? 'ست‌های پیشنهادی تازه با موفقیت ایجاد شدند!' : 'پیشنهادات ست لباس بر اساس کمد شخصی شما آماده شد!', 'success');
    } catch (e) {
        console.error('Client recommendation error:', e);
        showToast('خطا در تولید پیشنهادات ست لباس.', 'error');
    } finally {
        hideLoading();
    }
}

function getOutfitPool(outfit, style = 'Mixed') {
    const text = `${outfit.name || ''} ${(outfit.items || []).join(' ')} ${outfit.why || ''}`.toLowerCase();
    const styleKey = (style || 'Mixed').toLowerCase();
    const genderKey = (state.profile?.gender || 'unisex').toLowerCase();

    const genderGallery = MANNEQUIN_FASHION_GALLERY[genderKey] || MANNEQUIN_FASHION_GALLERY.unisex;

    let poolKey = 'casual';
    if (text.includes('کاپشن') || text.includes('پافر') || text.includes('بادگیر') || text.includes('جکت')) {
        poolKey = 'puffer';
    } else if (text.includes('پالتو') || text.includes('بارانی') || text.includes('ترنچ') || text.includes('اورکت')) {
        poolKey = 'overcoat';
    } else if (text.includes('هودی') || text.includes('سویشرت') || text.includes('دورس')) {
        poolKey = 'hoodie';
    } else if (text.includes('پلیور') || text.includes('بافت') || text.includes('ژاکت')) {
        poolKey = 'knitwear';
    } else if (styleKey === 'formal' || text.includes('کت') || text.includes('رسمی') || text.includes('کت و شلوار')) {
        poolKey = 'formal';
    } else if (styleKey === 'sport' || text.includes('ورزشی') || text.includes('اسپرت')) {
        poolKey = 'sport';
    } else {
        poolKey = 'casual';
    }

    return genderGallery[poolKey] || genderGallery.casual || MANNEQUIN_FASHION_GALLERY.unisex.casual;
}

function getMannequinOutfitImage(outfit, style = 'Mixed', index = 0) {
    const pool = getOutfitPool(outfit, style);
    return pool[index % pool.length];
}
// Alias for backward compatibility
const getNaturalOutfitImage = getMannequinOutfitImage;

function openMannequinShowcase(index) {
    if (!state.currentRecommendations || !state.currentRecommendations.outfits) return;
    const outfit = state.currentRecommendations.outfits[index];
    if (!outfit) return;

    state.activeMannequinOutfitIndex = index;
    state.activeMannequinPhotoIndex = 0;

    renderMannequinModal(outfit, index);
    if (DOM.mannequinModal) {
        DOM.mannequinModal.style.display = 'flex';
    }
}

function cycleMannequinAngle() {
    if (!state.currentRecommendations || !state.currentRecommendations.outfits) return;
    const outfit = state.currentRecommendations.outfits[state.activeMannequinOutfitIndex];
    if (!outfit) return;

    const pool = getOutfitPool(outfit, state.style);
    state.activeMannequinPhotoIndex = (state.activeMannequinPhotoIndex + 1) % pool.length;

    const newUrl = pool[state.activeMannequinPhotoIndex];
    if (DOM.mannequinModalImg) {
        DOM.mannequinModalImg.style.opacity = '0.3';
        setTimeout(() => {
            DOM.mannequinModalImg.src = newUrl;
            DOM.mannequinModalImg.style.opacity = '1';
        }, 150);
    }

    if (DOM.mannequinPhotoCounter) {
        DOM.mannequinPhotoCounter.textContent = `مدل / زاویه ${state.activeMannequinPhotoIndex + 1} از ${pool.length}`;
    }
}

function renderMannequinModal(outfit, index) {
    const t = I18N[state.lang] || I18N.fa;
    const pool = getOutfitPool(outfit, state.style);
    const photoUrl = pool[state.activeMannequinPhotoIndex % pool.length];

    if (DOM.mannequinModalTitle) DOM.mannequinModalTitle.textContent = outfit.name || 'ست پیشنهادی تن مانکن';
    if (DOM.mannequinModalImg) DOM.mannequinModalImg.src = photoUrl;
    if (DOM.mannequinPhotoCounter) DOM.mannequinPhotoCounter.textContent = `مدل / زاویه ${state.activeMannequinPhotoIndex + 1} از ${pool.length}`;
    if (DOM.mannequinModalTime) DOM.mannequinModalTime.textContent = `🕒 ${outfit.time_of_day || 'مناسب روز'}`;

    const gKey = state.profile?.gender || 'unisex';
    const genderLabel = gKey === 'female' ? '👩 استایل بانوان' : (gKey === 'male' ? '👨 استایل آقایان' : '👤 استایل مشترک');
    if (DOM.mannequinModalGender) DOM.mannequinModalGender.textContent = genderLabel;

    const pieces = outfit.pieces || (outfit.items || []).map(itemName => {
        const matchedW = state.wardrobe.find(w => {
            if (!w || !w.name) return false;
            const wn = w.name.trim().toLowerCase();
            const iname = itemName.trim().toLowerCase();
            return wn === iname || iname.includes(wn) || wn.includes(iname);
        });
        const isWardrobe = (outfit.from_wardrobe || []).includes(itemName) || Boolean(matchedW);
        return {
            name: itemName,
            is_wardrobe: isWardrobe,
            image_url: matchedW?.image_url || getGarmentFallbackImage(itemName)
        };
    });

    if (DOM.mannequinModalPieces) {
        DOM.mannequinModalPieces.innerHTML = pieces.map(p => `
            <div class="mannequin-piece-card">
                <img class="mannequin-piece-thumb" 
                     src="${p.image_url}" 
                     alt="${p.name}" 
                     loading="lazy" 
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=150&q=80';">
                <div class="mannequin-piece-info">
                    <span class="mannequin-piece-name" title="${p.name}">${p.name}</span>
                    <span class="mannequin-piece-source ${p.is_wardrobe ? 'wardrobe' : 'suggestion'}">
                        ${p.is_wardrobe ? t.inWardrobe : t.suggestion}
                    </span>
                </div>
            </div>
        `).join('');
    }

    if (DOM.mannequinModalWhy) DOM.mannequinModalWhy.textContent = outfit.why || '';
}

function setupMannequinModal() {
    if (!DOM.mannequinModal) return;

    const closeModal = () => {
        DOM.mannequinModal.style.display = 'none';
    };

    if (DOM.closeMannequinModal) {
        DOM.closeMannequinModal.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }

    if (DOM.closeMannequinBtn) {
        DOM.closeMannequinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }

    if (DOM.cycleMannequinAngleBtn) {
        DOM.cycleMannequinAngleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cycleMannequinAngle();
        });
    }

    if (DOM.cycleMannequinBtnBottom) {
        DOM.cycleMannequinBtnBottom.addEventListener('click', (e) => {
            e.preventDefault();
            cycleMannequinAngle();
        });
    }

    DOM.mannequinModal.addEventListener('click', (e) => {
        if (e.target === DOM.mannequinModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.mannequinModal.style.display === 'flex') {
            closeModal();
        }
    });
}

function renderRecommendations(data) {
    if (!data) return;
    if (Array.isArray(data.outfits)) {
        data.outfits = sanitizeOutfitsStructure(data.outfits, state.wardrobe);
    }
    const t = I18N[state.lang] || I18N.fa;

    // 1. Render Summary Card
    DOM.aiSummaryCard.style.display = 'block';
    DOM.aiSummaryText.textContent = data.summary;
    DOM.aiReasonText.textContent = data.reason;

    if (data.umbrella) {
        DOM.umbrellaBanner.className = 'umbrella-badge needed';
        DOM.umbrellaBanner.innerHTML = `<span>${t.umbrellaNeeded}</span>`;
    } else {
        DOM.umbrellaBanner.className = 'umbrella-badge not-needed';
        DOM.umbrellaBanner.innerHTML = `<span>${t.umbrellaNotNeeded}</span>`;
    }

    // 2. Render 3 Outfit Cards
    DOM.outfitsGrid.innerHTML = '';
    const outfits = data.outfits || [];

    outfits.forEach((outfit, index) => {
        const card = document.createElement('div');
        card.className = 'outfit-card glass-card';

        // High quality mannequin display image
        const outfitImg = getMannequinOutfitImage(outfit, state.style, index);

        // Build Pieces Breakdown with photos & isolated cutouts strictly from sanitized outfit.items
        let pieces = (outfit.items || []).map(itemName => {
            const matchedW = findMatchingWardrobeItem(itemName, state.wardrobe);
            const isWardrobe = (outfit.from_wardrobe || []).includes(itemName) || Boolean(matchedW);
            return {
                name: matchedW ? matchedW.name : itemName,
                is_wardrobe: isWardrobe,
                image_url: matchedW?.image_url || getGarmentFallbackImage(itemName)
            };
        });

        // Strict piece-level deduplication: Never allow 2 pullovers/hoodies, 2 bottoms, or 2 shoes in the same card!
        const seenSlots = new Set();
        pieces = pieces.filter(p => {
            const cat = classifyGarmentItem(p.name);
            if (cat === 'WARM_TOP') {
                if (seenSlots.has('WARM_TOP')) return false;
                seenSlots.add('WARM_TOP');
            } else if (cat === 'OUTERWEAR') {
                if (seenSlots.has('OUTERWEAR')) return false;
                seenSlots.add('OUTERWEAR');
            } else if (cat === 'BOTTOM') {
                if (seenSlots.has('BOTTOM')) return false;
                seenSlots.add('BOTTOM');
            } else if (cat === 'SHOES') {
                if (seenSlots.has('SHOES')) return false;
                seenSlots.add('SHOES');
            }
            return true;
        });

        const piecesHtml = pieces.map(p => `
            <div class="piece-item">
                <img class="piece-thumb" 
                     src="${p.image_url}" 
                     alt="${p.name}" 
                     loading="lazy" 
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=200&q=80';">
                <div class="piece-details">
                    <span class="piece-name" title="${p.name}">${p.name}</span>
                    <span class="piece-badge ${p.is_wardrobe ? 'wardrobe' : 'suggestion'}">
                        ${p.is_wardrobe ? t.inWardrobe : t.suggestion}
                    </span>
                </div>
            </div>
        `).join('');

        card.innerHTML = `
            <div class="outfit-img-wrap">
                <button type="button" 
                        class="outfit-badge-mannequin" 
                        onclick="openMannequinShowcase(${index})" 
                        title="برای بزرگ‌نمایی و مشاهده جزئیات ست تن مانکن کلیک کنید">
                    <span>${t.mannequinBadge || '👗 نمایش ست تن مانکن'}</span>
                    <span class="badge-icon-zoom">🔍</span>
                </button>
                <img class="outfit-img" 
                     src="${outfitImg}" 
                     alt="${outfit.name}" 
                     loading="lazy" 
                     onclick="openMannequinShowcase(${index})"
                     style="cursor: pointer;"
                     title="کلیک برای بزرگ‌نمایی و مشاهده جزئیات ست تن مانکن"
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80';">
                <div class="outfit-img-overlay">
                    <span class="outfit-time">🕒 ${outfit.time_of_day || 'مناسب روز'}</span>
                    <button class="btn-fav" title="نشان‌گذاری ست" onclick="toggleOutfitFavorite(${data.history_id || 0}, this)">
                        ❤️
                    </button>
                </div>
            </div>
            <div class="outfit-content">
                <h3 class="outfit-title">${outfit.name}</h3>
                
                <!-- Individual Garment Pieces with Images -->
                <div class="outfit-pieces-section">
                    <span class="pieces-section-title">${t.piecesTitle}</span>
                    <div class="pieces-grid">
                        ${piecesHtml}
                    </div>
                </div>

                <div class="outfit-why">
                    <strong>${t.whyLabel}</strong> ${outfit.why}
                </div>
            </div>
        `;

        DOM.outfitsGrid.appendChild(card);
    });

    // 3. Show Regenerate Alternative Button Bar
    if (DOM.regenerateBar) {
        DOM.regenerateBar.style.display = 'flex';
    }

    // Scroll gently to recommendations
    DOM.aiSummaryCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function toggleOutfitFavorite(historyId, buttonEl) {
    if (!historyId) {
        showToast('شناسه ذخیره در دسترس نیست.', 'info');
        return;
    }
    try {
        const res = await fetch(`/api/history/${historyId}/favorite`, { method: 'POST' });
        if (!res.ok) throw new Error('خطا در ذخیره علاقه‌مندی');
        const result = await res.json();
        
        if (buttonEl) {
            buttonEl.classList.toggle('active', result.is_favorite);
        }
        showToast(result.is_favorite ? 'به لیست علاقه‌مندی‌ها افزوده شد!' : 'از لیست علاقه‌مندی‌ها حذف شد.', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// -------------------------------------------------------------
// History Management Service
// -------------------------------------------------------------
async function loadHistory() {
    try {
        let items = null;
        if (!isStaticHost()) {
            const url = `/api/history${state.historyOnlyFavorites ? '?favorites_only=true' : ''}`;
            const res = await fetch(url);
            if (res.ok) {
                items = await res.json();
            }
        }
        if (!items) {
            items = getLocalHistory();
            if (state.historyOnlyFavorites) {
                items = items.filter(h => h.is_favorite);
            }
            items.forEach(it => {
                if (typeof it.outfits_json === 'string' && !it.outfits) {
                    try { it.outfits = JSON.parse(it.outfits_json); } catch (_) { it.outfits = []; }
                }
            });
        }
        state.history = items;
        renderHistory(items);
    } catch (err) {
        console.warn('History fetch error, using local:', err);
        let items = getLocalHistory();
        if (state.historyOnlyFavorites) items = items.filter(h => h.is_favorite);
        items.forEach(it => {
            if (typeof it.outfits_json === 'string' && !it.outfits) {
                try { it.outfits = JSON.parse(it.outfits_json); } catch (_) { it.outfits = []; }
            }
        });
        state.history = items;
        renderHistory(items);
    }
}

function renderHistory(items) {
    DOM.historyList.innerHTML = '';
    if (items.length === 0) {
        DOM.historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📂</div>
                <p>${state.historyOnlyFavorites ? 'هیچ ست نشان‌شده‌ای در علاقه‌مندی‌ها وجود ندارد.' : 'هنوز هیچ پیشنهادی ثبت نشده است.'}</p>
            </div>
        `;
        return;
    }

    items.forEach(record => {
        const itemEl = document.createElement('div');
        itemEl.className = 'history-item glass-card';

        const outfitsArr = record.outfits || (typeof record.outfits_json === 'string' ? JSON.parse(record.outfits_json) : []);
        const outfitsPreview = outfitsArr.map(o => `
            <div class="history-outfit-mini">
                <div class="mini-name">${o.name}</div>
                <div class="mini-items">${(o.items || []).slice(0, 3).join(' • ')}</div>
            </div>
        `).join('');

        const formattedDate = new Date(record.created_at || Date.now()).toLocaleDateString('fa-IR', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        itemEl.innerHTML = `
            <div class="history-item-header">
                <div>
                    <span class="history-item-city">📍 ${record.city}</span>
                    <span class="history-item-date"> | ${formattedDate}</span>
                </div>
                <div class="history-item-actions">
                    <button class="btn-fav ${record.is_favorite ? 'active' : ''}" 
                            title="نشان‌گذاری" 
                            onclick="toggleHistoryFavorite(${record.id})">
                        ❤️
                    </button>
                    <button class="btn-del" title="حذف رکورد" onclick="deleteHistoryItem(${record.id})">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="history-summary">${record.weather_summary}</div>
            <div class="history-outfits-preview">
                ${outfitsPreview}
            </div>
        `;

        DOM.historyList.appendChild(itemEl);
    });
}

async function toggleHistoryFavorite(id) {
    try {
        if (!isStaticHost()) {
            const res = await fetch(`/api/history/${id}/favorite`, { method: 'POST' });
            if (res.ok) {
                loadHistory();
                return;
            }
        }
    } catch (_) {}

    const list = getLocalHistory();
    const item = list.find(h => h.id == id);
    if (item) {
        item.is_favorite = item.is_favorite ? 0 : 1;
        localStorage.setItem('wearwise_history_items', JSON.stringify(list));
        loadHistory();
    }
}

async function deleteHistoryItem(id) {
    if (!confirm('آیا این رکورد تاریخچه حذف شود؟')) return;
    try {
        if (!isStaticHost()) {
            const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('رکورد حذف شد.', 'success');
                loadHistory();
                return;
            }
        }
    } catch (_) {}

    const list = getLocalHistory().filter(h => h.id != id);
    localStorage.setItem('wearwise_history_items', JSON.stringify(list));
    showToast('رکورد با موفقیت حذف شد.', 'success');
    loadHistory();
}

// -------------------------------------------------------------
// User Profile Service
// -------------------------------------------------------------
async function loadProfile() {
    try {
        const res = await fetch('/api/profile');
        if (res.ok) {
            const data = await res.json();
            state.profile = data;
            syncProfileUI();
        }
    } catch (e) {
        console.warn('Profile fetch error:', e);
    }
}

function syncProfileUI() {
    const p = state.profile || { gender: 'unisex', age_group: 'young_adult', fit_pref: 'regular', temp_sensitivity: 'normal' };
    const genderInput = document.querySelector(`input[name="profileGender"][value="${p.gender}"]`);
    if (genderInput) genderInput.checked = true;

    const ageInput = document.querySelector(`input[name="profileAge"][value="${p.age_group}"]`);
    if (ageInput) ageInput.checked = true;

    const fitInput = document.querySelector(`input[name="profileFit"][value="${p.fit_pref}"]`);
    if (fitInput) fitInput.checked = true;

    const tempInput = document.querySelector(`input[name="profileTemp"][value="${p.temp_sensitivity}"]`);
    if (tempInput) tempInput.checked = true;

    // Update label classes
    document.querySelectorAll('.profile-pill-label').forEach(lbl => {
        const radio = lbl.querySelector('input[type="radio"]');
        lbl.classList.toggle('active', !!(radio && radio.checked));
    });

    const genderIcon = p.gender === 'female' ? '👩' : (p.gender === 'male' ? '👨' : '👤');
    if (DOM.profileStatusText) {
        const t = I18N[state.lang] || I18N.fa;
        DOM.profileStatusText.textContent = `${genderIcon} ${t.myProfile}`;
    }
}

function setupProfileModal() {
    DOM.profileBtn.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        syncProfileUI();
        DOM.profileModal.style.display = 'flex';
    });

    const closeModal = () => {
        DOM.profileModal.style.display = 'none';
    };

    DOM.closeProfileModal.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        closeModal();
    });

    DOM.cancelProfileBtn.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        closeModal();
    });

    // Close when clicking on backdrop
    DOM.profileModal.addEventListener('click', (e) => {
        if (e.target === DOM.profileModal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.profileModal.style.display === 'flex') {
            closeModal();
        }
    });

    // Direct click handling on pill labels for 100% reliable radio selection
    document.querySelectorAll('.profile-pill-label').forEach(lbl => {
        lbl.addEventListener('click', (e) => {
            const radio = lbl.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                const groupName = radio.name;
                document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
                    const parent = r.closest('.profile-pill-label');
                    if (parent) parent.classList.toggle('active', r.checked);
                });
            }
        });
    });

    // Also support change events on radio inputs
    document.querySelectorAll('.profile-pill-label input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            syncProfileUI();
        });
    });

    DOM.saveProfileBtn.addEventListener('click', async (e) => {
        if (e) e.preventDefault();
        const gender = document.querySelector('input[name="profileGender"]:checked')?.value || 'unisex';
        const age_group = document.querySelector('input[name="profileAge"]:checked')?.value || 'young_adult';
        const fit_pref = document.querySelector('input[name="profileFit"]:checked')?.value || 'regular';
        const temp_sensitivity = document.querySelector('input[name="profileTemp"]:checked')?.value || 'normal';

        state.profile = { gender, age_group, fit_pref, temp_sensitivity };
        syncProfileUI();
        closeModal();
        showToast('پروفایل کاربری با موفقیت ذخیره شد.', 'success');
        triggerAutoSync();

        try {
            await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state.profile)
            });
            if (state.currentRecommendations) {
                generateRecommendations();
            }
        } catch (err) {
            console.error('Profile save error:', err);
            showToast('خطا در ذخیره مشخصات پروفایل', 'error');
        }
    });
}

// -------------------------------------------------------------
// Settings & API Key Service
// -------------------------------------------------------------
async function checkApiStatus() {
    // 1. Check local browser storage (works on GitHub Pages & offline)
    const localKey = localStorage.getItem('wearwise_gemini_key');
    if (localKey && localKey.trim().length > 10) {
        state.geminiConfigured = true;
        if (DOM.apiStatusDot) DOM.apiStatusDot.className = 'status-dot active';
        if (DOM.apiStatusText) DOM.apiStatusText.textContent = 'Gemini فعال';
        if (DOM.apiKeyBtn) DOM.apiKeyBtn.title = 'کلید Google Gemini فعال و متصل است';
        return;
    }

    // 2. If running with Python backend, check server status
    if (!isStaticHost()) {
        try {
            const res = await fetch('/api/settings/status');
            if (res.ok) {
                const data = await res.json();
                state.geminiConfigured = data.gemini_configured;
                if (state.geminiConfigured) {
                    if (DOM.apiStatusDot) DOM.apiStatusDot.className = 'status-dot active';
                    if (DOM.apiStatusText) DOM.apiStatusText.textContent = 'Gemini فعال';
                    if (DOM.apiKeyBtn) DOM.apiKeyBtn.title = 'کلید Google Gemini فعال و متصل است';
                    return;
                }
            }
        } catch (e) {
            console.warn('Could not check backend API status:', e);
        }
    }

    state.geminiConfigured = false;
    if (DOM.apiStatusDot) DOM.apiStatusDot.className = 'status-dot';
    if (DOM.apiStatusText) DOM.apiStatusText.textContent = 'تنظیم هوش مصنوعی';
    if (DOM.apiKeyBtn) DOM.apiKeyBtn.title = 'کلید Gemini تنظیم نشده است';
}

function setupApiKeyModal() {
    DOM.apiKeyBtn.addEventListener('click', () => {
        DOM.apiKeyModal.style.display = 'flex';
        const storedKey = localStorage.getItem('wearwise_gemini_key') || '';
        DOM.apiKeyInput.value = storedKey;
        DOM.apiKeyInput.focus();
    });

    const closeModal = () => {
        DOM.apiKeyModal.style.display = 'none';
    };

    DOM.closeApiKeyModal.addEventListener('click', closeModal);
    DOM.cancelApiKeyBtn.addEventListener('click', closeModal);

    DOM.saveApiKeyBtn.addEventListener('click', async () => {
        const key = DOM.apiKeyInput.value.trim();
        if (!key) {
            showToast('لطفاً کلید API را وارد نمایید.', 'error');
            return;
        }

        showLoading('در حال ذخیره و اعتبارسنجی کلید API...', 'ارتباط با موتور Google Gemini');
        try {
            // Always save to browser localStorage for GitHub Pages & cross-device sync
            localStorage.setItem('wearwise_gemini_key', key);
            state.geminiConfigured = true;

            // If backend is reachable, also save to backend
            if (!isStaticHost()) {
                try {
                    await fetch('/api/settings/api-key', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ api_key: key })
                    });
                } catch (bErr) {
                    console.warn('Backend API key save note:', bErr);
                }
            }

            // Quick live check with Google Gemini API directly
            try {
                const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
                const testRes = await fetch(testUrl);
                if (testRes.ok) {
                    showToast('✨ کلید API با موفقیت متصل و فعال شد!', 'success');
                } else {
                    showToast('کلید در حافظه مرورگر ذخیره شد (در صورت خطای شبکه یا تحریم، DNS بررسی شود).', 'warning');
                }
            } catch (_) {
                showToast('کلید در حافظه مرورگر شما با موفقیت ذخیره شد!', 'success');
            }

            closeModal();
            await checkApiStatus();
            triggerAutoSync();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            hideLoading();
        }
    });
}

// -------------------------------------------------------------
// Cross-Device Cloud Sync & Backup System
// -------------------------------------------------------------
const PUBLIC_KV_ENDPOINT = 'https://api.restful-api.dev/objects';

function getSyncKey() {
    let key = localStorage.getItem('wearwise_sync_id');
    if (!key || !key.trim()) {
        key = 'user-' + Math.random().toString(36).substring(2, 8);
        localStorage.setItem('wearwise_sync_id', key);
    }
    return key.trim();
}

function setSyncKey(key) {
    if (key && key.trim()) {
        localStorage.setItem('wearwise_sync_id', key.trim());
    }
}

function generateRandomSyncKey() {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let rand = 'ww-';
    for (let i = 0; i < 6; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return rand;
}

function getSyncPayload() {
    const currentWardrobe = (state.wardrobe && state.wardrobe.length > 0) ? state.wardrobe : getLocalWardrobe();
    return {
        sync_id: getSyncKey(),
        gemini_api_key: localStorage.getItem('wearwise_gemini_key') || '',
        wardrobe: currentWardrobe,
        profile: state.profile || { gender: 'unisex', age_group: 'young_adult', fit_pref: 'regular', temp_sensitivity: 'normal' },
        settings: {
            theme: state.theme,
            lang: state.lang,
            destination: state.destination,
            style: state.style,
            useWardrobe: state.useWardrobe
        },
        history: getLocalHistory(),
        exported_at: new Date().toISOString()
    };
}

async function applySyncedData(payload, showSuccessToast = true) {
    if (!payload || typeof payload !== 'object') {
        throw new Error('فرمت داده‌های دریافتی نامعتبر است.');
    }

    // 0. Restore Gemini API Key
    if (payload.gemini_api_key && typeof payload.gemini_api_key === 'string' && payload.gemini_api_key.trim().length > 5) {
        localStorage.setItem('wearwise_gemini_key', payload.gemini_api_key.trim());
        state.geminiConfigured = true;
        checkApiStatus();
    }

    // 1. Wardrobe Items (with photos)
    if (Array.isArray(payload.wardrobe) && payload.wardrobe.length > 0) {
        state.wardrobe = payload.wardrobe;
        safeSetLocalWardrobe(payload.wardrobe);
        renderWardrobe();
        updateWardrobeCount();
    }

    // 2. User Profile
    if (payload.profile && typeof payload.profile === 'object') {
        state.profile = { ...state.profile, ...payload.profile };
        localStorage.setItem('wearwise_profile', JSON.stringify(state.profile));
        updateProfileButtonLabel();
    }

    // 3. Settings (Theme, Lang, Destination, Style)
    if (payload.settings && typeof payload.settings === 'object') {
        if (payload.settings.theme && payload.settings.theme !== state.theme) {
            applyTheme(payload.settings.theme);
        }
        if (payload.settings.lang && payload.settings.lang !== state.lang) {
            applyLanguage(payload.settings.lang);
        }
        if (payload.settings.destination) {
            state.destination = payload.settings.destination;
            if (DOM.destinationSelect) DOM.destinationSelect.value = state.destination;
        }
        if (payload.settings.style) {
            state.style = payload.settings.style;
            if (DOM.styleSelect) DOM.styleSelect.value = state.style;
        }
        if (typeof payload.settings.useWardrobe === 'boolean') {
            state.useWardrobe = payload.settings.useWardrobe;
            if (DOM.wardrobeToggle) DOM.wardrobeToggle.checked = state.useWardrobe;
        }
    }

    // 4. History
    if (Array.isArray(payload.history) && payload.history.length > 0) {
        state.history = payload.history;
        localStorage.setItem('wearwise_history_items', JSON.stringify(payload.history));
        renderHistory();
    }

    // 5. If running on local server, also update backend SQLite
    if (!isStaticHost()) {
        fetch('/api/sync/import-full', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(() => {});
    }

    if (showSuccessToast) {
        const count = (payload.wardrobe && payload.wardrobe.length) || 0;
        showToast(`✨ همگام‌سازی موفق: ${count} لباس، عکس‌ها، کلید API و تنظیمات به‌روزرسانی شدند.`, 'success');
    }
}

let autoSyncDebounceTimer = null;
function triggerAutoSync() {
    if (localStorage.getItem('wearwise_autosync') === 'false') return;
    clearTimeout(autoSyncDebounceTimer);
    autoSyncDebounceTimer = setTimeout(() => {
        pushToCloud(true);
    }, 2500);
}

async function pushToCloud(silent = false) {
    let syncKey = (DOM.syncKeyInput && DOM.syncKeyInput.value ? DOM.syncKeyInput.value : getSyncKey()).trim();
    if (!syncKey) {
        syncKey = generateRandomSyncKey();
        setSyncKey(syncKey);
        if (DOM.syncKeyInput) DOM.syncKeyInput.value = syncKey;
    }

    if (!silent) {
        showLoading('در حال ذخیره کمد در فضای ابری...', 'همگام‌سازی بین دستگاه‌ها');
    }

    let success = false;
    let cloudId = null;

    try {
        const payload = getSyncPayload();
        payload.sync_id = syncKey;

        // 1. Backend sync endpoint (with strict 3.5s timeout)
        if (!isStaticHost()) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 3500);
                const res = await fetch('/api/sync/push', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                clearTimeout(timer);
                if (res.ok) success = true;
            } catch (e) {
                console.warn('Backend push note:', e);
            }
        }

        // 2. Public cloud storage for static GitHub Pages (with strict 5.5s timeout)
        if (!success) {
            // Keep public KV payload lightweight (< 900 bytes) so api.restful-api.dev does NOT crash with HTTP 500
            const cloudPayload = {
                ...payload,
                wardrobe: (payload.wardrobe || []).map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    color: item.color,
                    season: item.season,
                    image_url: (item.image_url && !item.image_url.startsWith('data:')) 
                        ? item.image_url 
                        : getGarmentFallbackImage(item.name, item.category)
                }))
            };

            const storedObjectId = localStorage.getItem(`wearwise_cloud_obj_${syncKey}`) || (syncKey.length > 20 ? syncKey : null);
            let kvRes = null;
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 5500);

            try {
                if (storedObjectId) {
                    try {
                        kvRes = await fetch(`${PUBLIC_KV_ENDPOINT}/${storedObjectId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: `wearwise_${syncKey}`,
                                data: cloudPayload
                            }),
                            signal: controller.signal
                        });
                        if (kvRes && kvRes.ok) {
                            cloudId = storedObjectId;
                            success = true;
                        }
                    } catch (_) {}
                }

                if (!success) {
                    kvRes = await fetch(PUBLIC_KV_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: `wearwise_${syncKey}`,
                            data: cloudPayload
                        }),
                        signal: controller.signal
                    });
                    if (kvRes && kvRes.ok) {
                        const kvData = await kvRes.json();
                        if (kvData && kvData.id) {
                            cloudId = kvData.id;
                            localStorage.setItem(`wearwise_cloud_obj_${syncKey}`, cloudId);
                            localStorage.setItem(`wearwise_cloud_obj_${cloudId}`, cloudId);
                            setSyncKey(cloudId);
                            if (DOM.syncKeyInput) DOM.syncKeyInput.value = cloudId;
                            success = true;
                        }
                    }
                }
            } catch (cloudErr) {
                console.warn('Cloud KV timed out or network blocked:', cloudErr);
            } finally {
                clearTimeout(timer);
            }
        }
    } catch (err) {
        console.error('pushToCloud error:', err);
    } finally {
        // ALWAYS close loading overlay so it can NEVER spin for 10 minutes!
        if (!silent) hideLoading();
    }

    if (success) {
        const activeKey = cloudId || syncKey;
        const timeStr = new Date().toLocaleTimeString('fa-IR');
        if (DOM.syncStatusBadge) {
            DOM.syncStatusBadge.textContent = `همگام شد (${timeStr})`;
            DOM.syncStatusBadge.style.color = 'var(--accent-emerald)';
        }
        if (!silent) {
            showToast(`☁️ کمد با شناسه «${activeKey}» با موفقیت در فضای ابری ذخیره شد.`, 'success');
        }
        updateSyncQrCode();
    } else {
        if (!silent) {
            showToast('⚠️ سرور ابری در دسترس نیست یا مسدود است. لطفاً از دکمه «کُد سریع انتقال» استفاده کنید که ۱۰۰٪ آفلاین و آنی کار می‌کند!', 'warning');
        }
    }
}

async function pullFromCloud(customKey = null, silent = false) {
    const syncKey = (customKey || (DOM.syncKeyInput && DOM.syncKeyInput.value) || getSyncKey()).trim();
    if (!syncKey) {
        if (!silent) showToast('لطفاً شناسه کمد (Sync Key) را مشخص کنید.', 'error');
        return;
    }
    setSyncKey(syncKey);
    if (DOM.syncKeyInput) DOM.syncKeyInput.value = syncKey;

    if (!silent) {
        showLoading('در حال دریافت کمد از فضای ابری...', `شناسه: ${syncKey}`);
    }

    let payload = null;

    try {
        // 1. Local backend first (with 3s timeout)
        if (!isStaticHost()) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 3000);
                const res = await fetch(`/api/sync/pull?sync_id=${encodeURIComponent(syncKey)}`, {
                    signal: controller.signal
                });
                clearTimeout(timer);
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.data && json.data.wardrobe) {
                        payload = json.data;
                    }
                }
            } catch (e) {
                console.warn('Backend pull note:', e);
            }
        }

        // 2. Direct cloud object ID with 5s timeout
        if (!payload) {
            const queryId = localStorage.getItem(`wearwise_cloud_obj_${syncKey}`) || syncKey;
            if (queryId) {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 5000);
                try {
                    const res = await fetch(`${PUBLIC_KV_ENDPOINT}/${encodeURIComponent(queryId)}`, {
                        signal: controller.signal
                    });
                    if (res.ok) {
                        const kvObj = await res.json();
                        if (kvObj && kvObj.data && kvObj.data.wardrobe) {
                            payload = kvObj.data;
                        }
                    }
                } catch (e) {
                    console.warn('Direct cloud pull note:', e);
                } finally {
                    clearTimeout(timer);
                }
            }
        }
    } catch (err) {
        console.error('pullFromCloud error:', err);
    } finally {
        if (!silent) hideLoading();
    }

    if (payload) {
        await applySyncedData(payload, !silent);
        updateSyncQrCode();
        if (DOM.syncStatusBadge) {
            const timeStr = new Date().toLocaleTimeString('fa-IR');
            DOM.syncStatusBadge.textContent = `دریافت شد (${timeStr})`;
            DOM.syncStatusBadge.style.color = 'var(--accent-emerald)';
        }
    } else {
        if (!silent) {
            showToast(`اطلاعاتی با شناسه «${syncKey}» یافت نشد. می‌توانید از کُد سریع انتقال یا فایل پشتیبان استفاده نمایید.`, 'warning');
        }
    }
}

function updateSyncQrCode() {
    const syncKey = (DOM.syncKeyInput && DOM.syncKeyInput.value ? DOM.syncKeyInput.value : getSyncKey()).trim();
    if (!syncKey) return;

    const currentUrl = window.location.href.split('?')[0];
    const directSyncUrl = `${currentUrl}?sync=${encodeURIComponent(syncKey)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(directSyncUrl)}`;

    if (DOM.syncQrImg) {
        DOM.syncQrImg.src = qrApiUrl;
        DOM.syncQrImg.style.display = 'block';
        if (DOM.syncQrPlaceholder) DOM.syncQrPlaceholder.style.display = 'none';
    }

    if (DOM.syncQrHint) {
        DOM.syncQrHint.textContent = `بارکد آماده است! با دوربین گوشی اسکن کنید تا کمد ${syncKey} باز شود.`;
    }
}

function exportBackupFile() {
    const payload = getSyncPayload();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `wearwise_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('💾 فایل پشتیبان کامل کمد با موفقیت دانلود شد.', 'success');
}

function importBackupFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (!parsed.wardrobe || !Array.isArray(parsed.wardrobe)) {
                throw new Error('فایل پشتیبان فاقد لیست معتبر لباس‌ها است.');
            }
            await applySyncedData(parsed, true);
            if (parsed.sync_id && DOM.syncKeyInput) {
                DOM.syncKeyInput.value = parsed.sync_id;
                setSyncKey(parsed.sync_id);
                updateSyncQrCode();
            }
        } catch (err) {
            showToast(`خطا در بازخوانی فایل: ${err.message}`, 'error');
        }
    };
    reader.readAsText(file);
}

function setupSyncModal() {
    const {
        syncModalBtn,
        syncModal,
        closeSyncModal,
        closeSyncModalBtn,
        syncKeyInput,
        generateSyncKeyBtn,
        copySyncLinkBtn,
        pushSyncBtn,
        pullSyncBtn,
        autoSyncCheckbox,
        generateQrBtn,
        exportBackupBtn,
        importBackupBtn,
        importBackupFile: fileInput
    } = DOM;

    if (!syncModalBtn || !syncModal) return;

    // Load initial sync ID
    const initialKey = getSyncKey();
    if (syncKeyInput) syncKeyInput.value = initialKey;

    // Open Modal
    syncModalBtn.addEventListener('click', () => {
        syncModal.style.display = 'flex';
        if (syncKeyInput) syncKeyInput.value = getSyncKey();
        updateSyncQrCode();
    });

    const closeModal = () => {
        syncModal.style.display = 'none';
    };

    if (closeSyncModal) closeSyncModal.addEventListener('click', closeModal);
    if (closeSyncModalBtn) closeSyncModalBtn.addEventListener('click', closeModal);

    // Generate Random Key
    if (generateSyncKeyBtn) {
        generateSyncKeyBtn.addEventListener('click', () => {
            const newKey = generateRandomSyncKey();
            if (syncKeyInput) syncKeyInput.value = newKey;
            setSyncKey(newKey);
            updateSyncQrCode();
            showToast(`شناسه جدید «${newKey}» ایجاد شد. برای ذخیره دکمه ارسال را بزنید.`, 'info');
        });
    }

    // Copy Direct Link for Phone
    if (copySyncLinkBtn) {
        copySyncLinkBtn.addEventListener('click', () => {
            const syncKey = (syncKeyInput.value || getSyncKey()).trim();
            const currentUrl = window.location.href.split('?')[0];
            const directSyncUrl = `${currentUrl}?sync=${encodeURIComponent(syncKey)}`;
            navigator.clipboard.writeText(directSyncUrl).then(() => {
                showToast('📋 لینک ورود مستقیم به گوشی در کلیپ‌بورد کپی شد.', 'success');
            }).catch(() => {
                prompt('لینک کمد شما برای باز کردن در گوشی:', directSyncUrl);
            });
        });
    }

    // Push Button
    if (pushSyncBtn) {
        pushSyncBtn.addEventListener('click', () => pushToCloud(false));
    }

    // Pull Button
    if (pullSyncBtn) {
        pullSyncBtn.addEventListener('click', () => pullFromCloud(syncKeyInput.value.trim(), false));
    }

    // Generate QR Button
    if (generateQrBtn) {
        generateQrBtn.addEventListener('click', updateSyncQrCode);
    }

    // Export Backup
    if (exportBackupBtn) {
        exportBackupBtn.addEventListener('click', exportBackupFile);
    }

    // Import Backup
    if (importBackupBtn && fileInput) {
        importBackupBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                importBackupFile(e.target.files[0]);
                e.target.value = '';
            }
        });
    }

    // Quick Sync Code (Copy/Paste text - 100% Offline & Reliable)
    if (DOM.copySyncCodeBtn) {
        DOM.copySyncCodeBtn.addEventListener('click', () => {
            try {
                const payload = getSyncPayload();
                const jsonStr = JSON.stringify(payload);
                const b64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
                    return String.fromCharCode('0x' + p1);
                }));
                const quickCode = `WEARWISE:${b64}`;

                // Display in textarea
                if (DOM.syncCodeExportContainer && DOM.syncCodeExportArea) {
                    DOM.syncCodeExportContainer.style.display = 'block';
                    DOM.syncCodeExportArea.value = quickCode;
                    DOM.syncCodeExportArea.select();
                }

                // Copy to clipboard
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(quickCode).then(() => {
                        if (DOM.copySuccessNotice) {
                            DOM.copySuccessNotice.style.display = 'inline';
                            setTimeout(() => { if (DOM.copySuccessNotice) DOM.copySuccessNotice.style.display = 'none'; }, 4000);
                        }
                        showToast('📋 کُد انتقال با موفقیت کپی شد! در پیام‌رسان بفرستید و در گوشی Paste کنید.', 'success');
                    }).catch(() => {
                        if (DOM.syncCodeExportArea) {
                            DOM.syncCodeExportArea.select();
                            document.execCommand('copy');
                        }
                        showToast('📋 کُد انتقال در کادر زیر آماده کپی است.', 'info');
                    });
                } else {
                    if (DOM.syncCodeExportArea) {
                        DOM.syncCodeExportArea.select();
                        document.execCommand('copy');
                    }
                    showToast('📋 کُد انتقال در کادر زیر نمایش داده شد.', 'info');
                }
            } catch (err) {
                showToast('خطا در تولید کُد انتقال: ' + err.message, 'error');
            }
        });
    }

    if (DOM.copyExportedCodeBtn && DOM.syncCodeExportArea) {
        DOM.copyExportedCodeBtn.addEventListener('click', () => {
            DOM.syncCodeExportArea.select();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(DOM.syncCodeExportArea.value);
            } else {
                document.execCommand('copy');
            }
            if (DOM.copySuccessNotice) {
                DOM.copySuccessNotice.style.display = 'inline';
                setTimeout(() => { if (DOM.copySuccessNotice) DOM.copySuccessNotice.style.display = 'none'; }, 4000);
            }
            showToast('📋 متن کُد مجدداً کپی شد.', 'success');
        });
    }

    // Apply pasted sync code (Directly from textarea - No truncation, No prompt)
    if (DOM.applySyncCodeBtn) {
        DOM.applySyncCodeBtn.addEventListener('click', async () => {
            const codeInput = (DOM.syncCodeImportArea ? DOM.syncCodeImportArea.value : '').trim();
            if (!codeInput) {
                showToast('لطفاً ابتدا کُد انتقال را در کادر جای‌گذاری کنید.', 'error');
                if (DOM.syncCodeImportArea) DOM.syncCodeImportArea.focus();
                return;
            }

            try {
                let rawCode = codeInput.trim();
                let jsonText = '';
                if (rawCode.startsWith('WEARWISE:')) {
                    const b64 = rawCode.substring(9).trim();
                    const decoded = decodeURIComponent(Array.prototype.map.call(atob(b64), (c) => {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    jsonText = decoded;
                } else if (rawCode.startsWith('{')) {
                    jsonText = rawCode;
                } else {
                    throw new Error('فرمت کُد انتقال نامعتبر است (باید با WEARWISE: شروع شود).');
                }

                const parsed = JSON.parse(jsonText);
                if (!parsed || !parsed.wardrobe) {
                    throw new Error('کُد فاقد اطلاعات معتبر کمد است.');
                }

                await applySyncedData(parsed, true);
                if (parsed.sync_id && DOM.syncKeyInput) {
                    DOM.syncKeyInput.value = parsed.sync_id;
                    setSyncKey(parsed.sync_id);
                    updateSyncQrCode();
                }
                if (DOM.syncCodeImportArea) DOM.syncCodeImportArea.value = '';
                showToast('🎉 تمام لباس‌ها، تصاویر، کلید API و تنظیمات با موفقیت منتقل شدند!', 'success');
            } catch (err) {
                showToast('خطا در اعمال کُد انتقال: ' + err.message, 'error');
            }
        });
    }

    if (DOM.pasteSyncCodeBtn) {
        DOM.pasteSyncCodeBtn.addEventListener('click', () => {
            if (DOM.syncCodeImportArea) {
                DOM.syncCodeImportArea.focus();
                DOM.syncCodeImportArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Auto-Sync Toggle
    if (autoSyncCheckbox) {
        const autoSyncStored = localStorage.getItem('wearwise_autosync') !== 'false';
        autoSyncCheckbox.checked = autoSyncStored;
        autoSyncCheckbox.addEventListener('change', (e) => {
            localStorage.setItem('wearwise_autosync', e.target.checked);
        });
    }
}

// -------------------------------------------------------------
// Image Vision & Photo Upload Handling
// -------------------------------------------------------------
async function callGeminiVisionClientSide(apiKey, base64Data, mimeType) {
    const models = [
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.8-flash',
        'gemini-2.5-flash'
    ];
    const prompt = `شما یک کارشناس ارشد مد و استایل، طراح لباس و متخصص بینایی ماشین هستید.
این تصویر لباس یا اکسسوری را با دقت بسیار بالا، موشکافانه و جزء به جزء بررسی کنید.

دستورالعمل تولید «name» (بسیار مهم):
نام آیتم باید کاملاً دقیق، پر جزئیات و توصیفی باشد (حدود ۵ تا ۹ کلمه) و همه مشخصات ظاهری زیر را در بر بگیرد:
- نوع دقیق آیتم (مثلاً: تیشرت، پیراهن دکمه‌دار، شلوار جین، کفش کتانی، ساعت مچی، هودی، کاپشن بادی)
- فرم و برش (اوورسایز، راسته، اسلیم‌فیت، لانگ، بگ، مام‌استایل و...)
- جزئیات طراحی (یقه گرد، یقه هفت، دکمه‌دار، آستین کوتاه، آستین بلند، کلاه‌دار، زیپ‌دار، جیب‌دار، بند چرمی و...)
- جنس و بافت احتمالی (نخی پنبه‌ای، کتان، دنیم جین، چرم، بافت کشباف، استیل، سیلیکونی و...)
- طرح و پترن (ساده مینیمال، چاپ گرافیکی، چهارخانه، راه‌راه، لوگودار، بدون طرح و...)
- رنگ و تناژ دقیق (مشکی مات، سفید شیری، سرمه‌ای تیره، طوسی ملانژ، زیتونی و...)

تفکیک دقیق تیشرت و پیراهن:
- اگر لباس دارای آستین کوتاه، تریکو، پنبه‌ای، یقه گرد یا هفت، پلوشرت اسپرت یا بدون دکمه‌های سرتاسری جلویی است، نام حتماً با «تیشرت ...» شروع شود و category برابر «تیشرت» باشد.
- «پیراهن» را منحصراً برای پیراهن‌های دکمه‌دار رسمی آستین‌دار به کار ببرید.

خروجی را منحصراً در قالب فرمت JSON زیر به زبان فارسی برگردانید (هیچ متن، توضیح یا مارک‌داون اضافی نفرستید):
{
  "name": "نام کامل، دقیق و پرجزئیات لباس با تمام ویژگی‌های ظاهری به زبان فارسی",
  "category": "یکی از موارد: تیشرت, پیراهن, شلوار, کفش, اکسسوری, هودی, پلیور, کاپشن, پالتو",
  "color": "رنگ دقیق و تناژ",
  "season": "یکی از موارد: بهار و تابستان, تابستان, پاییز و زمستان, زمستان, چهارفصل",
  "style": "سبک لباس (مثلاً: کژوال روزمره، اسپرت، رسمی، استریت‌ویر)",
  "details": "۲ یا ۳ مورد از بارزترین جزئیات ظاهری مانند نوع یقه، جنس، زیپ یا طرح"
}`;

    const bodyData = JSON.stringify({
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: mimeType || 'image/jpeg',
                        data: base64Data
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0.1
        }
    });

    for (const model of models) {
        const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        
        // List of candidate endpoints: direct first, then anti-sanction CORS proxies
        const candidateUrls = [
            directUrl,
            `https://corsproxy.io/?${encodeURIComponent(directUrl)}`
        ];

        for (const url of candidateUrls) {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: bodyData
                });

                if (res.ok) {
                    const json = await res.json();
                    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
                    let parsed = JSON.parse(cleaned);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        parsed = parsed[0];
                    }
                    if (parsed && parsed.name) {
                        return parsed;
                    }
                } else {
                    const errText = await res.text().catch(() => '');
                    console.warn(`Vision call via ${url.slice(0, 35)} failed (${res.status}):`, errText);
                }
            } catch (err) {
                console.warn(`Vision network error with ${url.slice(0, 35)}:`, err.message);
            }
        }
    }

    throw new Error('عدم دریافت پاسخ از سرور هوش مصنوعی (احتمالاً تحریم یا فیلترشکن خاموش است)');
}

async function processImageLocally(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const rawDataUrl = e.target.result;
            const img = new Image();
            img.onload = async () => {
                const maxDim = 320;
                let w = img.width;
                let h = img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

                // Automatically remove background for crystal-clear isolated clothing item
                let cleanDataUrl = compressedDataUrl;
                try {
                    cleanDataUrl = await removeBackgroundFromDataUrl(compressedDataUrl);
                } catch (bgErr) {
                    console.warn('Auto background removal note:', bgErr);
                }

                // 1. Try Gemini Vision if API key is stored
                const apiKey = localStorage.getItem('wearwise_gemini_key');
                if (apiKey && apiKey.trim().length > 10) {
                    try {
                        const base64Data = compressedDataUrl.split(',')[1];
                        const geminiRes = await callGeminiVisionClientSide(apiKey.trim(), base64Data, 'image/jpeg');
                        if (geminiRes && geminiRes.name) {
                            return resolve({
                                dataUrl: cleanDataUrl,
                                name: geminiRes.name,
                                category: geminiRes.category || 'اکسسوری',
                                color: geminiRes.color || 'مشکی',
                                season: geminiRes.season || 'چهارفصل',
                                details: geminiRes.details || '',
                                style: geminiRes.style || '',
                                gemini_used: true
                            });
                        }
                    } catch (gErr) {
                        console.warn('Client-side Gemini Vision call failed, using heuristic engine:', gErr);
                    }
                }

                // 2. Intelligent Canvas Pixel Color & Aspect Ratio Heuristic Engine
                const imgData = ctx.getImageData(
                    Math.floor(w * 0.25),
                    Math.floor(h * 0.25),
                    Math.floor(w * 0.5),
                    Math.floor(h * 0.5)
                );
                const pixels = imgData.data;
                let totalR = 0, totalG = 0, totalB = 0, count = 0;
                for (let i = 0; i < pixels.length; i += 16) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    totalR += r;
                    totalG += g;
                    totalB += b;
                    count++;
                }
                const avgR = count ? Math.round(totalR / count) : 100;
                const avgG = count ? Math.round(totalG / count) : 100;
                const avgB = count ? Math.round(totalB / count) : 100;
                const brightness = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;
                const maxC = Math.max(avgR, avgG, avgB);
                const minC = Math.min(avgR, avgG, avgB);
                const saturation = maxC === 0 ? 0 : ((maxC - minC) / maxC) * 100;

                let color = "مشکی";
                if (brightness < 55) {
                    color = "مشکی";
                } else if (brightness > 200 && saturation < 25) {
                    color = "سفید";
                } else if (saturation < 22) {
                    color = brightness > 140 ? "نقره‌ای / طوسی روشن" : "طوسی";
                } else if (avgB > avgR + 15 && avgB > avgG) {
                    color = brightness < 100 ? "سرمه‌ای" : "آبی";
                } else if (avgR > avgB + 20 && avgG > avgB + 10 && brightness > 130) {
                    color = avgR > 180 ? "طلایی / بژ" : "کرم";
                } else if (avgR > avgG + 25 && avgR > avgB + 25) {
                    color = brightness < 110 ? "زرشکی" : "قرمز";
                } else if (avgG > avgR + 15 && avgG > avgB + 15) {
                    color = "سبز / زیتونی";
                } else if (avgR > avgB + 30 && avgG > avgB) {
                    color = "قهوه‌ای";
                } else {
                    color = "طوسی تیره";
                }

                const fn = (file.name || '').toLowerCase();
                const ratio = img.height / (img.width || 1);
                let category = "اکسسوری";
                let name = "";
                let season = "چهارفصل";

                // Heuristic Classification based on filename keywords and geometry
                if (fn.includes('tshirt') || fn.includes('t-shirt') || fn.includes('تیشرت') || fn.includes('تی‌شرت') || fn.includes('tee') || fn.includes('پلوشرت') || fn.includes('پولوشرت') || fn.includes('تاپ')) {
                    category = "تیشرت";
                    name = `تیشرت نخی ${color}`;
                    season = "بهار و تابستان";
                } else if (fn.includes('watch') || fn.includes('clock') || fn.includes('smartwatch') || fn.includes('ساعت') || fn.includes('مچی') || fn.includes('زمان')) {
                    category = "اکسسوری";
                    name = `ساعت مچی ${color}`;
                    season = "چهارفصل";
                } else if (fn.includes('glass') || fn.includes('عینک') || fn.includes('optical') || fn.includes('shade') || fn.includes('spectacle')) {
                    category = "اکسسوری";
                    name = `عینک ${color}`;
                    season = "چهارفصل";
                } else if (fn.includes('hat') || fn.includes('cap') || fn.includes('beanie') || fn.includes('کلاه')) {
                    category = "اکسسوری";
                    name = `کلاه ${color}`;
                    season = "پاییز و زمستان";
                } else if (fn.includes('belt') || fn.includes('کمربند')) {
                    category = "اکسسوری";
                    name = `کمربند چرمی ${color}`;
                    season = "چهارفصل";
                } else if (fn.includes('bag') || fn.includes('wallet') || fn.includes('backpack') || fn.includes('کیف') || fn.includes('کوله')) {
                    category = "اکسسوری";
                    name = `کیف ${color}`;
                    season = "چهارفصل";
                } else if (fn.includes('scarf') || fn.includes('شال') || fn.includes('روسری')) {
                    category = "اکسسوری";
                    name = `شال ${color}`;
                    season = "پاییز و زمستان";
                } else if (fn.includes('pant') || fn.includes('jean') || fn.includes('trouser') || fn.includes('شلوار') || fn.includes('اسلش') || fn.includes('کتان')) {
                    category = "شلوار";
                    name = `شلوار ${color}`;
                    season = "چهارفصل";
                } else if (fn.includes('shoe') || fn.includes('sneak') || fn.includes('boot') || fn.includes('کفش') || fn.includes('کتانی') || fn.includes('بوت') || fn.includes('نیم‌بوت')) {
                    category = "کفش";
                    name = `کتانی یا کفش ${color}`;
                    season = "چهارفصل";
                } else if (fn.includes('hoodie') || fn.includes('سویشرت') || fn.includes('هودی')) {
                    category = "هودی";
                    name = `هودی ${color}`;
                    season = "پاییز و زمستان";
                } else if (fn.includes('sweater') || fn.includes('knit') || fn.includes('بافت') || fn.includes('پلیور') || fn.includes('دورس')) {
                    category = "پلیور";
                    name = `پلیور بافت ${color}`;
                    season = "پاییز و زمستان";
                } else if (fn.includes('shirt') || fn.includes('پیراهن') || fn.includes('بلوز') || fn.includes('شومیز')) {
                    category = "پیراهن";
                    name = `پیراهن ${color}`;
                    season = "چهارفصل";
                } else if (fn.includes('jacket') || fn.includes('coat') || fn.includes('کاپشن') || fn.includes('پالتو') || fn.includes('بارانی') || fn.includes('پافر')) {
                    category = "کاپشن";
                    name = `کاپشن یا بارانی ${color}`;
                    season = "پاییز و زمستان";
                } else {
                    // Geometry & aspect ratio fallback when filename is generic (IMG_..., Photo_..., etc.)
                    if (ratio > 1.6) {
                        category = "شلوار";
                        name = `شلوار ${color}`;
                        season = "چهارفصل";
                    } else if (ratio < 0.72) {
                        category = "کفش";
                        name = `کفش یا کتانی ${color}`;
                        season = "چهارفصل";
                    } else if (ratio >= 0.90 && ratio <= 1.15 && (brightness < 60 || brightness > 190 || saturation < 15)) {
                        // Square close-up object
                        category = "اکسسوری";
                        name = `ساعت مچی یا اکسسوری ${color}`;
                        season = "چهارفصل";
                    } else {
                        // Standard casual upper garment defaults to t-shirt (most common daily casual wear)
                        category = "تیشرت";
                        name = `تیشرت نخی ${color}`;
                        season = "بهار و تابستان";
                    }
                }

                resolve({
                    dataUrl: cleanDataUrl,
                    name,
                    category,
                    color,
                    season,
                    gemini_used: false
                });
            };
            img.src = rawDataUrl;
        };
        reader.readAsDataURL(file);
    });
}

function setupPhotoUpload() {
    const { dropZone, clothingPhotoInput, dropZonePrompt, dropZonePreview, previewImg, confirmUploadBtn, cancelUploadBtn } = DOM;

    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('#confirmUploadBtn') || e.target.closest('#cancelUploadBtn')) return;
        clothingPhotoInput.click();
    });

    ['dragenter', 'dragover'].forEach(evtName => {
        dropZone.addEventListener(evtName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(evtName => {
        dropZone.addEventListener(evtName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handlePhotoSelect(files[0]);
        }
    });

    clothingPhotoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handlePhotoSelect(e.target.files[0]);
        }
    });

    cancelUploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetPhotoUpload();
    });

    if (DOM.cleanAllBgBtn) {
        DOM.cleanAllBgBtn.addEventListener('click', cleanAllWardrobeBackgrounds);
    }

    confirmUploadBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!state.selectedPhotoFile) return;

        showLoading('تحلیل هوشمند تصویر لباس...', 'تشخیص فرم و نوع پوشاک، حذف پس‌زمینه و استخراج پالت رنگ');

        try {
            let result = null;
            if (!isStaticHost()) {
                try {
                    const formData = new FormData();
                    formData.append('file', state.selectedPhotoFile);
                    formData.append('auto_save', 'false');

                    const res = await fetch('/api/wardrobe/upload-photo', {
                        method: 'POST',
                        body: formData
                    });

                    if (res.ok) {
                        result = await res.json();
                    }
                } catch (e) {
                    console.warn('Backend photo upload unavailable, using client-side engine:', e);
                }
            }

            // Client-side local analyzer fallback (100% works on GitHub Pages & offline)
            if (!result || !result.items || result.items.length === 0) {
                const analyzed = await processImageLocally(state.selectedPhotoFile);
                result = {
                    items: [{
                        name: analyzed.name,
                        category: analyzed.category,
                        color: analyzed.color,
                        season: analyzed.season,
                        details: analyzed.details,
                        style: analyzed.style,
                        image_url: analyzed.dataUrl
                    }],
                    gemini_used: analyzed.gemini_used,
                    message: analyzed.gemini_used 
                        ? 'لباس با بررسی جزء به جزء و استخراج نام کامل توسط Gemini تحلیل گردید!' 
                        : 'تصویر با تحلیل محلی ویژگی‌ها پردازش شد.'
                };
            }

            const items = result.items || [];
            if (items.length > 0) {
                const item = items[0];
                state.detectedImageUrl = item.image_url || null;
                DOM.detectedName.value = item.name || '';
                DOM.detectedCategory.value = item.category || 'اکسسوری';
                DOM.detectedColor.value = item.color || '';
                DOM.detectedSeason.value = item.season || 'چهارفصل';

                if (DOM.detectedDetailsBox) {
                    if (item.details) {
                        DOM.detectedDetailsText.textContent = item.details;
                        if (DOM.detectedStyleBadge) {
                            DOM.detectedStyleBadge.textContent = item.style ? `سبک: ${item.style}` : 'جزئیات اختصاصی';
                            DOM.detectedStyleBadge.style.display = 'inline-block';
                        }
                        DOM.detectedDetailsBox.style.display = 'block';
                    } else {
                        DOM.detectedDetailsBox.style.display = 'none';
                    }
                }

                DOM.detectionBadge.textContent = result.gemini_used 
                    ? '✨ تحلیل موشکافانه با هوش مصنوعی بینایی Google Gemini'
                    : '📷 تحلیل تخمینی مشخصات (موتور محلی)';
                
                DOM.detectionNote.innerHTML = result.gemini_used
                    ? 'هوش مصنوعی Gemini تصویر را مو به مو بررسی کرد و تمام ویژگی‌ها، جنس و نام کامل آن را نوشت.'
                    : '⚠️ توجه: کلید هوش مصنوعی فعال نیست یا متصل نشد. برای تحلیل دقیق و نام کامل، <button type="button" class="btn-chip" onclick="document.getElementById(\'apiKeyBtn\').click()" style="margin-inline: 4px; color: #a5b4fc; border-color: #6366f1;">🔑 تنظیم کلید Gemini</button> را بزنید یا دسته‌بندی را با دکمه‌های زیر انتخاب کنید:';

                DOM.detectionResultBox.style.display = 'block';
                DOM.detectionResultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                showToast(result.message, 'success');
            }
        } catch (err) {
            console.error('Vision upload error:', err);
            showToast(err.message, 'error');
        } finally {
            hideLoading();
        }
    });

    // Save Verified Detected Item
    DOM.saveDetectedBtn.addEventListener('click', async () => {
        const name = DOM.detectedName.value.trim();
        const category = DOM.detectedCategory.value;
        const color = DOM.detectedColor.value.trim();
        const season = DOM.detectedSeason.value;

        if (!name || !color) {
            showToast('لطفاً نام و رنگ لباس را وارد کنید.', 'error');
            return;
        }

        let savedOnBackend = false;
        if (!isStaticHost()) {
            try {
                const res = await fetch('/api/wardrobe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        name, 
                        category, 
                        color, 
                        season,
                        image_url: state.detectedImageUrl || undefined
                    })
                });

                if (res.ok) {
                    savedOnBackend = true;
                }
            } catch (_) {}
        }

        // Always ensure saved into local storage (for GitHub Pages & offline)
        const localItems = getLocalWardrobe();
        const newItem = {
            id: Date.now(),
            name,
            category,
            color,
            season,
            image_url: state.detectedImageUrl || getGarmentFallbackImage(name, category)
        };
        const existingIdx = localItems.findIndex(w => w.name === name);
        if (existingIdx >= 0) {
            localItems[existingIdx] = newItem;
        } else {
            localItems.unshift(newItem);
        }
        safeSetLocalWardrobe(localItems);
        state.wardrobe = localItems;

        showToast('لباس با موفقیت در کمد شخصی شما ثبت گردید!', 'success');
        state.detectedImageUrl = null;
        resetPhotoUpload();
        DOM.detectionResultBox.style.display = 'none';
        await loadWardrobe();
        triggerAutoSync();
    });

    DOM.discardDetectedBtn.addEventListener('click', () => {
        DOM.detectionResultBox.style.display = 'none';
        resetPhotoUpload();
    });
}

// ============================================================
// Bulk Wardrobe Addition (Multi-Photo & Multi-Text Entry)
// ============================================================

function setupBulkWardrobe() {
    // Mode toggles
    if (DOM.modeVisionBtn) {
        DOM.modeVisionBtn.addEventListener('click', () => switchWardrobeAddMode('vision'));
    }
    if (DOM.modeBulkUploadBtn) {
        DOM.modeBulkUploadBtn.addEventListener('click', () => switchWardrobeAddMode('bulk-upload'));
    }
    if (DOM.modeBulkTextBtn) {
        DOM.modeBulkTextBtn.addEventListener('click', () => switchWardrobeAddMode('bulk-text'));
    }
    if (DOM.modeManualBtn) {
        DOM.modeManualBtn.addEventListener('click', () => switchWardrobeAddMode('manual'));
    }

    // 1. Bulk Photo Upload
    if (DOM.bulkDropZone && DOM.bulkPhotoInput) {
        ['dragenter', 'dragover'].forEach(evt => {
            DOM.bulkDropZone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                DOM.bulkDropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            DOM.bulkDropZone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                DOM.bulkDropZone.classList.remove('drag-over');
            });
        });

        DOM.bulkDropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                handleBulkFilesSelect(files);
            }
        });

        DOM.bulkPhotoInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleBulkFilesSelect(e.target.files);
            }
        });
    }

    if (DOM.bulkClearFilesBtn) {
        DOM.bulkClearFilesBtn.addEventListener('click', clearBulkUploadFiles);
    }

    if (DOM.bulkUploadSubmitBtn) {
        DOM.bulkUploadSubmitBtn.addEventListener('click', submitBulkUpload);
    }

    // 2. Bulk Text Entry
    if (DOM.bulkTextParseBtn) {
        DOM.bulkTextParseBtn.addEventListener('click', () => {
            const text = DOM.bulkTextInput?.value || '';
            parseBulkText(text);
        });
    }

    if (DOM.bulkTextSubmitDirectBtn) {
        DOM.bulkTextSubmitDirectBtn.addEventListener('click', async () => {
            const text = DOM.bulkTextInput?.value || '';
            const items = parseBulkTextInternal(text);
            if (items.length === 0) {
                showToast('لطفاً حداقل یک سطر مشخصات لباس وارد کنید.', 'error');
                return;
            }
            await submitBulkItemsPayload(items);
        });
    }

    if (DOM.bulkSaveParsedBtn) {
        DOM.bulkSaveParsedBtn.addEventListener('click', async () => {
            if (!state.parsedBulkItems || state.parsedBulkItems.length === 0) {
                showToast('هیچ آیتمی برای ذخیره وجود ندارد.', 'error');
                return;
            }
            await submitBulkItemsPayload(state.parsedBulkItems);
        });
    }
}

function switchWardrobeAddMode(mode) {
    [DOM.modeVisionBtn, DOM.modeBulkUploadBtn, DOM.modeBulkTextBtn, DOM.modeManualBtn].forEach(b => {
        if (b) b.classList.remove('active');
    });

    if (DOM.visionForm) DOM.visionForm.style.display = 'none';
    if (DOM.bulkUploadForm) DOM.bulkUploadForm.style.display = 'none';
    if (DOM.bulkTextForm) DOM.bulkTextForm.style.display = 'none';
    if (DOM.manualForm) DOM.manualForm.style.display = 'none';

    if (mode === 'vision') {
        if (DOM.modeVisionBtn) DOM.modeVisionBtn.classList.add('active');
        if (DOM.visionForm) DOM.visionForm.style.display = 'block';
    } else if (mode === 'bulk-upload') {
        if (DOM.modeBulkUploadBtn) DOM.modeBulkUploadBtn.classList.add('active');
        if (DOM.bulkUploadForm) DOM.bulkUploadForm.style.display = 'block';
    } else if (mode === 'bulk-text') {
        if (DOM.modeBulkTextBtn) DOM.modeBulkTextBtn.classList.add('active');
        if (DOM.bulkTextForm) DOM.bulkTextForm.style.display = 'block';
    } else if (mode === 'manual') {
        if (DOM.modeManualBtn) DOM.modeManualBtn.classList.add('active');
        if (DOM.manualForm) DOM.manualForm.style.display = 'block';
    }
}

function handleBulkFilesSelect(fileList) {
    const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
        showToast('لطفاً فقط فایل‌های تصویری معتبر انتخاب کنید.', 'error');
        return;
    }

    const combined = [...state.bulkUploadFiles, ...validFiles].slice(0, 20);
    state.bulkUploadFiles = combined;
    renderBulkThumbnails();
}

function renderBulkThumbnails() {
    if (!DOM.bulkFilesPreviewWrap || !DOM.bulkThumbGrid || !DOM.bulkSelectedCount) return;

    if (state.bulkUploadFiles.length === 0) {
        DOM.bulkFilesPreviewWrap.style.display = 'none';
        return;
    }

    DOM.bulkFilesPreviewWrap.style.display = 'block';
    DOM.bulkSelectedCount.textContent = state.bulkUploadFiles.length;
    DOM.bulkThumbGrid.innerHTML = '';

    state.bulkUploadFiles.forEach((file, idx) => {
        const thumbItem = document.createElement('div');
        thumbItem.className = 'bulk-thumb-item';
        const objUrl = URL.createObjectURL(file);

        thumbItem.innerHTML = `
            <img src="${objUrl}" alt="${file.name}" title="${file.name}">
            <button type="button" class="bulk-thumb-remove" onclick="removeBulkUploadFile(${idx})" title="حذف این عکس">✕</button>
        `;
        DOM.bulkThumbGrid.appendChild(thumbItem);
    });
}

function removeBulkUploadFile(index) {
    if (index >= 0 && index < state.bulkUploadFiles.length) {
        state.bulkUploadFiles.splice(index, 1);
        renderBulkThumbnails();
    }
}

function clearBulkUploadFiles() {
    state.bulkUploadFiles = [];
    if (DOM.bulkPhotoInput) DOM.bulkPhotoInput.value = '';
    renderBulkThumbnails();
}

async function submitBulkUpload() {
    if (state.bulkUploadFiles.length === 0) {
        showToast('لطفاً ابتدا حداقل یک یا چند عکس انتخاب کنید.', 'error');
        return;
    }

    if (DOM.bulkProgressWrap) DOM.bulkProgressWrap.style.display = 'block';
    if (DOM.bulkProgressBar) DOM.bulkProgressBar.style.width = '20%';
    if (DOM.bulkProgressText) DOM.bulkProgressText.textContent = `در حال آماده‌سازی و ارسال ${state.bulkUploadFiles.length} عکس به سرور...`;
    if (DOM.bulkUploadSubmitBtn) DOM.bulkUploadSubmitBtn.disabled = true;

    showLoading('تحلیل گروهی تصاویر لباس...', `در حال پردازش هوشمند ${state.bulkUploadFiles.length} تصویر...`);

    let backendSuccess = false;
    if (!isStaticHost()) {
        try {
            const formData = new FormData();
            state.bulkUploadFiles.forEach(file => {
                formData.append('files', file);
            });

            if (DOM.bulkProgressBar) DOM.bulkProgressBar.style.width = '60%';
            if (DOM.bulkProgressText) DOM.bulkProgressText.textContent = 'هوش مصنوعی در حال شناسایی نوع پوشاک و حذف پس‌زمینه...';

            const res = await fetch('/api/wardrobe/bulk-upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                backendSuccess = true;
                showToast(data.message || `${data.saved_count || state.bulkUploadFiles.length} لباس به کمد افزوده شد!`, 'success');
            }
        } catch (e) {
            console.warn('Backend bulk upload failed, switching to client-side analyzer:', e);
        }
    }

    // Client-side fallback for GitHub Pages and offline
    if (!backendSuccess) {
        try {
            const localItems = getLocalWardrobe();
            let addedCount = 0;
            for (let i = 0; i < state.bulkUploadFiles.length; i++) {
                const file = state.bulkUploadFiles[i];
                const pct = Math.round(((i + 1) / state.bulkUploadFiles.length) * 100);
                if (DOM.bulkProgressBar) DOM.bulkProgressBar.style.width = `${pct}%`;
                if (DOM.bulkProgressText) DOM.bulkProgressText.textContent = `پردازش تصویر ${i + 1} از ${state.bulkUploadFiles.length}...`;

                const analyzed = await processImageLocally(file);
                const newItem = {
                    id: Date.now() + Math.floor(Math.random() * 10000),
                    name: analyzed.name,
                    category: analyzed.category,
                    color: analyzed.color,
                    season: analyzed.season,
                    image_url: analyzed.dataUrl
                };
                const existingIdx = localItems.findIndex(w => w.name === newItem.name);
                if (existingIdx >= 0) {
                    localItems[existingIdx] = newItem;
                } else {
                    localItems.unshift(newItem);
                }
                addedCount++;
            }
            safeSetLocalWardrobe(localItems);
            state.wardrobe = localItems;
            showToast(`${addedCount} لباس با موفقیت توسط تحلیلگر مرورگر به کمد شما افزوده شد!`, 'success');
        } catch (err) {
            console.error('Client bulk upload error:', err);
            showToast('خطا در پردازش تصاویر: ' + err.message, 'error');
        }
    }

    if (DOM.bulkProgressBar) DOM.bulkProgressBar.style.width = '100%';
    if (DOM.bulkProgressText) DOM.bulkProgressText.textContent = 'تمام شد!';
    clearBulkUploadFiles();
    if (DOM.bulkProgressWrap) DOM.bulkProgressWrap.style.display = 'none';
    hideLoading();
    if (DOM.bulkUploadSubmitBtn) DOM.bulkUploadSubmitBtn.disabled = false;
    await loadWardrobe();
    triggerAutoSync();
}

// ------------------------------------------------------------
// Bulk Text Parsing & Submitting
// ------------------------------------------------------------

function detectCategoryFromText(name) {
    const n = name.toLowerCase();
    if (n.includes('کاپشن') || n.includes('پافر') || n.includes('بادگیر') || n.includes('جکت')) return 'کاپشن';
    if (n.includes('پالتو') || n.includes('بارانی') || n.includes('ترنچ') || n.includes('اورکت')) return 'پالتو';
    if (n.includes('هودی') || n.includes('سویشرت') || n.includes('دورس')) return 'هودی';
    if (n.includes('پلیور') || n.includes('بافت') || n.includes('ژاکت')) return 'پلیور';
    if (n.includes('تیشرت') || n.includes('پلوشرت') || n.includes('تاپ')) return 'تیشرت';
    if (n.includes('پیراهن')) return 'پیراهن';
    if (n.includes('کت تک') || n.includes('بلیزر') || n.includes('کت و شلوار')) return 'کت تک';
    if (n.includes('جلیقه') || n.includes('وست')) return 'جلیقه';
    if (n.includes('شلوار') || n.includes('جین') || n.includes('کتان') || n.includes('اسلش')) return 'شلوار';
    if (n.includes('دامن')) return 'دامن';
    if (n.includes('شورت') || n.includes('برمودا')) return 'شورت';
    if (n.includes('کتانی') || n.includes('کفش') || n.includes('بوت') || n.includes('نیم‌بوت') || n.includes('کالج') || n.includes('صندل')) return 'کفش';
    if (n.includes('شال') || n.includes('روسری') || n.includes('کلاه') || n.includes('دستکش') || n.includes('عینک') || n.includes('ساعت') || n.includes('کمربند') || n.includes('کیف') || n.includes('چتر')) return 'اکسسوری';
    return 'سایر';
}

function detectColorFromText(name) {
    const colors = [
        'مشکی', 'سفید', 'طوسی', 'خاکستری', 'ذغالی', 
        'سرمه‌ای', 'آبی', 'کرم', 'قهوه‌ای', 'شتری', 
        'قرمز', 'زرشکی', 'سبز', 'زیتونی', 'خاکی', 
        'زرد', 'صورتی', 'بنفش', 'نارنجی'
    ];
    for (const c of colors) {
        if (name.includes(c)) return c;
    }
    return 'چندرنگ / متناسب';
}

function detectSeasonFromText(name, category) {
    const n = name.toLowerCase();
    if (n.includes('زمستان') || n.includes('پشم') || n.includes('گرم') || n.includes('ضخیم') || category === 'کاپشن' || category === 'پالتو') {
        return 'زمستان';
    }
    if (n.includes('پاییز') || category === 'هودی' || category === 'پلیور' || category === 'بارانی') {
        return 'پاییز و زمستان';
    }
    if (n.includes('تابستان') || n.includes('خنک') || n.includes('نخی') || category === 'تیشرت' || category === 'شورت' || category === 'صندل') {
        return 'تابستان';
    }
    if (n.includes('بهار')) {
        return 'بهار';
    }
    return 'چهارفصل';
}

function parseBulkTextInternal(rawText) {
    if (!rawText || !rawText.trim()) return [];
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 1);
    const parsed = [];

    lines.forEach(line => {
        let clean = line.replace(/^[\d\.\-\*\•\)]+\s*/, '').trim();
        if (!clean) return;

        let parts = clean.split(/[،,\-]/).map(p => p.trim()).filter(p => p.length > 0);
        let name = parts[0] || clean;
        let season = '';
        let color = '';

        if (parts.length >= 3) {
            season = parts[1];
            color = parts[2];
        } else if (parts.length === 2) {
            if (['پاییز', 'زمستان', 'بهار', 'تابستان', 'چهارفصل', 'پاییز و زمستان', 'بهار و تابستان'].some(s => parts[1].includes(s))) {
                season = parts[1];
            } else {
                color = parts[1];
            }
        }

        const category = detectCategoryFromText(name);
        if (!color) color = detectColorFromText(name);
        if (!season) season = detectSeasonFromText(name, category);

        parsed.push({
            name,
            category,
            color,
            season,
            image_url: getGarmentFallbackImage(name, category)
        });
    });

    return parsed;
}

function parseBulkText(rawText) {
    const items = parseBulkTextInternal(rawText);
    state.parsedBulkItems = items;

    if (items.length === 0) {
        showToast('هیچ سطری برای تفکیک یافت نشد. لطفاً چند لباس وارد نمایید.', 'error');
        if (DOM.bulkParsedTableWrap) DOM.bulkParsedTableWrap.style.display = 'none';
        return;
    }

    renderBulkParsedTable();
    showToast(`${items.length} لباس تفکیک و در جدول آماده بررسی گردید.`, 'success');
}

function renderBulkParsedTable() {
    if (!DOM.bulkParsedTableWrap || !DOM.bulkParsedTableBody || !DOM.bulkParsedCount) return;

    if (state.parsedBulkItems.length === 0) {
        DOM.bulkParsedTableWrap.style.display = 'none';
        return;
    }

    DOM.bulkParsedTableWrap.style.display = 'block';
    DOM.bulkParsedCount.textContent = state.parsedBulkItems.length;
    DOM.bulkParsedTableBody.innerHTML = '';

    state.parsedBulkItems.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img class="bulk-row-thumb" src="${item.image_url}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=150&q=80';">
            </td>
            <td><strong>${item.name}</strong></td>
            <td><span class="badge-cat">${item.category}</span></td>
            <td>${item.color}</td>
            <td>${item.season}</td>
            <td>
                <button type="button" class="bulk-del-row-btn" onclick="removeBulkParsedRow(${idx})" title="حذف این سطر">✕</button>
            </td>
        `;
        DOM.bulkParsedTableBody.appendChild(tr);
    });
}

function removeBulkParsedRow(index) {
    if (index >= 0 && index < state.parsedBulkItems.length) {
        state.parsedBulkItems.splice(index, 1);
        renderBulkParsedTable();
    }
}

async function submitBulkItemsPayload(items) {
    if (!items || items.length === 0) return;

    showLoading('ثبت گروهی لباس‌ها در کمد...', `در حال افزودن ${items.length} آیتم به کمد شخصی...`);

    let savedOnBackend = false;
    if (!isStaticHost()) {
        try {
            const res = await fetch('/api/wardrobe/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });

            if (res.ok) {
                const data = await res.json();
                savedOnBackend = true;
                showToast(data.message || `${data.added_count} لباس با موفقیت به کمد شما افزوده شد!`, 'success');
            }
        } catch (e) {
            console.warn('Backend bulk save unavailable, saving locally:', e);
        }
    }

    if (!savedOnBackend) {
        const localItems = getLocalWardrobe();
        items.forEach(it => {
            const newItem = {
                id: Date.now() + Math.floor(Math.random() * 10000),
                name: it.name,
                category: it.category || 'کاپشن',
                color: it.color || 'مشکی',
                season: it.season || 'چهارفصل',
                image_url: getGarmentFallbackImage(it.name, it.category)
            };
            const existingIdx = localItems.findIndex(w => w.name === newItem.name);
            if (existingIdx >= 0) {
                localItems[existingIdx] = newItem;
            } else {
                localItems.unshift(newItem);
            }
        });
        safeSetLocalWardrobe(localItems);
        state.wardrobe = localItems;
        showToast(`${items.length} لباس با موفقیت در کمد شخصی شما ثبت گردید!`, 'success');
    }

    state.parsedBulkItems = [];
    if (DOM.bulkTextInput) DOM.bulkTextInput.value = '';
    if (DOM.bulkParsedTableWrap) DOM.bulkParsedTableWrap.style.display = 'none';

    hideLoading();
    await loadWardrobe();
    triggerAutoSync();
}

function insertBulkTemplate(type) {
    if (!DOM.bulkTextInput) return;
    let template = '';

    if (type === 'winter') {
        template = [
            'کاپشن بادی مشکی کلاه‌دار، زمستان، مشکی',
            'پالتو پشمی شتری فوتر، زمستان، قهوه‌ای',
            'هودی دورس مشکی پنبه‌ای، پاییز و زمستان، مشکی',
            'پلیور بافت یقه اسکی طوسی، زمستان، طوسی',
            'شلوار جین تیره راسته، چهارفصل، سرمه‌ای',
            'نیم‌بوت چرم ضدآب، پاییز و زمستان، قهوه‌ای',
            'کلاه بافتنی مشکی گرم، زمستان، مشکی'
        ].join('\n');
    } else if (type === 'casual') {
        template = [
            'هودی کلاه‌دار طوسی روشن، پاییز، طوسی',
            'تیشرت یقه گرد سفید، تابستان، سفید',
            'پیراهن کتان آستین بلند سرمه‌ای، چهارفصل، سرمه‌ای',
            'شلوار کتان کرم راسته، چهارفصل، کرم',
            'شلوار اسلش مشکی راحت، چهارفصل، مشکی',
            'کتانی ورزشی سفید، چهارفصل، سفید'
        ].join('\n');
    } else if (type === 'formal') {
        template = [
            'کت تک سرمه‌ای بلیزر، چهارفصل، سرمه‌ای',
            'پیراهن رسمی سفید پنبه‌ای، چهارفصل، سفید',
            'شلوار پارچه‌ای ذغالی خوش‌دوخت، چهارفصل، ذغالی',
            'کفش چرم مجلسی مشکی، چهارفصل، مشکی',
            'کمربند چرم طبیعی مشکی، چهارفصل، مشکی',
            'ساعت مچی رسمی نقره‌ای، چهارفصل، نقره‌ای'
        ].join('\n');
    }

    DOM.bulkTextInput.value = template;
    parseBulkText(template);
}

function compressImageClientSide(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxWidth) {
                        width = Math.round((width * maxWidth) / height);
                        height = maxWidth;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(blob || file);
                }, 'image/jpeg', quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function handlePhotoSelect(file) {
    if (!file.type.startsWith('image/')) {
        showToast('لطفاً یک فایل تصویری (عکس) انتخاب کنید.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        DOM.previewImg.src = e.target.result;
        DOM.dropZonePrompt.style.display = 'none';
        DOM.dropZonePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    try {
        const compressedBlob = await compressImageClientSide(file, 800, 0.8);
        state.selectedPhotoFile = new File([compressedBlob], 'clothing.jpg', { type: 'image/jpeg' });
    } catch (e) {
        state.selectedPhotoFile = file;
    }
}

function resetPhotoUpload() {
    state.selectedPhotoFile = null;
    state.detectedImageUrl = null;
    DOM.clothingPhotoInput.value = '';
    DOM.previewImg.src = '';
    DOM.dropZonePrompt.style.display = 'block';
    DOM.dropZonePreview.style.display = 'none';
}

// -------------------------------------------------------------
// City Autocomplete Dropdown
// -------------------------------------------------------------
function setupCityAutocomplete() {
    let debounceTimer;
    let selectedIdx = -1;
    let abortController = null;

    const hideDropdown = () => {
        DOM.cityDropdown.style.display = 'none';
        DOM.cityDropdown.innerHTML = '';
        selectedIdx = -1;
    };

    DOM.cityInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = DOM.cityInput.value.trim();

        if (query.length < 1) {
            hideDropdown();
            return;
        }

        debounceTimer = setTimeout(async () => {
            const normQuery = normalizePersianText(query);
            const qLower = query.toLowerCase();

            // 1. Instant local search from 80+ Iranian cities (0ms latency)
            const localMatches = STATIC_CITIES_TABLE.filter(c => {
                const normName = normalizePersianText(c.name);
                const normAdmin = normalizePersianText(c.admin1 || '');
                const normCountry = normalizePersianText(c.country || '');
                const enName = (c.name_en || '').toLowerCase();
                return (
                    normName.includes(normQuery) ||
                    normQuery.includes(normName) ||
                    enName.includes(qLower) ||
                    normAdmin.includes(normQuery) ||
                    normCountry.includes(normQuery)
                );
            });

            // Show local matches immediately
            if (localMatches.length > 0) {
                renderCityDropdown(localMatches.slice(0, 10));
            }

            // 2. Parallel Live Geocoding from Open-Meteo in Persian
            try {
                if (abortController) abortController.abort();
                abortController = new AbortController();

                let liveResults = [];

                if (!isStaticHost()) {
                    try {
                        const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`, {
                            signal: abortController.signal
                        });
                        if (res.ok) {
                            liveResults = await res.json();
                        }
                    } catch (_) {}
                }

                if (liveResults.length === 0) {
                    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=fa&format=json`;
                    const res = await fetch(geoUrl, { signal: abortController.signal });
                    if (res.ok) {
                        const geoData = await res.json();
                        if (geoData.results && Array.isArray(geoData.results)) {
                            liveResults = geoData.results.map(r => ({
                                name: r.name,
                                name_en: r.name,
                                country: r.country || 'ایران',
                                admin1: r.admin1 || '',
                                latitude: r.latitude,
                                longitude: r.longitude,
                                lat: r.latitude,
                                lon: r.longitude
                            }));
                        }
                    }
                }

                // 3. Merge & Deduplicate
                const merged = [...localMatches];
                for (const live of liveResults) {
                    const lat = live.latitude ?? live.lat;
                    const lon = live.longitude ?? live.lon;
                    if (lat !== undefined && lon !== undefined) {
                        const isDup = merged.some(m => {
                            const mLat = m.latitude ?? m.lat;
                            const mLon = m.longitude ?? m.lon;
                            return Math.abs(mLat - lat) < 0.04 && Math.abs(mLon - lon) < 0.04;
                        });
                        if (!isDup) {
                            merged.push(live);
                        }
                    }
                }

                renderCityDropdown(merged.slice(0, 12));
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('City search note:', err);
                }
            }
        }, 160);
    });

    function renderCityDropdown(cities) {
        if (!cities || cities.length === 0) {
            DOM.cityDropdown.innerHTML = `
                <div class="city-dropdown-item no-result" style="cursor: default; opacity: 0.7; justify-content: center; padding: 10px;">
                    <span>🔍 شهری با این نام یافت نشد. دکمه Enter را بزنید.</span>
                </div>
            `;
            DOM.cityDropdown.style.display = 'block';
            return;
        }

        DOM.cityDropdown.innerHTML = '';
        cities.forEach((city, idx) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'city-dropdown-item';
            itemEl.setAttribute('data-idx', idx);

            const displayName = city.name || 'شهر';
            const subLabel = city.admin1 ? city.admin1 : (city.name_en && city.name_en !== city.name ? city.name_en : '');
            const countryBadge = city.country || 'ایران';

            itemEl.innerHTML = `
                <div class="city-main-info">
                    <span class="city-name-txt">${displayName}</span>
                    ${subLabel ? `<span class="city-meta-txt">(${subLabel})</span>` : ''}
                </div>
                <span class="city-country-tag">${countryBadge}</span>
            `;

            itemEl.addEventListener('click', () => {
                selectCity(city);
            });

            DOM.cityDropdown.appendChild(itemEl);
        });

        DOM.cityDropdown.style.display = 'block';
    }

    function selectCity(city) {
        DOM.cityInput.value = city.name;
        hideDropdown();
        const lat = city.latitude ?? city.lat;
        const lon = city.longitude ?? city.lon;
        fetchWeather(city.name, lat, lon);
    }

    DOM.cityInput.addEventListener('keydown', (e) => {
        const items = DOM.cityDropdown.querySelectorAll('.city-dropdown-item:not(.no-result)');
        if (DOM.cityDropdown.style.display === 'none' || items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIdx = (selectedIdx + 1) % items.length;
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIdx = (selectedIdx - 1 + items.length) % items.length;
            updateSelection(items);
        } else if (e.key === 'Enter' && selectedIdx >= 0) {
            e.preventDefault();
            items[selectedIdx].click();
        } else if (e.key === 'Escape') {
            hideDropdown();
        }
    });

    function updateSelection(items) {
        items.forEach((it, i) => {
            it.classList.toggle('active', i === selectedIdx);
            if (i === selectedIdx) it.scrollIntoView({ block: 'nearest' });
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            hideDropdown();
        }
    });
}

// -------------------------------------------------------------
// Event Listeners & Initialization
// -------------------------------------------------------------
function setupEventListeners() {
    // Navigation Tabs
    DOM.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            DOM.tabButtons.forEach(b => b.classList.remove('active'));
            DOM.tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.classList.add('active');

            if (targetId === 'wardrobeTab') loadWardrobe();
            if (targetId === 'historyTab') loadHistory();
        });
    });

    // Theme Selector
    DOM.themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    // Language Selector
    DOM.langSelect.addEventListener('change', (e) => {
        applyLanguage(e.target.value);
    });

    // Destination Selector
    DOM.destinationSelect.addEventListener('change', (e) => {
        state.destination = e.target.value;
    });

    // Style Selector
    DOM.styleSelect.addEventListener('change', (e) => {
        state.style = e.target.value;
    });

    // Wardrobe Toggle
    DOM.wardrobeToggle.addEventListener('change', (e) => {
        state.useWardrobe = e.target.checked;
        showToast(state.useWardrobe ? 'کمد شخصی در پیشنهادات فعال شد.' : 'پیشنهادات بر اساس استایل عمومی خواهد بود.', 'info');
    });

    // City Autocomplete
    setupCityAutocomplete();

    // Manual Search
    DOM.searchBtn.addEventListener('click', () => {
        const query = DOM.cityInput.value.trim();
        if (query) fetchWeather(query);
    });

    DOM.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = DOM.cityInput.value.trim();
            if (query) fetchWeather(query);
        }
    });

    // High Reliability GPS & Auto-Location
    DOM.gpsBtn.addEventListener('click', () => {
        showLoading('در حال شناسایی موقعیت مکانی شما...', 'دریافت مختصات از GPS یا شبکه محلی');
        
        const fallbackToIp = async () => {
            try {
                const res = await fetch('/api/weather/detect-location');
                if (res.ok) {
                    const loc = await res.json();
                    if (loc.latitude && loc.longitude) {
                        await fetchWeather(loc.city, loc.latitude, loc.longitude);
                        showToast(`موقعیت شما شناسایی شد: ${loc.city}`, 'success');
                        return;
                    }
                }
            } catch (e) {
                console.warn('IP location detection error:', e);
            }
            await fetchWeather('تهران');
            showToast('موقعیت خودکار شناسایی نشد؛ شهر پیش‌فرض تهران بارگذاری شد.', 'info');
        };

        if (!navigator.geolocation) {
            fallbackToIp().finally(() => hideLoading());
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                hideLoading();
                const { latitude, longitude } = pos.coords;
                await fetchWeather(null, latitude, longitude);
                showToast('موقعیت کنونی شما با موفقیت شناسایی شد.', 'success');
            },
            async (err) => {
                console.warn('Geolocation fallback to IP:', err);
                await fallbackToIp();
                hideLoading();
            },
            { timeout: 5000, enableHighAccuracy: false, maximumAge: 60000 }
        );
    });

    // Generate Recommendations Button
    DOM.generateBtn.addEventListener('click', () => {
        state.variationSeed = 0;
        generateRecommendations(false);
    });

    // Regenerate Alternative Outfits Button
    if (DOM.regenerateOutfitsBtn) {
        DOM.regenerateOutfitsBtn.addEventListener('click', () => {
            state.variationSeed = Date.now();
            generateRecommendations(true);
        });
    }

    // Wardrobe Add Mode Toggle
    DOM.modeVisionBtn.addEventListener('click', () => {
        DOM.modeVisionBtn.classList.add('active');
        DOM.modeManualBtn.classList.remove('active');
        DOM.visionForm.style.display = 'block';
        DOM.manualForm.style.display = 'none';
    });

    DOM.modeManualBtn.addEventListener('click', () => {
        DOM.modeManualBtn.classList.add('active');
        DOM.modeVisionBtn.classList.remove('active');
        DOM.visionForm.style.display = 'none';
        DOM.manualForm.style.display = 'block';
    });

    // Manual Wardrobe Form Submit
    DOM.manualForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('itemName').value.trim();
        const category = document.getElementById('itemCategory').value;
        const color = document.getElementById('itemColor').value.trim();
        const season = document.getElementById('itemSeason').value;

        if (!name || !color) {
            showToast('لطفاً همه فیلدهای الزامی را پر کنید.', 'error');
            return;
        }

        let savedOnBackend = false;
        if (!isStaticHost()) {
            try {
                const res = await fetch('/api/wardrobe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, category, color, season })
                });

                if (res.ok) {
                    savedOnBackend = true;
                }
            } catch (_) {}
        }

        if (!savedOnBackend) {
            const localItems = getLocalWardrobe();
            const newItem = {
                id: Date.now(),
                name,
                category,
                color,
                season,
                image_url: getGarmentFallbackImage(name, category)
            };
            const existingIdx = localItems.findIndex(w => w.name === name);
            if (existingIdx >= 0) {
                localItems[existingIdx] = newItem;
            } else {
                localItems.unshift(newItem);
            }
            safeSetLocalWardrobe(localItems);
            state.wardrobe = localItems;
        }

        showToast('لباس با موفقیت به کمد افزوده شد!', 'success');
        DOM.manualForm.reset();
        await loadWardrobe();
        triggerAutoSync();
    });

    // Wardrobe Category Filters
    DOM.categoryFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-chip');
        if (!btn) return;
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        state.activeCategoryFilter = btn.getAttribute('data-filter');
        renderWardrobe(state.wardrobe);
    });

    // History Filters
    DOM.historyAllBtn.addEventListener('click', () => {
        DOM.historyAllBtn.classList.add('active');
        DOM.historyFavBtn.classList.remove('active');
        state.historyOnlyFavorites = false;
        loadHistory();
    });

    DOM.historyFavBtn.addEventListener('click', () => {
        DOM.historyFavBtn.classList.add('active');
        DOM.historyAllBtn.classList.remove('active');
        state.historyOnlyFavorites = true;
        loadHistory();
    });

    // Photo Upload Dropzone
    setupPhotoUpload();

    // Bulk Wardrobe (Multi-Photo & Multi-Text Entry)
    setupBulkWardrobe();

    // User Profile Modal
    setupProfileModal();

    // Mannequin Showcase Modal
    setupMannequinModal();

    // API Key Settings Modal
    setupApiKeyModal();

    // Cloud Sync Modal
    setupSyncModal();
}

// Global scope bindings for inline onclicks
window.deleteWardrobeItem = deleteWardrobeItem;
window.toggleOutfitFavorite = toggleOutfitFavorite;
window.toggleHistoryFavorite = toggleHistoryFavorite;
window.deleteHistoryItem = deleteHistoryItem;
window.openMannequinShowcase = openMannequinShowcase;
window.cycleMannequinAngle = cycleMannequinAngle;
window.insertBulkTemplate = insertBulkTemplate;
window.removeBulkUploadFile = removeBulkUploadFile;
window.removeBulkParsedRow = removeBulkParsedRow;
window.pushToCloud = pushToCloud;
window.pullFromCloud = pullFromCloud;
window.quickSetCategory = function(cat, label) {
    if (DOM.detectedCategory) DOM.detectedCategory.value = cat;
    if (DOM.detectedName) {
        const colorInput = DOM.detectedColor ? DOM.detectedColor.value.trim() : '';
        DOM.detectedName.value = colorInput ? `${label} ${colorInput}` : label;
    }
    showToast(`دسته‌بندی به «${cat}» تنظیم شد.`, 'info');
};

// Initial Startup
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(state.theme);
    applyLanguage(state.lang);
    setupEventListeners();
    checkApiStatus();
    loadProfile();
    loadWardrobe();
    fetchWeather('تهران');

    // Cross-Device Sync on URL parameter (?sync=...)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('sync')) {
            const incomingKey = urlParams.get('sync').trim();
            if (incomingKey) {
                setSyncKey(incomingKey);
                if (DOM.syncKeyInput) DOM.syncKeyInput.value = incomingKey;
                pullFromCloud(incomingKey, false);
            }
        }
    } catch (e) {
        console.warn('Could not parse sync URL parameter:', e);
    }
});
