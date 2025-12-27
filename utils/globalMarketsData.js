/**
 * Global Markets Data Generator
 * 30+ Major World Economy with Realistic Mock Data
 * Coordinates are accurate for map display
 */

// Country Tiers for realistic data generation
const TIER_1 = ['USA', 'DEU', 'JPN', 'GBR', 'FRA', 'CAN', 'AUS', 'NLD', 'CHE', 'SGP'];
const TIER_2 = ['CHN', 'TUR', 'BRA', 'POL', 'MEX', 'IND', 'KOR', 'ITA', 'ESP', 'ARE', 'SAU', 'QAT'];
const TIER_3 = ['VNM', 'IDN', 'EGY', 'ZAF', 'THA', 'MYS', 'PHL', 'COL', 'ARG', 'CHL'];

/**
 * Complete Global Markets Dataset
 * Includes accurate coordinates and realistic economic data
 */
const GLOBAL_MARKETS = [
  // ============ NORTH AMERICA ============
  {
    ulke_id: 1001,
    ulke_adi: 'Amerika Birleşik Devletleri',
    ISO_KODU: 'USA',
    latitude: 37.0902,
    longitude: -95.7129,
    bolge_adi: 'Kuzey Amerika',
    tier: 1,
    // Economic Data
    gsyh_kisi_basi: 76330,
    nufus_milyon: 331.9,
    enflasyon: 3.4,
    issizlik: 3.7,
    buyume_orani: 2.5,
    risk_notu: 'AAA',
    // Logistics
    lpi_skoru: 4.2,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1450,
    // Sector
    sektorel_buyume: 3.2,
    sektorel_ithalat: 2850,
    yerli_uretim_orani: 75,
    anlasma_sayisi: 5
  },
  {
    ulke_id: 1002,
    ulke_adi: 'Kanada',
    ISO_KODU: 'CAN',
    latitude: 56.1304,
    longitude: -106.3468,
    bolge_adi: 'Kuzey Amerika',
    tier: 1,
    gsyh_kisi_basi: 52722,
    nufus_milyon: 38.2,
    enflasyon: 2.8,
    issizlik: 5.4,
    buyume_orani: 1.8,
    risk_notu: 'AAA',
    lpi_skoru: 4.0,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1380,
    sektorel_buyume: 2.5,
    sektorel_ithalat: 420,
    yerli_uretim_orani: 65,
    anlasma_sayisi: 4
  },
  {
    ulke_id: 1003,
    ulke_adi: 'Meksika',
    ISO_KODU: 'MEX',
    latitude: 23.6345,
    longitude: -102.5528,
    bolge_adi: 'Kuzey Amerika',
    tier: 2,
    gsyh_kisi_basi: 10948,
    nufus_milyon: 128.9,
    enflasyon: 4.5,
    issizlik: 2.8,
    buyume_orani: 3.2,
    risk_notu: 'BBB',
    lpi_skoru: 3.1,
    gumruk_suresi: 5,
    konteyner_maliyeti: 1150,
    sektorel_buyume: 4.8,
    sektorel_ithalat: 380,
    yerli_uretim_orani: 55,
    anlasma_sayisi: 3
  },

  // ============ EUROPE ============
  {
    ulke_id: 1004,
    ulke_adi: 'Almanya',
    ISO_KODU: 'DEU',
    latitude: 51.1657,
    longitude: 10.4515,
    bolge_adi: 'Avrupa',
    tier: 1,
    gsyh_kisi_basi: 48398,
    nufus_milyon: 83.2,
    enflasyon: 2.9,
    issizlik: 3.0,
    buyume_orani: 0.3,
    risk_notu: 'AAA',
    lpi_skoru: 4.3,
    gumruk_suresi: 1,
    konteyner_maliyeti: 1280,
    sektorel_buyume: 1.8,
    sektorel_ithalat: 1420,
    yerli_uretim_orani: 82,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1005,
    ulke_adi: 'Birleşik Krallık',
    ISO_KODU: 'GBR',
    latitude: 55.3781,
    longitude: -3.4360,
    bolge_adi: 'Avrupa',
    tier: 1,
    gsyh_kisi_basi: 45850,
    nufus_milyon: 67.2,
    enflasyon: 4.0,
    issizlik: 4.2,
    buyume_orani: 0.5,
    risk_notu: 'AA',
    lpi_skoru: 4.1,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1350,
    sektorel_buyume: 2.1,
    sektorel_ithalat: 890,
    yerli_uretim_orani: 68,
    anlasma_sayisi: 3
  },
  {
    ulke_id: 1006,
    ulke_adi: 'Fransa',
    ISO_KODU: 'FRA',
    latitude: 46.2276,
    longitude: 2.2137,
    bolge_adi: 'Avrupa',
    tier: 1,
    gsyh_kisi_basi: 42350,
    nufus_milyon: 67.4,
    enflasyon: 2.5,
    issizlik: 7.1,
    buyume_orani: 1.1,
    risk_notu: 'AA',
    lpi_skoru: 4.0,
    gumruk_suresi: 1,
    konteyner_maliyeti: 1320,
    sektorel_buyume: 2.3,
    sektorel_ithalat: 780,
    yerli_uretim_orani: 72,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1007,
    ulke_adi: 'İtalya',
    ISO_KODU: 'ITA',
    latitude: 41.8719,
    longitude: 12.5674,
    bolge_adi: 'Avrupa',
    tier: 2,
    gsyh_kisi_basi: 34085,
    nufus_milyon: 59.1,
    enflasyon: 1.8,
    issizlik: 7.6,
    buyume_orani: 0.9,
    risk_notu: 'BBB',
    lpi_skoru: 3.8,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1250,
    sektorel_buyume: 1.5,
    sektorel_ithalat: 620,
    yerli_uretim_orani: 78,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1008,
    ulke_adi: 'İspanya',
    ISO_KODU: 'ESP',
    latitude: 40.4637,
    longitude: -3.7492,
    bolge_adi: 'Avrupa',
    tier: 2,
    gsyh_kisi_basi: 29674,
    nufus_milyon: 47.4,
    enflasyon: 3.2,
    issizlik: 11.8,
    buyume_orani: 2.3,
    risk_notu: 'A',
    lpi_skoru: 3.7,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1180,
    sektorel_buyume: 3.5,
    sektorel_ithalat: 420,
    yerli_uretim_orani: 62,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1009,
    ulke_adi: 'Hollanda',
    ISO_KODU: 'NLD',
    latitude: 52.1326,
    longitude: 5.2913,
    bolge_adi: 'Avrupa',
    tier: 1,
    gsyh_kisi_basi: 57025,
    nufus_milyon: 17.4,
    enflasyon: 2.2,
    issizlik: 3.5,
    buyume_orani: 0.8,
    risk_notu: 'AAA',
    lpi_skoru: 4.4,
    gumruk_suresi: 1,
    konteyner_maliyeti: 1150,
    sektorel_buyume: 2.0,
    sektorel_ithalat: 680,
    yerli_uretim_orani: 58,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1010,
    ulke_adi: 'Polonya',
    ISO_KODU: 'POL',
    latitude: 51.9194,
    longitude: 19.1451,
    bolge_adi: 'Avrupa',
    tier: 2,
    gsyh_kisi_basi: 18688,
    nufus_milyon: 37.8,
    enflasyon: 5.2,
    issizlik: 2.9,
    buyume_orani: 3.8,
    risk_notu: 'A',
    lpi_skoru: 3.5,
    gumruk_suresi: 2,
    konteyner_maliyeti: 980,
    sektorel_buyume: 5.2,
    sektorel_ithalat: 320,
    yerli_uretim_orani: 48,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1011,
    ulke_adi: 'İsviçre',
    ISO_KODU: 'CHE',
    latitude: 46.8182,
    longitude: 8.2275,
    bolge_adi: 'Avrupa',
    tier: 1,
    gsyh_kisi_basi: 92434,
    nufus_milyon: 8.7,
    enflasyon: 1.4,
    issizlik: 2.0,
    buyume_orani: 1.5,
    risk_notu: 'AAA',
    lpi_skoru: 4.2,
    gumruk_suresi: 1,
    konteyner_maliyeti: 1680,
    sektorel_buyume: 1.2,
    sektorel_ithalat: 280,
    yerli_uretim_orani: 85,
    anlasma_sayisi: 4
  },

  // ============ ASIA ============
  {
    ulke_id: 1012,
    ulke_adi: 'Çin',
    ISO_KODU: 'CHN',
    latitude: 35.8617,
    longitude: 104.1954,
    bolge_adi: 'Asya',
    tier: 2,
    gsyh_kisi_basi: 12556,
    nufus_milyon: 1412,
    enflasyon: 0.2,
    issizlik: 5.2,
    buyume_orani: 5.2,
    risk_notu: 'A',
    lpi_skoru: 3.6,
    gumruk_suresi: 4,
    konteyner_maliyeti: 890,
    sektorel_buyume: 6.5,
    sektorel_ithalat: 2200,
    yerli_uretim_orani: 88,
    anlasma_sayisi: 2
  },
  {
    ulke_id: 1013,
    ulke_adi: 'Japonya',
    ISO_KODU: 'JPN',
    latitude: 36.2048,
    longitude: 138.2529,
    bolge_adi: 'Asya',
    tier: 1,
    gsyh_kisi_basi: 33815,
    nufus_milyon: 125.7,
    enflasyon: 3.2,
    issizlik: 2.6,
    buyume_orani: 1.9,
    risk_notu: 'A',
    lpi_skoru: 4.1,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1420,
    sektorel_buyume: 1.5,
    sektorel_ithalat: 780,
    yerli_uretim_orani: 90,
    anlasma_sayisi: 3
  },
  {
    ulke_id: 1014,
    ulke_adi: 'Güney Kore',
    ISO_KODU: 'KOR',
    latitude: 35.9078,
    longitude: 127.7669,
    bolge_adi: 'Asya',
    tier: 2,
    gsyh_kisi_basi: 32255,
    nufus_milyon: 51.7,
    enflasyon: 3.5,
    issizlik: 2.7,
    buyume_orani: 2.6,
    risk_notu: 'AA',
    lpi_skoru: 3.9,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1280,
    sektorel_buyume: 3.8,
    sektorel_ithalat: 520,
    yerli_uretim_orani: 78,
    anlasma_sayisi: 4
  },
  {
    ulke_id: 1015,
    ulke_adi: 'Hindistan',
    ISO_KODU: 'IND',
    latitude: 20.5937,
    longitude: 78.9629,
    bolge_adi: 'Asya',
    tier: 2,
    gsyh_kisi_basi: 2389,
    nufus_milyon: 1417,
    enflasyon: 5.4,
    issizlik: 7.8,
    buyume_orani: 7.2,
    risk_notu: 'BBB',
    lpi_skoru: 3.2,
    gumruk_suresi: 6,
    konteyner_maliyeti: 1050,
    sektorel_buyume: 8.5,
    sektorel_ithalat: 620,
    yerli_uretim_orani: 42,
    anlasma_sayisi: 2
  },
  {
    ulke_id: 1016,
    ulke_adi: 'Singapur',
    ISO_KODU: 'SGP',
    latitude: 1.3521,
    longitude: 103.8198,
    bolge_adi: 'Asya',
    tier: 1,
    gsyh_kisi_basi: 65233,
    nufus_milyon: 5.5,
    enflasyon: 4.8,
    issizlik: 2.0,
    buyume_orani: 1.1,
    risk_notu: 'AAA',
    lpi_skoru: 4.5,
    gumruk_suresi: 1,
    konteyner_maliyeti: 920,
    sektorel_buyume: 2.8,
    sektorel_ithalat: 380,
    yerli_uretim_orani: 25,
    anlasma_sayisi: 6
  },
  {
    ulke_id: 1017,
    ulke_adi: 'Vietnam',
    ISO_KODU: 'VNM',
    latitude: 14.0583,
    longitude: 108.2772,
    bolge_adi: 'Asya',
    tier: 3,
    gsyh_kisi_basi: 4164,
    nufus_milyon: 98.2,
    enflasyon: 3.2,
    issizlik: 2.3,
    buyume_orani: 8.0,
    risk_notu: 'BB',
    lpi_skoru: 2.9,
    gumruk_suresi: 8,
    konteyner_maliyeti: 780,
    sektorel_buyume: 9.5,
    sektorel_ithalat: 280,
    yerli_uretim_orani: 35,
    anlasma_sayisi: 3
  },
  {
    ulke_id: 1018,
    ulke_adi: 'Endonezya',
    ISO_KODU: 'IDN',
    latitude: -0.7893,
    longitude: 113.9213,
    bolge_adi: 'Asya',
    tier: 3,
    gsyh_kisi_basi: 4788,
    nufus_milyon: 273.8,
    enflasyon: 3.8,
    issizlik: 5.3,
    buyume_orani: 5.3,
    risk_notu: 'BBB',
    lpi_skoru: 3.0,
    gumruk_suresi: 7,
    konteyner_maliyeti: 850,
    sektorel_buyume: 6.2,
    sektorel_ithalat: 320,
    yerli_uretim_orani: 52,
    anlasma_sayisi: 2
  },
  {
    ulke_id: 1019,
    ulke_adi: 'Tayland',
    ISO_KODU: 'THA',
    latitude: 15.8700,
    longitude: 100.9925,
    bolge_adi: 'Asya',
    tier: 3,
    gsyh_kisi_basi: 7066,
    nufus_milyon: 69.8,
    enflasyon: 1.2,
    issizlik: 1.0,
    buyume_orani: 2.8,
    risk_notu: 'BBB',
    lpi_skoru: 3.4,
    gumruk_suresi: 5,
    konteyner_maliyeti: 920,
    sektorel_buyume: 4.5,
    sektorel_ithalat: 240,
    yerli_uretim_orani: 58,
    anlasma_sayisi: 3
  },
  {
    ulke_id: 1020,
    ulke_adi: 'Malezya',
    ISO_KODU: 'MYS',
    latitude: 4.2105,
    longitude: 101.9758,
    bolge_adi: 'Asya',
    tier: 3,
    gsyh_kisi_basi: 12364,
    nufus_milyon: 32.4,
    enflasyon: 2.5,
    issizlik: 3.4,
    buyume_orani: 4.2,
    risk_notu: 'A',
    lpi_skoru: 3.5,
    gumruk_suresi: 4,
    konteyner_maliyeti: 880,
    sektorel_buyume: 5.8,
    sektorel_ithalat: 210,
    yerli_uretim_orani: 48,
    anlasma_sayisi: 4
  },

  // ============ MIDDLE EAST & NORTH AFRICA ============
  {
    ulke_id: 1021,
    ulke_adi: 'Birleşik Arap Emirlikleri',
    ISO_KODU: 'ARE',
    latitude: 23.4241,
    longitude: 53.8478,
    bolge_adi: 'Orta Doğu',
    tier: 2,
    gsyh_kisi_basi: 44316,
    nufus_milyon: 9.9,
    enflasyon: 2.3,
    issizlik: 2.9,
    buyume_orani: 3.4,
    risk_notu: 'AA',
    lpi_skoru: 3.9,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1080,
    sektorel_buyume: 4.5,
    sektorel_ithalat: 520,
    yerli_uretim_orani: 22,
    anlasma_sayisi: 3
  },
  {
    ulke_id: 1022,
    ulke_adi: 'Suudi Arabistan',
    ISO_KODU: 'SAU',
    latitude: 23.8859,
    longitude: 45.0792,
    bolge_adi: 'Orta Doğu',
    tier: 2,
    gsyh_kisi_basi: 27044,
    nufus_milyon: 35.0,
    enflasyon: 2.1,
    issizlik: 4.8,
    buyume_orani: 2.8,
    risk_notu: 'A',
    lpi_skoru: 3.4,
    gumruk_suresi: 4,
    konteyner_maliyeti: 1150,
    sektorel_buyume: 3.8,
    sektorel_ithalat: 380,
    yerli_uretim_orani: 28,
    anlasma_sayisi: 2
  },
  {
    ulke_id: 1023,
    ulke_adi: 'Türkiye',
    ISO_KODU: 'TUR',
    latitude: 38.9637,
    longitude: 35.2433,
    bolge_adi: 'Orta Doğu',
    tier: 2,
    gsyh_kisi_basi: 10616,
    nufus_milyon: 85.3,
    enflasyon: 65.0,
    issizlik: 9.4,
    buyume_orani: 4.5,
    risk_notu: 'B',
    lpi_skoru: 3.4,
    gumruk_suresi: 3,
    konteyner_maliyeti: 920,
    sektorel_buyume: 5.2,
    sektorel_ithalat: 180,
    yerli_uretim_orani: 72,
    anlasma_sayisi: 6
  },
  {
    ulke_id: 1024,
    ulke_adi: 'Mısır',
    ISO_KODU: 'EGY',
    latitude: 26.8206,
    longitude: 30.8025,
    bolge_adi: 'Afrika',
    tier: 3,
    gsyh_kisi_basi: 3698,
    nufus_milyon: 102.3,
    enflasyon: 33.0,
    issizlik: 7.2,
    buyume_orani: 4.2,
    risk_notu: 'B',
    lpi_skoru: 2.8,
    gumruk_suresi: 9,
    konteyner_maliyeti: 1280,
    sektorel_buyume: 4.8,
    sektorel_ithalat: 180,
    yerli_uretim_orani: 45,
    anlasma_sayisi: 2
  },
  {
    ulke_id: 1025,
    ulke_adi: 'Katar',
    ISO_KODU: 'QAT',
    latitude: 25.3548,
    longitude: 51.1839,
    bolge_adi: 'Orta Doğu',
    tier: 2,
    gsyh_kisi_basi: 83891,
    nufus_milyon: 2.9,
    enflasyon: 2.8,
    issizlik: 0.1,
    buyume_orani: 2.4,
    risk_notu: 'AA',
    lpi_skoru: 3.6,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1180,
    sektorel_buyume: 3.2,
    sektorel_ithalat: 120,
    yerli_uretim_orani: 15,
    anlasma_sayisi: 2
  },
  {
    ulke_id: 1026,
    ulke_adi: 'İsrail',
    ISO_KODU: 'ISR',
    latitude: 31.0461,
    longitude: 34.8516,
    bolge_adi: 'Orta Doğu',
    tier: 1,
    gsyh_kisi_basi: 52170,
    nufus_milyon: 9.4,
    enflasyon: 4.2,
    issizlik: 3.5,
    buyume_orani: 2.0,
    risk_notu: 'A',
    lpi_skoru: 3.8,
    gumruk_suresi: 3,
    konteyner_maliyeti: 1350,
    sektorel_buyume: 3.5,
    sektorel_ithalat: 180,
    yerli_uretim_orani: 68,
    anlasma_sayisi: 3
  },

  // ============ SOUTH AMERICA ============
  {
    ulke_id: 1027,
    ulke_adi: 'Brezilya',
    ISO_KODU: 'BRA',
    latitude: -14.2350,
    longitude: -51.9253,
    bolge_adi: 'Güney Amerika',
    tier: 2,
    gsyh_kisi_basi: 8917,
    nufus_milyon: 214.3,
    enflasyon: 4.6,
    issizlik: 7.8,
    buyume_orani: 2.9,
    risk_notu: 'BB',
    lpi_skoru: 2.9,
    gumruk_suresi: 8,
    konteyner_maliyeti: 1450,
    sektorel_buyume: 3.5,
    sektorel_ithalat: 280,
    yerli_uretim_orani: 72,
    anlasma_sayisi: 2
  },
  {
    ulke_id: 1028,
    ulke_adi: 'Arjantin',
    ISO_KODU: 'ARG',
    latitude: -38.4161,
    longitude: -63.6167,
    bolge_adi: 'Güney Amerika',
    tier: 3,
    gsyh_kisi_basi: 10636,
    nufus_milyon: 45.8,
    enflasyon: 142.0,
    issizlik: 6.2,
    buyume_orani: -1.6,
    risk_notu: 'CCC',
    lpi_skoru: 2.7,
    gumruk_suresi: 12,
    konteyner_maliyeti: 1680,
    sektorel_buyume: -0.5,
    sektorel_ithalat: 80,
    yerli_uretim_orani: 65,
    anlasma_sayisi: 1
  },
  {
    ulke_id: 1029,
    ulke_adi: 'Şili',
    ISO_KODU: 'CHL',
    latitude: -35.6751,
    longitude: -71.5430,
    bolge_adi: 'Güney Amerika',
    tier: 3,
    gsyh_kisi_basi: 16265,
    nufus_milyon: 19.5,
    enflasyon: 7.6,
    issizlik: 8.5,
    buyume_orani: 2.0,
    risk_notu: 'A',
    lpi_skoru: 3.2,
    gumruk_suresi: 5,
    konteyner_maliyeti: 1250,
    sektorel_buyume: 2.8,
    sektorel_ithalat: 120,
    yerli_uretim_orani: 45,
    anlasma_sayisi: 4
  },
  {
    ulke_id: 1030,
    ulke_adi: 'Kolombiya',
    ISO_KODU: 'COL',
    latitude: 4.5709,
    longitude: -74.2973,
    bolge_adi: 'Güney Amerika',
    tier: 3,
    gsyh_kisi_basi: 6624,
    nufus_milyon: 51.9,
    enflasyon: 9.3,
    issizlik: 10.2,
    buyume_orani: 1.2,
    risk_notu: 'BB',
    lpi_skoru: 2.9,
    gumruk_suresi: 7,
    konteyner_maliyeti: 1380,
    sektorel_buyume: 2.5,
    sektorel_ithalat: 140,
    yerli_uretim_orani: 52,
    anlasma_sayisi: 2
  },

  // ============ OCEANIA ============
  {
    ulke_id: 1031,
    ulke_adi: 'Avustralya',
    ISO_KODU: 'AUS',
    latitude: -25.2744,
    longitude: 133.7751,
    bolge_adi: 'Okyanusya',
    tier: 1,
    gsyh_kisi_basi: 64491,
    nufus_milyon: 25.7,
    enflasyon: 4.1,
    issizlik: 3.7,
    buyume_orani: 2.1,
    risk_notu: 'AAA',
    lpi_skoru: 3.8,
    gumruk_suresi: 3,
    konteyner_maliyeti: 1580,
    sektorel_buyume: 2.5,
    sektorel_ithalat: 320,
    yerli_uretim_orani: 55,
    anlasma_sayisi: 4
  },

  // ============ AFRICA ============
  {
    ulke_id: 1032,
    ulke_adi: 'Güney Afrika',
    ISO_KODU: 'ZAF',
    latitude: -30.5595,
    longitude: 22.9375,
    bolge_adi: 'Afrika',
    tier: 3,
    gsyh_kisi_basi: 6001,
    nufus_milyon: 60.0,
    enflasyon: 5.4,
    issizlik: 32.9,
    buyume_orani: 0.9,
    risk_notu: 'BB',
    lpi_skoru: 3.4,
    gumruk_suresi: 6,
    konteyner_maliyeti: 1480,
    sektorel_buyume: 1.8,
    sektorel_ithalat: 180,
    yerli_uretim_orani: 62,
    anlasma_sayisi: 2
  },
  {
    ulke_id: 1033,
    ulke_adi: 'Nijerya',
    ISO_KODU: 'NGA',
    latitude: 9.0820,
    longitude: 8.6753,
    bolge_adi: 'Afrika',
    tier: 3,
    gsyh_kisi_basi: 2184,
    nufus_milyon: 218.5,
    enflasyon: 28.2,
    issizlik: 33.3,
    buyume_orani: 2.9,
    risk_notu: 'B',
    lpi_skoru: 2.5,
    gumruk_suresi: 14,
    konteyner_maliyeti: 1850,
    sektorel_buyume: 3.5,
    sektorel_ithalat: 120,
    yerli_uretim_orani: 28,
    anlasma_sayisi: 1
  },
  {
    ulke_id: 1034,
    ulke_adi: 'Fas',
    ISO_KODU: 'MAR',
    latitude: 31.7917,
    longitude: -7.0926,
    bolge_adi: 'Afrika',
    tier: 3,
    gsyh_kisi_basi: 3795,
    nufus_milyon: 37.1,
    enflasyon: 6.1,
    issizlik: 11.8,
    buyume_orani: 3.0,
    risk_notu: 'BB',
    lpi_skoru: 2.9,
    gumruk_suresi: 5,
    konteyner_maliyeti: 1120,
    sektorel_buyume: 4.2,
    sektorel_ithalat: 140,
    yerli_uretim_orani: 42,
    anlasma_sayisi: 3
  },

  // ============ ADDITIONAL EUROPEAN ============
  {
    ulke_id: 1035,
    ulke_adi: 'Belçika',
    ISO_KODU: 'BEL',
    latitude: 50.5039,
    longitude: 4.4699,
    bolge_adi: 'Avrupa',
    tier: 1,
    gsyh_kisi_basi: 51247,
    nufus_milyon: 11.5,
    enflasyon: 2.3,
    issizlik: 5.5,
    buyume_orani: 1.4,
    risk_notu: 'AA',
    lpi_skoru: 4.1,
    gumruk_suresi: 1,
    konteyner_maliyeti: 1180,
    sektorel_buyume: 1.8,
    sektorel_ithalat: 420,
    yerli_uretim_orani: 52,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1036,
    ulke_adi: 'Avusturya',
    ISO_KODU: 'AUT',
    latitude: 47.5162,
    longitude: 14.5501,
    bolge_adi: 'Avrupa',
    tier: 1,
    gsyh_kisi_basi: 53638,
    nufus_milyon: 9.0,
    enflasyon: 4.2,
    issizlik: 5.0,
    buyume_orani: 0.8,
    risk_notu: 'AA',
    lpi_skoru: 4.0,
    gumruk_suresi: 1,
    konteyner_maliyeti: 1350,
    sektorel_buyume: 1.5,
    sektorel_ithalat: 280,
    yerli_uretim_orani: 68,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1037,
    ulke_adi: 'Çekya',
    ISO_KODU: 'CZE',
    latitude: 49.8175,
    longitude: 15.4730,
    bolge_adi: 'Avrupa',
    tier: 2,
    gsyh_kisi_basi: 26821,
    nufus_milyon: 10.5,
    enflasyon: 8.5,
    issizlik: 2.6,
    buyume_orani: 0.2,
    risk_notu: 'AA',
    lpi_skoru: 3.6,
    gumruk_suresi: 1,
    konteyner_maliyeti: 1050,
    sektorel_buyume: 2.8,
    sektorel_ithalat: 180,
    yerli_uretim_orani: 72,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1038,
    ulke_adi: 'Romanya',
    ISO_KODU: 'ROU',
    latitude: 45.9432,
    longitude: 24.9668,
    bolge_adi: 'Avrupa',
    tier: 2,
    gsyh_kisi_basi: 15892,
    nufus_milyon: 19.0,
    enflasyon: 6.6,
    issizlik: 5.4,
    buyume_orani: 4.8,
    risk_notu: 'BBB',
    lpi_skoru: 3.1,
    gumruk_suresi: 3,
    konteyner_maliyeti: 980,
    sektorel_buyume: 5.5,
    sektorel_ithalat: 220,
    yerli_uretim_orani: 38,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1039,
    ulke_adi: 'Yunanistan',
    ISO_KODU: 'GRC',
    latitude: 39.0742,
    longitude: 21.8243,
    bolge_adi: 'Avrupa',
    tier: 2,
    gsyh_kisi_basi: 20876,
    nufus_milyon: 10.4,
    enflasyon: 2.9,
    issizlik: 10.9,
    buyume_orani: 2.4,
    risk_notu: 'BBB',
    lpi_skoru: 3.2,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1150,
    sektorel_buyume: 3.2,
    sektorel_ithalat: 160,
    yerli_uretim_orani: 48,
    anlasma_sayisi: 8
  },
  {
    ulke_id: 1040,
    ulke_adi: 'Portekiz',
    ISO_KODU: 'PRT',
    latitude: 39.3999,
    longitude: -8.2245,
    bolge_adi: 'Avrupa',
    tier: 2,
    gsyh_kisi_basi: 24521,
    nufus_milyon: 10.3,
    enflasyon: 3.2,
    issizlik: 6.5,
    buyume_orani: 2.3,
    risk_notu: 'A',
    lpi_skoru: 3.5,
    gumruk_suresi: 2,
    konteyner_maliyeti: 1080,
    sektorel_buyume: 3.8,
    sektorel_ithalat: 140,
    yerli_uretim_orani: 52,
    anlasma_sayisi: 8
  }
];

