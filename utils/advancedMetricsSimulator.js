/**
 * ============================================
 * ADVANCED METRICS SIMULATOR
 * Gelişmiş Metrik Simülatörü
 * ============================================
 * 
 * Veritabanında bulunmayan gelişmiş metrikleri
 * tutarlı bir şekilde simüle eder.
 * 
 * Seed: Ülke ID kullanılarak her ülke için
 * tutarlı değerler üretilir.
 */

class AdvancedMetricsSimulator {
  
  /**
   * Seed-based random number generator
   * Aynı ülke için her zaman aynı değeri üretir
   */
  static seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Range içinde seed-based değer üret
   */
  static getSeededValue(ulkeId, metricKey, min, max) {
    const seed = ulkeId * 1000 + this.hashString(metricKey);
    const random = this.seededRandom(seed);
    return min + random * (max - min);
  }

  /**
   * String to number hash
   */
  static hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * ==========================================
   * SIMULATED METRICS
   * ==========================================
   */

  /**
   * Regulatory Difficulty (1-100)
   * Düzenleyici Zorluk - Yüksek = Giriş zor
   */
  static getRegulatoryDifficulty(ulkeId, riskNotu, gumrukSuresi) {
    // Base from real data
    const riskScore = this.riskToScore(riskNotu);
    const customsScore = Math.min(gumrukSuresi / 30, 1);
    
    // Add some simulated variance
    const simulated = this.getSeededValue(ulkeId, 'regulatory', 0, 30);
    
    // Combine: 40% risk, 30% customs, 30% simulated
    const difficulty = (1 - riskScore) * 40 + customsScore * 30 + simulated;
    
    return {
      score: Math.round(Math.min(100, Math.max(0, difficulty))),
      level: difficulty > 70 ? 'high' : difficulty > 40 ? 'medium' : 'low',
      label: difficulty > 70 ? 'Çok Zor' : difficulty > 40 ? 'Orta' : 'Kolay',
      color: difficulty > 70 ? '#f44336' : difficulty > 40 ? '#ffc107' : '#00ff88'
    };
  }

  /**
   * Cultural Similarity (1-100)
   * Kültürel Benzerlik - Türkiye baz alınarak
   */
  static getCulturalSimilarity(ulkeId, bolgeId) {
    // Region-based base scores (Türkiye merkezli)
    const regionScores = {
      1: 60,  // Avrupa - orta benzerlik
      2: 70,  // Ortadoğu - yüksek benzerlik
      3: 40,  // Asya Pasifik - düşük
      4: 30,  // Kuzey Amerika - düşük
      5: 35,  // Güney Amerika - düşük
      6: 50,  // Afrika - orta
      7: 45   // Diğer
    };
    
    const baseScore = regionScores[bolgeId] || 50;
    const variance = this.getSeededValue(ulkeId, 'culture', -15, 15);
    const score = Math.round(Math.min(100, Math.max(0, baseScore + variance)));
    
    return {
      score,
      level: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
      label: score > 70 ? 'Yüksek Benzerlik' : score > 40 ? 'Orta' : 'Düşük Benzerlik',
      color: score > 70 ? '#00ff88' : score > 40 ? '#ffc107' : '#f44336',
      adaptation: score > 70 ? 'Minimal' : score > 40 ? 'Moderate' : 'Heavy'
    };
  }

  /**
   * Digital Adoption Rate (%)
   * Dijital Adaptasyon Oranı
   */
  static getDigitalAdoption(ulkeId, gdpPerCapita, nufus) {
    // GDP correlates with digital adoption
    const gdpFactor = Math.min((gdpPerCapita || 0) / 50000, 1) * 50;
    
    // Population size slightly negative correlation (harder to digitize large populations)
    const popFactor = Math.max(0, 30 - (nufus || 0) / 50);
    
    // Simulated variance
    const variance = this.getSeededValue(ulkeId, 'digital', -10, 20);
    
    const score = Math.round(Math.min(95, Math.max(15, gdpFactor + popFactor + variance)));
    
    return {
      score,
      level: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
      label: score > 70 ? 'Yüksek Dijitalleşme' : score > 40 ? 'Gelişen' : 'Düşük',
      color: score > 70 ? '#00ff88' : score > 40 ? '#ffc107' : '#f44336',
      marketingChannel: score > 70 ? 'Digital First' : score > 40 ? 'Omnichannel' : 'Traditional'
    };
  }

