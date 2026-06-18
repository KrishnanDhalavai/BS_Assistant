import React, { useState, useEffect, useRef } from 'react';

export default function BrawlerDropdown({
  brawlers = [],
  selected = '',
  onChange,
  disabledOptions = [],
  placeholder = 'Search brawler...',
  accentColor = 'cyan' // 'cyan' | 'red' | 'amber'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter brawlers
  const filteredBrawlers = brawlers.filter(name => {
    const isSelectedElsewhere = disabledOptions.includes(name) && name !== selected;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && !isSelectedElsewhere;
  });

  // Reset highlighted index on search change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  // Handle keyboard interaction
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      setHighlightedIndex(prev => 
        prev < filteredBrawlers.length - 1 ? prev + 1 : prev
      );
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (filteredBrawlers.length > 0) {
        selectBrawler(filteredBrawlers[highlightedIndex]);
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      e.preventDefault();
    }
  };

  const selectBrawler = (name) => {
    onChange(name);
    setSearch('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  // Color mappings for esports aesthetic
  const themeClasses = {
    red: {
      border: 'border-red-500/35 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20',
      text: 'text-red-400',
      activeItem: 'bg-red-500/20 text-red-200',
      glow: 'shadow-[0_0_12px_rgba(239,68,68,0.2)]'
    },
    cyan: {
      border: 'border-cyan-500/35 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20',
      text: 'text-cyan-400',
      activeItem: 'bg-cyan-500/20 text-cyan-200',
      glow: 'shadow-[0_0_12px_rgba(6,182,212,0.2)]'
    },
    amber: {
      border: 'border-amber-500/35 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20',
      text: 'text-amber-400',
      activeItem: 'bg-amber-500/20 text-amber-200',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]'
    }
  };

  const theme = themeClasses[accentColor] || themeClasses.cyan;

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Trigger Box */}
      <div
        className={`flex items-center justify-between w-full h-12 px-4 rounded-xl border glass-panel transition-all duration-200 cursor-text ${theme.border} ${selected ? theme.glow : ''}`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="flex-1 flex items-center overflow-hidden">
          {selected ? (
            <span className={`font-semibold tracking-wide truncate ${theme.text}`}>
              {selected}
            </span>
          ) : (
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent border-none outline-none text-sm placeholder-gray-500 text-gray-200 font-medium"
              placeholder={placeholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
            />
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          {selected && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Options List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 glass-panel border border-gray-850 rounded-xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto animate-fade-in-up">
          {filteredBrawlers.length > 0 ? (
            filteredBrawlers.map((name, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={name}
                  className={`px-4 py-2.5 text-sm font-medium tracking-wide cursor-pointer transition-colors duration-100 ${
                    isHighlighted ? theme.activeItem : 'hover:bg-gray-800/40 text-gray-300'
                  }`}
                  onClick={() => selectBrawler(name)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {name}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-xs text-gray-500 text-center font-medium">
              No brawlers found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
