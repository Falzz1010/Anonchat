import { useState } from 'react';
import { Smile } from 'lucide-react';

const EMOJI_LIST = ['👍', '❤️', '😊', '🎉', '🤔', '😂'];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAbove, setShowAbove] = useState(true);

  const handleButtonClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const button = event.currentTarget as HTMLButtonElement;
    const viewport = window.innerHeight;
    const buttonRect = button.getBoundingClientRect();
    
    setShowAbove(buttonRect.bottom > viewport * 0.6);
    setIsOpen(!isOpen);
  };

  const handleEmojiClick = (emoji: string) => {
    event?.preventDefault();
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleButtonClick}
        className="brutal-button p-2"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className={`brutal-card absolute ${
          showAbove ? 'bottom-full mb-2' : 'top-full mt-2'
        } right-0 sm:right-auto sm:left-0 p-2 flex flex-wrap gap-1 w-[280px] max-w-[calc(100vw-2rem)] z-50`}>
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-brutal-gray rounded text-xl"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmojiPicker;
