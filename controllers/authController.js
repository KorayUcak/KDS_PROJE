const UserModel = require('../models/userModel');
const LogModel = require('../models/logModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Auth Controller
 * Kullanıcı kimlik doğrulama işlemleri
 */

// Login sayfasını göster
exports.getLoginPage = (req, res) => {
  res.render('users/login', {
    title: 'Giriş Yap - KDS'
  });
};

// Register sayfasını göster
exports.getRegisterPage = (req, res) => {
  res.render('users/register', {
    title: 'Kayıt Ol - KDS'
  });
};

// Login işlemi
exports.login = catchAsync(async (req, res, next) => {
  const { email, sifre } = req.body;

  // 1) Email ve şifre kontrolü
  if (!email || !sifre) {
    return next(new AppError('Lütfen email ve şifre giriniz', 400));
  }

  // 2) Kullanıcıyı bul
  const user = await UserModel.getByEmail(email);
  
  if (!user) {
    // Log: Başarısız giriş denemesi
    await LogModel.warning('LOGIN_FAILED', `Geçersiz email: ${email}`, null);
    return next(new AppError('Geçersiz email veya şifre', 401));
  }

  // 3) Şifre doğrulama (Gerçek projede bcrypt kullanılmalı)
  // TODO: bcrypt.compare(sifre, user.sifre_hash) kullanılacak
  if (user.sifre_hash !== sifre) {
    await LogModel.warning('LOGIN_FAILED', `Yanlış şifre - Kullanıcı: ${user.kullanici_id}`, user.kullanici_id);
    return next(new AppError('Geçersiz email veya şifre', 401));
  }

  // 4) Log: Başarılı giriş
  await LogModel.info('LOGIN_SUCCESS', `Kullanıcı giriş yaptı`, user.kullanici_id);

  // 5) Session oluştur (Gerçek projede express-session kullanılmalı)
  // TODO: req.session.user = { id: user.kullanici_id, ... }

  res.status(200).json({
    status: 'success',
    message: 'Giriş başarılı',
    data: {
      user: {
        id: user.kullanici_id,
        ad_soyad: user.ad_soyad,
        email: user.email,
        rol: user.rol
      }
    }
  });
});

// Register işlemi
exports.register = catchAsync(async (req, res, next) => {
  const { ad_soyad, email, sifre, sifre_tekrar } = req.body;

  // 1) Gerekli alan kontrolü
  if (!ad_soyad || !email || !sifre) {
    return next(new AppError('Tüm alanları doldurunuz', 400));
  }

  // 2) Şifre eşleşme kontrolü
  if (sifre !== sifre_tekrar) {
    return next(new AppError('Şifreler eşleşmiyor', 400));
  }

  // 3) Şifre uzunluk kontrolü
  if (sifre.length < 6) {
    return next(new AppError('Şifre en az 6 karakter olmalıdır', 400));
  }

  // 4) Email mevcut mu kontrol et
  const exists = await UserModel.exists(email);
  if (exists) {
    return next(new AppError('Bu email adresi zaten kullanılıyor', 400));
  }

  // 5) Şifreyi hashle (Gerçek projede bcrypt kullanılmalı)
  // TODO: const sifre_hash = await bcrypt.hash(sifre, 12);
  const sifre_hash = String(sifre); // String olduğundan emin ol

  // 6) Kullanıcı oluştur
  const userId = await UserModel.create({
    ad_soyad: String(ad_soyad),
    email: String(email),
    sifre_hash,
    rol: 'user'
  });

  // 7) Log: Yeni kayıt
  await LogModel.info('USER_REGISTER', `Yeni kullanıcı kaydı: ${ad_soyad}`, userId);

  // 8) Yeni kullanıcıyı getir
  const newUser = await UserModel.getById(userId);

  res.status(201).json({
    status: 'success',
    message: 'Kayıt başarılı',
    data: {
      user: {
        id: newUser.kullanici_id,
        ad_soyad: newUser.ad_soyad,
        email: newUser.email,
        rol: newUser.rol
      }
    }
  });
});

// Logout işlemi
exports.logout = catchAsync(async (req, res, next) => {
  // TODO: Session'dan kullanıcı ID'si alınacak
  const userId = req.body.userId || null;

  if (userId) {
    await LogModel.info('LOGOUT', 'Kullanıcı çıkış yaptı', userId, req.ip);
  }

  // TODO: req.session.destroy()

  res.status(200).json({
    status: 'success',
    message: 'Çıkış başarılı'
  });
});

// Mevcut kullanıcı bilgilerini getir
exports.getCurrentUser = catchAsync(async (req, res, next) => {
  // TODO: Session'dan kullanıcı ID'si alınacak
  const userId = req.params.id;

  const user = await UserModel.getById(userId);

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Şifre güncelleme
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { userId, mevcut_sifre, yeni_sifre, yeni_sifre_tekrar } = req.body;

  // 1) Kullanıcıyı bul
  const user = await UserModel.getByEmail(req.body.email);
  
  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  // 2) Mevcut şifre kontrolü
  // TODO: bcrypt.compare kullanılacak
  if (user.sifre_hash !== mevcut_sifre) {
    return next(new AppError('Mevcut şifre yanlış', 401));
  }

  // 3) Yeni şifre eşleşme kontrolü
  if (yeni_sifre !== yeni_sifre_tekrar) {
    return next(new AppError('Yeni şifreler eşleşmiyor', 400));
  }

  // 4) Şifreyi güncelle
  // TODO: bcrypt.hash kullanılacak
  await UserModel.updatePassword(user.id, yeni_sifre);

  // 5) Log
  await LogModel.info('PASSWORD_CHANGE', 'Şifre değiştirildi', user.id, req.ip);

  res.status(200).json({
    status: 'success',
    message: 'Şifre başarıyla güncellendi'
  });
});
