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
  
  const itemClasses = `
    group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer
    ${isActive || hasActiveChild 
      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    }
    ${depth > 0 ? 'ml-4 pl-6' : ''}
  `;

  const content = (
    <>
      {IconComponent && (
        <IconComponent 
          size={18} 
          className={`
            flex-shrink-0 transition-colors duration-200
            ${isActive || hasActiveChild ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
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
              {isExpanded ? (
                <ChevronDown size={14} className="text-gray-400" />
              ) : (
                <ChevronRight size={14} className="text-gray-400" />
              )}
            </div>
          )}
        </>
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
      <div className={itemClasses} onClick={handleClick} data-testid={`sidebar-item-${item.id}`}>
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
        <div className="mt-1 space-y-1">
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