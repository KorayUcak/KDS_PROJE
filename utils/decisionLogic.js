/**
 * ============================================
 * DECISION LOGIC ENGINE
 * Karar Destek Sistemi - Akıllı Öneri Motoru
 * ============================================
 * 
 * Bu modül ham verileri yorumlar ve yöneticilere
 * net, eyleme dönüştürülebilir kararlar sunar.
 */

class DecisionLogic {
  
  /**
   * ==========================================
   * DECISION 1: Market Entry Strategy (Go/No-Go)
   * ==========================================
   * Question: "Is this market viable?"
   * Input: risk_notu_kodu + yerli_uretim_karsilama_orani
   */
  static getMarketEntryDecision(riskNotu, yerliUretimOrani) {
    const risk = this.getRiskScore(riskNotu);
    const localProd = parseFloat(yerliUretimOrani) || 0;
    
    // High Risk & High Local Production
    if (risk < 0.5 && localProd > 70) {
      return {
        verdict: 'NO-GO',
        status: 'danger',
        icon: '🔴',
        title: 'Pazara Girme',
        subtitle: 'Yüksek Bariyerler',
        explanation: `Yüksek risk (${riskNotu}) ve %${localProd.toFixed(0)} yerli üretim ile bu pazar zorlu giriş koşulları sunuyor.`,
        action: 'Bu pazarı şu an için atlayın. Alternatif pazarları değerlendirin.',
        confidence: 85
      };
    }
    
    // Low Risk & Low Local Production = Blue Ocean
    if (risk >= 0.6 && localProd < 40) {
      return {
        verdict: 'GO',
        status: 'success',
        icon: '🟢',
        title: 'Pazara Gir',
        subtitle: 'Mavi Okyanus Fırsatı',
        explanation: `Düşük risk (${riskNotu}) ve sadece %${localProd.toFixed(0)} yerli üretim - açık bir pazar fırsatı!`,
        action: 'Hızlı giriş stratejisi uygulayın. İlk hamle avantajını yakalayın.',
        confidence: 90
      };
    }
    
    // Low Risk but High Local Production = Competitive
    if (risk >= 0.6 && localProd >= 40) {
      return {
        verdict: 'CAUTION',
        status: 'warning',
        icon: '🟡',
        title: 'Dikkatli İlerle',
        subtitle: 'Rekabetçi Pazar',
        explanation: `Risk düşük (${riskNotu}) ama %${localProd.toFixed(0)} yerli üretim rekabet demek.`,
        action: 'Niş segment stratejisi veya fiyat liderliği ile giriş düşünün.',
        confidence: 70
      };
    }
    
    // Mixed signals
    return {
      verdict: 'ANALYZE',
      status: 'neutral',
      icon: '🔵',
      title: 'Detaylı Analiz Gerekli',
      subtitle: 'Karışık Sinyaller',
      explanation: `Risk: ${riskNotu}, Yerli Üretim: %${localProd.toFixed(0)} - Daha fazla veri gerekli.`,
      action: 'Pilot proje veya sınırlı test lansmanı düşünün.',
      confidence: 50
    };
  }

