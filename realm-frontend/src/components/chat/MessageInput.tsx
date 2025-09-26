import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Plus } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  channelName?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, channelName }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="p-4 bg-gray-900">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end space-x-3 bg-gray-700 rounded-lg p-3">
          {/* Attachment Button */}
          <button
            type="button"
            className="flex-shrink-0 p-1 text-gray-400 hover:text-white transition-colors"
            title="Attach file"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${channelName ? `#${channelName}` : 'channel'}`}
              className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none max-h-32"
              rows={1}
              style={{ minHeight: '24px' }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {message.trim() && (
              <button
                type="submit"
                className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="absolute -top-6 left-0 text-xs text-gray-400">
            <span className="bg-gray-800 px-2 py-1 rounded">
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>
        )}
      </form>
    </div>
  );
};