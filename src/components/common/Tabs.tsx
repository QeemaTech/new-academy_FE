import { ReactNode, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
}

interface Props {
  tabs: Tab[];
  defaultTab?: string;
}

export default function Tabs({ tabs, defaultTab }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div>
      <div className="d-flex gap-2 flex-wrap mb-4" style={{ borderBottom: '2px solid var(--border-soft)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className="btn border-0 rounded-0 pb-3 position-relative"
            onClick={() => setActiveTab(tab.id)}
            style={{
              color: activeTab === tab.id ? 'var(--primary-blue)' : 'var(--muted-text)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: 15,
              background: 'transparent',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary-blue)' : '3px solid transparent',
              marginBottom: activeTab === tab.id ? '-2px' : 0,
              transition: 'var(--transition)',
            }}
          >
            {tab.icon && <i className={`bi ${tab.icon} me-2`}></i>}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-in">{activeTabContent}</div>
    </div>
  );
}

