import React, { useState, useRef, useEffect } from 'react'
import { Box, IconButton, Popover, TextField, List, ListItemButton, ListItemText } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PushPinIcon from '@mui/icons-material/PushPin'
import TabInfo from './TabInfo'

interface TabsEllipsesMenuProps<T extends TabInfo> {
    tabs: T[]
    onTabSelect: (tabId: string) => void
    filterPlaceholder?: string
}

function TabsEllipsesMenu<T extends TabInfo>({
    tabs,
    onTabSelect,
    filterPlaceholder = 'Filter tabs...',
}: TabsEllipsesMenuProps<T>) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [filter, setFilter] = useState('')

    const isOpen = Boolean(anchorEl)
    const filteredTabs = tabs.filter((tab) => tab.title.toLowerCase().includes(filter.toLowerCase()))

    const handleEllipsesClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        setAnchorEl(event.currentTarget)
    }

    const handleClosePopover = () => setAnchorEl(null)

    return (
        <Box>
            <IconButton size="small" aria-label="More tabs" onClick={handleEllipsesClick}>
                <ExpandMoreIcon fontSize="small" />
            </IconButton>
            <Popover
                open={isOpen}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { p: 1, width: 280 } } }}
            >
                <Box onMouseDown={(e) => e.stopPropagation()}>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        type="search"
                        placeholder={filterPlaceholder}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <List dense disablePadding sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {filteredTabs.map((tab) => (
                            <ListItemButton
                                key={tab.id}
                                onClick={() => {
                                    onTabSelect(tab.id)
                                    handleClosePopover()
                                }}
                                sx={{ gap: 1 }}
                            >
                                <ListItemText primary={tab.title} slotProps={{ primary: { noWrap: true } }} />
                                {tab.isPinned && <PushPinIcon fontSize="small" sx={{ opacity: 0.7 }} />}
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Popover>
        </Box>
    )
}

export default TabsEllipsesMenu
