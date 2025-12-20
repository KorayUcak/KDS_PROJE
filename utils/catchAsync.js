/**
 * Async fonksiyonları saran wrapper
 * Try-catch bloklarını ortadan kaldırır
 * Hataları otomatik olarak error handling middleware'e iletir
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
