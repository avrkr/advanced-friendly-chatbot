const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');
const UserSettings = require('../models/UserSettings');
const { chatLimiter, validateUser } = require('../middleware/auth');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Personality templates based on style
const PERSONALITY_TEMPLATES = {
  friendly: `
You are {botName}, a warm, friendly, and empathetic chatbot friend. Your personality traits: {traits}.

Guidelines:
1. Be conversational and casual - use contractions, emojis when appropriate
2. Show genuine interest in the user's feelings and experiences
3. Use gentle humor when appropriate
4. Ask thoughtful follow-up questions
5. Be supportive and encouraging
6. Share brief, relatable anecdotes when relevant
7. Remember context from previous messages
8. Use the user's name if they've shared it
9. Be like a good friend who's always there to listen

Conversation history:
  `,

  professional: `
You are {botName}, a professional and knowledgeable assistant. Your personality traits: {traits}.

Guidelines:
1. Be clear, concise, and professional
2. Provide well-structured responses
3. Ask clarifying questions when needed
4. Maintain appropriate boundaries
5. Offer helpful insights and information
6. Be respectful and polite
7. Use proper grammar and formatting

Conversation history:
  `,

  funny: `
You are {botName}, a witty and humorous chatbot friend. Your personality traits: {traits}.

Guidelines:
1. Be playful and use humor frequently
2. Use emojis and lighthearted language
3. Don't be afraid to be silly when appropriate
4. Keep jokes positive and inclusive
5. Balance humor with genuine care
6. Use pop culture references occasionally
7. Make the conversation fun and engaging

Conversation history:
  `,

  supportive: `
You are {botName}, a caring and supportive companion. Your personality traits: {traits}.

Guidelines:
1. Be exceptionally empathetic and understanding
2. Focus on emotional support and validation
3. Use calming and reassuring language
4. Offer practical advice when appropriate
5. Be patient and non-judgmental
6. Encourage self-care and positive thinking
7. Remember emotional context from previous messages

Conversation history:
  `,

  enthusiastic: `
You are {botName}, an energetic and enthusiastic friend! Your personality traits: {traits}.

Guidelines:
1. Be highly energetic and positive
2. Use exclamation points and excited language
3. Show lots of enthusiasm for the user's interests
4. Be incredibly encouraging and motivational
5. Use lots of emojis and expressive language
6. Keep the energy level high but genuine
7. Celebrate small things with the user

Conversation history:
  `
};

// Generate dynamic prompt based on user settings
function generatePrompt(userSettings, conversationHistory, userMessage) {
  const template = PERSONALITY_TEMPLATES[userSettings.conversationStyle] || PERSONALITY_TEMPLATES.friendly;
  
  const traits = userSettings.personalityTraits.join(', ');
  let prompt = template
    .replace('{botName}', userSettings.botName)
    .replace('{traits}', traits);

  // Add user context if available
  if (userSettings.userInfo.name) {
    prompt += `\nUser's name: ${userSettings.userInfo.name}`;
  }
  if (userSettings.userInfo.interests && userSettings.userInfo.interests.length > 0) {
    prompt += `\nUser's interests: ${userSettings.userInfo.interests.join(', ')}`;
  }

  prompt += `\n\n${conversationHistory}\n\nUser: ${userMessage}\n${userSettings.botName}:`;

  return prompt;
}

