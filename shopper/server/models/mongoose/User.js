const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
  email: {
    // Trim and lowercase
    type: String, required: true, index: { unique: true }, lowercase: true, trim: true,
  },
  password: {
    type: String, required: true, trim: true,
  },
}, { timestamps: true });

async function generateHash(password) {
  const COST = 12;
  return bcrypt.hash(password, COST);
}

// hook: be executed before the document is saved. It's used to modify the data before it's saved.
UserSchema.pre('save', function preSave(next) {
  const user = this;

  // Only create a new password hash if the field was updated
  if(user.isModified('password')) {
    return generateHash(user.password).then(hash => {
      user.password = hash;
      return next();
    }).catch(error => {
      return next(error);
    });
  }
  return next();
});

// compare the provided password (plain text) with the one in the database (hashed)
UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);