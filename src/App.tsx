import React, { useState } from 'react';
import { Search, Upload, Video, User, Star, Play, Clock, Calendar, Globe, Settings, Zap, Brain, ExternalLink } from 'lucide-react';
import { AISettings } from './components/AISettings';
import { aiService } from './services/aiService';
import { MovieResult, GoogleSearchResult } from './types/ai';


function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MovieResult[]>([]);
  const [googleResults, setGoogleResults] = useState<GoogleSearchResult[]>([]);
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'video' | 'actor'>('text');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [aiProvider, setAiProvider] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedFile) return;
    
    setIsSearching(true);
    setProcessingTime(0);
    
    try {
      const input = {
        type: activeTab,
        content: selectedFile || searchQuery,
        query: searchQuery
      };

      const response = await aiService.identifyContent(input);
      
      if (response.success) {
        setSearchResults(response.results);
        setGoogleResults(response.googleResults || []);
        setProcessingTime(response.processingTime);
        setAiProvider(aiService.getCurrentProvider());
      } else {
        console.error('AI identification failed:', response.error);
        // Show error message to user
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 transform scale-105'
          : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 hover:transform hover:scale-105'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  const MovieCard = ({ movie }: { movie: MovieResult }) => {
    
    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:transform hover:scale-105 border border-gray-700/50">
        <div className="relative">
          <img 
            src={movie.backdrop} 
            alt={movie.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {movie.confidence.toFixed(1)}% Match
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{movie.title}</h3>
              <p className="text-gray-400 text-sm flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {movie.year}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {movie.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400" />
                  {movie.rating}
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genre.map((g, index) => (
              <span key={index} className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                {g}
              </span>
            ))}
          </div>
          
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">
            {movie.description}
          </p>
          
          <div className="mb-4">
            <p className="text-gray-400 text-xs mb-2">Director: {movie.director}</p>
            <p className="text-gray-400 text-xs">Cast: {movie.cast.join(', ')}</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              <Globe size={16} />
              Available on:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {movie.platforms.map((platform) => (
                <div
                  key={platform.name}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                    platform.available
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:scale-105'
                      : 'bg-gray-700/30 border border-gray-600/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{platform.logo}</span>
                    <span className={`text-sm font-medium ${
                      platform.available ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {platform.name}
                    </span>
                  </div>
                  {platform.available && platform.link && (
                    <button className="p-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <Play size={12} className="text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700/50 backdrop-blur-xl bg-gray-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CineAI</h1>
                <p className="text-gray-400 text-sm">AI-Powered Content Discovery</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 hover:text-white transition-all duration-300"
            >
              <Settings size={18} />
              AI Settings
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Interface */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-gray-700/50 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            AI-Powered Content Identification
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Upload images, videos, or search by text using advanced AI vision models
          </p>
          
          {/* AI Status */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Zap size={16} className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">
                AI Provider: {aiService.getCurrentProvider().toUpperCase()}
              </span>
            </div>
            {processingTime > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Clock size={16} className="text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  Processed in {(processingTime / 1000).toFixed(1)}s
                </span>
              </div>
            )}
          </div>
          
          {/* Search Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <TabButton
              id="text"
              label="Text Search"
              icon={Search}
              isActive={activeTab === 'text'}
              onClick={() => setActiveTab('text')}
            />
            <TabButton
              id="image"
              label="Image Upload"
              icon={Upload}
              isActive={activeTab === 'image'}
              onClick={() => setActiveTab('image')}
            />
            <TabButton
              id="video"
              label="Video Clip"
              icon={Video}
              isActive={activeTab === 'video'}
              onClick={() => setActiveTab('video')}
            />
            <TabButton
              id="actor"
              label="Actor Search"
              icon={User}
              isActive={activeTab === 'actor'}
              onClick={() => setActiveTab('actor')}
            />
          </div>

          {/* Search Input */}
          <div className="space-y-6">
            {activeTab === 'text' && (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for movies, series, or describe a scene..."
                  className="w-full px-6 py-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              </div>
            )}

            {(activeTab === 'image' || activeTab === 'video') && (
              <div className="border-2 border-dashed border-gray-600 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors duration-300">
                <input
                  type="file"
                  accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {activeTab === 'image' ? <Upload className="text-white" size={24} /> : <Video className="text-white" size={24} />}
                  </div>
                  <p className="text-white font-medium mb-2">
                    {activeTab === 'image' ? 'Upload an image' : 'Upload a video clip'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {activeTab === 'image' ? 'Screenshot, poster, or scene from the content' : 'Any clip from the movie or series'}
                  </p>
                  {selectedFile && (
                    <p className="text-blue-400 mt-2 font-medium">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </label>
              </div>
            )}

            {activeTab === 'actor' && (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter actor or actress name..."
                  className="w-full px-6 py-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={isSearching || (!searchQuery.trim() && !selectedFile)}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              {isSearching ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  AI Processing...
                </div>
              ) : (
                'Identify with AI'
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              AI Results ({searchResults.length} matches found)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResults.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}

        {/* Google Search Results */}
        {googleResults.length > 0 && (
          <div className="space-y-6 mt-12">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Globe className="text-blue-400" size={28} />
              Related Web Results ({googleResults.length} found)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {googleResults.map((result, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="flex items-start gap-4">
                    {result.thumbnail && (
                      <img 
                        src={result.thumbnail} 
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                        {result.title}
                      </h4>
                      <p className="text-gray-400 text-xs mb-2">
                        {result.displayLink}
                      </p>
                      <p className="text-gray-300 text-xs line-clamp-3 mb-3">
                        {result.snippet}
                      </p>
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                      >
                        Visit Site
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && googleResults.length === 0 && !isSearching && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
              <Brain className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {aiService.getAvailableProviders().length === 0 
                ? "Configure AI API Keys to Start" 
                : "Ready to Identify Content"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {aiService.getAvailableProviders().length === 0 
                ? "Click 'AI Settings' to add your OpenAI or Gemini API keys. Get keys from platform.openai.com or makersuite.google.com"
                : "Upload an image, video, or enter text to identify movies and series using AI"}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 CineAI. Powered by advanced AI and computer vision technology.
            </p>
          </div>
        </div>
      </footer>
      
      {/* AI Settings Modal */}
      <AISettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;