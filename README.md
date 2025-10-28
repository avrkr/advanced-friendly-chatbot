This looks like a fantastic, well-detailed project! Here's a beautifully formatted and easy-to-read document for your Advanced Friendly Chatbot. 🤖🤖 Advanced Friendly Chatbot: Your Highly Customizable AI FriendBuilt with Node.js, Express, MongoDB, and Google's Gemini AI.The Advanced Friendly Chatbot is a feature-rich, empathetic conversational agent designed to provide a truly personalized user experience. Acting like a real friend, this chatbot is customizable, intelligent, and built on a robust, modern tech stack.✨ Core Features🎭 Customizable PersonalityTailor your AI friend's persona to perfectly match your desired interaction style.FeatureDescriptionCustom Bot NamesName your AI friend anything you want!Multiple Conversation StylesChoose from five distinct, engaging personalities:  🤗 FriendlyWarm, empathetic, and casual.  💼 ProfessionalClear, structured, and formal.  😄 FunnyPlayful, humorous, and lighthearted.  🌟 SupportiveCaring, encouraging, and focused on emotional support.  🎉 EnthusiasticEnergetic, positive, and highly motivational.💾 Smart Memory & ContextThe chatbot remembers and adapts, ensuring conversations flow naturally and feel genuinely personal.Conversation History: Remembers your entire chat history.Context Awareness: Maintains context across messages for coherent replies.User Preferences: Saves your settings and preferences, like conversation style.Personalized Responses: Learns your interests and remembers your name.🎨 Advanced UI/UXA modern, responsive, and visually appealing interface for a seamless chat experience.Responsive Design: Works perfectly on all devices (mobile, tablet, desktop).Real-time Typing Indicators: Provides visual feedback when the bot is processing its response.Message Statistics: Track your conversation metrics (e.g., message count, average response time).Beautiful Animations: Smooth transitions and effects for an engaging feel.Customizable Themes: Modern gradient design for a sleek look.🔧 Technical RobustnessBuilt with best practices for stability, security, and performance.Rate Limiting: Prevents API abuse and ensures service stability.Error Handling: Graceful error recovery for a smooth user experience.MongoDB Integration: Efficient and scalable data storage for history and settings.RESTful API: Clean, well-documented, and easy-to-use endpoints.Security: Includes essential features like input validation and sanitization.🚀 Quick Start GuidePrerequisitesBefore you begin, ensure you have the following installed:Node.js (v16 or higher)MongoDB (v4.4 or higher, or a cloud service like Atlas)Google Gemini API keyInstallation & SetupClone the RepositoryBashgit clone https://github.com/avrkr/advanced-friendly-chatbot.git
cd advanced-friendly-chatbot
Install DependenciesBashnpm install
Environment SetupCopy the example file to create your local environment file:Bashcp .env.example .env
Update the following variables in the newly created .env file:Code snippet# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/advanced-chatbot # Your MongoDB connection string

# Gemini AI Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here # Your Google Gemini API Key

# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here # A long, random string for security

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
Start MongoDBIf running locally, start your MongoDB daemon:Bashmongod
Alternatively, ensure your MongoDB Atlas (cloud) instance is running and your MONGODB_URI is correct.Start the ApplicationModeCommandDescriptionDevelopmentnpm run devUses nodemon for automatic restarts on file changes.Productionnpm startStandard production execution.Access the ApplicationOpen your browser and navigate to: http://localhost:3000📁 Project StructureA clean, modular structure ensures maintainability and scalability.Plaintextadvanced-friendly-chatbot/
├── models/                     # MongoDB Data Models
│   ├── Conversation.js         # Schema for conversation history
│   └── UserSettings.js         # Schema for user preferences and settings
├── routes/                     # API Endpoints
│   └── chat.js                 # Chat and settings API logic
├── middleware/                 # Custom Middleware Functions
│   └── auth.js                 # Authentication and rate limiting logic
├── public/                     # Frontend Assets
│   ├── index.html              # Main HTML file (UI structure)
│   ├── style.css               # Application stylesheets
│   └── script.js               # Frontend JavaScript for interaction
├── .env                        # Environment variables (local config)
├── .gitignore                  # Git exclusion rules
├── package.json                # Dependencies and scripts
└── server.js                   # Main application entry point (Express setup)
🔌 API Endpoints ReferenceThe backend exposes a clean RESTful API for all chat and configuration needs.Chat & Settings EndpointsMethodEndpointDescriptionPOST/api/chatSend a message to the chatbot and get a response.GET/api/chat/settings/:userIdRetrieve the specified user's configuration.PUT/api/chat/settings/:userIdUpdate the user's settings (e.g., conversation style).GET/api/chat/conversation/:userIdFetch the full chat history for the user.DELETE/api/chat/conversation/:userIdClear the user's entire conversation history.GET/api/chat/stats/:userIdGet conversation statistics (e.g., message count).Health CheckMethodEndpointDescriptionGET/api/healthCheck the server's operational status.🎛️ Conversation Styles Deep DiveThe Customizable Personality feature is powered by the following system prompts:StyleIconKey Traits & FocusFriendly🤗Warm, empathetic, casual conversation, uses emojis and gentle language.Professional💼Clear, structured, formal language, focused on providing accurate information.Funny😄Playful, humorous, uses jokes, puns, and pop culture references.Supportive🌟Caring, encouraging, focused on emotional support, validating and understanding.Enthusiastic🎉High energy, extremely positive, uses excited language and lots of encouragement.🛠️ DevelopmentTo run the application with hot-reloading for rapid development:Bashnpm run dev
This command utilizes nodemon to automatically restart the server whenever file changes are detected.📞 Support & ContributionWe're here to help!If you encounter any issues, first check the troubleshooting section in the full documentation (not provided here).Search existing GitHub Issues to see if your problem has already been addressed.If your issue is new, please create a new issue on the GitHub repository with detailed information, including steps to reproduce, error messages, and your environment setup.
