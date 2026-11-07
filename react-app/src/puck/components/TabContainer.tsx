import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  content?: string;
  badge?: string;
}

export interface TabContainerProps {
  id?: string;
  tabs: TabItem[];
  activeTabId?: string;
  variant?: 'pills' | 'underline' | 'boxed';
}

export const TabContainer: React.FC<TabContainerProps> = ({
  tabs = [],
  activeTabId,
  variant = 'boxed',
}) => {
  const [selectedTabId, setSelectedTabId] = useState<string>(
    activeTabId || (tabs.length > 0 ? tabs[0].id : '')
  );

  const activeTab = tabs.find((t) => t.id === selectedTabId) || tabs[0];

  return (
    <div className={`puck-tab-container tab-variant-${variant}`} style={{ margin: '2rem 0', width: '100%' }}>
      {/* Tab Navigation List */}
      <div
        className="tab-nav-list"
        role="tablist"
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '0.5rem',
          paddingBottom: '0.5rem',
          borderBottom: '2px solid var(--cordo-chocolate)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === (activeTab ? activeTab.id : selectedTabId);
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              type="button"
              onClick={() => setSelectedTabId(tab.id)}
              className={`tab-btn ${isActive ? 'tab-btn-active' : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: isActive ? 'var(--cordo-chocolate)' : 'var(--cordo-cream)',
                color: isActive ? 'white' : 'var(--cordo-chocolate)',
                border: '2px solid var(--cordo-chocolate)',
                borderRadius: '8px 8px 0 0',
                fontFamily: 'var(--font-title)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
                fontWeight: 700,
                boxShadow: isActive ? '3px -2px 0px 0px var(--cordo-gold)' : 'none',
              }}
            >
              {tab.icon && <span className={tab.icon} />}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    backgroundColor: isActive ? 'var(--cordo-gold)' : 'var(--cordo-chocolate)',
                    color: 'white',
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    marginLeft: '0.35rem',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      {activeTab && (
        <div
          id={`tabpanel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab.id}`}
          className="tab-panel-content"
          style={{
            backgroundColor: 'white',
            border: '2px solid var(--cordo-chocolate)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            padding: '1.75rem',
            boxShadow: 'var(--cordo-shadow)',
          }}
        >
          {activeTab.content && /<[a-z][\s\S]*>/i.test(activeTab.content) ? (
            <div dangerouslySetInnerHTML={{ __html: activeTab.content }} />
          ) : (
            <p style={{ margin: 0, lineHeight: 1.7 }}>{activeTab.content}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TabContainer;