/**
 * Calculate country score based on weighted criteria
 */
function calculateScore(country, weights = {}) {
  const w = {
    marketPotential: weights.marketPotential || 30,
    economicStability: weights.economicStability || 25,
    logisticsEase: weights.logisticsEase || 25,
    sectorGrowth: weights.sectorGrowth || 20
  };

  // Market Potential (0-100)
  const marketScore = Math.min(100, 
    (country.sektorel_ithalat / 30) + 
    (100 - country.yerli_uretim_orani) * 0.5 +
    Math.log10(country.nufus_milyon) * 10
  );

  // Economic Stability (0-100)
  const riskScores = { 'AAA': 100, 'AA': 90, 'A': 75, 'BBB': 60, 'BB': 45, 'B': 30, 'CCC': 15 };
  const riskScore = riskScores[country.risk_notu] || riskScores[country.risk_notu?.substring(0, 2)] || 50;
  const inflationPenalty = Math.max(0, 100 - country.enflasyon * 2);
  const economicScore = (riskScore * 0.6 + inflationPenalty * 0.4);

  // Logistics Ease (0-100)
  const lpiScore = (country.lpi_skoru / 5) * 100;
  const customsScore = Math.max(0, 100 - country.gumruk_suresi * 5);
  const costScore = Math.max(0, 100 - (country.konteyner_maliyeti - 500) / 20);
  const logisticsScore = lpiScore * 0.5 + customsScore * 0.3 + costScore * 0.2;

  // Sector Growth (0-100)
  const growthScore = Math.min(100, Math.max(0, country.sektorel_buyume * 10 + 30));

  // Weighted Total
  const total = (
    marketScore * (w.marketPotential / 100) +
    economicScore * (w.economicStability / 100) +
    logisticsScore * (w.logisticsEase / 100) +
    growthScore * (w.sectorGrowth / 100)
  );

  return {
    marketPotential: Math.round(marketScore),
    economicStability: Math.round(economicScore),
    logisticsEase: Math.round(logisticsScore),
    sectorGrowth: Math.round(growthScore),
    total: Math.round(total)
  };
}

