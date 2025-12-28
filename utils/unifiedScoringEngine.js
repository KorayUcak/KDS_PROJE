/**
 * ============================================
 * UNIFIED SCORING ENGINE
 * Birleşik Skorlama Motoru v2.0
 * ============================================
 * 
 * MATEMATİKSEL TUTARLILIK:
 * Global Skor = 7 Karar Alt-Skorunun Ortalaması
 * 
 * Eğer Global Skor = 72 ise, 7 kararın ortalaması da 72'dir.
 * Bu sayede "Yüksek skor ama çoğu karar negatif" tutarsızlığı ortadan kalkar.
 * 
 * EŞIK DEĞERLERİ:
 * - Score > 70  → Pozitif (Yeşil)
 * - Score 40-70 → Nötr (Sarı)
 * - Score < 40  → Negatif (Kırmızı)
 */

class UnifiedScoringEngine {
  
  /**
   * ==========================================
   * HELPER: Normalize any value to 0-100 scale
   * ==========================================
   */
  static normalize(value, min, max, inverse = false) {
    const val = parseFloat(value) || 0;
    const normalized = Math.max(0, Math.min(1, (val - min) / (max - min)));
    const score = (inverse ? (1 - normalized) : normalized) * 100;
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Get verdict classification based on score
   */
  static getVerdict(score) {
    if (score >= 70) {
      return { 
        type: 'positive', 
        label: 'Olumlu', 
        icon: '🟢', 
        color: '#00ff88',
        bgColor: 'rgba(0, 255, 136, 0.1)'
      };
    }
    if (score >= 40) {
      return { 
        type: 'neutral', 
        label: 'Nötr', 
        icon: '🟡', 
        color: '#ffc107',
        bgColor: 'rgba(255, 193, 7, 0.1)'
      };
    }
    return { 
      type: 'negative', 
      label: 'Olumsuz', 
      icon: '🔴', 
      color: '#f44336',
      bgColor: 'rgba(244, 67, 54, 0.1)'
    };
  }

  /**
   * Risk score helper (AAA=100, D=5)
   */
  static riskToScore(riskNotu) {
    const riskScores = {
      'AAA': 100, 'AA+': 95, 'AA': 90, 'AA-': 85,
      'A+': 80, 'A': 75, 'A-': 70,
      'BBB+': 65, 'BBB': 60, 'BBB-': 55,
      'BB+': 50, 'BB': 45, 'BB-': 40,
      'B+': 35, 'B': 30, 'B-': 25,
      'CCC': 20, 'CC': 15, 'C': 10, 'D': 5
    };
    return riskScores[riskNotu] || 50;
  }

  /**
   * ==========================================
   * DECISION 1: Market Entry Score (0-100)
   * ==========================================
   * Inputs: risk_notu_kodu + yerli_uretim_karsilama_orani
   * Logic: Low risk + Low local production = High score
   */
  static getMarketEntryScore(riskNotu, yerliUretimOrani) {
    // Risk score (0-100, high = good)
    const riskScore = this.riskToScore(riskNotu);
    
    // Local production (0-100, LOW local production = HIGH opportunity)
    const localProd = parseFloat(yerliUretimOrani) || 0;
    const opportunityScore = Math.max(0, 100 - localProd);
    
    // Combined score: 50% risk, 50% opportunity
    const score = Math.round(riskScore * 0.5 + opportunityScore * 0.5);
    const verdict = this.getVerdict(score);
    
    // Dynamic recommendation based on score
    let decision, action, subtitle;
    if (score >= 70) {
      decision = 'Pazara Gir';
      subtitle = 'Açık Fırsat';
      action = 'Hızlı giriş stratejisi uygulayın. İlk hamle avantajını yakalayın.';
    } else if (score >= 40) {
      decision = 'Dikkatli İlerle';
      subtitle = 'Orta Bariyer';
      action = 'Niş segment stratejisi veya fiyat liderliği ile giriş düşünün.';
    } else {
      decision = 'Pazardan Kaçın';
      subtitle = 'Yüksek Bariyerler';
      action = 'Bu pazarı şu an için atlayın. Alternatif pazarları değerlendirin.';
    }

    return {
      id: 1,
      key: 'marketEntry',
      title: 'Pazar Giriş Stratejisi',
      score,
      verdict,
      decision,
      subtitle,
      action,
      explanation: `Risk: ${riskNotu} (${riskScore}/100), Yerli Üretim: %${localProd.toFixed(0)} → Fırsat Skoru: ${opportunityScore}`,
      inputs: { riskNotu, yerliUretimOrani: localProd, riskScore, opportunityScore }
    };
  }

  /**
   * ==========================================
   * DECISION 2: Pricing Strategy Score (0-100)
   * ==========================================
   * Input: gsyh_kisi_basi_usd (GDP per Capita)
   * Logic: Higher GDP = Premium pricing possible = Higher score
   */
  static getPricingScore(gdpPerCapita) {
    const gdp = parseFloat(gdpPerCapita) || 0;
    
    // GDP per capita normalized (0-80000 = 0-100)
    const score = this.normalize(gdp, 0, 80000);
    const verdict = this.getVerdict(score);
    
    let decision, subtitle, multiplier, action;
    if (score >= 70) {
      decision = 'Premium Fiyatlandırma';
      subtitle = 'Yüksek Ödeme Gücü';
      multiplier = '1.5x';
      action = 'Marka değerine odaklanın. Kalite ve prestij vurgulayın.';
    } else if (score >= 40) {
      decision = 'Değer Odaklı Fiyatlandırma';
      subtitle = 'Orta Segment';
      multiplier = '1.0x';
      action = 'Kalite/fiyat dengesini vurgulayın.';
    } else {
      decision = 'Penetrasyon Fiyatlandırma';
      subtitle = 'Hacim Odaklı';
      multiplier = '0.7x';
      action = 'Düşük fiyat + yüksek hacim stratejisi uygulayın.';
    }

    return {
      id: 2,
      key: 'pricing',
      title: 'Fiyatlandırma Stratejisi',
      score,
      verdict,
      decision,
      subtitle,
      action,
      multiplier,
      explanation: `Kişi Başı GSYİH: $${gdp.toLocaleString()} → Fiyatlandırma Kapasitesi: ${score}/100`,
      inputs: { gdpPerCapita: gdp }
    };
  }

  /**
   * ==========================================
   * DECISION 3: Logistics Score (0-100)
   * ==========================================
   * Input: lpi_skoru + gumruk_bekleme_suresi_gun
   * Logic: High LPI + Fast customs = High score
   */
  static getLogisticsScore(lpiScore, customsDays) {
    const lpi = parseFloat(lpiScore) || 2.5;
    const customs = parseInt(customsDays) || 15;
    
    // LPI score (1-5 scale to 0-100)
    const lpiNorm = this.normalize(lpi, 1, 5);
    
    // Customs days (0-30 days, LOWER = BETTER, so inverse)
    const customsNorm = this.normalize(customs, 0, 30, true);
    
    // Combined: 60% LPI, 40% customs speed
    const score = Math.round(lpiNorm * 0.6 + customsNorm * 0.4);
    const verdict = this.getVerdict(score);
    
    let decision, subtitle, mode, bufferStock, action;
    if (score >= 70) {
      decision = 'Just-in-Time Lojistik';
      subtitle = 'Mükemmel Altyapı';
      mode = 'Deniz + Kara';
      bufferStock = 'Düşük (2 hafta)';
      action = 'Minimum stok ile çalışın. Haftalık sipariş döngüsü uygulayın.';
    } else if (score >= 40) {
      decision = 'Standart Lojistik';
      subtitle = 'Orta Altyapı';
      mode = 'Deniz Yolu';
      bufferStock = 'Orta (4 hafta)';
      action = 'Emniyet stoğu tutun. Aylık planlama yapın.';
    } else {
      decision = 'Tampon Stok Modeli';
      subtitle = 'Zayıf Altyapı';
      mode = 'Hava + Deniz';
      bufferStock = 'Yüksek (6-8 hafta)';
      action = 'Kritik ürünler için hava yolu kullanın. Yüksek stok tutun.';
    }

    return {
      id: 3,
      key: 'logistics',
      title: 'Lojistik Stratejisi',
      score,
      verdict,
      decision,
      subtitle,
      action,
      recommendedMode: mode,
      bufferStock,
      explanation: `LPI: ${lpi.toFixed(2)}/5 → ${lpiNorm}/100, Gümrük: ${customs} gün → ${customsNorm}/100`,
      inputs: { lpiScore: lpi, customsDays: customs, lpiNorm, customsNorm }
    };
  }

  /**
   * ==========================================
   * DECISION 4: Financial Risk Score (0-100)
   * ==========================================
   * Input: enflasyon_orani_yuzde + risk_notu
   * Logic: Low inflation + Good risk rating = High score
   */
  static getFinancialScore(inflationRate, riskNotu) {
    const inflation = parseFloat(inflationRate) || 0;
    
    // Inflation (0-30%, LOWER = BETTER)
    const inflationNorm = this.normalize(inflation, 0, 30, true);
    
    // Risk rating
    const riskScore = this.riskToScore(riskNotu);
    
    // Combined: 50% inflation, 50% risk
    const score = Math.round(inflationNorm * 0.5 + riskScore * 0.5);
    const verdict = this.getVerdict(score);
    
    let decision, subtitle, terms, hedging, action;
    if (score >= 70) {
      decision = 'Standart Ödeme Koşulları';
      subtitle = 'Stabil Ekonomi';
      terms = 'Net 60-90';
      hedging = false;
      action = 'Yerel para birimi ile çalışabilirsiniz. Normal ticari şartlar.';
    } else if (score >= 40) {
      decision = 'Kısmi Koruma';
      subtitle = 'Orta Risk';
      terms = 'LC 30-60';
      hedging = true;
      action = 'Büyük sözleşmeleri dövizle yapın. Akreditif kullanın.';
    } else {
      decision = 'Döviz Koruması Şart';
      subtitle = 'Yüksek Risk';
      terms = 'Peşin/LC at Sight';
      hedging = true;
      action = 'TÜM sözleşmeleri USD/EUR ile yapın. Yerel para riski almayın.';
    }

    return {
      id: 4,
      key: 'financial',
      title: 'Finansal Risk Stratejisi',
      score,
      verdict,
      decision,
      subtitle,
      action,
      paymentTerms: terms,
      hedgingRequired: hedging,
      explanation: `Enflasyon: %${inflation.toFixed(1)} → ${inflationNorm}/100, Risk: ${riskNotu} → ${riskScore}/100`,
      inputs: { inflationRate: inflation, riskNotu, inflationNorm, riskScore }
    };
  }

  /**
   * ==========================================
   * DECISION 5: Marketing Score (0-100)
   * ==========================================
   * Input: nufus_milyon + sektorel_buyume + digital_adoption
   * Logic: Large population + High growth + Digital = High score
   */
  static getMarketingScore(population, sectorGrowth, gdpPerCapita) {
    const pop = parseFloat(population) || 0;
    const growth = parseFloat(sectorGrowth) || 0;
    const gdp = parseFloat(gdpPerCapita) || 0;
    
    // Population (0-200M = 0-100)
    const popNorm = this.normalize(pop, 0, 200);
    
    // Sector growth (-5% to 15% = 0-100)
    const growthNorm = this.normalize(growth, -5, 15);
    
    // Digital adoption (estimated from GDP)
    const digitalNorm = this.normalize(gdp, 0, 50000);
    
    // Combined: 30% pop, 40% growth, 30% digital
    const score = Math.round(popNorm * 0.3 + growthNorm * 0.4 + digitalNorm * 0.3);
    const verdict = this.getVerdict(score);
    
    let decision, subtitle, channels, action;
    if (score >= 70) {
      decision = 'Dijital/Sosyal Medya Odaklı';
      subtitle = 'Yüksek Potansiyel';
      channels = ['Digital', 'Social Media', 'Influencer'];
      action = 'Dijital pazarlama ve sosyal medyaya yoğunlaşın.';
    } else if (score >= 40) {
      decision = 'Omnichannel Strateji';
      subtitle = 'Dengeli Yaklaşım';
      channels = ['Digital', 'TV', 'OOH'];
      action = 'Çok kanallı strateji uygulayın.';
    } else {
      decision = 'Geleneksel Medya Odaklı';
      subtitle = 'Sınırlı Potansiyel';
      channels = ['TV', 'Gazete', 'Radyo'];
      action = 'Geleneksel kanallara odaklanın. Maliyetleri kontrol edin.';
    }

    return {
      id: 5,
      key: 'marketing',
      title: 'Pazarlama Stratejisi',
      score,
      verdict,
      decision,
      subtitle,
      action,
      channels,
      explanation: `Nüfus: ${pop.toFixed(0)}M → ${popNorm}/100, Büyüme: %${growth.toFixed(1)} → ${growthNorm}/100, Dijital: ${digitalNorm}/100`,
      inputs: { population: pop, sectorGrowth: growth, popNorm, growthNorm, digitalNorm }
    };
  }

  /**
   * ==========================================
   * DECISION 6: Trade Barrier Score (0-100)
   * ==========================================
   * Input: anlasma_sayisi + gumruk_bekleme_suresi
   * Logic: More agreements + Fast customs = High score
   */
  static getTradeBarrierScore(agreementCount, customsDays, agreements = []) {
    const count = parseInt(agreementCount) || 0;
    const customs = parseInt(customsDays) || 15;
    
    // Agreements (0-5 = 0-100)
    const agreementNorm = this.normalize(count, 0, 5);
    
    // Customs speed (inverse)
    const customsNorm = this.normalize(customs, 0, 30, true);
    
    // Combined: 60% agreements, 40% customs
    const score = Math.round(agreementNorm * 0.6 + customsNorm * 0.4);
    const verdict = this.getVerdict(score);
    
    let decision, subtitle, tariffAdvantage, action;
    if (score >= 70) {
      decision = 'Hızlı Koridor';
      subtitle = 'Çoklu Anlaşma';
      tariffAdvantage = 'Yüksek';
      action = 'Anlaşma avantajlarını maksimize edin. Menşe belgesi hazırlayın.';
    } else if (score >= 40) {
      decision = 'Kısmi Avantaj';
      subtitle = 'Sınırlı Anlaşma';
      tariffAdvantage = 'Orta';
      action = 'Mevcut anlaşma şartlarını optimize edin.';
    } else {
      decision = 'Standart Tarifeler';
      subtitle = 'Anlaşma Yok';
      tariffAdvantage = 'Yok';
      action = 'Tarife maliyetlerini fiyatlamaya dahil edin.';
    }

    return {
      id: 6,
      key: 'tradeBarrier',
      title: 'Ticari Bariyer Analizi',
      score,
      verdict,
      decision,
      subtitle,
      action,
      tariffAdvantage,
      agreements,
      explanation: `Anlaşma: ${count} adet → ${agreementNorm}/100, Gümrük: ${customs} gün → ${customsNorm}/100`,
      inputs: { agreementCount: count, customsDays: customs, agreementNorm, customsNorm }
    };
  }

  /**
   * ==========================================
   * DECISION 7: Investment Horizon Score (0-100)
   * ==========================================
   * Input: issizlik_orani + buyume_orani + ease_of_business
   * Logic: Low unemployment + High growth + Easy business = High score
   */
  static getInvestmentScore(unemploymentRate, growthRate, lpiScore, riskNotu) {
    const unemployment = parseFloat(unemploymentRate) || 0;
    const growth = parseFloat(growthRate) || 0;
    const lpi = parseFloat(lpiScore) || 2.5;
    
    // Unemployment (0-25%, LOWER = BETTER)
    const unemploymentNorm = this.normalize(unemployment, 0, 25, true);
    
    // Economic growth (-5% to 10% = 0-100)
    const growthNorm = this.normalize(growth, -5, 10);
    
    // Ease of business (from LPI and risk)
    const eobNorm = Math.round(
      this.normalize(lpi, 1, 5) * 0.5 + 
      this.riskToScore(riskNotu) * 0.5
    );
    
    // Combined: 30% unemployment, 40% growth, 30% ease of business
    const score = Math.round(unemploymentNorm * 0.3 + growthNorm * 0.4 + eobNorm * 0.3);
    const verdict = this.getVerdict(score);
    
    let decision, subtitle, horizon, investmentLevel, action;
    if (score >= 70) {
      decision = 'Stratejik Merkez';
      subtitle = 'Uzun Vadeli Yatırım';
      horizon = '5+ yıl';
      investmentLevel = 'Yüksek';
      action = 'Uzun vadeli yatırım planı yapın. Yerel ekip kurun.';
    } else if (score >= 40) {
      decision = 'Büyüme Pazarı';
      subtitle = 'Orta Vadeli Potansiyel';
      horizon = '3-5 yıl';
      investmentLevel = 'Orta';
      action = 'Distribütör ortaklıkları kurun. Aşamalı büyüme planlayın.';
    } else {
      decision = 'Taktiksel Satış';
      subtitle = 'Kısa Vadeli Odak';
      horizon = '1-2 yıl';
      investmentLevel = 'Düşük';
      action = 'Uzun vadeli yatırımdan kaçının. Fırsatçı satışlara odaklanın.';
    }

    return {
      id: 7,
      key: 'investment',
      title: 'Yatırım Ufku',
      score,
      verdict,
      decision,
      subtitle,
      action,
      horizon,
      investmentLevel,
      explanation: `İşsizlik: %${unemployment.toFixed(1)} → ${unemploymentNorm}/100, Büyüme: %${growth.toFixed(1)} → ${growthNorm}/100, İş Ortamı: ${eobNorm}/100`,
      inputs: { unemploymentRate: unemployment, growthRate: growth, unemploymentNorm, growthNorm, eobNorm }
    };
  }

  /**
   * ==========================================
   * MASTER: Get All 7 Decisions with Unified Scoring
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

    // Get all 7 decisions with scores
    const decisions = [
      this.getMarketEntryScore(risk_notu_kodu, yerli_uretim_karsilama_orani_yuzde),
      this.getPricingScore(gsyh_kisi_basi_usd),
      this.getLogisticsScore(lpi_skoru, gumruk_bekleme_suresi_gun),
      this.getFinancialScore(enflasyon_orani_yuzde, risk_notu_kodu),
      this.getMarketingScore(nufus_milyon, sektorel_buyume_orani_yuzde, gsyh_kisi_basi_usd),
      this.getTradeBarrierScore(anlasma_sayisi, gumruk_bekleme_suresi_gun, agreements),
      this.getInvestmentScore(issizlik_orani_yuzde, buyume_orani_yuzde, lpi_skoru, risk_notu_kodu)
    ];

    return decisions;
  }

  /**
   * ==========================================
   * GLOBAL SCORE: Average of 7 Decision Scores
   * ==========================================
   * This ensures mathematical consistency!
   */
  static calculateGlobalScore(countryData, weights = null) {
    const decisions = this.getAllDecisions(countryData);
    
    // Default weights (all equal)
    const defaultWeights = {
      marketEntry: 1,
      pricing: 1,
      logistics: 1,
      financial: 1,
      marketing: 1,
      tradeBarrier: 1,
      investment: 1
    };
    
    const w = weights || defaultWeights;
    
    // Calculate weighted average
    let totalScore = 0;
    let totalWeight = 0;
    
    decisions.forEach(d => {
      const weight = w[d.key] || 1;
      totalScore += d.score * weight;
      totalWeight += weight;
    });
    
    const globalScore = Math.round(totalScore / totalWeight);
    
    // Count verdicts
    const counts = {
      positive: decisions.filter(d => d.verdict.type === 'positive').length,
      neutral: decisions.filter(d => d.verdict.type === 'neutral').length,
      negative: decisions.filter(d => d.verdict.type === 'negative').length
    };
    
    // Get global verdict
    const globalVerdict = this.getVerdict(globalScore);
    
    // Get recommendation text
    let recommendation;
    if (globalScore >= 70) {
      recommendation = {
        text: 'Öncelikli Hedef',
        description: 'Bu pazar yüksek potansiyel sunuyor. Stratejik yatırım önerilir.',
        action: 'Detaylı pazar giriş planı hazırlayın.'
      };
    } else if (globalScore >= 50) {
      recommendation = {
        text: 'Potansiyel Fırsat',
        description: 'Değerlendirilmeye değer fırsatlar var. Dikkatli ilerlenmeli.',
        action: 'Pilot proje veya sınırlı giriş düşünün.'
      };
    } else if (globalScore >= 40) {
      recommendation = {
        text: 'İzle ve Bekle',
        description: 'Riskler ve fırsatlar dengeli. Koşulları izleyin.',
        action: 'Alternatif pazarları da değerlendirin.'
      };
    } else {
      recommendation = {
        text: 'Önerilmez',
        description: 'Riskler fırsatların önünde. Bu pazarı şu an için atlayın.',
        action: 'Kaynaklarınızı başka pazarlara yönlendirin.'
      };
    }

    return {
      globalScore,
      globalVerdict,
      decisions,
      counts,
      recommendation,
      summary: `${counts.positive} Olumlu, ${counts.neutral} Nötr, ${counts.negative} Olumsuz`
    };
  }

  /**
   * ==========================================
   * VALIDATION: Check Mathematical Consistency
   * ==========================================
   * Debug method to verify the math works
   */
  static validateConsistency(countryData) {
    const result = this.calculateGlobalScore(countryData);
    
    // Manual average calculation
    const manualAvg = result.decisions.reduce((sum, d) => sum + d.score, 0) / 7;
    
    // Check if global score matches average
    const isConsistent = Math.abs(result.globalScore - manualAvg) < 1;
    
    console.log('🧮 [UnifiedScoringEngine] Consistency Check:');
    console.log(`   - Global Score: ${result.globalScore}`);
    console.log(`   - Manual Average: ${manualAvg.toFixed(2)}`);
    console.log(`   - Consistent: ${isConsistent ? '✅' : '❌'}`);
    console.log(`   - Verdicts: ${result.summary}`);
    
    // If score is 72, roughly 5-6 should be neutral/positive
    const expectedPositives = result.globalScore >= 70 ? 4 : result.globalScore >= 50 ? 3 : result.globalScore >= 40 ? 2 : 1;
    console.log(`   - Expected ~${expectedPositives} positives for score ${result.globalScore}`);
    
    return {
      isConsistent,
      details: result
    };
  }
}

module.exports = UnifiedScoringEngine;

