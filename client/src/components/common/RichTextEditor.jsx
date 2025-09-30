import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Type 
} from 'lucide-react';

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Describe your milestone...', 
  className = '',
  minHeight = '120px' 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleContentChange = (e) => {
    const content = e.target.innerHTML;
    onChange(content);
  };

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleFormat('bold')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('italic')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('underline')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Underline"
        >
          <Underline size={14} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => handleFormat('insertUnorderedList')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('insertOrderedList')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) handleFormat('createLink', url);
          }}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Add Link"
        >
          <Link size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('removeFormat')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Clear Formatting"
        >
          <Type size={14} />
        </button>
      </div>
      
      {/* Editor Content */}
      <div
        contentEditable
        onInput={handleContentChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`p-3 outline-none ${
          isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
        style={{ 
          minHeight,
          maxHeight: '300px',
          overflowY: 'auto'
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
      
      {/* Character count indicator */}
      <div className="px-3 pb-2 text-xs text-gray-500 flex justify-end">
        <div className="bg-green-100 text-green-600 px-2 py-1 rounded-full">
          ✓
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;