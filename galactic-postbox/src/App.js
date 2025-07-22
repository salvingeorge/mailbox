import React, { useState, useEffect } from 'react';
import apiService from './services/api';
import ComposeMail from './components/composeMail';

// Sci-fi movie addresses
const SCI_FI_ADDRESSES = [
  { id: 1, address: "Cloud City, Bespin System", movie: "Star Wars" },
  { id: 2, address: "Tyrell Corporation, Los Angeles 2019", movie: "Blade Runner" },
  { id: 3, address: "USS Enterprise NCC-1701, Bridge", movie: "Star Trek" },
  { id: 4, address: "Zion, Machine City Underground", movie: "The Matrix" },
  { id: 5, address: "Pandora Research Station, Alpha Centauri", movie: "Avatar" },
  { id: 6, address: "New Tokyo Bay, Sector 7", movie: "Akira" },
  { id: 7, address: "Elysium Space Station, Orbit", movie: "Elysium" },
  { id: 8, address: "Aperture Science Labs, Level 5", movie: "Portal" },
  { id: 9, address: "Mars Colony Dome, Olympus Mons", movie: "Total Recall" },
  { id: 10, address: "Coruscant Senate District, Level 1", movie: "Star Wars" }
];

const OnlinePostBox = () => {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [postBoxOpen, setPostBoxOpen] = useState(false);
  const [letters, setLetters] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    username: '', 
    email: '',
    password: '', 
    confirmPassword: '',
    selectedAddress: null,
    customAddress: '',
    useCustomAddress: false
  });

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUser = apiService.getStoredUser();
    if (storedUser && apiService.isLoggedIn()) {
      setUser(storedUser);
      loadMail();
    }
  }, []);

  // Load user's mail
  const loadMail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMail();
      if (response.success) {
        setLetters(response.mail);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await apiService.login(loginForm);
      
      if (response.success) {
        setUser(response.user);
        setLoginForm({ username: '', password: '' });
        await loadMail();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const { username, email, password, confirmPassword, selectedAddress, customAddress, useCustomAddress } = signupForm;
    
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!useCustomAddress && !selectedAddress) {
      setError('Please select an address');
      return;
    }
    
    if (useCustomAddress && !customAddress.trim()) {
      setError('Please enter a custom address');
      return;
    }
    
    const userAddress = useCustomAddress 
      ? { id: Date.now(), address: customAddress.trim(), movie: "Custom", isCustom: true }
      : { ...selectedAddress, isCustom: false };
    
    try {
      setLoading(true);
      setError('');
      
      const userData = {
        username,
        email,
        password,
        address: userAddress
      };
      
      const response = await apiService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        setSignupForm({ 
          username: '', 
          email: '',
          password: '', 
          confirmPassword: '',
          selectedAddress: null,
          customAddress: '',
          useCustomAddress: false
        });
        await loadMail();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    setSignupForm(prev => ({ ...prev, selectedAddress: address, useCustomAddress: false }));
  };

  const openPostBox = () => {
    setPostBoxOpen(true);
  };

  const closePostBox = () => {
    setPostBoxOpen(false);
    setSelectedLetter(null);
  };

  const openLetter = async (letter) => {
    setSelectedLetter(letter);
    
    // Mark as read if not already read
    if (!letter.isRead) {
      try {
        await apiService.markAsRead(letter._id);
        // Update local state
        setLetters(prev => prev.map(l => 
          l._id === letter._id ? { ...l, isRead: true, readAt: new Date() } : l
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking letter as read:', error);
      }
    }
  };

  const closeLetter = () => {
    setSelectedLetter(null);
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setPostBoxOpen(false);
    setSelectedLetter(null);
    setShowCompose(false);
    setLetters([]);
    setUnreadCount(0);
    setLoginForm({ username: '', password: '' });
    setShowSignup(false);
    setError('');
  };

  // Login/Signup Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-black opacity-5 rounded-full"></div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-black opacity-3 rounded-full"></div>
          
          <div className="relative bg-white shadow-2xl rounded-3xl p-12 w-full max-w-2xl border border-gray-100">
            <div className="text-center mb-12">
              <div className="inline-block p-4 bg-black rounded-2xl mb-6">
                <div className="text-white text-3xl">📫</div>
              </div>
              <h1 className="text-4xl font-extralight text-black mb-2 tracking-tight">
                PostBox
              </h1>
              <p className="text-gray-500 font-light text-sm tracking-wide">
                Digital Mail Experience
              </p>
            </div>

            {!showSignup ? (
              // Login Form
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="block text-gray-700 text-sm font-medium tracking-wide">
                    Username
                  </label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400"
                    placeholder="Enter your username"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-gray-700 text-sm font-medium tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400"
                    placeholder="Enter your password"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-4 bg-black text-white font-medium text-base tracking-wide rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Access PostBox'}
                </button>

                <div className="text-center pt-4">
                  <p className="text-gray-500 text-sm mb-4">
                    Don't have an account?
                  </p>
                  <button
                    onClick={() => {setShowSignup(true); setError('');}}
                    className="text-black font-medium hover:underline transition-all duration-300"
                    disabled={loading}
                  >
                    Create New Account
                  </button>
                </div>
              </div>
            ) : (
              // Signup Form
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium tracking-wide">
                      Username
                    </label>
                    <input
                      type="text"
                      value={signupForm.username}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="Choose username"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="Enter email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium tracking-wide">
                      Password
                    </label>
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="Enter password"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-sm font-medium tracking-wide">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="Confirm password"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Address Selection */}
                <div className="space-y-4">
                  <label className="block text-gray-700 text-sm font-medium tracking-wide">
                    Choose Your Address
                  </label>
                  
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setSignupForm(prev => ({ ...prev, useCustomAddress: false }))}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        !signupForm.useCustomAddress 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      Pre-made Addresses
                    </button>
                    <button
                      onClick={() => setSignupForm(prev => ({ ...prev, useCustomAddress: true }))}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        signupForm.useCustomAddress 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      Custom Address
                    </button>
                  </div>

                  {signupForm.useCustomAddress ? (
                    <input
                      type="text"
                      value={signupForm.customAddress}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, customAddress: e.target.value }))}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="Enter your custom address"
                      disabled={loading}
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                      {SCI_FI_ADDRESSES.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => !loading && handleAddressSelect(addr)}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                            signupForm.selectedAddress?.id === addr.id
                              ? 'bg-black text-white border-black'
                              : 'bg-gray-50 border-gray-200 hover:border-black hover:bg-gray-100'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="font-medium text-sm">{addr.address}</div>
                          <div className="text-xs opacity-70">{addr.movie}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full py-4 bg-black text-white font-medium text-base tracking-wide rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="text-center pt-4">
                  <button
                    onClick={() => {setShowSignup(false); setError('');}}
                    disabled={loading}
                    className="text-gray-600 font-medium hover:underline transition-all duration-300 disabled:opacity-50"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Post Box Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-black rounded-xl">
                <div className="text-white text-xl">📫</div>
              </div>
              <div>
                <h1 className="text-2xl font-light text-black tracking-tight">
                  Welcome, {user.username}
                </h1>
                <p className="text-gray-600 font-light text-sm">
                  {user.address?.address}
                </p>
                <p className="text-gray-400 font-light text-xs">
                  {user.address?.movie}
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {!postBoxOpen ? (
          // Closed Post Box View
          <div className="flex flex-col items-center">
            {/* Stats */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-16 text-center">
              <div className="text-4xl font-extralight text-black mb-2">
                {unreadCount}
              </div>
              <p className="text-gray-600 font-light tracking-wide">
                New Messages Waiting
              </p>
              {loading && (
                <p className="text-gray-400 text-sm mt-2">
                  Loading mail...
                </p>
              )}
            </div>
            
            {/* Post Box Visual */}
            <div className="relative group">
              {/* Shadow */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-96 h-8 bg-black opacity-10 rounded-full blur-xl"></div>
              
              {/* Post Box */}
              <div className="relative w-96 h-[500px]">
                {/* Main Post Box Body */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl shadow-2xl border-4 border-gray-700">
                  {/* Front Panel */}
                  <div className="absolute inset-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl">
                    
                    {/* Mail Slot */}
                    <div 
                      onClick={openPostBox}
                      className="absolute top-16 left-8 right-8 h-32 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-105 border-2 border-gray-300 flex items-center justify-center group-hover:from-gray-50 group-hover:to-white overflow-hidden"
                    >
                      {/* Mail Slot Opening */}
                      <div className="absolute top-2 left-4 right-4 h-2 bg-gradient-to-r from-gray-800 to-black rounded-full shadow-inner"></div>
                      
                      {/* Door Content */}
                      <div className="text-center mt-4">
                        <div className="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110 text-gray-700">
                          📬
                        </div>
                        <p className="text-gray-600 font-light tracking-wide text-sm">
                          Click to Open
                        </p>
                      </div>
                      
                      {/* Door Handle */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full shadow-lg border border-yellow-700"></div>
                      
                      {/* Door Hinges */}
                      <div className="absolute left-1 top-3 w-2 h-3 bg-gray-600 rounded-sm"></div>
                      <div className="absolute left-1 bottom-3 w-2 h-3 bg-gray-600 rounded-sm"></div>
                    </div>
                    
                    {/* Address Plate */}
                    <div className="absolute bottom-16 left-8 right-8 bg-gradient-to-br from-gray-200 via-gray-100 to-white rounded-xl p-6 border-2 border-gray-300 shadow-inner">
                      <div className="text-center">
                        <div className="w-8 h-1 bg-gray-400 rounded mx-auto mb-3"></div>
                        <p className="text-gray-800 font-light text-sm leading-relaxed">
                          {user.address?.address}
                        </p>
                        <div className="text-xs text-gray-500 mt-2 font-light">
                          {user.address?.movie}
                        </div>
                        <div className="w-8 h-1 bg-gray-400 rounded mx-auto mt-3"></div>
                      </div>
                    </div>
                    
                    {/* Collection Times Sign */}
                    <div className="absolute top-4 left-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs text-center py-2 rounded-lg font-medium">
                      GALACTIC POSTAL SERVICE
                    </div>
                  </div>
                  
                  {/* Side Details */}
                  <div className="absolute right-0 top-8 bottom-8 w-3 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-2xl"></div>
                  <div className="absolute left-0 top-8 bottom-8 w-3 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-2xl"></div>
                </div>
                
                {/* Post Box Stand */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-20 h-24 bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 rounded-lg shadow-xl border-2 border-gray-600">
                  <div className="absolute top-2 left-2 right-2 h-1 bg-gray-500 rounded"></div>
                  <div className="absolute bottom-2 left-2 right-2 h-1 bg-gray-500 rounded"></div>
                </div>
                
                {/* Ground Base */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 rounded-full opacity-30"></div>
              </div>
            </div>
          </div>
        ) : (
          // Open Post Box View
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-extralight text-black mb-2 tracking-tight">
                  Your Mail
                </h2>
                <p className="text-gray-600 font-light">
                  {letters.length} messages in your inbox
                </p>
                {error && (
                  <p className="text-red-500 font-light text-sm mt-1">
                    {error}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCompose(true)}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                >
                  Compose Mail
                </button>
                <button
                  onClick={loadMail}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={closePostBox}
                  className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Close PostBox
                </button>
              </div>
            </div>

            {selectedLetter ? (
              // Letter Reading View
              <div className="relative">
                {selectedLetter.type === 'letter' ? (
                  // Letter View
                  <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Letter Header */}
                    <div className="relative bg-gradient-to-r from-gray-100 via-white to-gray-100 p-8 border-b border-gray-200">
                      {/* Letterhead Design */}
                      <div className="text-center mb-6">
                        <div className="inline-block p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mb-4">
                          <div className="text-white text-xl">✉️</div>
                        </div>
                        <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded"></div>
                      </div>
                      
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-3xl font-light text-black mb-4 leading-tight">
                            {selectedLetter.subject}
                          </h3>
                          <div className="flex items-center space-x-4 text-gray-600">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {selectedLetter.sender?.username?.[0]?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <span className="font-light">
                                From: {selectedLetter.sender?.username || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-gray-500 space-y-1">
                            <p>📅 {new Date(selectedLetter.createdAt).toLocaleDateString()} at {new Date(selectedLetter.createdAt).toLocaleTimeString()}</p>
                            {selectedLetter.readAt && (
                              <p>👁️ Read: {new Date(selectedLetter.readAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium rounded-full tracking-wide shadow-lg">
                            LETTER
                          </span>
                          <button
                            onClick={closeLetter}
                            className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-300"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Letter Content */}
                    <div className="p-8">
                      <div className="bg-white rounded-2xl p-8 shadow-inner border border-gray-200">
                        {/* Paper Lines Effect */}
                        <div className="space-y-6 relative">
                          <div className="absolute left-8 top-0 bottom-0 w-px bg-red-300 opacity-30"></div>
                          <div className="absolute left-16 top-0 bottom-0 w-px bg-blue-300 opacity-20"></div>
                          
                          <div className="prose prose-lg max-w-none pl-6">
                            <p className="text-gray-800 font-light leading-relaxed text-lg whitespace-pre-wrap">
                              {selectedLetter.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Postcard View
                  <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-3xl shadow-2xl border border-orange-200 overflow-hidden">
                    {/* Postcard Header */}
                    <div className="relative p-8 border-b border-orange-200">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-yellow-100"></div>
                      
                      <div className="relative flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="text-3xl">🏞️</div>
                            <h3 className="text-3xl font-light text-gray-800">
                              {selectedLetter.subject}
                            </h3>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-gray-600">
                            <span className="font-light">
                              📮 From: {selectedLetter.sender?.username || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            📅 {new Date(selectedLetter.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full tracking-wide shadow-lg">
                            POSTCARD
                          </span>
                          <button
                            onClick={closeLetter}
                            className="px-6 py-2 bg-white bg-opacity-80 text-gray-700 font-medium rounded-lg hover:bg-opacity-100 transition-all duration-300"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Postcard Content */}
                    <div className="p-8">
                      <div className="bg-white bg-opacity-80 rounded-2xl p-8 border-2 border-dashed border-orange-300">
                        <div className="prose prose-lg max-w-none">
                          <p className="text-gray-800 font-light leading-relaxed text-lg whitespace-pre-wrap italic">
                            {selectedLetter.content}
                          </p>
                        </div>
                        
                        {/* Postcard Footer */}
                        <div className="mt-6 pt-6 border-t border-orange-200 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            🌍 Sent via Galactic Postal Service
                          </div>
                          <div className="w-12 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded border border-green-600 flex items-center justify-center">
                            <div className="text-white text-xs font-bold text-center">
                              🚀<br/>10¢
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Mail List View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {letters.map((letter, index) => (
                  <div
                    key={letter._id}
                    onClick={() => openLetter(letter)}
                    className={`group relative cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                      letter.isRead 
                        ? 'opacity-70' 
                        : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Mail Item */}
                    <div className={`relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl ${
                      letter.type === 'postcard' ? 'aspect-[3/2]' : 'aspect-[4/3]'
                    }`}>
                      
                      {letter.type === 'letter' ? (
                        // Letter Envelope Design
                        <div className={`w-full h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl border-2 shadow-lg transform transition-all duration-500 ${
                          letter.isRead 
                            ? 'border-gray-300' 
                            : 'border-gray-400 shadow-xl'
                        }`}>
                          {/* Envelope Flap */}
                          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-gray-200 via-gray-100 to-white border-b-2 border-gray-300 rounded-t-2xl">
                            {/* Envelope Flap Triangle */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[80px] border-r-[80px] border-t-[60px] border-l-transparent border-r-transparent border-t-gray-200"></div>
                            
                            {/* Wax Seal */}
                            {!letter.isRead && (
                              <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full border-2 border-red-700 shadow-lg flex items-center justify-center">
                                <div className="text-white text-xs font-bold">✉</div>
                              </div>
                            )}
                          </div>
                          
                          {/* Envelope Body */}
                          <div className="absolute top-20 left-0 right-0 bottom-0 p-6">
                            {/* Address Lines */}
                            <div className="space-y-3 mt-4">
                              <div className="w-3/4 h-2 bg-gray-400 rounded"></div>
                              <div className="w-full h-2 bg-gray-300 rounded"></div>
                              <div className="w-5/6 h-2 bg-gray-300 rounded"></div>
                            </div>
                            
                            {/* Subject Preview */}
                            <div className="absolute bottom-6 left-6 right-6">
                              <h3 className="text-lg font-light text-gray-800 mb-2 truncate">
                                {letter.subject}
                              </h3>
                              <p className="text-sm text-gray-600 font-light">
                                From: {letter.sender?.username || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(letter.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Postmark Stamp */}
                          <div className="absolute top-4 right-4 w-16 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded border-2 border-blue-700 flex items-center justify-center transform rotate-12">
                            <div className="text-white text-xs font-bold text-center leading-tight">
                              MAIL<br/>★★★
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Postcard Design
                        <div className={`w-full h-full bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50 rounded-2xl border-2 shadow-lg overflow-hidden ${
                          letter.isRead 
                            ? 'border-orange-300' 
                            : 'border-orange-400 shadow-xl'
                        }`}>
                          {/* Postcard Front */}
                          <div className="relative w-full h-full">
                            {/* Scenic Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-30"></div>
                            
                            {/* Postcard Texture */}
                            <div className="absolute inset-0 bg-white opacity-80"></div>
                            
                            {/* Postcard Border */}
                            <div className="absolute inset-2 border-2 border-dashed border-gray-400 rounded-xl"></div>
                            
                            {/* Content */}
                            <div className="relative p-6 h-full flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-4">
                                  <div className="text-2xl">🏞️</div>
                                  {!letter.isRead && (
                                    <div className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                                      NEW
                                    </div>
                                  )}
                                </div>
                                
                                <h3 className="text-lg font-light text-gray-800 mb-2">
                                  {letter.subject}
                                </h3>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-600 font-light">
                                  From: {letter.sender?.username || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(letter.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            {/* Postage Stamp */}
                            <div className="absolute top-3 right-3 w-12 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded border border-green-600 flex items-center justify-center transform -rotate-3">
                              <div className="text-white text-xs font-bold text-center">
                                🚀<br/>10¢
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl"></div>
                    </div>
                  </div>
                ))}
                
                {letters.length === 0 && !loading && (
                  <div className="col-span-full text-center py-24">
                    <div className="text-6xl mb-6 opacity-30">📭</div>
                    <p className="text-gray-500 font-light text-xl">
                      Your inbox is empty
                    </p>
                    <p className="text-gray-400 font-light text-sm mt-2">
                      Register other users and send mail to start receiving messages!
                    </p>
                  </div>
                )}
                
                {loading && letters.length === 0 && (
                  <div className="col-span-full text-center py-24">
                    <div className="text-6xl mb-6 opacity-30">⏳</div>
                    <p className="text-gray-500 font-light text-xl">
                      Loading your mail...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compose Mail Modal */}
      {showCompose && (
        <ComposeMail 
          onClose={() => setShowCompose(false)}
          onMailSent={() => {
            loadMail();
            setShowCompose(false);
          }}
        />
      )}
    </div>
  );
};

export default OnlinePostBox;