  /**
   * ==========================================
   * DECISION 2: Pricing Strategy
   * ==========================================
   * Question: "How should we price our product?"
   * Input: gsyh_kisi_basi_usd (GDP per Capita)
   */
  static getPricingDecision(gdpPerCapita) {
    const gdp = parseFloat(gdpPerCapita) || 0;
    
    if (gdp >= 50000) {
      return {
        verdict: 'PREMIUM',
        status: 'success',
        icon: '💎',
        title: 'Premium Fiyatlandırma',
        subtitle: 'Yüksek Ödeme Gücü',
        explanation: `$${gdp.toLocaleString()} kişi başı GSYİH ile bu pazar yüksek kalite ürünlere ödeme yapabilir.`,
        action: 'Marka değerine odaklanın. Kalite ve prestij vurgulayın.',
        priceMultiplier: 1.5,
        confidence: 88
      };
    }
    
    if (gdp >= 25000) {
      return {
        verdict: 'VALUE',
        status: 'success',
        icon: '⭐',
        title: 'Değer Odaklı Fiyatlandırma',
        subtitle: 'Orta-Üst Segment',
        explanation: `$${gdp.toLocaleString()} kişi başı GSYİH kalite/fiyat dengesi arayan bir pazarı gösteriyor.`,
        action: 'Kalite vurgulayın ama rekabetçi fiyat sunun.',
        priceMultiplier: 1.2,
        confidence: 80
      };
    }
    
    if (gdp >= 10000) {
      return {
        verdict: 'COMPETITIVE',
        status: 'warning',
        icon: '🏷️',
        title: 'Rekabetçi Fiyatlandırma',
        subtitle: 'Fiyat Hassasiyeti',
        explanation: `$${gdp.toLocaleString()} kişi başı GSYİH - tüketiciler fiyat karşılaştırması yapıyor.`,
        action: 'Maliyet liderliği stratejisi. Hacim odaklı düşünün.',
        priceMultiplier: 1.0,
        confidence: 75
      };
    }
    
    return {
      verdict: 'PENETRATION',
      status: 'neutral',
      icon: '📉',
      title: 'Penetrasyon Fiyatlandırma',
      subtitle: 'Hacim Odaklı',
      explanation: `$${gdp.toLocaleString()} kişi başı GSYİH - düşük marjlı, yüksek hacimli strateji gerekli.`,
      action: 'Düşük giriş fiyatı ile pazar payı yakalayın. Ölçek ekonomisi kritik.',
      priceMultiplier: 0.7,
      confidence: 70
    };
  }

  /**
   * ==========================================
   * DECISION 3: Logistics Mode Recommendation
   * ==========================================
   * Question: "How do we ship?"
   * Input: lpi_skoru + gumruk_bekleme_suresi
   */
  static getLogisticsDecision(lpiScore, customsDays) {
    const lpi = parseFloat(lpiScore) || 0;
    const customs = parseInt(customsDays) || 30;
    
    // High LPI, Fast Customs = JIT possible
    if (lpi >= 3.5 && customs <= 5) {
      return {
        verdict: 'JIT',
        status: 'success',
        icon: '🚛',
        title: 'Just-in-Time Lojistik',
        subtitle: 'Standart Kara/Deniz Yolu',
        explanation: `LPI: ${lpi.toFixed(2)}, Gümrük: ${customs} gün - mükemmel altyapı, stok maliyetlerini minimize edin.`,
        action: 'Düşük stok seviyesi ile çalışın. Haftalık sipariş döngüsü uygulayın.',
        recommendedMode: 'Deniz + Kara',
        bufferStock: 'Düşük (2 haftalık)',
        confidence: 92
      };
    }
    
    // Good LPI, Moderate Customs
    if (lpi >= 3.0 && customs <= 10) {
      return {
        verdict: 'STANDARD',
        status: 'success',
        icon: '🚢',
        title: 'Standart Lojistik',
        subtitle: 'Dengeli Yaklaşım',
        explanation: `LPI: ${lpi.toFixed(2)}, Gümrük: ${customs} gün - güvenilir ama biraz tampon gerekli.`,
        action: '3-4 haftalık emniyet stoğu tutun. Aylık sipariş planlaması.',
        recommendedMode: 'Deniz Yolu',
        bufferStock: 'Orta (4 haftalık)',
        confidence: 80
      };
    }
    
    // Low LPI or Slow Customs = Buffer needed
    if (lpi < 3.0 || customs > 10) {
      return {
        verdict: 'BUFFER',
        status: 'warning',
        icon: '✈️',
        title: 'Tampon Stok Modeli',
        subtitle: 'Kritik Ürünler İçin Hava Yolu',
        explanation: `LPI: ${lpi.toFixed(2)}, Gümrük: ${customs} gün - belirsizlik yüksek, stok tutun.`,
        action: 'Yüksek emniyet stoğu. Kritik ürünleri hava yolu ile gönderin.',
        recommendedMode: 'Hava + Deniz (Hibrit)',
        bufferStock: 'Yüksek (6-8 haftalık)',
        confidence: 75
      };
    }
    
    return {
      verdict: 'EVALUATE',
      status: 'neutral',
      icon: '📦',
      title: 'Özel Değerlendirme',
      subtitle: 'Karma Strateji',
      explanation: 'Lojistik koşulları değişken - ürün bazında karar verin.',
      action: 'Her ürün kategorisi için ayrı lojistik planı oluşturun.',
      recommendedMode: 'Ürüne Göre Değişir',
      bufferStock: 'Değişken',
      confidence: 60
    };
  }

