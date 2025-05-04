import TabInfo from './TabInfo'

// Abstract base class for tab management
abstract class Tabs<T extends TabInfo> {
    protected tabs: T[]
    protected currentTabId: string
    protected changeListeners: (() => void)[] = []

    constructor() {
        this.tabs = this.loadTabs()
        if (this.tabs.length === 0) {
            this.tabs.push(this.createNewTab())
        }
        this.currentTabId = this.tabs[0].id
    }

    abstract loadTabs(): T[]
    abstract saveTabs(): void
    abstract deleteTabFromStorage(tabId: string): void
    abstract createNewTab(): T

    getTabs(): T[] {
        return [...this.tabs] // Return a shallow copy
    }

    getCurrentTab(): T {
        if (!this.currentTabId || !this.tabs.some((t) => t.id === this.currentTabId)) {
            if (this.tabs.length === 0) {
                this.tabs.push(this.createNewTab())
            }
            this.currentTabId = this.tabs[0].id
        }
        return this.tabs.find((t) => t.id === this.currentTabId)!
    }

    setCurrentTab(tabId: string): void {
        const tab = this.tabs.find((t) => t.id === tabId)
        if (tab) {
            this.currentTabId = tabId
        } else {
            this.currentTabId = this.tabs[0]?.id || this.createNewTab().id
        }
        this.notifyListeners()
    }

    addTab(front: boolean = false, title: string = 'New Tab'): T {
        const newTab = this.createNewTab()
        this.tabs.push(newTab)
        this.currentTabId = newTab.id
        if (front) {
            this.moveToFrontAfterPinned(newTab.id)
        } else {
            this.saveTabs()
            this.notifyListeners()
        }
        return newTab
    }

    deleteTab(tabId: string): void {
        this.tabs = this.tabs.filter((t) => t.id !== tabId)
        if (this.tabs.length === 0) {
            this.addTab()
        } else if (this.currentTabId === tabId) {
            this.currentTabId = this.tabs[0].id
        }
        this.deleteTabFromStorage(tabId)
        this.notifyListeners()
    }

    updateTab(tabId: string, updates: Partial<T>): void {
        const tabIndex = this.tabs.findIndex((t) => t.id === tabId)
        if (tabIndex !== -1) {
            this.tabs[tabIndex] = { ...this.tabs[tabIndex], ...updates }
            this.saveTabs()
            this.notifyListeners()
        }
    }

    updateTabOrder(newOrder: string[]): void {
        if (newOrder.every((id) => this.tabs.some((t) => t.id === id)) && newOrder.length === this.tabs.length) {
            this.tabs = newOrder.map((id) => this.tabs.find((t) => t.id === id)!)
            this.saveTabs()
            this.notifyListeners()
        } else {
            console.error('Invalid tab order update')
        }
    }

    pinTab(tabId: string, isPinned: boolean): void {
        const tabIndex = this.tabs.findIndex((t) => t.id === tabId)
        if (tabIndex !== -1) {
            this.tabs[tabIndex].isPinned = isPinned
            this.sortTabs()
            this.saveTabs()
            this.notifyListeners()
        }
    }

    moveToFront(tabId: string): void {
        const index = this.tabs.findIndex((t) => t.id === tabId)
        if (index > -1) {
            const [tab] = this.tabs.splice(index, 1)
            this.tabs.unshift(tab)
            this.setCurrentTab(tabId)
            this.saveTabs()
            this.notifyListeners()
        }
    }

    moveToFrontAfterPinned(tabId: string): void {
        const index = this.tabs.findIndex((t) => t.id === tabId)
        if (index > -1) {
            const pinnedTabs = this.tabs.filter((t) => t.isPinned)
            const pinnedCount = pinnedTabs.length
            const [tab] = this.tabs.splice(index, 1)
            this.tabs.splice(pinnedCount, 0, tab)
            this.setCurrentTab(tabId)
            this.saveTabs()
            this.notifyListeners()
        }
    }

    protected sortTabs(): void {
        this.tabs.sort((a, b) => {
            if (a.isPinned === b.isPinned) return 0
            return a.isPinned ? -1 : 1
        })
    }

    addChangeListener(listener: () => void) {
        this.changeListeners.push(listener)
    }

    removeChangeListener(listener: () => void) {
        this.changeListeners = this.changeListeners.filter((l) => l !== listener)
    }

    protected notifyListeners() {
        this.changeListeners.forEach((listener) => listener())
    }
}

export default Tabs
