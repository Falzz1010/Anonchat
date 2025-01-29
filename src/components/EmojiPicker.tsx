import { useState } from 'react';
import { Smile } from 'lucide-react';

// Tambah lebih banyak emoji dan kategorikan
const EMOJI_CATEGORIES = {
  smileys: ['😊', '😂', '🥹', '😅', '😆', '😍', '🥰', '😘', '😋', '🤔'],
  gestures: ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '🫶', '❤️', '💔'],
  objects: ['🎉', '🎊', '🎈', '🎁', '💡', '⭐', '🌟', '✨', '🔥', '💯'],
  nature: ['🌸', '🌺', '🌼', '🌻', '🌹', '🍀', '🌈', '☀️', '🌙', '⚡'],
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="brutal-button p-2"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="brutal-card absolute bottom-full mb-2 right-0 w-[280px] sm:w-[320px] z-50">
          {/* Category Tabs */}
          <div className="flex gap-0.5 sm:gap-1 mb-2 border-b border-black/10 pb-2">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
                className={`p-1.5 sm:p-2 rounded-lg text-sm ${
                  activeCategory === category ? 'bg-gray-100 dark:bg-brutal-gray' : ''
                }`}
              >
                {EMOJI_CATEGORIES[category as keyof typeof EMOJI_CATEGORIES][0]}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
            {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onEmojiSelect(emoji);
                  setIsOpen(false);
                }}
                className="p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-brutal-gray rounded text-lg sm:text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmojiPicker;
