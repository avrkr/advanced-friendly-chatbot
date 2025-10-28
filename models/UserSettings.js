const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  botName: {
    type: String,
    required: true,
    default: 'Alex',
    trim: true,
    maxlength: 30
  },
  conversationStyle: {
    type: String,
    enum: ['friendly', 'professional', 'funny', 'supportive', 'enthusiastic'],
    default: 'friendly'
  },
  personalityTraits: [{
    type: String,
    enum: ['humorous', 'empathetic', 'curious', 'encouraging', 'wise', 'playful']
  }],
  preferences: {
    useEmojis: { type: Boolean, default: true },
    askQuestions: { type: Boolean, default: true },
    shareFacts: { type: Boolean, default: false },
    memoryEnabled: { type: Boolean, default: true }
  },
  userInfo: {
    name: String,
    interests: [String],
    mood: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set default personality traits based on conversation style
userSettingsSchema.pre('save', function(next) {
  if (!this.personalityTraits || this.personalityTraits.length === 0) {
    const styleTraits = {
      'friendly': ['empathetic', 'curious', 'encouraging'],
      'professional': ['wise', 'curious'],
      'funny': ['humorous', 'playful'],
      'supportive': ['empathetic', 'encouraging', 'wise'],
      'enthusiastic': ['playful', 'curious', 'encouraging']
    };
    this.personalityTraits = styleTraits[this.conversationStyle] || ['empathetic', 'curious'];
  }
  next();
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);