const LogModel = require('../models/logModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Log Controller
 * Sistem log işlemleri
 */

// Tüm logları getir
exports.getAllLogs = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  const logs = await LogModel.getAll(limit, offset);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: { logs }
  });
});

// Kullanıcıya ait logları getir
exports.getUserLogs = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  const logs = await LogModel.getByUserId(userId, limit);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: { logs }
  });
});

// İşlem tipine göre logları getir
exports.getLogsByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  const logs = await LogModel.getByType(type, limit);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: { logs }
  });
});

// Seviyeye göre logları getir
exports.getLogsByLevel = catchAsync(async (req, res, next) => {
  const { level } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  // Seviye doğrulama
  const validLevels = ['info', 'warning', 'error', 'debug'];
  if (!validLevels.includes(level)) {
    return next(new AppError('Geçersiz log seviyesi', 400));
  }

  const logs = await LogModel.getByLevel(level, limit);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: { logs }
  });
});

// Tarih aralığına göre logları getir
exports.getLogsByDateRange = catchAsync(async (req, res, next) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return next(new AppError('Başlangıç ve bitiş tarihi gereklidir', 400));
  }

  const logs = await LogModel.getByDateRange(start, end);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: { logs }
  });
});

// Log istatistikleri
exports.getLogStats = catchAsync(async (req, res, next) => {
  const stats = await LogModel.getStats();

  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

// Eski logları temizle (Admin only)
exports.cleanOldLogs = catchAsync(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;

  const deletedCount = await LogModel.deleteOldLogs(days);

  // Bu işlemi de logla
  await LogModel.info('LOG_CLEANUP', `${deletedCount} eski log kaydı silindi`, null, req.ip);

  res.status(200).json({
    status: 'success',
    message: `${deletedCount} log kaydı silindi`,
    data: { deletedCount }
  });
});

// Manuel log ekleme (API üzerinden)
exports.createLog = catchAsync(async (req, res, next) => {
  const { kullanici_id, islem_tipi, detay, seviye } = req.body;

  if (!islem_tipi) {
    return next(new AppError('İşlem tipi zorunludur', 400));
  }

  const logId = await LogModel.create({
    kullanici_id,
    islem_tipi,
    detay,
    ip_adresi: req.ip,
    seviye: seviye || 'info'
  });

  res.status(201).json({
    status: 'success',
    message: 'Log kaydı oluşturuldu',
    data: { logId }
  });
});
