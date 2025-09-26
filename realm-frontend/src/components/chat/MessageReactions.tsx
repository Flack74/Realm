import React from 'react';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface MessageReactionsProps {
  reactions: Reaction[];
  messageId: string;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  messageId
}) => {
  const handleReactionClick = (emoji: string) => {
    // TODO: Implement reaction toggle logic
    console.log(`Toggle reaction ${emoji} on message ${messageId}`);
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          className="flex items-center bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 text-sm transition-colors"
          onClick={() => handleReactionClick(reaction.emoji)}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span className="text-gray-300">{reaction.count}</span>
        </button>
      ))}
      
      {/* Add Reaction Button */}
      <button
        className="flex items-center bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 text-sm transition-colors text-gray-400 hover:text-white"
        title="Add Reaction"
      >
        <span>+</span>
      </button>
    </div>
  );
};