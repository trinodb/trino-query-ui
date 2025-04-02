import React, { useState, useRef, useEffect } from 'react';
import TabInfo from './TabInfo';

interface TabsEllipsesMenuProps<T extends TabInfo> {
  tabs: T[];
  onTabSelect: (tabId: string) => void;
  filterPlaceholder?: string;
}

function TabsEllipsesMenu<T extends TabInfo>({ 
  tabs, 
  onTabSelect, 
  filterPlaceholder = "Filter tabs..." 
}: TabsEllipsesMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredTabs = tabs.filter(tab => 
    tab.title.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleEllipsesClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(true);
  };

  return (
    <div className="tabs-ellipses-menu" ref={menuRef}>
      <button className="ellipses-button" onClick={handleEllipsesClick}>
        <span>...</span>
      </button>
      {isOpen && (
        <div className="tabs-ellipses-menu-content">
          <input
            type="text"
            placeholder={filterPlaceholder}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            autoFocus
          />
          <div className="tab-list">
            {filteredTabs.map(tab => (
              <div
                key={tab.id}
                className={`tab-item ${tab.isPinned ? 'pinned' : ''}`}
                onClick={() => {
                  onTabSelect(tab.id);
                  setIsOpen(false);
                }}
              >
                <span className="tab-name">{tab.title}</span>
                {tab.isPinned && <span className="pinned-indicator">📌</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TabsEllipsesMenu;