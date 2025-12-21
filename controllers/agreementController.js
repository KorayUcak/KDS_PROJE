const AgreementModel = require('../models/agreementModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAgreementsList = catchAsync(async (req, res, next) => {
  const [agreements, statistics] = await Promise.all([
    AgreementModel.getAll(),
    AgreementModel.getStatistics()
  ]);

  res.render('agreements/index', {
    title: 'Anlaşma Tipleri - KDS',
    activePage: 'agreements',
    breadcrumb: [{ name: 'Anlaşma Tipleri', url: '/agreements' }],
    agreements,
    statistics,
    hasData: agreements.length > 0
  });
});

exports.getAgreementDetail = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const [agreement, countries] = await Promise.all([
    AgreementModel.getById(id),
    AgreementModel.getCountriesByAgreement(id)
  ]);
  
  if (!agreement) {
    return next(new AppError('Anlaşma tipi bulunamadı', 404));
  }

  res.render('agreements/detail', {
    title: `${agreement.anlasma_adi} - Anlaşma Detay`,
    activePage: 'agreements',
    breadcrumb: [
      { name: 'Anlaşma Tipleri', url: '/agreements' },
      { name: agreement.anlasma_adi, url: `/agreements/${id}` }
    ],
    agreement,
    countries,
    hasCountries: countries.length > 0
  });
});

exports.getAgreementEditForm = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const agreement = await AgreementModel.getById(id);
  
  if (!agreement) {
    return next(new AppError('Anlaşma tipi bulunamadı', 404));
  }

  res.render('agreements/edit', {
    title: `${agreement.anlasma_adi} - Anlaşma Düzenle`,
    activePage: 'agreements',
    breadcrumb: [
      { name: 'Anlaşma Tipleri', url: '/agreements' },
      { name: agreement.anlasma_adi, url: `/agreements/${id}` },
      { name: 'Düzenle', url: `/agreements/${id}/edit` }
    ],
    agreement
  });
});

exports.getAgreementCreateForm = catchAsync(async (req, res, next) => {
  res.render('agreements/create', {
    title: 'Yeni Anlaşma Tipi Ekle',
    activePage: 'agreements',
    breadcrumb: [
      { name: 'Anlaşma Tipleri', url: '/agreements' },
      { name: 'Yeni Ekle', url: '/agreements/create' }
    ]
  });
});

exports.createAgreement = catchAsync(async (req, res, next) => {
  const data = {
    anlasma_adi: req.body.anlasma_adi,
    anlasma_kodu: req.body.anlasma_kodu
  };

  const newId = await AgreementModel.create(data);
  
  res.redirect(`/agreements/${newId}`);
});

exports.updateAgreement = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const data = {
    anlasma_adi: req.body.anlasma_adi,
    anlasma_kodu: req.body.anlasma_kodu
  };

  const updated = await AgreementModel.update(id, data);
  
  if (!updated) {
    return next(new AppError('Anlaşma tipi güncellenemedi', 404));
  }
  
  res.redirect(`/agreements/${id}`);
});

exports.deleteAgreement = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const deleted = await AgreementModel.delete(id);
  
  if (!deleted) {
    return next(new AppError('Anlaşma tipi silinemedi', 404));
  }
  
  res.redirect('/agreements');
});

exports.getAgreementsAPI = catchAsync(async (req, res, next) => {
  const agreements = await AgreementModel.getAll();

  res.status(200).json({
    status: 'success',
    results: agreements.length,
    data: { agreements }
  });
});
