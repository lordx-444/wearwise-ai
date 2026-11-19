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

const STATIC_CITIES_TABLE = [
    { name: "تهران", name_en: "Tehran", country: "ایران", admin1: "استان تهران", lat: 35.69439, lon: 51.42151, latitude: 35.69439, longitude: 51.42151 },
    { name: "مشهد", name_en: "Mashhad", country: "ایران", admin1: "خراسان رضوی", lat: 36.2970, lon: 59.6062, latitude: 36.2970, longitude: 59.6062 },
    { name: "اصفهان", name_en: "Isfahan", country: "ایران", admin1: "اصفهان", lat: 32.6546, lon: 51.6680, latitude: 32.6546, longitude: 51.6680 },
    { name: "شیراز", name_en: "Shiraz", country: "ایران", admin1: "فارس", lat: 29.5918, lon: 52.5837, latitude: 29.5918, longitude: 52.5837 },
    { name: "تبریز", name_en: "Tabriz", country: "ایران", admin1: "آذربایجان شرقی", lat: 38.0800, lon: 46.2919, latitude: 38.0800, longitude: 46.2919 },
    { name: "کرج", name_en: "Karaj", country: "ایران", admin1: "البرز", lat: 35.8327, lon: 50.9915, latitude: 35.8327, longitude: 50.9915 },
    { name: "رشت", name_en: "Rasht", country: "ایران", admin1: "گیلان", lat: 37.2808, lon: 49.5832, latitude: 37.2808, longitude: 49.5832 },
    { name: "اهواز", name_en: "Ahvaz", country: "ایران", admin1: "خوزستان", lat: 31.3183, lon: 48.6706, latitude: 31.3183, longitude: 48.6706 },
    { name: "قم", name_en: "Qom", country: "ایران", admin1: "قم", lat: 34.6401, lon: 50.8764, latitude: 34.6401, longitude: 50.8764 },
    { name: "کرمانشاه", name_en: "Kermanshah", country: "ایران", admin1: "کرمانشاه", lat: 34.3142, lon: 47.0650, latitude: 34.3142, longitude: 47.0650 },
    { name: "ارومیه", name_en: "Urmia", country: "ایران", admin1: "آذربایجان غربی", lat: 37.5527, lon: 45.0761, latitude: 37.5527, longitude: 45.0761 },
    { name: "یزد", name_en: "Yazd", country: "ایران", admin1: "یزد", lat: 31.8974, lon: 54.3569, latitude: 31.8974, longitude: 54.3569 },
    { name: "کیش", name_en: "Kish", country: "ایران", admin1: "هرمزگان", lat: 26.5578, lon: 54.0194, latitude: 26.5578, longitude: 54.0194 },
    { name: "استانبول", name_en: "Istanbul", country: "ترکیه", admin1: "استانبول", lat: 41.0082, lon: 28.9784, latitude: 41.0082, longitude: 28.9784 },
    { name: "دبی", name_en: "Dubai", country: "امارات", admin1: "دبی", lat: 25.2048, lon: 55.2708, latitude: 25.2048, longitude: 55.2708 },
    { name: "لندن", name_en: "London", country: "بریتانیا", admin1: "انگلستان", lat: 51.5074, lon: -0.1278, latitude: 51.5074, longitude: -0.1278 },
    { name: "پاریس", name_en: "Paris", country: "فرانسه", admin1: "ایل-دو-فرانس", lat: 48.8566, lon: 2.3522, latitude: 48.8566, longitude: 2.3522 }
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

function getLocalWardrobe() {
    const raw = localStorage.getItem('wearwise_wardrobe_items');
    if (!raw) {
        const seed = getInitialWardrobeSeed();
        localStorage.setItem('wearwise_wardrobe_items', JSON.stringify(seed));
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

function generateClientSideRecommendations() {
    const weather = state.weather;
    const curr = weather?.current || {};
    const temp = curr.temperature || 18;
    const isRain = weather?.day_summary?.rain_alert || (curr.precipitation || 0) > 0.2;
    const gender = state.profile?.gender || 'unisex';
    const dest = state.destination || 'محل کار / اداری';

    const wardrobeNames = state.useWardrobe ? state.wardrobe.map(w => w.name) : [];
    const isCold = temp < 14;
    const isMild = temp >= 14 && temp < 22;

    const jacketPiece = gender === 'female' ? "کاپشن یا بارانی زنانه شیک" : "کاپشن بادی مشکی";
    const coatPiece = gender === 'female' ? "پالتو فوتر یا ترنچ‌کت" : "پالتو کلاسیک پشمی";
    const midPiece = isCold ? "هودی دورس گرم" : (isMild ? "پلیور بافت سبک" : "پیراهن آستین بلند");

    const w1 = wardrobeNames.find(n => n.includes('کاپشن') || n.includes('پالتو')) || jacketPiece;
    const w2 = wardrobeNames.find(n => n.includes('شلوار')) || "شلوار کتان راسته";
    const w3 = wardrobeNames.find(n => n.includes('کتانی') || n.includes('کفش')) || "کتانی راحت";

    const outfits = [
        {
            name: `ست ۱: استایل ویژه ${dest}`,
            time_of_day: "صبح تا ظهر",
            items: [w1, w2, w3],
            from_wardrobe: [w1, w2, w3].filter(item => wardrobeNames.includes(item)),
            general_suggestions: [w1, w2, w3].filter(item => !wardrobeNames.includes(item)),
            why: `انتخابی برازنده و آراسته برای حضور در ${dest} با هماهنگی کامل با دمای ${temp} درجه سانتی‌گراد.`
        },
        {
            name: `ست ۲: لایه‌بندی منعطف ${isCold ? 'گرم زمستانه' : 'خنک پاییزی'}`,
            time_of_day: "ظهر تا عصر",
            items: [coatPiece, midPiece, "شلوار جین تیره", "نیم‌بوت چرمی"],
            from_wardrobe: [coatPiece, midPiece, "شلوار جین تیره", "نیم‌بوت چرمی"].filter(item => wardrobeNames.includes(item)),
            general_suggestions: [coatPiece, midPiece, "شلوار جین تیره", "نیم‌بوت چرمی"].filter(item => !wardrobeNames.includes(item)),
            why: "لایه‌بندی هوشمند متناسب با نوسانات دمایی روزانه و ایجاد حداکثر راحتی و زیبایی بصری."
        },
        {
            name: `ست ۳: ترکیب آزاد و مدرن شهری`,
            time_of_day: "عصر و شب",
            items: ["هودی کلاه‌دار", "شلوار اسلش شیک", "کفش اسپرت", "اکسسوری هماهنگ"],
            from_wardrobe: ["هودی کلاه‌دار", "شلوار اسلش شیک", "کفش اسپرت", "اکسسوری هماهنگ"].filter(item => wardrobeNames.includes(item)),
            general_suggestions: ["هودی کلاه‌دار", "شلوار اسلش شیک", "کفش اسپرت", "اکسسوری هماهنگ"].filter(item => !wardrobeNames.includes(item)),
            why: "استایلی با آزادی حرکت بالا و نشاط بیشتر برای استراحت یا فعالیت‌های غیررسمی عصرگاهی."
        }
    ];

    return {
        summary: `هوای امروز ${state.city} ${curr.description} با دمای حدود ${temp}°C است.`,
        reason: `طراحی شده ویژه مقصد (${dest}) و استایل ${state.style}. بر اساس دمای ${temp}°C، رطوبت ${curr.humidity}% و سرعت باد ${curr.wind_speed} km/h.`,
        umbrella: isRain,
        outfits: outfits,
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
    localStorage.setItem('wearwise_wardrobe_items', JSON.stringify(items));
    showToast('لباس با موفقیت از کمد حذف شد.', 'success');
    await loadWardrobe();
    triggerAutoSync();
}

// -------------------------------------------------------------
// AI Outfit Recommendations
// -------------------------------------------------------------
async function generateRecommendations(isAlternative = false) {
    if (!state.weather) {
        showToast('ابتدا وضعیت آب‌وهوا را دریافت کنید.', 'error');
        return;
    }

    const t = I18N[state.lang] || I18N.fa;
    showLoading(
        isAlternative ? 'در حال تولید ست‌های تازه و جدید...' : 'در حال فراخوانی هوش مصنوعی...',
        'تحلیل همزمان آب‌وهوا، مقصد، پروفایل و تنوع‌بخشی به لایه‌ها'
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
                state.currentRecommendations = data;
                renderRecommendations(data);
                showToast(isAlternative ? 'ست‌های پیشنهادی تازه با موفقیت ایجاد شدند!' : 'پیشنهادات ست لباس آماده شد!', 'success');
                return;
            }
        }
    } catch (err) {
        console.warn('Backend recommendation error, switching to client-side recommender:', err);
    }

    // Client-Side Recommender (Autonomous on GitHub Pages)
    try {
        const clientRec = generateClientSideRecommendations();
        state.currentRecommendations = clientRec;
        renderRecommendations(clientRec);
        saveLocalHistory(clientRec);
        showToast(isAlternative ? 'ست‌های پیشنهادی تازه با موفقیت ایجاد شدند!' : 'پیشنهادات ست لباس آماده شد!', 'success');
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
        const isWardrobe = (outfit.from_wardrobe || []).includes(itemName);
        const matchedW = state.wardrobe.find(w => w.name === itemName || itemName.includes(w.name));
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

        // Build Pieces Breakdown with photos
        const pieces = outfit.pieces || (outfit.items || []).map(itemName => {
            const isWardrobe = (outfit.from_wardrobe || []).includes(itemName);
            const matchedW = state.wardrobe.find(w => w.name === itemName || itemName.includes(w.name));
            return {
                name: itemName,
                is_wardrobe: isWardrobe,
                image_url: matchedW?.image_url || getGarmentFallbackImage(itemName)
            };
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
        wardrobe: currentWardrobe,
        profile: state.profile,
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

    // 1. Wardrobe Items
    if (Array.isArray(payload.wardrobe) && payload.wardrobe.length > 0) {
        state.wardrobe = payload.wardrobe;
        localStorage.setItem('wearwise_wardrobe_items', JSON.stringify(payload.wardrobe));
        renderWardrobe();
        updateWardrobeCount();
    }

    // 2. User Profile
    if (payload.profile && typeof payload.profile === 'object') {
        state.profile = { ...state.profile, ...payload.profile };
        localStorage.setItem('wearwise_profile', JSON.stringify(state.profile));
        updateProfileButtonLabel();
    }

    // 3. Settings (Theme, Lang, etc.)
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
        showToast(`✅ همگام‌سازی موفق: ${count} لباس و تنظیمات به‌روزرسانی شد.`, 'success');
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
    const syncKey = (DOM.syncKeyInput && DOM.syncKeyInput.value ? DOM.syncKeyInput.value : getSyncKey()).trim();
    if (!syncKey) {
        if (!silent) showToast('لطفاً شناسه کمد (Sync Key) را مشخص کنید.', 'error');
        return;
    }
    setSyncKey(syncKey);

    const payload = getSyncPayload();
    payload.sync_id = syncKey;

    if (!silent) {
        showLoading('در حال ارسال کمد به فضای ابری...', 'همگام‌سازی بین دستگاه‌ها');
    }

    let success = false;

    // First attempt: Backend sync endpoint (if server is up)
    if (!isStaticHost()) {
        try {
            const res = await fetch('/api/sync/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                success = true;
            }
        } catch (e) {
            console.warn('Backend push failed, falling back to public cloud storage:', e);
        }
    }

    // Second attempt (or parallel fallback): Public cloud storage for static GitHub Pages
    try {
        const storedObjectId = localStorage.getItem(`wearwise_cloud_obj_${syncKey}`);
        let kvRes;
        if (storedObjectId) {
            kvRes = await fetch(`${PUBLIC_KV_ENDPOINT}/${storedObjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `wearwise_${syncKey}`,
                    data: payload
                })
            });
        }
        if (!kvRes || !kvRes.ok) {
            kvRes = await fetch(PUBLIC_KV_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `wearwise_${syncKey}`,
                    data: payload
                })
            });
            if (kvRes.ok) {
                const kvData = await kvRes.json();
                if (kvData && kvData.id) {
                    localStorage.setItem(`wearwise_cloud_obj_${syncKey}`, kvData.id);
                }
            }
        }
        if (kvRes && kvRes.ok) {
            success = true;
        }
    } catch (e) {
        console.warn('Public cloud KV push failed:', e);
    }

    if (!silent) hideLoading();

    if (success) {
        const timeStr = new Date().toLocaleTimeString('fa-IR');
        if (DOM.syncStatusBadge) {
            DOM.syncStatusBadge.textContent = `همگام شد (${timeStr})`;
            DOM.syncStatusBadge.style.color = 'var(--accent-emerald)';
        }
        if (!silent) {
            showToast(`☁️ کمد با شناسه «${syncKey}» با موفقیت در فضای ابری ذخیره شد.`, 'success');
        }
        updateSyncQrCode();
    } else {
        if (!silent) {
            showToast('خطا در ارتباط با سرور ابری. لطفاً اتصال اینترنت خود را بررسی کنید.', 'error');
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

    // 1. Check local backend first
    if (!isStaticHost()) {
        try {
            const res = await fetch(`/api/sync/pull?sync_id=${encodeURIComponent(syncKey)}`);
            if (res.ok) {
                const json = await res.json();
                if (json && json.data && json.data.wardrobe) {
                    payload = json.data;
                }
            }
        } catch (e) {
            console.warn('Backend pull failed, checking cloud KV:', e);
        }
    }

    // 2. Check public cloud storage
    if (!payload) {
        try {
            const storedObjectId = localStorage.getItem(`wearwise_cloud_obj_${syncKey}`);
            if (storedObjectId) {
                const res = await fetch(`${PUBLIC_KV_ENDPOINT}/${storedObjectId}`);
                if (res.ok) {
                    const kvObj = await res.json();
                    if (kvObj && kvObj.data && kvObj.data.wardrobe) {
                        payload = kvObj.data;
                    }
                }
            }
            if (!payload) {
                const resAll = await fetch(PUBLIC_KV_ENDPOINT);
                if (resAll.ok) {
                    const allList = await resAll.json();
                    const targetName = `wearwise_${syncKey}`;
                    const found = allList.find(item => item.name === targetName);
                    if (found && found.data && found.data.wardrobe) {
                        payload = found.data;
                        localStorage.setItem(`wearwise_cloud_obj_${syncKey}`, found.id);
                    }
                }
            }
        } catch (e) {
            console.warn('Cloud KV pull failed:', e);
        }
    }

    if (!silent) hideLoading();

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
            showToast(`اطلاعاتی با شناسه «${syncKey}» یافت نشد. مطمئن شوید قبلاً با دکمه ارسال به فضای ابری ذخیره شده باشد.`, 'warning');
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
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    let lastError = null;

    for (const model of models) {
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
            const prompt = `شما یک متخصص مد، استایل و هوش مصنوعی بینایی هستید. این تصویر یک لباس، کفش یا اکسسوری (مانند ساعت مچی، عینک، کلاه، دستبند، کیف، شال، کمربند یا پوشاک) است.
لطفاً با دقت بالا تصویر را تحلیل کرده و خروجی را دقیقاً در قالب فرمت JSON زیر به زبان فارسی برگردانید (هیچ متن، توضیح یا مارک‌داون اضافی نفرستید):
{
  "name": "نام دقیق و شیک آیتم (مثلاً: ساعت مچی استیل یا ساعت هوشمند مشکی یا کاپشن بادی سرمه‌ای)",
  "category": "یکی از این موارد دقیق: اکسسوری, کفش, شلوار, کاپشن, پالتو, هودی, پلیور, پیراهن, تیشرت",
  "color": "رنگ اصلی آیتم (مثلاً: نقره‌ای, طلایی, مشکی, سرمه‌ای, قهوه‌ای, طوسی)",
  "season": "یکی از این موارد: چهارفصل, پاییز و زمستان, بهار و تابستان, زمستان"
}`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
                })
            });

            if (res.ok) {
                const json = await res.json();
                const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                if (parsed && parsed.name) {
                    return parsed;
                }
            } else {
                const errText = await res.text().catch(() => '');
                console.warn(`Vision model ${model} response error:`, res.status, errText);
            }
        } catch (e) {
            lastError = e;
            console.warn(`Vision model ${model} failed:`, e);
        }
    }
    throw lastError || new Error('All vision models failed');
}

async function processImageLocally(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const rawDataUrl = e.target.result;
            const img = new Image();
            img.onload = async () => {
                const maxDim = 480;
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

                // 1. Try Gemini Vision if API key is stored
                const apiKey = localStorage.getItem('wearwise_gemini_key');
                if (apiKey && apiKey.trim().length > 10) {
                    try {
                        const base64Data = compressedDataUrl.split(',')[1];
                        const geminiRes = await callGeminiVisionClientSide(apiKey.trim(), base64Data, 'image/jpeg');
                        if (geminiRes && geminiRes.name) {
                            return resolve({
                                dataUrl: compressedDataUrl,
                                name: geminiRes.name,
                                category: geminiRes.category || 'اکسسوری',
                                color: geminiRes.color || 'مشکی',
                                season: geminiRes.season || 'چهارفصل',
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
                if (fn.includes('watch') || fn.includes('clock') || fn.includes('smartwatch') || fn.includes('ساعت') || fn.includes('مچی') || fn.includes('زمان')) {
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
                } else if (fn.includes('shirt') || fn.includes('tshirt') || fn.includes('تیشرت') || fn.includes('پیراهن')) {
                    category = "پیراهن";
                    name = `پیراهن ${color}`;
                    season = "بهار و تابستان";
                } else if (fn.includes('jacket') || fn.includes('coat') || fn.includes('کاپشن') || fn.includes('پالتو') || fn.includes('بارانی') || fn.includes('پافر')) {
                    category = "کاپشن";
                    name = `کاپشن یا بارانی ${color}`;
                    season = "پاییز و زمستان";
                } else {
                    // Geometry-based fallback when filename has no descriptive words
                    if (ratio > 1.45) {
                        category = "شلوار";
                        name = `شلوار راسته ${color}`;
                        season = "چهارفصل";
                    } else if (ratio < 0.72) {
                        category = "کفش";
                        name = `کفش یا کتانی ${color}`;
                        season = "چهارفصل";
                    } else if (ratio >= 0.85 && ratio <= 1.2) {
                        // Square shaped photo is typical for watches, accessories, hats, or folded garments
                        category = "اکسسوری";
                        name = `ساعت مچی یا اکسسوری ${color}`;
                        season = "چهارفصل";
                    } else if (ratio > 1.2) {
                        category = "کاپشن";
                        name = `کاپشن ${color}`;
                        season = "پاییز و زمستان";
                    } else {
                        category = "هودی";
                        name = `هودی یا پلیور ${color}`;
                        season = "پاییز و زمستان";
                    }
                }

                resolve({
                    dataUrl: compressedDataUrl,
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
                        image_url: analyzed.dataUrl
                    }],
                    gemini_used: analyzed.gemini_used,
                    message: analyzed.gemini_used 
                        ? 'لباس توسط هوش مصنوعی بینایی Gemini با موفقیت تحلیل گردید!' 
                        : 'تصویر با موفقیت در مرورگر پردازش شد و آماده ذخیره است.'
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

                DOM.detectionBadge.textContent = result.gemini_used 
                    ? '✨ شناسایی دقیق با هوش مصنوعی بینایی Gemini'
                    : '📷 تحلیل محلی ویژگی‌های تصویر در مرورگر';
                
                DOM.detectionNote.textContent = result.gemini_used
                    ? 'هوش مصنوعی بینایی Google Gemini با دقت بالا این آیتم را تشخیص داد.'
                    : 'در صورت نیاز می‌توانید نام و دسته‌بندی بالا را پیش از ثبت در کمد ویرایش نمایید.';

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
        localStorage.setItem('wearwise_wardrobe_items', JSON.stringify(localItems));
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
            localStorage.setItem('wearwise_wardrobe_items', JSON.stringify(localItems));
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
        localStorage.setItem('wearwise_wardrobe_items', JSON.stringify(localItems));
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

    const hideDropdown = () => {
        DOM.cityDropdown.style.display = 'none';
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
            let cities = null;
            try {
                if (!isStaticHost()) {
                    const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        cities = await res.json();
                    }
                }
            } catch (_) {}

            if (!cities || cities.length === 0) {
                const qLower = query.toLowerCase();
                cities = STATIC_CITIES_TABLE.filter(c => 
                    c.name.includes(query) || 
                    c.name_en.toLowerCase().includes(qLower) || 
                    (c.country && c.country.includes(query)) ||
                    (c.admin1 && c.admin1.includes(query))
                );
            }
            renderCityDropdown(cities);
        }, 220);
    });

    function renderCityDropdown(cities) {
        if (!cities || cities.length === 0) {
            hideDropdown();
            return;
        }

        DOM.cityDropdown.innerHTML = '';
        cities.forEach((city, idx) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'city-dropdown-item';
            itemEl.setAttribute('data-idx', idx);

            itemEl.innerHTML = `
                <div class="city-main-info">
                    <span class="city-name-txt">${city.name}</span>
                    <span class="city-meta-txt">${city.name_en !== city.name ? `(${city.name_en})` : ''}</span>
                    ${city.admin1 ? `<span class="city-meta-txt">${city.admin1}</span>` : ''}
                </div>
                <span class="city-country-tag">${city.country}</span>
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
        fetchWeather(city.name, city.latitude, city.longitude);
    }

    DOM.cityInput.addEventListener('keydown', (e) => {
        const items = DOM.cityDropdown.querySelectorAll('.city-dropdown-item');
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
            localStorage.setItem('wearwise_wardrobe_items', JSON.stringify(localItems));
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