  /**
   * ==========================================
   * DECISION 4: Financial Hedging
   * ==========================================
   * Question: "Is our money safe?"
   * Input: enflasyon_orani_yuzde
   */
  static getFinancialDecision(inflationRate) {
    const inflation = parseFloat(inflationRate) || 0;
    
    if (inflation > 15) {
      return {
        verdict: 'HARD_CURRENCY',
        status: 'danger',
        icon: '🛡️',
        title: 'Döviz Koruması Şart',
        subtitle: 'Sadece Sert Para Birimi',
        explanation: `%${inflation.toFixed(1)} enflasyon - yerel para değer kaybediyor. USD/EUR ile çalışın.`,
        action: 'TÜM sözleşmeleri USD veya EUR olarak yapın. Yerel para riski almayın.',
        currencyRecommendation: 'USD/EUR Only',
        hedgingRequired: true,
        confidence: 95
      };
    }
    
    if (inflation > 10) {
      return {
        verdict: 'PARTIAL_HEDGE',
        status: 'warning',
        icon: '⚠️',
        title: 'Kısmi Koruma',
        subtitle: 'Döviz Kuru Riski',
        explanation: `%${inflation.toFixed(1)} enflasyon - orta düzey risk. Büyük işlemleri koruma altına alın.`,
        action: 'Büyük sözleşmeleri dövizle, küçük işlemleri yerel para ile yapabilirsiniz.',
        currencyRecommendation: 'Mixed (70% Hard Currency)',
        hedgingRequired: true,
        confidence: 80
      };
    }
    
    if (inflation > 5) {
      return {
        verdict: 'MONITOR',
        status: 'warning',
        icon: '👁️',
        title: 'İzle ve Değerlendir',
        subtitle: 'Dikkatli Olun',
        explanation: `%${inflation.toFixed(1)} enflasyon - kabul edilebilir ama takip edin.`,
        action: 'Yerel para kabul edilebilir ama enflasyon trendini izleyin.',
        currencyRecommendation: 'Local Acceptable',
        hedgingRequired: false,
        confidence: 70
      };
    }
    
    return {
      verdict: 'STANDARD',
      status: 'success',
      icon: '✅',
      title: 'Standart Koşullar',
      subtitle: 'Yerel Para Kabul',
      explanation: `%${inflation.toFixed(1)} enflasyon - stabil ekonomi. Yerel para güvenle kullanılabilir.`,
      action: 'Yerel para birimi ile çalışabilirsiniz. Normal ticari şartlar.',
      currencyRecommendation: 'Local Currency OK',
      hedgingRequired: false,
      confidence: 90
    };
  }

