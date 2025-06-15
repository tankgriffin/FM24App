import React, { useState } from 'react';
import { useSquad } from '../contexts/SquadContext';
import { useTactics } from '../contexts/TacticsContext';
import { 
  MessageCircle, 
  Send, 
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

const Assistant = () => {
  const { players } = useSquad();
  const { currentBoard, savedBoards } = useTactics();


  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your FM24 tactical assistant powered by Claude 3 Opus. I can help you with squad analysis, tactical advice, and formation suggestions based on your current data. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPhilosophySettings, setShowPhilosophySettings] = useState(false);
  const [tacticalPhilosophy, setTacticalPhilosophy] = useState(
    localStorage.getItem('fm24-tactical-philosophy') || 
    'Balanced approach with emphasis on possession and quick transitions'
  );

  const quickSuggestions = [
    {
      text: "Analyze my squad strengths",
      icon: Users,
      prompt: "Can you analyze my current squad and tell me about the strengths and weaknesses?"
    },
    {
      text: "Suggest best formation",
      icon: Zap,
      prompt: "Based on my squad, what formation would you recommend and why?"
    },
    {
      text: "Player role recommendations",
      icon: TrendingUp,
      prompt: "Can you suggest the best roles for my key players?"
    },
    {
      text: "Tactical advice",
      icon: Lightbulb,
      prompt: "What tactical adjustments should I consider for my next match?"
    }
  ];

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get tactical philosophy from localStorage or use default
      const tacticalPhilosophy = localStorage.getItem('fm24-tactical-philosophy') || 
        'Balanced approach with emphasis on possession and quick transitions';

      // Prepare squad summary
      const squadSummary = players.length > 0 
        ? `Squad of ${players.length} players with key roles: ${players.slice(0, 5).map(p => `${p.Name} (${p.Position || 'Unknown'})`).join(', ')}${players.length > 5 ? '...' : ''}`
        : 'No squad data imported yet';

      // Prepare current tactic info
      const currentTactic = currentBoard 
        ? `Formation: ${currentBoard.myTeam?.formation || 'Unknown'}, Saved tactics: ${savedBoards.length}`
        : `No current tactic set, Saved tactics: ${savedBoards.length}`;

      // Construct the prompt
      const prompt = `You are my FM24 Assistant Coach. You help with tactical decisions, formations, and squad roles based on Football Manager 2024 logic.

Here is my tactical philosophy:
${tacticalPhilosophy}

Here is my current squad:
${squadSummary}

Here is my current tactic:
${currentTactic}

User's question:
${message}`;

      // Check if we have an API key
      const apiKey = process.env.REACT_APP_CLAUDE_API_KEY;
      
      if (!apiKey) {
        throw new Error('No API key configured');
      }

      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.content[0].text;

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Claude API Error:', error);
      
      // Fallback to simulated response on error
      const contextInfo = {
        playerCount: players.length,
        hasSquadData: players.length > 0,
        currentFormation: currentBoard?.myTeam?.formation || 'None',
        savedTactics: savedBoards.length
      };

      let fallbackResponse = "I'm sorry, I'm having trouble connecting to my AI assistant right now. ";
      
      if (!process.env.REACT_APP_CLAUDE_API_KEY) {
        fallbackResponse += "It looks like the Claude API key hasn't been configured. Please add your API key to the .env file as REACT_APP_CLAUDE_API_KEY.\n\n";
      }
      
      fallbackResponse += generateContextualResponse(message, contextInfo);

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContextualResponse = (message, context) => {
    const lowerMessage = message.toLowerCase();
    
    if (!context.hasSquadData) {
      return "I notice you haven't imported your squad data yet. To provide personalized tactical advice, please upload your FM24 squad export in the Squad Analysis section. Once you do that, I can give you specific recommendations about formations, player roles, and tactical setups!";
    }

    if (lowerMessage.includes('formation') || lowerMessage.includes('tactic')) {
      return `Based on your squad of ${context.playerCount} players, I can see you're currently using a ${context.currentFormation} formation. For tactical analysis, I'd need to know more about your playing style preferences. Do you prefer:

- Possession-based football with patient build-up
- High-intensity pressing and quick transitions  
- Defensive solidity with counter-attacking
- Wide play with crossing and wing-based attacks

Also, what's your team's main weakness you'd like to address?`;
    }

    if (lowerMessage.includes('squad') || lowerMessage.includes('player')) {
      return `Your squad has ${context.playerCount} players imported. Here are some general observations:

**Squad Analysis Tips:**
- Check your role scores in the Squad Analysis section
- Look for players with versatility (good scores in multiple roles)
- Identify any positional gaps where you might need reinforcements
- Consider age profiles for squad planning

**Key Questions to Consider:**
- Which positions have the lowest average role scores?
- Do you have adequate cover for key positions?
- Are there any standout players who should be tactical focal points?

Would you like me to focus on any specific area of your squad?`;
    }

    if (lowerMessage.includes('role') || lowerMessage.includes('position')) {
      return `For player role optimization:

**Role Assignment Strategy:**
1. **Primary Role**: Each player's highest-scoring role
2. **Secondary Role**: Alternative positions for rotation/injuries
3. **Tactical Flexibility**: Players who can adapt to multiple systems

**Key Considerations:**
- Match player attributes to role requirements
- Consider personality traits and preferred moves
- Factor in physical attributes for specific roles
- Think about partnerships (e.g., DLP + BWM in midfield)

Use the Squad Analysis filters to sort by specific roles and see your best options for each position.`;
    }

    // Default response
    return `I'm here to help with your tactical decisions! With ${context.playerCount} players in your squad and ${context.savedTactics} saved tactics, there's plenty we can analyze.

**I can help you with:**
- Formation recommendations based on your squad
- Player role optimization
- Tactical matchup analysis
- Squad strengths and weaknesses
- Training focus suggestions

**To get started, try asking:**
- "What's my best starting XI?"
- "How should I set up against stronger opposition?"
- "Which players need role changes?"
- "What formation suits my squad best?"

What specific aspect would you like to explore?`;
  };

  const handleQuickSuggestion = (suggestion) => {
    handleSendMessage(suggestion.prompt);
  };

  const saveTacticalPhilosophy = () => {
    localStorage.setItem('fm24-tactical-philosophy', tacticalPhilosophy);
    setShowPhilosophySettings(false);
    
    const systemMessage = {
      id: Date.now(),
      type: 'assistant',
      content: `✅ Tactical philosophy updated! I'll now provide advice based on your "${tacticalPhilosophy}" approach.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Assistant
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get tactical advice and squad analysis powered by AI
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowPhilosophySettings(!showPhilosophySettings)}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            ⚙️ Philosophy Settings
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Bot className="w-5 h-5 inline mr-1" />
            Claude 3 Opus
          </div>
        </div>
      </div>

      {/* Philosophy Settings */}
      {showPhilosophySettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tactical Philosophy Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your preferred tactical approach:
              </label>
              <textarea
                value={tacticalPhilosophy}
                onChange={(e) => setTacticalPhilosophy(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., High-pressing, possession-based football with quick transitions and emphasis on wing play..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPhilosophySettings(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveTacticalPhilosophy}
                className="btn-primary"
              >
                Save Philosophy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col h-96">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Ask about tactics, formations, player roles..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Quick Suggestions
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Click any suggestion to get instant advice
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickSuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="flex items-center space-x-3 p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {suggestion.text}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Get AI-powered insights
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* API Key Status */}
      {!process.env.REACT_APP_CLAUDE_API_KEY && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Bot className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Claude API Setup Required:</p>
              <p className="mb-2">
                To enable AI-powered responses, add your Claude API key to a <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env</code> file:
              </p>
              <code className="block bg-yellow-100 dark:bg-yellow-800 p-2 rounded text-xs">
                REACT_APP_CLAUDE_API_KEY=your_api_key_here
              </code>
              <p className="mt-2 text-xs">
                Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Context Info */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Pro Tip:</p>
            <p>
              The more specific your questions, the better advice I can provide. Include details about your playing style, 
              opponent analysis, or specific tactical challenges you're facing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant; 