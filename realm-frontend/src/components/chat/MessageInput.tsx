import React, { useState, useRef } from 'react';
import { Plus, Smile, Gift, Sticker } from 'lucide-react';

interface MessageInputProps {
  channelId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ channelId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // TODO: Send message via WebSocket
      console.log('Sending message:', message);
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }

    // Typing indicator logic
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      // TODO: Send typing start event
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
      // TODO: Send typing stop event
    }
  };

  return (
    <div className="px-4 pb-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-gray-600 rounded-lg flex items-end">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-white transition-colors"
            title="Upload a file"
          >
            <Plus size={20} />
          </button>

          {/* Message Input */}
          <div className="flex-1 py-3">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message #general`}
              className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none max-h-[200px] min-h-[20px]"
              rows={1}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center p-3 space-x-2">
            <button
              type="button"
              className="text-gray-400 hover:text-white transition-colors"
              title="Select emoji"
            >
              <Smile size={20} />
            </button>
            <button
              type="button"
              className="text-gray-400 hover:text-white transition-colors"
              title="Send a gift"
            >
              <Gift size={20} />
            </button>
            <button
              type="button"
              className="text-gray-400 hover:text-white transition-colors"
              title="Open sticker picker"
            >
              <Sticker size={20} />
            </button>
          </div>
        </div>

        {/* Character Count / Typing Indicator */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
          <div>
            {isTyping && <span>Typing...</span>}
          </div>
          <div>
            {message.length > 1900 && (
              <span className={message.length > 2000 ? 'text-red-400' : 'text-yellow-400'}>
                {2000 - message.length}
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};