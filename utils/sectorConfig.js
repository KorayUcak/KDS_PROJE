/**
 * ============================================
 * SECTOR CONFIGURATION
 * Sektör Bazlı Algoritma Ağırlıkları
 * ============================================
 * 
 * Her sektör için farklı skorlama mantığı.
 * Örnek: Mobilya için maliyet önemli, Gıda için hız önemli.
 */

// Sektör Arketipleri
const SECTOR_ARCHETYPES = {
  // Zaman Hassas Ürünler - Hız > Maliyet
  TIME_SENSITIVE: {
    name: 'Zaman Hassas',
    icon: '⚡',
    description: 'Lojistik hızı ve gümrük verimliliği maliyet önünde önceliklidir.',
    weights: {
      logistics: 35,      // LPI + Gümrük süresi (YÜKSELTİLDİ)
      cost: 10,           // Konteyner maliyeti (DÜŞÜRÜLDÜ)
      market: 25,         // Pazar potansiyeli
      economy: 15,        // Ekonomik stabilite
      growth: 15          // Sektörel büyüme
    },
    priorityFactors: ['gumruk_bekleme_suresi_gun', 'lpi_skoru'],
    ignoredFactors: ['konteyner_maliyeti'],
    insight: 'Sistem artık **Lojistik Hızı** ve **Gümrük Verimliliği** öncelikli hesaplıyor. Maliyet ikinci planda.'
  },

  // Yüksek Hacimli/Ağır Ürünler - Maliyet > Hız
  HEAVY_GOODS: {
    name: 'Ağır/Hacimli',
    icon: '📦',
    description: 'Nakliye maliyeti kritik, bekleme süresi tolere edilebilir.',
    weights: {
      logistics: 15,      // LPI (DÜŞÜRÜLDÜ)
      cost: 35,           // Konteyner maliyeti (YÜKSELTİLDİ)
      market: 25,         // Pazar potansiyeli
      economy: 10,        // Ekonomik stabilite
      growth: 15          // Sektörel büyüme
    },
    priorityFactors: ['konteyner_maliyeti', 'sektorel_ithalat'],
    ignoredFactors: ['gumruk_bekleme_suresi_gun'],
    insight: 'Sistem artık **Nakliye Maliyeti** öncelikli hesaplıyor. Gümrük bekleme süresi tolere edilebilir.'
  },

  // Yüksek Değerli/Teknoloji - Risk + Satın Alma Gücü
  HIGH_VALUE: {
    name: 'Yüksek Değer',
    icon: '💎',
    description: 'IP koruması ve yüksek satın alma gücü kritik faktörler.',
    weights: {
      logistics: 15,      // LPI
      cost: 10,           // Konteyner maliyeti (DÜŞÜRÜLDÜ)
      market: 25,         // Pazar potansiyeli
      economy: 30,        // Ekonomik stabilite + Risk (YÜKSELTİLDİ)
      growth: 20          // Sektörel büyüme
    },
    priorityFactors: ['risk_notu_kodu', 'gsyh_kisi_basi_usd'],
    ignoredFactors: ['konteyner_maliyeti'],
    insight: 'Sistem artık **Ülke Riski** ve **Satın Alma Gücü** öncelikli hesaplıyor. Premium pazarlar öne çıkıyor.'
  },

  // Emtia/Hammadde - Hacim + Maliyet
  COMMODITY: {
    name: 'Emtia/Hammadde',
    icon: '🏭',
    description: 'Yüksek hacim, düşük marj. Maliyet optimizasyonu şart.',
    weights: {
      logistics: 20,      // LPI
      cost: 30,           // Konteyner maliyeti (YÜKSELTİLDİ)
      market: 30,         // Pazar hacmi (YÜKSELTİLDİ)
      economy: 10,        // Ekonomik stabilite
      growth: 10          // Sektörel büyüme
    },
    priorityFactors: ['sektorel_ithalat', 'konteyner_maliyeti', 'nufus_milyon'],
    ignoredFactors: [],
    insight: 'Sistem artık **Pazar Hacmi** ve **Maliyet Optimizasyonu** öncelikli hesaplıyor. Ölçek ekonomisi kritik.'
  },

  // Standart/Dengeli
  BALANCED: {
    name: 'Dengeli',
    icon: '⚖️',
    description: 'Tüm faktörler dengeli ağırlıkta değerlendiriliyor.',
    weights: {
      logistics: 25,
      cost: 20,
      market: 25,
      economy: 15,
      growth: 15
    },
    priorityFactors: [],
    ignoredFactors: [],
    insight: 'Sistem **dengeli mod**da çalışıyor. Tüm faktörler eşit ağırlıkta.'
  }
};

