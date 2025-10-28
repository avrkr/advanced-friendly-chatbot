const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  messageType: {
    type: String,
    enum: ['text', 'question', 'greeting', 'emotional'],
    default: 'text'
  }
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  botName: {
    type: String,
    required: true,
    default: 'Alex'
  },
  messages: [messageSchema],
  conversationStyle: {
    type: String,
    enum: ['friendly', 'professional', 'funny', 'supportive'],
    default: 'friendly'
  },
  mood: {
    type: String,
    enum: ['happy', 'calm', 'excited', 'thoughtful'],
    default: 'calm'
  },
  context: {
    lastTopics: [String],
    userPreferences: Map,
    emotionalState: String
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

// Index for faster queries
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ 'messages.timestamp': -1 });

conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update context with last 3 topics
  const userMessages = this.messages
    .filter(msg => msg.sender === 'user')
    .slice(-5)
    .map(msg => msg.content.substring(0, 50));
  
  this.context.lastTopics = userMessages;
  next();
});

// Static method to get conversation summary
conversationSchema.statics.getConversationSummary = async function(userId) {
  const conversation = await this.findOne({ userId });
  if (!conversation) return null;
  
  return {
    totalMessages: conversation.messages.length,
    lastActivity: conversation.updatedAt,
    botName: conversation.botName,
    style: conversation.conversationStyle
  };
};

module.exports = mongoose.model('Conversation', conversationSchema);