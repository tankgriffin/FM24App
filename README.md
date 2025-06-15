# FM24 Companion - Tactical Assistant Web App

A comprehensive tactical assistant web application for Football Manager 2024 players. Analyze your squad, create tactical boards, plan matches, and get AI-powered tactical advice.

## 🚀 Features

### 📊 **Dashboard**
- Overview of your squad statistics
- Quick access to all major features
- Recent activity and saved tactics summary

### 👥 **Squad Analysis**
- Import FM24 squad data (CSV/HTML export)
- Comprehensive role scoring for 43+ FM24 roles
- Player filtering and sorting capabilities
- Attribute-based role recommendations

### 🎯 **Tactical Board**
- Interactive formation builder with 11 draggable players
- Multiple formation presets (4-4-2, 4-3-3, 3-5-2, 4-2-3-1, 5-3-2)
- Movement arrows with Shift+click
- Smart positioning with overlap detection
- Save and load tactical setups

### 📅 **Match Planner**
- Plan upcoming matches with opponent analysis
- 12 tactical philosophies and 10 opponent formations
- Match importance levels and detailed notes
- Integration with tactical boards

### 🤖 **AI Assistant** (Powered by Claude 3 Opus)
- Real-time tactical advice based on your squad
- Contextual responses using your tactical philosophy
- Quick suggestions for common scenarios
- Formation and player role recommendations

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/FM24App.git
cd FM24App
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables (Optional - for AI Assistant)
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Claude API key
REACT_APP_CLAUDE_API_KEY=your_claude_api_key_here
```

Get your Claude API key from [Anthropic Console](https://console.anthropic.com/)

### 4. Start Development Server
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 📱 Usage Guide

### Importing Squad Data
1. Export your FM24 squad data as CSV or HTML
2. Navigate to **Squad Analysis** page
3. Click **"Import Squad Data"** and select your file
4. View role scores and player recommendations

### Creating Tactics
1. Go to **Tactical Board** page
2. Select a formation from the dropdown
3. Drag players to desired positions
4. Add movement arrows with Shift+click
5. Save your tactical setup

### Match Planning
1. Visit **Match Planner** page
2. Add upcoming matches with opponent details
3. Select tactical philosophy and opponent formation
4. Add notes and set match importance
5. Link to tactical boards for specific setups

### Using AI Assistant
1. Ensure you have set up your Claude API key
2. Navigate to **AI Assistant** page
3. Configure your tactical philosophy in settings
4. Ask questions about tactics, formations, or players
5. Use quick suggestions for common scenarios

## 🎨 Features in Detail

### Role Scoring System
The app includes comprehensive role scoring for all FM24 positions:
- **Goalkeepers**: Goalkeeper, Sweeper Keeper
- **Defenders**: Centre-Back, Ball-Playing Defender, Libero, Full-Back, Wing-Back, etc.
- **Midfielders**: Deep Lying Playmaker, Box-to-Box, Anchor Man, Advanced Playmaker, etc.
- **Forwards**: Target Man, False 9, Inside Forward, Winger, etc.

### Smart Tactical Board
- **Formation Presets**: Quick setup with popular formations
- **Drag & Drop**: Intuitive player positioning
- **Movement Arrows**: Visualize player runs and movements
- **Overlap Detection**: Automatic positioning adjustments
- **Save System**: Store and recall tactical setups

### AI-Powered Insights
- **Contextual Advice**: Responses based on your actual squad data
- **Tactical Philosophy**: Personalized recommendations
- **Formation Analysis**: Best setups for your players
- **Match Preparation**: Opponent-specific tactical advice

## 🔧 Technical Stack

- **Frontend**: React 18 with functional components and hooks
- **Styling**: TailwindCSS for responsive design
- **Routing**: React Router for navigation
- **State Management**: React Context API
- **Data Processing**: PapaParse for CSV handling
- **AI Integration**: Anthropic Claude 3 Opus API
- **Icons**: Lucide React icon library

## 🌙 Dark Mode Support

The app includes full dark mode support with automatic theme detection and manual toggle options.

## 📱 Mobile Responsive

Fully responsive design that works on desktop, tablet, and mobile devices.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Football Manager 2024 by Sports Interactive
- Anthropic for Claude AI API
- The FM community for tactical insights and feedback

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/FM24App/issues) page
2. Create a new issue with detailed information
3. Include your browser console logs if reporting bugs

---

**Made with ⚽ for the Football Manager community** 