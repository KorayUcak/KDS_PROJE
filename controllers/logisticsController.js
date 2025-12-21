const LogisticsModel = require('../models/logisticsModel');
const AgreementModel = require('../models/agreementModel');
const CountryModel = require('../models/countryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getLogisticsList = catchAsync(async (req, res, next) => {
  const [logistics, statistics] = await Promise.all([
    LogisticsModel.getAll(),
    LogisticsModel.getStatistics()
  ]);

  res.render('logistics/index', {
    title: 'Lojistik Verileri - KDS',
    activePage: 'logistics',
    breadcrumb: [{ name: 'Lojistik Verileri', url: '/logistics' }],
    logistics,
    statistics,
    hasData: logistics.length > 0
  });
});

exports.getLogisticsCharts = catchAsync(async (req, res, next) => {
  const [logistics, statistics] = await Promise.all([
    LogisticsModel.getAll(),
    LogisticsModel.getStatistics()
  ]);

  res.render('logistics/charts', {
    title: 'Lojistik Verileri - Grafikler - KDS',
    activePage: 'logistics',
    breadcrumb: [
      { name: 'Lojistik Verileri', url: '/logistics' },
      { name: 'Grafikler', url: '/logistics/charts' }
    ],
    logistics,
    statistics,
    hasData: logistics.length > 0
  });
});

exports.getLogisticsDetail = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const logistics = await LogisticsModel.getById(id);
  
  if (!logistics) {
    return next(new AppError('Lojistik verisi bulunamadı', 404));
  }

  res.render('logistics/detail', {
    title: `${logistics.ulke_adi} - Lojistik Detay`,
    activePage: 'logistics',
    breadcrumb: [
      { name: 'Lojistik Verileri', url: '/logistics' },
      { name: logistics.ulke_adi, url: `/logistics/${id}` }
    ],
    logistics
  });
});

exports.getLogisticsEditForm = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const [logistics, countries] = await Promise.all([
    LogisticsModel.getById(id),
    CountryModel.getAll()
  ]);
  
  if (!logistics) {
    return next(new AppError('Lojistik verisi bulunamadı', 404));
  }

  res.render('logistics/edit', {
    title: `${logistics.ulke_adi} - Lojistik Düzenle`,
    activePage: 'logistics',
    breadcrumb: [
      { name: 'Lojistik Verileri', url: '/logistics' },
      { name: logistics.ulke_adi, url: `/logistics/${id}` },
      { name: 'Düzenle', url: `/logistics/${id}/edit` }
    ],
    logistics,
    countries
  });
});

exports.getLogisticsCreateForm = catchAsync(async (req, res, next) => {
  const countries = await CountryModel.getAll();

  res.render('logistics/create', {
    title: 'Yeni Lojistik Verisi Ekle',
    activePage: 'logistics',
    breadcrumb: [
      { name: 'Lojistik Verileri', url: '/logistics' },
      { name: 'Yeni Ekle', url: '/logistics/create' }
    ],
    countries
  });
});

exports.createLogistics = catchAsync(async (req, res, next) => {
  const data = {
    ulke_id: req.body.ulke_id,
    lpi_skoru: parseFloat(req.body.lpi_skoru),
    gumruk_bekleme_suresi_gun: parseFloat(req.body.gumruk_bekleme_suresi_gun),
    konteyner_ihracat_maliyeti_usd: parseFloat(req.body.konteyner_ihracat_maliyeti_usd)
  };

  const newId = await LogisticsModel.create(data);
  
  res.redirect(`/logistics/${newId}`);
});

exports.updateLogistics = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const data = {
    lpi_skoru: parseFloat(req.body.lpi_skoru),
    gumruk_bekleme_suresi_gun: parseFloat(req.body.gumruk_bekleme_suresi_gun),
    konteyner_ihracat_maliyeti_usd: parseFloat(req.body.konteyner_ihracat_maliyeti_usd)
  };

  const updated = await LogisticsModel.update(id, data);
  
  if (!updated) {
    return next(new AppError('Lojistik verisi güncellenemedi', 404));
  }
  
  res.redirect(`/logistics/${id}`);
});

exports.deleteLogistics = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const deleted = await LogisticsModel.delete(id);
  
  if (!deleted) {
    return next(new AppError('Lojistik verisi silinemedi', 404));
  }
  
  res.redirect('/logistics');
});

exports.getLogisticsAPI = catchAsync(async (req, res, next) => {
  const logistics = await LogisticsModel.getAll();

  res.status(200).json({
    status: 'success',
    results: logistics.length,
    data: { logistics }
  });
});
