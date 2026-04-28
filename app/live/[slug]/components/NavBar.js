const TABS = [
  { id: 'info', label: 'Info', icon: '🏆' },
  { id: 'myteam', label: 'My Team', icon: '👕' },
  { id: 'standings', label: 'Standings', icon: '📊' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
  { id: 'referees', label: 'Referees', icon: '🎽' },
];

export default function NavBar({ activeTab, setActiveTab }) {
  return (
    <nav className="nav-bar" role="navigation" aria-label="Tournament sections">
      {TABS.map(tab => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          aria-selected={activeTab === tab.id}
        >
          <span>{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