  /**
   * ==========================================
   * DECISION 5: Marketing Focus
   * ==========================================
   * Question: "Who is the audience?"
   * Input: nufus_milyon + sektorel_buyume
   */
  static getMarketingDecision(population, sectorGrowth) {
    const pop = parseFloat(population) || 0;
    const growth = parseFloat(sectorGrowth) || 0;
    
    // High Growth Market
    if (growth > 5) {
      return {
        verdict: 'AWARENESS',
        status: 'success',
        icon: '🚀',
        title: 'Marka Bilinirliği',
        subtitle: 'Yeni Trend Pazarı',
        explanation: `%${growth.toFixed(1)} sektörel büyüme - yeni müşteriler akın ediyor, marka oluşturun.`,
        action: 'Dijital pazarlama ve sosyal medyaya yoğunlaşın. İlk akılda kalan marka olun.',
        campaignFocus: 'Brand Awareness',
        channelPriority: ['Digital', 'Social Media', 'Influencer'],
        confidence: 85
      };
    }
    
    // Large but Mature Market
    if (pop > 50 && growth <= 5 && growth > 0) {
      return {
        verdict: 'LOYALTY',
        status: 'warning',
        icon: '🤝',
        title: 'Sadakat & Geçiş',
        subtitle: 'Olgun Pazar',
        explanation: `${pop.toFixed(0)}M nüfus, %${growth.toFixed(1)} büyüme - mevcut müşteriler için savaşın.`,
        action: 'Rakiplerden müşteri çekin. Sadakat programları ve karşılaştırmalı reklamlar.',
        campaignFocus: 'Competitor Switch',
        channelPriority: ['Traditional', 'Loyalty Programs', 'Promotions'],
        confidence: 75
      };
    }
    
    // Small Growing Market
    if (pop <= 50 && growth > 3) {
      return {
        verdict: 'NICHE',
        status: 'success',
        icon: '🎯',
        title: 'Niş Odak',
        subtitle: 'Hedefli Pazarlama',
        explanation: `${pop.toFixed(0)}M nüfus, %${growth.toFixed(1)} büyüme - küçük ama büyüyen pazar.`,
        action: 'Hedefli dijital kampanyalar. Premium segment odağı.',
        campaignFocus: 'Targeted Niche',
        channelPriority: ['Targeted Digital', 'B2B', 'Premium Channels'],
        confidence: 80
      };
    }
    
    // Declining or Stagnant
    return {
      verdict: 'RETENTION',
      status: 'neutral',
      icon: '🔒',
      title: 'Müşteri Koruma',
      subtitle: 'Durgun Pazar',
      explanation: `Sınırlı büyüme (%${growth.toFixed(1)}) - mevcut müşterileri kaybetmeyin.`,
      action: 'Mevcut müşteri tabanını koruyun. Maliyet optimizasyonu yapın.',
      campaignFocus: 'Customer Retention',
      channelPriority: ['CRM', 'Email', 'Service Quality'],
      confidence: 65
    };
  }

  /**
   * ==========================================
   * DECISION 6: Trade Barrier Check
   * ==========================================
   * Question: "Do we have a bureaucratic advantage?"
   * Input: anlasma_sayisi (trade agreement count)
   */
  static getTradeBarrierDecision(agreementCount, agreements = []) {
    const count = parseInt(agreementCount) || 0;
    
    if (count >= 3) {
      return {
        verdict: 'FAST_LANE',
        status: 'success',
        icon: '📄',
        title: 'Hızlı Koridor',
        subtitle: 'Çoklu Ticaret Anlaşması',
        explanation: `${count} aktif ticaret anlaşması - güçlü diplomatik bağlar ve düşük tarife avantajı.`,
        action: 'Anlaşma avantajlarını maksimize edin. Menşe belgesi prosedürlerini optimize edin.',
        tariffAdvantage: 'Significant',
        agreements: agreements,
        confidence: 90
      };
    }
    
    if (count >= 1) {
      return {
        verdict: 'ADVANTAGE',
        status: 'success',
        icon: '✅',
        title: 'Ticari Avantaj',
        subtitle: 'Anlaşma Mevcut',
        explanation: `${count} ticaret anlaşması - standart tarifelerin altında işlem yapabilirsiniz.`,
        action: 'Anlaşma şartlarını iyi öğrenin ve dokümantasyonu eksiksiz hazırlayın.',
        tariffAdvantage: 'Moderate',
        agreements: agreements,
        confidence: 80
      };
    }
    
    return {
      verdict: 'STANDARD_TARIFF',
      status: 'warning',
      icon: '🚧',
      title: 'Standart Tarifeler',
      subtitle: 'Anlaşma Yok',
      explanation: 'Aktif ticaret anlaşması bulunmuyor - standart gümrük vergileri uygulanacak.',
      action: 'Tarife maliyetlerini fiyatlamaya dahil edin. Serbest bölge seçeneklerini araştırın.',
      tariffAdvantage: 'None',
      agreements: [],
      confidence: 95
    };
  }