// Sektör ID -> Arketip Eşleştirmesi
// Bu değerler veritabanındaki sektör ID'lerine göre ayarlanmalı
const SECTOR_TO_ARCHETYPE = {
  // Zaman Hassas (Food, Fashion, Perishables)
  1: 'TIME_SENSITIVE',   // Gıda
  2: 'TIME_SENSITIVE',   // Tekstil/Moda
  3: 'TIME_SENSITIVE',   // Taze Ürünler
  
  // Ağır/Hacimli (Furniture, Metals, Construction)
  4: 'HEAVY_GOODS',      // Mobilya
  5: 'HEAVY_GOODS',      // Metal Ürünler
  6: 'HEAVY_GOODS',      // İnşaat Malzemeleri
  7: 'HEAVY_GOODS',      // Seramik/Cam
  
  // Yüksek Değer (Tech, Pharma, Luxury)
  8: 'HIGH_VALUE',       // Elektronik
  9: 'HIGH_VALUE',       // İlaç/Medikal
  10: 'HIGH_VALUE',      // Otomotiv
  11: 'HIGH_VALUE',      // Makine
  
  // Emtia/Hammadde
  12: 'COMMODITY',       // Kimyasal
  13: 'COMMODITY',       // Plastik
  14: 'COMMODITY',       // Tarım Ürünleri
  
  // Diğer - Dengeli
  default: 'BALANCED'
};

// Sektör adına göre arketip bul
const SECTOR_NAME_TO_ARCHETYPE = {
  // Türkçe sektör adları
  'gıda': 'TIME_SENSITIVE',
  'gida': 'TIME_SENSITIVE',
  'tekstil': 'TIME_SENSITIVE',
  'moda': 'TIME_SENSITIVE',
  'hazır giyim': 'TIME_SENSITIVE',
  'taze': 'TIME_SENSITIVE',
  
  'mobilya': 'HEAVY_GOODS',
  'metal': 'HEAVY_GOODS',
  'çelik': 'HEAVY_GOODS',
  'inşaat': 'HEAVY_GOODS',
  'seramik': 'HEAVY_GOODS',
  'cam': 'HEAVY_GOODS',
  'mermer': 'HEAVY_GOODS',
  
  'elektronik': 'HIGH_VALUE',
  'ilaç': 'HIGH_VALUE',
  'medikal': 'HIGH_VALUE',
  'otomotiv': 'HIGH_VALUE',
  'makine': 'HIGH_VALUE',
  'teknoloji': 'HIGH_VALUE',
  
  'kimya': 'COMMODITY',
  'kimyasal': 'COMMODITY',
  'plastik': 'COMMODITY',
  'tarım': 'COMMODITY',
  'hammadde': 'COMMODITY'
};

/**
 * Sektör ID veya adına göre arketip döndür
 */
function getSectorArchetype(sectorIdOrName) {
  // Sayı ise ID olarak ara
  if (typeof sectorIdOrName === 'number') {
    const archetypeKey = SECTOR_TO_ARCHETYPE[sectorIdOrName] || SECTOR_TO_ARCHETYPE.default;
    return SECTOR_ARCHETYPES[archetypeKey];
  }
  
  // String ise isim olarak ara
  if (typeof sectorIdOrName === 'string') {
    const lowerName = sectorIdOrName.toLowerCase();
    
    // Tam eşleşme
    for (const [keyword, archetypeKey] of Object.entries(SECTOR_NAME_TO_ARCHETYPE)) {
      if (lowerName.includes(keyword)) {
        return SECTOR_ARCHETYPES[archetypeKey];
      }
    }
  }
  
  // Varsayılan: Dengeli
  return SECTOR_ARCHETYPES.BALANCED;
}

/**
 * Sektör için ağırlıkları döndür
 */
function getSectorWeights(sectorIdOrName) {
  const archetype = getSectorArchetype(sectorIdOrName);
  return archetype.weights;
}

/**
 * Sektör için insight mesajı döndür
 */
function getSectorInsight(sectorIdOrName) {
  const archetype = getSectorArchetype(sectorIdOrName);
  return {
    name: archetype.name,
    icon: archetype.icon,
    description: archetype.description,
    insight: archetype.insight,
    priorityFactors: archetype.priorityFactors,
    ignoredFactors: archetype.ignoredFactors
  };
}

/**
 * Tüm arketipleri döndür (UI dropdown için)
 */
function getAllArchetypes() {
  return Object.entries(SECTOR_ARCHETYPES).map(([key, value]) => ({
    key,
    ...value
  }));
}

module.exports = {
  SECTOR_ARCHETYPES,
  SECTOR_TO_ARCHETYPE,
  SECTOR_NAME_TO_ARCHETYPE,
  getSectorArchetype,
  getSectorWeights,
  getSectorInsight,
  getAllArchetypes
};