// Chat endpoint
router.post('/', chatLimiter, validateUser, async (req, res) => {
  try {
    const { message, userId, updateSettings } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required',
        details: 'Please provide a non-empty message'
      });
    }

    // Get or create user settings
    let userSettings = await UserSettings.findOne({ userId });
    if (!userSettings) {
      userSettings = new UserSettings({ userId });
      await userSettings.save();
    }

    // Update settings if provided
    if (updateSettings) {
      Object.assign(userSettings, updateSettings);
      await userSettings.save();
    }

    // Get or create conversation
    let conversation = await Conversation.findOne({ userId });
    if (!conversation) {
      conversation = new Conversation({ 
        userId, 
        botName: userSettings.botName,
        conversationStyle: userSettings.conversationStyle 
      });
    }

    // Add user message
    conversation.messages.push({
      content: message.trim(),
      sender: 'user',
      messageType: 'text'
    });

    // Get recent conversation history for context
    const recentMessages = conversation.messages.slice(-8);
    const conversationHistory = recentMessages.map(msg => 
      `${msg.sender === 'user' ? 'User' : userSettings.botName}: ${msg.content}`
    ).join('\n');

    // Generate AI response
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = generatePrompt(userSettings, conversationHistory, message);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const botResponse = response.text().trim();

    // Add bot response to conversation
    conversation.messages.push({
      content: botResponse,
      sender: 'bot',
      messageType: 'text'
    });

    // Update conversation metadata
    conversation.botName = userSettings.botName;
    conversation.conversationStyle = userSettings.conversationStyle;
    await conversation.save();

    res.json({
      response: botResponse,
      userId,
      botName: userSettings.botName,
      conversationStyle: userSettings.conversationStyle,
      timestamp: new Date(),
      messageId: conversation.messages[conversation.messages.length - 1]._id
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Enhanced error handling
    let errorMessage = 'Sorry, I encountered an error. Please try again! 😊';
    let statusCode = 500;

    if (error.message.includes('API_KEY_INVALID')) {
      errorMessage = 'AI service configuration error. Please check API settings. 🔧';
      statusCode = 503;
    } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Network connection issue. Please check your internet and try again! 🌐';
      statusCode = 503;
    }

    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user settings
router.get('/settings/:userId', validateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    
    let userSettings = await UserSettings.findOne({ userId });
    if (!userSettings) {
      userSettings = new UserSettings({ userId });
      await userSettings.save();
    }

    res.json(userSettings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user settings',
      details: error.message 
    });
  }
});

// Update user settings
router.put('/settings/:userId', validateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    let userSettings = await UserSettings.findOne({ userId });
    if (!userSettings) {
      userSettings = new UserSettings({ userId, ...updates });
    } else {
      Object.assign(userSettings, updates);
    }

    await userSettings.save();

    // Update all conversations with new bot name and style
    await Conversation.updateMany(
      { userId }, 
      { 
        botName: userSettings.botName,
        conversationStyle: userSettings.conversationStyle 
      }
    );

    res.json({
      message: 'Settings updated successfully',
      settings: userSettings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ 
      error: 'Failed to update settings',
      details: error.message 
    });
  }
});

// Get conversation history
router.get('/conversation/:userId', validateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const conversation = await Conversation.findOne({ userId });
    
    if (!conversation) {
      return res.json({ 
        messages: [], 
        summary: { totalMessages: 0, botName: 'Alex' } 
      });
    }

    const messages = conversation.messages
      .slice(-limit - offset, -offset || undefined)
      .reverse();

    const summary = await Conversation.getConversationSummary(userId);

    res.json({ 
      messages, 
      summary,
      botName: conversation.botName 
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversation',
      details: error.message 
    });
  }
});

// Clear conversation history
router.delete('/conversation/:userId', validateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Conversation.findOneAndDelete({ userId });
    
    res.json({ 
      message: 'Conversation history cleared successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({ 
      error: 'Failed to clear conversation',
      details: error.message 
    });
  }
});

// Get conversation statistics
router.get('/stats/:userId', validateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversation = await Conversation.findOne({ userId });
    if (!conversation) {
      return res.json({
        totalMessages: 0,
        userMessages: 0,
        botMessages: 0,
        firstMessage: null,
        lastMessage: null
      });
    }

    const userMessages = conversation.messages.filter(msg => msg.sender === 'user').length;
    const botMessages = conversation.messages.filter(msg => msg.sender === 'bot').length;

    res.json({
      totalMessages: conversation.messages.length,
      userMessages,
      botMessages,
      firstMessage: conversation.messages[0]?.timestamp,
      lastMessage: conversation.messages[conversation.messages.length - 1]?.timestamp,
      botName: conversation.botName
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
});

module.exports = router;