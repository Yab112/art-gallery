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
    <div className="mb-8 border-b border-gray-200">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`border-b-2 px-1 py-4 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
