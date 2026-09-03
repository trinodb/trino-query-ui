import React, { Component } from 'react'
import { Box, Divider, IconButton, Tab as MuiTab, Tabs as MuiTabs } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import TabsEllipsesMenu from './TabsEllipsesMenu'
import Tabs from './Tabs'
import TabInfo from './TabInfo'

interface EnterpriseTabsProps<T extends TabInfo> {
    tabs: Tabs<T>
    newTabLabel?: string
    onTabChange?: (tabId: string) => void
    onTabCreate?: () => void
    onTabClose?: (tabId: string) => void
    onTabRename?: (tabId: string, newTitle: string) => void
    onTabPin?: (tabId: string, isPinned: boolean) => void
    onTabsReorder?: (newOrder: string[]) => void
    onTabSelectAndPromote?: (tabId: string) => void
}

interface EnterpriseTabsState<T extends TabInfo> {
    tabs: T[]
    currentTabId: string
}

class EnterpriseTabs<T extends TabInfo> extends Component<EnterpriseTabsProps<T>, EnterpriseTabsState<T>> {
    private isUpdating: boolean = false

    constructor(props: EnterpriseTabsProps<T>) {
        super(props)
        this.state = {
            tabs: props.tabs.getTabs(),
            currentTabId: props.tabs.getCurrentTab().id,
        }
    }

    componentDidMount() {
        this.props.tabs.addChangeListener(this.handleTabsChange)
    }

    componentWillUnmount() {
        this.props.tabs.removeChangeListener(this.handleTabsChange)
    }

    handleTabsChange = () => {
        if (this.isUpdating) return
        this.isUpdating = true

        const newTabs = this.props.tabs.getTabs()
        const newCurrentTab = this.props.tabs.getCurrentTab()

        this.setState(
            {
                tabs: newTabs,
                currentTabId: newCurrentTab.id,
            },
            () => {
                if (newCurrentTab.id !== this.state.currentTabId && this.props.onTabChange) {
                    this.props.onTabChange(newCurrentTab.id)
                }
                this.isUpdating = false
            }
        )
    }

    handleTabClick = (tabId: string) => {
        if (tabId === this.state.currentTabId) return
        this.props.tabs.setCurrentTab(tabId)
    }

    handleTabClose = (tabId: string) => {
        this.props.tabs.deleteTab(tabId)
        if (this.props.onTabClose) {
            this.props.onTabClose(tabId)
        }
    }

    handleNewTab = () => {
        // Because tabs are created through the modifying the list of tabs, the list is managed by the containing component
        if (this.props.onTabCreate) {
            // Tabs should be created through
            this.props.onTabCreate()
        } else {
            // If no handler is provided, directly add the tab
            const newTab = this.props.tabs.addTab()
            this.props.tabs.setCurrentTab(newTab.id)
        }
    }

    handleTabRename = (tabId: string, newTitle: string) => {
        this.props.tabs.updateTab(tabId, { title: newTitle } as Partial<T>)
        if (this.props.onTabRename) {
            this.props.onTabRename(tabId, newTitle)
        }
    }

    handleTabPin = (tabId: string) => {
        const tab = this.props.tabs.getTabs().find((t) => t.id === tabId)
        if (tab) {
            const newPinnedState = !tab.isPinned
            this.props.tabs.pinTab(tabId, newPinnedState)
            if (this.props.onTabPin) {
                this.props.onTabPin(tabId, newPinnedState)
            }
        }
    }

    handleTabSelectAndPromote = (tabId: string) => {
        if (tabId === this.state.currentTabId) return
        this.props.tabs.moveToFront(tabId)
        this.props.tabs.setCurrentTab(tabId)
        if (this.props.onTabSelectAndPromote) {
            this.props.onTabSelectAndPromote(tabId)
        }
    }

    moveTab = (fromIndex: number, toIndex: number) => {
        const tabs = [...this.state.tabs]
        const [movedTab] = tabs.splice(fromIndex, 1)
        tabs.splice(toIndex, 0, movedTab)
        const newOrder = tabs.map((t) => t.id)
        this.props.tabs.updateTabOrder(newOrder)
        if (this.props.onTabsReorder) {
            this.props.onTabsReorder(newOrder)
        }
    }

    render() {
        const { tabs, currentTabId } = this.state
        const { newTabLabel = '+' } = this.props

        return (
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                    }}
                >
                    <MuiTabs
                        value={currentTabId}
                        variant="scrollable"
                        onChange={(_, id) => this.handleTabClick(id)}
                        sx={{ flexGrow: 1 }}
                    >
                        {tabs.map((tab) => (
                            <MuiTab
                                key={tab.id}
                                value={tab.id}
                                label={tab.title}
                                sx={{ minHeight: 36, py: 0 }}
                                icon={
                                    <IconButton
                                        component="span"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            this.handleTabClose(tab.id)
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                }
                                iconPosition="end"
                            />
                        ))}
                        <MuiTab
                            value="Add query"
                            icon={
                                <IconButton
                                    component="span"
                                    size="small"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        this.handleNewTab()
                                    }}
                                >
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            }
                            aria-label="Add tab"
                            sx={{ minWidth: 0, px: 1 }}
                            disableRipple
                        />
                    </MuiTabs>
                    <Box sx={{ ml: 'auto', pr: 1 }}>
                        <TabsEllipsesMenu tabs={tabs} onTabSelect={this.handleTabSelectAndPromote} />
                    </Box>
                </Box>

                <Divider />
            </Box>
        )
    }
}

export default EnterpriseTabs