  /**
   * ==========================================
   * DECISION 7: Investment Horizon
   * ==========================================
   * Question: "Is this short-term or long-term?"
   * Input: issizlik_orani + buyume_orani
   */
  static getInvestmentHorizonDecision(unemploymentRate, growthRate) {
    const unemployment = parseFloat(unemploymentRate) || 0;
    const growth = parseFloat(growthRate) || 0;
    
    // High Growth, Low Unemployment = Strategic Hub
    if (growth > 3 && unemployment < 7) {
      return {
        verdict: 'STRATEGIC',
        status: 'success',
        icon: '🏛️',
        title: 'Stratejik Merkez',
        subtitle: 'Uzun Vadeli Yatırım',
        explanation: `%${growth.toFixed(1)} büyüme, %${unemployment.toFixed(1)} işsizlik - sağlıklı ve büyüyen ekonomi.`,
        action: 'Uzun vadeli yatırım planı yapın. Yerel ekip kurun, depo/ofis düşünün.',
        horizon: 'Long-term (5+ years)',
        investmentLevel: 'High',
        confidence: 88
      };
    }
    
    // Good Growth, Moderate Unemployment
    if (growth > 2 && unemployment < 12) {
      return {
        verdict: 'GROWTH',
        status: 'success',
        icon: '📈',
        title: 'Büyüme Pazarı',
        subtitle: 'Orta Vadeli Potansiyel',
        explanation: `%${growth.toFixed(1)} büyüme, %${unemployment.toFixed(1)} işsizlik - olumlu trendler.`,
        action: '3-5 yıllık plan yapın. Distribütör ortaklıkları kurun.',
        horizon: 'Medium-term (3-5 years)',
        investmentLevel: 'Medium',
        confidence: 75
      };
    }
    
    // Volatile or Weak
    if (growth < 1 || unemployment > 15) {
      return {
        verdict: 'TACTICAL',
        status: 'warning',
        icon: '⚡',
        title: 'Taktiksel Satış',
        subtitle: 'Kısa Vadeli Odak',
        explanation: `%${growth.toFixed(1)} büyüme, %${unemployment.toFixed(1)} işsizlik - ekonomik belirsizlik yüksek.`,
        action: 'Uzun vadeli yatırımdan kaçının. Fırsatçı satışlara odaklanın.',
        horizon: 'Short-term (1-2 years)',
        investmentLevel: 'Low',
        confidence: 70
      };
    }
    
    return {
      verdict: 'EVALUATE',
      status: 'neutral',
      icon: '🔍',
      title: 'Değerlendirme Gerekli',
      subtitle: 'Karışık Sinyaller',
      explanation: `%${growth.toFixed(1)} büyüme, %${unemployment.toFixed(1)} işsizlik - daha fazla analiz gerekli.`,
      action: 'Pilot proje ile başlayın. 1 yıl sonra tekrar değerlendirin.',
      horizon: 'Pilot (1 year)',
      investmentLevel: 'Minimal',
      confidence: 55
    };
  }

