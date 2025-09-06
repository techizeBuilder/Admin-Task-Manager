import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const SidebarItem = ({ 
  item, 
  isCollapsed = false, 
  onItemClick,
  depth = 0 
}) => {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path === location;
  const hasActiveChild = hasChildren && item.children.some(child => child.path === location);
  
  const handleClick = (e) => {
    if (item.action === 'logout') {
      e.preventDefault();
      if (onItemClick) {
        onItemClick('logout');
      }
      return;
    }
    
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
    
    if (onItemClick && item.path) {
      onItemClick(item.path);
    }
  };

  const IconComponent = item.icon;
  
  const isSection = item.type === 'section' || item.children;
  const isActiveOrChildActive = isActive || hasActiveChild;
  
  const itemClasses = `
    group relative flex items-center transition-all duration-200 cursor-pointer rounded-lg
    ${isActiveOrChildActive
      ? 'text-[#ffffe6] bg-[#2a2a3c] border-r-[3px] border-[#2563eb]'
      : 'text-[rgb(152,153,172)] hover:text-[#ffffe6] hover:bg-[#2a2a3c] hover:border-r-[3px] hover:border-[#2563eb]'
    }
    ${isCollapsed 
      ? 'px-2 py-2.5 justify-center' 
      : depth > 0 
        ? 'ml-4 px-4 py-2.5 gap-3' 
        : 'px-4 py-2.5 gap-3'
    }
    ${isSection ? 'my-1' : ''}
    ${isExpanded ? 'mb-1' : ''}
  `;

  const content = (
    <>
      {IconComponent && (
        <IconComponent 
          size={18} 
          className={`
            flex-shrink-0 transition-colors duration-200
            ${isActive || hasActiveChild ? 'text-[#2563eb]' : 'text-[#9899AC] group-hover:text-[#2563eb]'}
          `}
        />
      )}
      
      {!isCollapsed && (
        <>
          <span className="flex-1 font-medium text-sm truncate">
            {item.label}
          </span>
          
          {hasChildren && (
            <div className="flex-shrink-0">
              <ChevronRight 
                size={14} 
                className={`
                  transform transition-transform duration-200
                  ${isExpanded ? 'rotate-90' : ''}
                  ${isActive || hasActiveChild ? 'text-[#2563eb]' : 'text-[rgb(152,153,172)]'}
                `} 
              />
            </div>
          )}
        </>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-[#2a2a3c] text-[#ffffe6] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
    </>
  );

  const ItemWrapper = ({ children }) => {
    if (item.path && !hasChildren) {
      return (
        <Link href={item.path} className={itemClasses} onClick={handleClick} data-testid={`sidebar-item-${item.id}`}>
          {children}
        </Link>
      );
    }
    
    return (
      <div 
        className={`${itemClasses} overflow-hidden`} 
        onClick={handleClick} 
        data-testid={`sidebar-item-${item.id}`}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="w-full">
      <ItemWrapper>
        {content}
      </ItemWrapper>
      
      {/* Render children if expanded */}
      {hasChildren && isExpanded && !isCollapsed && (
        <div className="mt-1 pt-1 space-y-0.5">
          {item.children.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              isCollapsed={isCollapsed}
              onItemClick={onItemClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;