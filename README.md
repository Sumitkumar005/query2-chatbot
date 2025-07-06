# Visamonk.ai University Chatbot

A production-ready AI-powered university chatbot built with Next.js frontend and Python backend integration, featuring 3D UI/UX, multilingual support, and comprehensive university information management.

## 🚀 Features

### Frontend (Next.js)
- **3D Interactive Interface**: React Three Fiber implementation with animated chatbot robot
- **Modern UI/UX**: Matches Dora.ai designs with gradient backgrounds and floating elements
- **Real-time Chat**: Interactive chat interface with typing indicators and message history
- **Multilingual Support**: Language selector with translation capabilities (English, Hindi, Spanish, French, German)
- **Audio Features**: Text-to-speech playback for bot responses
- **Feedback System**: Thumbs up/down rating system for responses
- **Follow-up Questions**: AI-generated contextual suggestions
- **JWT Authentication**: Secure login system for users and administrators
- **Admin Panel**: File upload, web scraping, and data management interface

### Backend Integration
- **Python Child Processes**: Seamless integration with existing Python functionality
- **RAG Pipeline**: Retrieval-Augmented Generation using FAISS and Google Gemini
- **SQL Query Generation**: Natural language to SQL conversion for structured data
- **Web Scraping**: Tavily API integration for dynamic content acquisition
- **Database Management**: SQLite for universities and conversation history
- **File Processing**: Support for CSV, XLSX, SQL, PDF, and TXT files

### Production Features
- **Error Handling**: Comprehensive error boundaries and fallback responses
- **Security**: JWT tokens, input validation, and secure API endpoints
- **Scalability**: Modular architecture ready for cloud deployment
- **Logging**: Detailed logging for debugging and monitoring
- **CORS Support**: Cross-origin resource sharing configuration

## 🛠 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Google Gemini API key
- Tavily API key

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd visamonk-university-chatbot
   \`\`\`

2. **Install Node.js dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Install Python dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Environment Variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   GOOGLE_API_KEY=your-google-gemini-api-key
   TAVILY_API_KEY=your-tavily-api-key
   JWT_SECRET=your-jwt-secret-key
   \`\`\`

5. **Initialize Database**
   The SQLite database will be automatically created on first run.

6. **Run the application**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
visamonk-university-chatbot/
├── app/
│   ├── page.tsx                 # Landing page with 3D hero section
│   ├── chat/
│   │   └── page.tsx            # Main chat interface
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts        # Chat processing endpoint
│   │   ├── tts/
│   │   │   └── route.ts        # Text-to-speech generation
│   │   ├── admin/
│   │   │   ├── scrape/
│   │   │   │   └── route.ts    # Web scraping endpoint
│   │   │   ├── upload/
│   │   │   │   └── route.ts    # File upload processing
│   │   │   └── reindex/
│   │   │       └── route.ts    # Data reindexing
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.ts    # User authentication
│   │       └── verify/
│   │           └── route.ts    # Token verification
│   └── layout.tsx              # Root layout with providers
├── components/
│   ├── robot-3d.tsx           # 3D robot component
│   ├── floating-particles.tsx  # 3D particle effects
│   ├── login-dialog.tsx        # Authentication modal
│   └── ui/                     # Shadcn UI components
├── hooks/
│   └── use-auth.tsx            # Authentication context
├── scripts/
│   ├── chat_processor.py       # Main chat processing logic
│   ├── tts_generator.py        # Text-to-speech generation
│   ├── web_scraper.py          # Website scraping functionality
│   ├── file_processor.py       # File upload processing
│   └── data_indexer.py         # FAISS indexing system
├── data/                       # SQLite database and files
├── scraped_data/              # Web scraped content
├── vectorstore/               # FAISS index and embeddings
└── requirements.txt           # Python dependencies
\`\`\`

## 🔧 Configuration

### Database Schema

**Universities Table:**
\`\`\`sql
CREATE TABLE universities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    university TEXT,
    program TEXT,
    tuition INTEGER,
    location TEXT,
    visa_service TEXT
);
\`\`\`

**Conversation History:**
\`\`\`sql
CREATE TABLE conversation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT,
    response TEXT,
    timestamp TEXT
);
\`\`\`

### API Endpoints

- `POST /api/chat` - Process chat messages
- `POST /api/tts` - Generate text-to-speech audio
- `POST /api/admin/scrape` - Scrape websites (admin only)
- `POST /api/admin/upload` - Upload files (admin only)
- `POST /api/admin/reindex` - Reindex data (admin only)
- `POST /api/auth/login` - User authentication
- `GET /api/auth/verify` - Token verification

## 👨‍💼 Admin Features

### Authentication
- **Default Admin Credentials:**
  - Email: `admin@visamonk.ai`
  - Password: `admin123`

### Admin Panel Features
1. **Web Scraping**: Enter URLs to scrape content using Tavily API
2. **File Upload**: Support for CSV, XLSX, SQL, PDF, and TXT files
3. **Data Management**: Reindex FAISS embeddings and manage database
4. **File Processing**: Automatic processing and categorization of uploaded content

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables in Vercel**
   \`\`\`
   GOOGLE_API_KEY=your-google-gemini-api-key
   TAVILY_API_KEY=your-tavily-api-key
   JWT_SECRET=your-jwt-secret-key
   \`\`\`

### Python Dependencies
Ensure Python runtime is available for subprocess calls. For serverless deployment, consider using:
- Vercel Functions with Python runtime
- Docker containers for complex Python dependencies
- External Python API services

## 🔍 Usage Examples

### Chat Queries
- "What programs does MIT offer?"
- "What are the tuition fees for Computer Science?"
- "Tell me about visa requirements for F-1 students"
- "How do I apply for a student visa?"
- "Which universities offer scholarships?"

### Admin Operations
1. **Upload university data**: CSV/XLSX files with university information
2. **Scrape websites**: Extract content from university websites
3. **Process documents**: Upload PDF documents for content extraction
4. **Reindex data**: Update FAISS embeddings for improved search

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: admin@visamonk.ai

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Tavily API for web scraping
- React Three Fiber for 3D graphics
- Shadcn/ui for UI components
- FAISS for vector similarity search
#   s u m i t 2 - q u e r y - c h a t b o t  
 