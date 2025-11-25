const handleSaveError = (err, data, next) => {
  const { name, code } = err;
  err.status = name === 'MongoServerError' && code === 11000 ? 409 : 400;
  next();
};

const preUpdate = function (next) {
  this.options.new = true;
  // добавляем проверку по mongoose схемме, так как по умолчанию она делает проверку только при добавлении нового объекта а при обновлении не делает
  this.options.runValidators = true;
  next();
};

module.exports = { handleSaveError, preUpdate };