/**
 * Get all global markets with calculated scores
 */
function getGlobalMarkets(weights = {}) {
  return GLOBAL_MARKETS.map(country => {
    const scores = calculateScore(country, weights);
    return {
      ...country,
      scores,
      totalScore: scores.total
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Merge DB countries with global markets (prioritize DB data)
 */
function mergeWithDBData(dbCountries, weights = {}) {
  const dbMap = new Map();
  dbCountries.forEach(c => {
    dbMap.set(c.ulke_adi?.toLowerCase(), c);
    if (c.ISO_KODU) dbMap.set(c.ISO_KODU.toLowerCase(), c);
  });

  const merged = [];

  // First add all global markets, replacing with DB data if available
  GLOBAL_MARKETS.forEach(gm => {
    const dbMatch = dbMap.get(gm.ulke_adi.toLowerCase()) || dbMap.get(gm.ISO_KODU.toLowerCase());
    
    if (dbMatch) {
      // Merge: prefer DB data but keep coordinates from global
      const mergedCountry = {
        ...gm,
        ...dbMatch,
        latitude: gm.latitude, // Always use accurate coordinates
        longitude: gm.longitude,
        // Keep calculated fields from DB if available
        sektorel_buyume: dbMatch.sektorel_buyume || gm.sektorel_buyume,
        sektorel_ithalat: dbMatch.sektorel_ithalat || gm.sektorel_ithalat
      };
      const scores = calculateScore(mergedCountry, weights);
      merged.push({ ...mergedCountry, scores, totalScore: scores.total });
    } else {
      // Use global market data
      const scores = calculateScore(gm, weights);
      merged.push({ ...gm, scores, totalScore: scores.total });
    }
  });

  // Add any remaining DB countries not in global markets
  dbCountries.forEach(dbc => {
    const alreadyAdded = merged.some(m => 
      m.ulke_adi?.toLowerCase() === dbc.ulke_adi?.toLowerCase() ||
      m.ISO_KODU?.toLowerCase() === dbc.ISO_KODU?.toLowerCase()
    );
    
    if (!alreadyAdded && dbc.latitude && dbc.longitude) {
      const scores = calculateScore(dbc, weights);
      merged.push({ ...dbc, scores, totalScore: scores.total });
    }
  });

  return merged.sort((a, b) => b.totalScore - a.totalScore);
}

module.exports = {
  GLOBAL_MARKETS,
  getGlobalMarkets,
  mergeWithDBData,
  calculateScore
};

