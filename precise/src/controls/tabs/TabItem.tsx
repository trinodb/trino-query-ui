import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import TabInfo from './TabInfo';
import PinUpIcon from '../../assets/pin_up.png';
import PinDownIcon from '../../assets/pin_down.png';
import CloseIcon from '../../assets/close.png';

const ItemType = {
  TAB: 'tab',
};

interface TabItemProps<T extends TabInfo> {
  tab: T;
  isActive: boolean;
  index: number;
  moveTab: (fromIndex: number, toIndex: number) => void;
  handleTabClick: (tabId: string) => void;
  handleTabClose: (tabId: string) => void;
  handleTabRename: (tabId: string, newTitle: string) => void;
  handleTabPin: (tabId: string) => void;
}

function TabItem<T extends TabInfo>({ 
    tab, 
    isActive, 
    index, 
    moveTab, 
    handleTabClick, 
    handleTabClose, 
    handleTabRename, 
    handleTabPin 
  }: TabItemProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(tab.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType.TAB,
    item: () => ({ index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !isEditing, // Disable dragging when editing
  });

  const [, drop] = useDrop({
    accept: ItemType.TAB,
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveTab(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select all text when editing starts
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(event.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    if (editedTitle.trim() !== tab.title && editedTitle.trim() !== '') {
      handleTabRename(tab.id, editedTitle.trim());
    } else {
      setEditedTitle(tab.title); // Reset to original title if empty or unchanged
    }
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div 
      ref={(node) => preview(drop(node))} 
      className={`tab-item ${isActive ? 'tab-item-selected' : ''} ${isDragging ? 'dragging' : ''} ${tab.isPinned ? 'pinned' : ''}`}
      onClick={() => handleTabClick(tab.id)}
    >
      <div className="tab-content" ref={drag}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleInputKeyPress}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'text' }}
          />
        ) : (
          <div className="tab-name" onDoubleClick={handleDoubleClick}>
            {tab.title}
          </div>
        )}
      </div>
      <div className="tab-buttons">
        <div 
          className={`tab-button pin-button ${tab.isPinned ? 'pinned' : ''}`} 
          onClick={(e) => { e.stopPropagation(); handleTabPin(tab.id); }}
        >
          <img src={tab.isPinned ? PinDownIcon : PinUpIcon} alt="Pin" className="full-height-image" />
        </div>
        <div 
          className="tab-button close-button" 
          onClick={(e) => { e.stopPropagation(); handleTabClose(tab.id); }}
        >
          <img src={CloseIcon} alt="Close" className="half-height-image" />
        </div>
      </div>
    </div>
  );
}

export default TabItem;