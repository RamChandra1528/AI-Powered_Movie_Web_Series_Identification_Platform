import React, { useState, useEffect } from 'react';
import { Settings, Key, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { aiService } from '../services/aiService';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettings: React.FC<AISettingsProps> = ({ isOpen, onClose }) => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: 'success' | 'error' | 'idle'}>({});

  useEffect(() => {
    // Load saved API keys
    setOpenaiKey(localStorage.getItem('openai_api_key') || '');
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    setSelectedProvider(aiService.getCurrentProvider());
  }, [isOpen]);

  const handleSaveApiKey = (provider: string, apiKey: string) => {
    if (apiKey.trim() && aiService.setApiKey(provider, apiKey)) {
      setConnectionStatus(prev => ({ ...prev, [provider]: 'success' }));
    } else {
      setConnectionStatus(prev => ({ ...prev, [provider]: 'error' }));
    }
  };

  const testConnection = async (provider: string) => {
    setIsTestingConnection(true);
    setConnectionStatus(prev => ({ ...prev, [provider]: 'idle' }));

    try {
      const testInput = {
        type: 'text' as const,
        content: 'The Matrix',
        query: 'Test connection'
      };

      aiService.setProvider(provider);
      const response = await aiService.identifyContent(testInput);
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        [provider]: response.success ? 'success' : 'error' 
      }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [provider]: 'error' }));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    aiService.setProvider(provider);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-gray-700/50 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Settings className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Configuration</h2>
              <p className="text-gray-400 text-sm">Configure AI providers for content identification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8">
          {/* Provider Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={20} className="text-blue-400" />
              AI Provider
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleProviderChange('openai')}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  selectedProvider === 'openai'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-semibold">OpenAI GPT-4 Vision</div>
                <div className="text-sm opacity-75">Advanced image & text analysis</div>
              </button>
              <button
                onClick={() => handleProviderChange('gemini')}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  selectedProvider === 'gemini'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-semibold">Google Gemini Vision</div>
                <div className="text-sm opacity-75">Multimodal AI capabilities</div>
              </button>
            </div>
          </div>

          {/* API Keys Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Key size={20} className="text-green-400" />
              API Keys
            </h3>
            
            <div className="space-y-6">
              {/* OpenAI API Key */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  OpenAI API Key
                </label>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    onClick={() => handleSaveApiKey('openai', openaiKey)}
                    className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => testConnection('openai')}
                    disabled={isTestingConnection || !openaiKey}
                    className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Test
                  </button>
                </div>
                {connectionStatus.openai && (
                  <div className={`flex items-center gap-2 text-sm ${
                    connectionStatus.openai === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {connectionStatus.openai === 'success' ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    {connectionStatus.openai === 'success' ? 'Connection successful' : 'Connection failed'}
                  </div>
                )}
              </div>

              {/* Gemini API Key */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Google Gemini API Key
                </label>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIza..."
                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    onClick={() => handleSaveApiKey('gemini', geminiKey)}
                    className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => testConnection('gemini')}
                    disabled={isTestingConnection || !geminiKey}
                    className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Test
                  </button>
                </div>
                {connectionStatus.gemini && (
                  <div className={`flex items-center gap-2 text-sm ${
                    connectionStatus.gemini === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {connectionStatus.gemini === 'success' ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    {connectionStatus.gemini === 'success' ? 'Connection successful' : 'Connection failed'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold mb-2">Getting API Keys:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <strong>OpenAI:</strong> Visit platform.openai.com → API Keys → Create new key</li>
              <li>• <strong>Google Gemini:</strong> Visit makersuite.google.com → Get API Key</li>
              <li>• API keys are stored locally in your browser for security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};