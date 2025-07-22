import React, { useState } from 'react';
import { mailAPI } from '../services/api';

const ComposeMail = ({ onClose, onMailSent }) => {
  const [mailForm, setMailForm] = useState({
    recipientAddress: '',
    subject: '',
    content: '',
    type: 'letter'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!mailForm.recipientAddress || !mailForm.subject || !mailForm.content) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await mailAPI.sendMail(mailForm);
      
      if (response.success) {
        onMailSent?.();
        onClose();
        alert('Mail sent successfully!');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extralight text-black tracking-tight">
            Compose Mail
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium tracking-wide">
                Recipient Address
              </label>
              <input
                type="text"
                value={mailForm.recipientAddress}
                onChange={(e) => setMailForm(prev => ({ ...prev, recipientAddress: e.target.value }))}
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400"
                placeholder="Enter recipient's address"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium tracking-wide">
                Type
              </label>
              <select
                value={mailForm.type}
                onChange={(e) => setMailForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900"
                disabled={loading}
              >
                <option value="letter">Letter</option>
                <option value="postcard">Postcard</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium tracking-wide">
              Subject
            </label>
            <input
              type="text"
              value={mailForm.subject}
              onChange={(e) => setMailForm(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400"
              placeholder="Enter subject"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium tracking-wide">
              Message
            </label>
            <textarea
              value={mailForm.content}
              onChange={(e) => setMailForm(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 resize-none"
              placeholder="Write your message..."
              disabled={loading}
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSend}
              disabled={loading}
              className="flex-1 py-4 bg-black text-white font-medium text-base tracking-wide rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Mail'}
            </button>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="px-8 py-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeMail;