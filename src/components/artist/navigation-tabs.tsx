interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "artworks", label: "Artworks" },
  { id: "about", label: "About" },
  { id: "blog", label: "Blog" },
  { id: "collections", label: "Collections" },
];

export function NavigationTabs({
  activeTab,
  onTabChange,
}: NavigationTabsProps) {
  return (
    <div className="mb-8 border-border border-b">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`border-b-2 px-1 py-4 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