  /**
   * Logistics Distance from Turkey (km)
   * Türkiye'den Lojistik Mesafesi
   */
  static getLogisticsDistance(ulkeId, latitude, longitude) {
    // Turkey coordinates (Ankara)
    const turkeyLat = 39.9334;
    const turkeyLon = 32.8597;
    
    const lat = latitude || this.getSeededValue(ulkeId, 'lat', -60, 70);
    const lon = longitude || this.getSeededValue(ulkeId, 'lon', -180, 180);
    
    // Haversine formula approximation
    const R = 6371; // Earth radius in km
    const dLat = (lat - turkeyLat) * Math.PI / 180;
    const dLon = (lon - turkeyLon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(turkeyLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = Math.round(R * c);
    
    return {
      km: distance,
      level: distance > 8000 ? 'far' : distance > 3000 ? 'medium' : 'near',
      label: distance > 8000 ? 'Çok Uzak' : distance > 3000 ? 'Orta Mesafe' : 'Yakın',
      color: distance > 8000 ? '#f44336' : distance > 3000 ? '#ffc107' : '#00ff88',
      shippingMode: distance > 8000 ? 'Air/Sea' : distance > 3000 ? 'Sea' : 'Road/Rail',
      transitDays: distance > 8000 ? '15-30' : distance > 3000 ? '7-15' : '2-7'
    };
  }

  /**
   * Corporate Tax Rate (%)
   * Kurumlar Vergisi Oranı
   */
  static getCorporateTaxRate(ulkeId, bolgeId) {
    // Region-based base rates
    const regionRates = {
      1: 22,  // Avrupa - orta
      2: 15,  // Ortadoğu - düşük
      3: 25,  // Asya Pasifik - orta-yüksek
      4: 27,  // Kuzey Amerika - yüksek
      5: 30,  // Güney Amerika - yüksek
      6: 28,  // Afrika - yüksek
      7: 20   // Diğer
    };
    
    const baseRate = regionRates[bolgeId] || 25;
    const variance = this.getSeededValue(ulkeId, 'tax', -8, 8);
    const rate = Math.round(Math.min(40, Math.max(5, baseRate + variance)));
    
    return {
      rate,
      level: rate > 25 ? 'high' : rate > 15 ? 'medium' : 'low',
      label: rate > 25 ? 'Yüksek Vergi' : rate > 15 ? 'Orta' : 'Düşük Vergi',
      color: rate > 25 ? '#f44336' : rate > 15 ? '#ffc107' : '#00ff88',
      taxStrategy: rate > 25 ? 'Transfer Pricing Review' : rate > 15 ? 'Standard' : 'Tax Efficient'
    };
  }

  /**
   * Competition Intensity (1-100)
   * Rekabet Yoğunluğu
   */
  static getCompetitionIntensity(ulkeId, yerliUretimOrani, gdpPerCapita) {
    // High local production = high competition
    const localProdScore = (yerliUretimOrani || 0) * 0.6;
    
    // High GDP markets attract more competitors
    const gdpScore = Math.min((gdpPerCapita || 0) / 80000, 1) * 25;
    
    // Simulated variance
    const variance = this.getSeededValue(ulkeId, 'competition', 0, 20);
    
    const score = Math.round(Math.min(100, Math.max(0, localProdScore + gdpScore + variance)));
    
    return {
      score,
      level: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
      label: score > 70 ? 'Yüksek Rekabet' : score > 40 ? 'Orta' : 'Düşük Rekabet',
      color: score > 70 ? '#f44336' : score > 40 ? '#ffc107' : '#00ff88',
      strategy: score > 70 ? 'Differentiation' : score > 40 ? 'Value' : 'Market Leader'
    };
  }

  /**
   * Youth Population Ratio (%)
   * Genç Nüfus Oranı (0-35 yaş)
   */
  static getYouthRatio(ulkeId, bolgeId, gdpPerCapita) {
    // Developing countries tend to have younger populations
    const gdpFactor = Math.max(0, 60 - (gdpPerCapita || 0) / 1500);
    
    // Region-based adjustment
    const regionAdjust = {
      1: -10,  // Avrupa - yaşlı
      2: 5,    // Ortadoğu - genç
      3: 0,    // Asya Pasifik - karışık
      4: -5,   // Kuzey Amerika - orta
      5: 10,   // Güney Amerika - genç
      6: 15,   // Afrika - çok genç
      7: 0
    };
    
    const variance = this.getSeededValue(ulkeId, 'youth', -5, 10);
    const ratio = Math.round(Math.min(70, Math.max(20, 40 + gdpFactor + (regionAdjust[bolgeId] || 0) + variance)));
    
    return {
      ratio,
      level: ratio > 50 ? 'young' : ratio > 35 ? 'balanced' : 'aging',
      label: ratio > 50 ? 'Genç Nüfus' : ratio > 35 ? 'Dengeli' : 'Yaşlanan Nüfus',
      color: ratio > 50 ? '#00ff88' : ratio > 35 ? '#4cc9f0' : '#ffc107',
      marketingApproach: ratio > 50 ? 'Digital/Social' : ratio > 35 ? 'Mixed' : 'Traditional'
    };
  }

  /**
   * Ease of Doing Business Score (1-100)
   * İş Yapma Kolaylığı Skoru
   */
  static getEaseOfBusiness(ulkeId, riskNotu, lpiScore, gumrukSuresi) {
    const riskScore = this.riskToScore(riskNotu) * 100;
    const lpiNorm = ((lpiScore || 2.5) / 5) * 100;
    const customsNorm = Math.max(0, 100 - (gumrukSuresi || 15) * 3);
    
    const variance = this.getSeededValue(ulkeId, 'eob', -10, 10);
    const score = Math.round(Math.min(100, Math.max(0, (riskScore * 0.4 + lpiNorm * 0.3 + customsNorm * 0.3) + variance)));
    
    return {
      score,
      level: score > 70 ? 'easy' : score > 40 ? 'moderate' : 'difficult',
      label: score > 70 ? 'Kolay' : score > 40 ? 'Orta' : 'Zor',
      color: score > 70 ? '#00ff88' : score > 40 ? '#ffc107' : '#f44336',
      timeline: score > 70 ? 'Fast (1-3 months)' : score > 40 ? 'Medium (3-6 months)' : 'Slow (6-12 months)'
    };
  }

  /**
   * Risk score helper
   */
  static riskToScore(riskNotu) {
    const riskScores = {
      'AAA': 1.0, 'AA+': 0.95, 'AA': 0.90, 'AA-': 0.85,
      'A+': 0.80, 'A': 0.75, 'A-': 0.70,
      'BBB+': 0.65, 'BBB': 0.60, 'BBB-': 0.55,
      'BB+': 0.50, 'BB': 0.45, 'BB-': 0.40,
      'B+': 0.35, 'B': 0.30, 'B-': 0.25,
      'CCC': 0.20, 'CC': 0.15, 'C': 0.10, 'D': 0.05
    };
    return riskScores[riskNotu] || 0.5;
  }

  /**
   * ==========================================
   * MASTER: Get All Advanced Metrics
   * ==========================================
   */
  static getAllAdvancedMetrics(countryData) {
    const {
      ulke_id,
      bolge_id,
      risk_notu_kodu,
      gumruk_bekleme_suresi_gun,
      gsyh_kisi_basi_usd,
      nufus_milyon,
      latitude,
      longitude,
      yerli_uretim_karsilama_orani_yuzde,
      lpi_skoru
    } = countryData;

    return {
      regulatory: this.getRegulatoryDifficulty(ulke_id, risk_notu_kodu, gumruk_bekleme_suresi_gun),
      cultural: this.getCulturalSimilarity(ulke_id, bolge_id),
      digital: this.getDigitalAdoption(ulke_id, gsyh_kisi_basi_usd, nufus_milyon),
      distance: this.getLogisticsDistance(ulke_id, latitude, longitude),
      tax: this.getCorporateTaxRate(ulke_id, bolge_id),
      competition: this.getCompetitionIntensity(ulke_id, yerli_uretim_karsilama_orani_yuzde, gsyh_kisi_basi_usd),
      youth: this.getYouthRatio(ulke_id, bolge_id, gsyh_kisi_basi_usd),
      easeOfBusiness: this.getEaseOfBusiness(ulke_id, risk_notu_kodu, lpi_skoru, gumruk_bekleme_suresi_gun)
    };
  }

  /**
   * ==========================================
   * ENHANCED 7 STRATEGIC DECISIONS
   * ==========================================
   */
  static getEnhancedStrategicDecisions(countryData, advancedMetrics) {
    const decisions = [];

    // 1. Entry Mode
    const regulatory = advancedMetrics.regulatory.score;
    const distance = advancedMetrics.distance.km;
    const growth = parseFloat(countryData.sektorel_buyume_orani_yuzde) || 0;
    
    let entryMode;
    if (regulatory > 60 && distance > 5000) {
      entryMode = {
        decision: 'Distribütörlük / Franchising',
        reasoning: 'Yüksek düzenleyici zorluk ve mesafe, yerel ortak gerektirir.',
        risk: 'medium',
        icon: '🤝'
      };
    } else if (regulatory < 40 && growth > 5) {
      entryMode = {
        decision: 'Doğrudan Yatırım (FDI)',
        reasoning: 'Düşük bariyer ve yüksek büyüme, doğrudan girişi destekler.',
        risk: 'low',
        icon: '🏭'
      };
    } else {
      entryMode = {
        decision: 'Joint Venture',
        reasoning: 'Risk paylaşımı için yerel ortakla ortak girişim.',
        risk: 'medium',
        icon: '🤲'
      };
    }
    decisions.push({ id: 1, title: 'Giriş Modu', ...entryMode });

    // 2. Pricing Strategy
    const gdpPerCapita = parseFloat(countryData.gsyh_kisi_basi_usd) || 0;
    const competition = advancedMetrics.competition.score;
    
    let pricing;
    if (gdpPerCapita > 40000 && competition < 50) {
      pricing = {
        decision: 'Skimming (Premium)',
        reasoning: 'Yüksek gelir ve düşük rekabet premium fiyatı destekler.',
        multiplier: '1.5x',
        icon: '💎'
      };
    } else if (competition > 70) {
      pricing = {
        decision: 'Penetrasyon (Düşük)',
        reasoning: 'Yüksek rekabet, agresif fiyatla pazar payı gerektirir.',
        multiplier: '0.8x',
        icon: '📉'
      };
    } else {
      pricing = {
        decision: 'Değer Bazlı',
        reasoning: 'Kalite/fiyat dengesi ile orta segment hedeflenir.',
        multiplier: '1.0x',
        icon: '⚖️'
      };
    }
    decisions.push({ id: 2, title: 'Fiyatlandırma Stratejisi', ...pricing });

    // 3. Logistics Channel
    const lpi = parseFloat(countryData.lpi_skoru) || 2.5;
    const distanceKm = advancedMetrics.distance.km;
    
    let logistics;
    if (lpi < 3.0) {
      logistics = {
        decision: 'Hava Kargo (Liman Gecikmelerinden Kaçın)',
        reasoning: 'Düşük LPI skoru, deniz/kara güvenilir değil.',
        transitTime: '3-7 gün',
        icon: '✈️'
      };
    } else if (distanceKm < 3000) {
      logistics = {
        decision: 'Kara/Demiryolu',
        reasoning: 'Yakın mesafe ve iyi altyapı, kara taşımacılığı optimal.',
        transitTime: '5-10 gün',
        icon: '🚛'
      };
    } else {
      logistics = {
        decision: 'Deniz/Demiryolu Intermodal',
        reasoning: 'Yüksek LPI ve uzun mesafe için maliyet-etkin çözüm.',
        transitTime: '15-25 gün',
        icon: '🚢'
      };
    }
    decisions.push({ id: 3, title: 'Lojistik Kanalı', ...logistics });

    // 4. Marketing Focus
    const youth = advancedMetrics.youth.ratio;
    const digital = advancedMetrics.digital.score;
    
    let marketing;
    if (youth > 50 && digital > 60) {
      marketing = {
        decision: 'Dijital/Sosyal Medya',
        reasoning: 'Genç ve dijital nüfus online kanallara yanıt verir.',
        channels: ['Instagram', 'TikTok', 'YouTube'],
        icon: '📱'
      };
    } else if (youth < 35) {
      marketing = {
        decision: 'Geleneksel Medya',
        reasoning: 'Yaşlanan nüfus TV ve basılı medyaya güvenir.',
        channels: ['TV', 'Gazete', 'Radyo'],
        icon: '📺'
      };
    } else {
      marketing = {
        decision: 'Omnichannel',
        reasoning: 'Karışık demografik, çok kanallı yaklaşım gerektirir.',
        channels: ['Digital', 'TV', 'OOH'],
        icon: '🎯'
      };
    }
    decisions.push({ id: 4, title: 'Pazarlama Odağı', ...marketing });

    // 5. Product Adaptation
    const cultural = advancedMetrics.cultural.score;
    
    let product;
    if (cultural < 40) {
      product = {
        decision: 'Ağır Lokalizasyon',
        reasoning: 'Düşük kültürel benzerlik, kapsamlı adaptasyon gerektirir.',
        adaptations: ['Ambalaj', 'Formülasyon', 'Marka Adı'],
        icon: '🔧'
      };
    } else if (cultural > 70) {
      product = {
        decision: 'Standart Global Ürün',
        reasoning: 'Yüksek kültürel benzerlik, minimal değişiklik yeterli.',
        adaptations: ['Dil'],
        icon: '🌐'
      };
    } else {
      product = {
        decision: 'Orta Düzey Adaptasyon',
        reasoning: 'Orta benzerlik, seçici lokalizasyon önerilir.',
        adaptations: ['Ambalaj', 'Dil'],
        icon: '🎨'
      };
    }
    decisions.push({ id: 5, title: 'Ürün Adaptasyonu', ...product });

    // 6. Financial Risk Strategy
    const inflation = parseFloat(countryData.enflasyon_orani_yuzde) || 0;
    const riskNotu = countryData.risk_notu_kodu;
    
    let financial;
    if (inflation > 10 || ['CCC', 'CC', 'C', 'D'].includes(riskNotu)) {
      financial = {
        decision: 'Hedging / Ön Ödeme',
        reasoning: 'Yüksek enflasyon/risk, para birimi koruması şart.',
        terms: 'LC at Sight / Prepayment',
        icon: '🛡️'
      };
    } else if (inflation < 5 && this.riskToScore(riskNotu) > 0.6) {
      financial = {
        decision: 'Açık Hesap',
        reasoning: 'Stabil ekonomi, standart ticari koşullar uygun.',
        terms: 'Net 60-90',
        icon: '✅'
      };
    } else {
      financial = {
        decision: 'Akreditif',
        reasoning: 'Orta risk seviyesi, banka garantisi önerilir.',
        terms: 'LC 30-60 days',
        icon: '🏦'
      };
    }
    decisions.push({ id: 6, title: 'Finansal Risk Stratejisi', ...financial });

    // 7. Timeline
    const easeOfBusiness = advancedMetrics.easeOfBusiness.score;
    const customsDays = parseInt(countryData.gumruk_bekleme_suresi_gun) || 10;
    
    let timeline;
    if (easeOfBusiness < 40 || customsDays > 15) {
      timeline = {
        decision: '6+ Ay Önceden Başla',
        reasoning: 'Yüksek bürokrasi, uzun hazırlık süresi gerektirir.',
        phases: ['Araştırma (2ay)', 'Yasal (2ay)', 'Kurulum (2ay)'],
        icon: '📅'
      };
    } else if (easeOfBusiness > 70) {
      timeline = {
        decision: 'Hızlı Lansman (1-2 Ay)',
        reasoning: 'Kolay iş ortamı, hızlı pazara giriş mümkün.',
        phases: ['Hazırlık (2hafta)', 'Lansman (2hafta)'],
        icon: '⚡'
      };
    } else {
      timeline = {
        decision: 'Standart Süreç (3-4 Ay)',
        reasoning: 'Normal iş ortamı, standart hazırlık süresi.',
        phases: ['Araştırma (1ay)', 'Kurulum (2ay)', 'Lansman (1ay)'],
        icon: '📆'
      };
    }
    decisions.push({ id: 7, title: 'Zaman Çizelgesi', ...timeline });

    return decisions;
  }
}

module.exports = AdvancedMetricsSimulator;

