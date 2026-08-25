import { FiSearch, FiChevronDown, FiX } from "react-icons/fi";
import { BsSortDown, BsSortUpAlt } from "react-icons/bs";

export const CATEGORIES = [
  "All Category",
  "Plantation",
  "Forests",
  "Wildlife",
  "Climate",
  "Community",
];

interface SidebarProps {
  query: string;
  onQueryChange: (value: string) => void;
  activeCategory: string;
  onCategoryChange: (value: string) => void;
  sortOrder: "newest" | "oldest";
  onSortChange: () => void;
  // Mobile drawer controls. On desktop (lg+) the sidebar ignores these and
  // renders as a normal sticky column regardless of isOpen.
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  sortOrder,
  onSortChange,
  isOpen = false,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Backdrop, mobile drawer only */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`
          fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl z-50
          px-6 py-8 overflow-y-auto transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          lg:static lg:translate-x-0 lg:z-10 lg:w-72 lg:shrink-0 lg:h-auto
          lg:bg-transparent lg:shadow-none lg:px-0 lg:py-0
          lg:sticky lg:top-[111px] lg:self-start lg:max-h-[calc(100vh-127px)]
          space-y-9
        `}
      >
        {/* Header row, mobile only */}
        <div className="flex items-center justify-between lg:hidden">
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FiX className="w-4.5 h-4.5" />
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
            Search
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search article..."
              className="w-full text-sm rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-gray-700 placeholder-gray-400 outline-none focus:border-[#11512a] transition-colors cursor-text"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
            Sort
          </label>
          <button
            type="button"
            onClick={onSortChange}
            className="w-full flex items-center justify-between text-sm rounded-full border border-gray-200 bg-white py-2.5 px-4 text-gray-500 hover:border-[#11512a] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {sortOrder === "newest" ? (
                <BsSortDown className="w-4 h-4" />
              ) : (
                <BsSortUpAlt className="w-4 h-4" />
              )}
              {sortOrder === "newest" ? "Newest first" : "Oldest first"}
            </span>
            <FiChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#11512a] mb-3">
            Browse By Categories
          </h3>
          <ul>
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => onCategoryChange(cat)}
                    className={`w-full text-left pl-4 py-2.5 text-sm border-l-2 transition-colors cursor-pointer ${
                      isActive
                        ? "border-[#990200] text-gray-900 font-semibold bg-[#990200]/5"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}