  /**
   * ==========================================
   * HELPER: Risk Score Calculator
   * ==========================================
   */
  static getRiskScore(riskNotu) {
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
   * MASTER: Get All 7 Decisions
   * ==========================================
   */
  static getAllDecisions(countryData) {
    const {
      risk_notu_kodu,
      yerli_uretim_karsilama_orani_yuzde,
      gsyh_kisi_basi_usd,
      lpi_skoru,
      gumruk_bekleme_suresi_gun,
      enflasyon_orani_yuzde,
      nufus_milyon,
      sektorel_buyume_orani_yuzde,
      anlasma_sayisi,
      agreements,
      issizlik_orani_yuzde,
      buyume_orani_yuzde
    } = countryData;

    return {
      marketEntry: this.getMarketEntryDecision(risk_notu_kodu, yerli_uretim_karsilama_orani_yuzde),
      pricing: this.getPricingDecision(gsyh_kisi_basi_usd),
      logistics: this.getLogisticsDecision(lpi_skoru, gumruk_bekleme_suresi_gun),
      financial: this.getFinancialDecision(enflasyon_orani_yuzde),
      marketing: this.getMarketingDecision(nufus_milyon, sektorel_buyume_orani_yuzde),
      tradeBarrier: this.getTradeBarrierDecision(anlasma_sayisi, agreements),
      investmentHorizon: this.getInvestmentHorizonDecision(issizlik_orani_yuzde, buyume_orani_yuzde)
    };
  }

  /**
   * ==========================================
   * TOP RECOMMENDATIONS: Rank Countries
   * ==========================================
   */
  static getTopRecommendations(countries, limit = 3) {
    const ranked = countries
      .map(c => ({
        ...c,
        suitabilityScore: this.calculateSuitabilityScore(c),
        winningFactor: this.getWinningFactor(c)
      }))
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
      .slice(0, limit);

    return ranked.map((c, i) => ({
      ...c,
      rank: i + 1,
      medal: i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉',
      rankLabel: i === 0 ? 'Gold' : i === 1 ? 'Silver' : 'Bronze'
    }));
  }

  /**
   * Calculate Suitability Score
   * Logic: (Growth * 0.4) + (LPI * 0.3) + (GDP_Capita_normalized * 0.3)
   */
  static calculateSuitabilityScore(country) {
    const growth = parseFloat(country.sektorel_buyume || country.sektorel_buyume_orani_yuzde || 0);
    const lpi = parseFloat(country.lpi_skoru || 0);
    const gdp = parseFloat(country.gsyh_kisi_basi || country.gsyh_kisi_basi_usd || 0);
    
    // Normalize values to 0-100 scale
    const growthScore = Math.min(growth * 10, 100); // 10% growth = 100
    const lpiScore = (lpi / 5) * 100; // 5.0 LPI = 100
    const gdpScore = Math.min((gdp / 80000) * 100, 100); // $80k = 100
    
    return (growthScore * 0.4) + (lpiScore * 0.3) + (gdpScore * 0.3);
  }

  /**
   * Get the main "winning factor" for a country
   */
  static getWinningFactor(country) {
    const factors = [];
    
    const lpi = parseFloat(country.lpi_skoru || 0);
    const customs = parseInt(country.gumruk_suresi || country.gumruk_bekleme_suresi_gun || 30);
    const growth = parseFloat(country.sektorel_buyume || country.sektorel_buyume_orani_yuzde || 0);
    const localProd = parseFloat(country.yerli_uretim_orani || country.yerli_uretim_karsilama_orani_yuzde || 0);
    const gdp = parseFloat(country.gsyh_kisi_basi || country.gsyh_kisi_basi_usd || 0);
    
    if (lpi >= 3.5) factors.push({ factor: 'Güçlü Lojistik Altyapısı', score: lpi });
    if (customs <= 5) factors.push({ factor: 'Hızlı Gümrük İşlemleri', score: 5 - customs });
    if (growth >= 5) factors.push({ factor: 'Yüksek Sektörel Büyüme', score: growth });
    if (localProd <= 30) factors.push({ factor: 'Düşük Rekabet (Açık Pazar)', score: 100 - localProd });
    if (gdp >= 30000) factors.push({ factor: 'Yüksek Satın Alma Gücü', score: gdp / 1000 });
    
    if (factors.length === 0) {
      return 'Dengeli Profil';
    }
    
    // Return the strongest factor
    factors.sort((a, b) => b.score - a.score);
    return factors[0].factor;
  }
}

module.exports = DecisionLogic;

