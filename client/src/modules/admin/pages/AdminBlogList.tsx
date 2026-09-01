import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineSearch, MdEdit, MdDelete, MdKeyboardArrowDown } from "react-icons/md";

import ArticleStats from "../components/BlogStats";
import {
  listPostsApi,
  updatePostStatusApi,
  deletePostApi,
} from "../auth.api";
import type { PostListItem } from "../auth.types";
import { CATEGORIES } from "../../../shared/categories";

type ArticleStatus = "published" | "draft";
type StatusTab = "all" | ArticleStatus;

const STATUS_OPTIONS: ArticleStatus[] = ["published", "draft"];

function toArticleStatus(s: PostListItem["status"]): ArticleStatus {
  return s === "PUBLISHED" ? "published" : "draft";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusLabel(status: ArticleStatus) {
  return status === "published" ? "Published" : "Draft";
}

type PendingAction =
  | { type: "delete"; id: string; heading: string }
  | { type: "status"; id: string; heading: string; newStatus: ArticleStatus }
  | null;

// ---------- Confirm modal ----------
function ConfirmModal({
  action,
  processing,
  onCancel,
  onConfirm,
}: {
  action: Exclude<PendingAction, null>;
  processing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDelete = action.type === "delete";
  const title = isDelete
    ? "Delete this article?"
    : `Change status to ${statusLabel(action.newStatus)}?`;
  const message = isDelete
    ? `"${action.heading}" will be permanently removed. This action can't be undone.`
    : `"${action.heading}" will be marked as ${statusLabel(action.newStatus).toLowerCase()}.`;
  const confirmLabel = isDelete ? "Delete" : "Confirm";
  const loadingLabel = isDelete ? "Deleting…" : "Saving…";
  const confirmColor = isDelete ? "#680505" : "#11512a";

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={processing ? undefined : onCancel}
    >
      <div
        className="bg-white rounded-xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={processing}
            style={{ backgroundColor: confirmColor }}
            className="text-sm font-medium text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed min-w-[92px] text-center"
          >
            {processing ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Status dropdown ----------
function StatusDropdown({
  status,
  isOpen,
  onOpen,
  onSelect,
}: {
  status: ArticleStatus;
  isOpen: boolean;
  onOpen: () => void;
  onSelect: (status: ArticleStatus) => void;
}) {
  const isPub = status === "published";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
          isPub
            ? "bg-[#e9f2ec] text-[#11512a] hover:bg-[#dcebe1]"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isPub ? "bg-[#11512a]" : "bg-gray-400"}`} />
        {statusLabel(status)}
        <MdKeyboardArrowDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-10 left-0 mt-1 w-36 rounded-lg border border-gray-200 bg-white shadow-sm py-1"
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === status}
              onClick={() => onSelect(opt)}
              className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  opt === "published" ? "bg-[#11512a]" : "bg-gray-400"
                }`}
              />
              {statusLabel(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Skeleton row ----------
function ArticleRowSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-7 sm:py-8 animate-pulse">
      <div className="hidden sm:block w-24 h-24 shrink-0 rounded-md bg-gray-100" />
      <div className="flex-1 min-w-0">
        <div className="h-5 w-20 bg-gray-100 rounded-full mb-2.5" />
        <div className="h-5 w-3/4 bg-gray-100 rounded mb-2" />
        <div className="hidden sm:block h-4 w-2/3 bg-gray-100 rounded mb-2" />
        <div className="h-3 w-40 bg-gray-100 rounded" />
      </div>
      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
        <div className="w-9 h-9 rounded-full bg-gray-100" />
        <div className="w-9 h-9 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

export default function AdminArticleManager() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState<PostListItem[]>([]);
  const [stats, setStats] = useState({ all: 0, published: 0, draft: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [processing, setProcessing] = useState(false);

  async function fetchArticles() {
    setLoading(true);
    setError(null);
    try {
      const res = await listPostsApi({
        status: statusTab,
        category: categoryFilter === "All Category" ? undefined : categoryFilter,
        search: query || undefined,
      });
      const data = res.data.data;
      setArticles(data.posts);
      setStats(data.stats);
    } catch (err) {
      setError("Couldn't load articles. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchArticles, 300); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTab, categoryFilter, query]);

  const filtered = useMemo(() => articles, [articles]);

  function goToEdit(id: string) {
    navigate(`/admin/blogs/${id}`);
  }

  function requestStatusChange(article: PostListItem, newStatus: ArticleStatus) {
    setStatusMenuId(null);
    if (newStatus === toArticleStatus(article.status)) return;
    setPendingAction({ type: "status", id: article.id, heading: article.title, newStatus });
  }

  function requestDelete(article: PostListItem) {
    setPendingAction({ type: "delete", id: article.id, heading: article.title });
  }

  function cancelPendingAction() {
    if (processing) return;
    setPendingAction(null);
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;
    setProcessing(true);
    try {
      if (pendingAction.type === "delete") {
        await deletePostApi(pendingAction.id);
      } else {
        await updatePostStatusApi(pendingAction.id, pendingAction.newStatus);
      }
      await fetchArticles();
    } catch (err) {
      setError("That action failed. Try again.");
    } finally {
      setProcessing(false);
      setPendingAction(null);
    }
  }

  return (
    <div className="min-h-screen bg-white font-['Poppins',_sans-serif]">
      {/* Header band */}
      <div
        className="relative overflow-hidden px-4 sm:px-6 py-9 sm:py-11"
        style={{
          background: "linear-gradient(135deg, #7a0a0a 0%, #680505 55%, #4a0303 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: "#11512a" }}
        />

        <div className="relative mx-auto max-w-5xl flex items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl uppercase font-semibold text-white tracking-tight">
              Your articles
            </h1>
            <p className="text-sm text-white/70 mt-1.5 max-w-md">
              Edit, publish, and remove articles across the site.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/blogs/new")}
            className="shrink-0 px-7 py-3.5 rounded-lg bg-white/10 border border-white/10 text-white/90 text-sm font-medium hover:bg-white/15 transition-colors cursor-pointer"
          >
            Create New
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Stat strip */}
        <ArticleStats
          total={stats.all}
          published={stats.published}
          drafts={stats.draft}
          totalViews={stats.totalViews}
        />

        {error && (
          <div className="text-sm text-[#680505] bg-red-50 rounded-md px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        {/* Status tabs */}
        <div className="flex items-center gap-5 border-b border-gray-200 mb-4">
          {(
            [
              { key: "all", label: "All" },
              { key: "published", label: "Published" },
              { key: "draft", label: "Drafts" },
            ] as { key: StatusTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusTab(tab.key)}
              className="whitespace-nowrap pb-3 text-sm font-medium -mb-px transition-colors cursor-pointer"
              style={{
                borderBottom: statusTab === tab.key ? "2px solid #11512a" : "2px solid transparent",
                color: statusTab === tab.key ? "#11512a" : "#6b7280",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <div className="relative flex-1">
            <MdOutlineSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title"
              className="w-full text-sm rounded-full border border-gray-200 bg-white pl-9 pr-4 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setCatMenuOpen((o) => !o)}
              className="w-full sm:w-auto flex items-center justify-between gap-1.5 text-sm rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
            >
              {categoryFilter}
              <MdKeyboardArrowDown className="w-3.5 h-3.5" />
            </button>
            {catMenuOpen && (
              <div className="absolute z-10 right-0 mt-1 w-44 rounded-lg border border-gray-200 bg-white shadow-sm py-1">
                {["All Category", ...CATEGORIES].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(c);
                      setCatMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="border-t border-gray-200">
          {loading && (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <ArticleRowSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-sm text-gray-400 py-14 text-center">
              No articles match your filters.
            </p>
          )}

          {!loading && filtered.length > 0 && (
            <div className="divide-y divide-gray-100">
              {filtered.map((article) => {
                const status = toArticleStatus(article.status);
                return (
                  <div
                    key={article.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-7 sm:py-8"
                  >
                    <div className="hidden sm:block w-24 h-24 shrink-0 rounded-md overflow-hidden bg-gray-100">
                      {article.heroImage && (
                        <img
                          src={article.heroImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        <StatusDropdown
                          status={status}
                          isOpen={statusMenuId === article.id}
                          onOpen={() =>
                            setStatusMenuId((cur) => (cur === article.id ? null : article.id))
                          }
                          onSelect={(newStatus) => requestStatusChange(article, newStatus)}
                        />
                        <span className="text-xs text-gray-400">{article.category}</span>
                      </div>

                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
                        {article.title}
                      </h2>

                      <p className="hidden sm:block text-sm text-gray-500 leading-relaxed mt-1.5 max-w-2xl">
                        {article.dek}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap mt-2.5 text-xs text-gray-500">
                        <span>{article.author.name}</span>
                        <span>·</span>
                        <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => goToEdit(article.id)}
                        title="Edit"
                        aria-label={`Edit ${article.title}`}
                        className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(article)}
                        title="Delete"
                        aria-label={`Delete ${article.title}`}
                        className="p-2.5 rounded-full text-gray-500 hover:bg-red-50 transition-colors cursor-pointer"
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#680505")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {pendingAction && (
        <ConfirmModal
          action={pendingAction}
          processing={processing}
          onCancel={cancelPendingAction}
          onConfirm={confirmPendingAction}
        />
      )}
    </div>
  );
}