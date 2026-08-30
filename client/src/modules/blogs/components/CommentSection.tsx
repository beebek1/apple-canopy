import { useEffect, useRef, useState } from "react";
import { FiX, FiSend, FiUser } from "react-icons/fi";
import { createCommentApi, listCommentsApi } from "../blog.api"; // adjust path

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
}

interface CommentSectionProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AUTHOR_NAME_KEY = "blog_comment_author_name";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CommentSection({ postId, isOpen, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Who "you" are, remembered locally so a returning visitor is recognized
  // without having to type their name again.
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [showNameGate, setShowNameGate] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Load the remembered name once on mount.
  useEffect(() => {
    const stored = localStorage.getItem(AUTHOR_NAME_KEY);
    if (stored) setAuthorName(stored);
  }, []);

  useEffect(() => {
    if (showNameGate) nameInputRef.current?.focus();
  }, [showNameGate]);

  // Fetch once, the first time the panel is opened — no need to refetch
  // every toggle.
  useEffect(() => {
    if (!isOpen || loaded) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listCommentsApi(postId);
        if (!cancelled) {
          setComments(res.data.data);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setError("Couldn't load comments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, loaded, postId]);

  async function postComment(name: string) {
    const text = draft.trim();
    if (!text || posting) return;

    setPosting(true);
    setError(null);
    try {
      const res = await createCommentApi(postId, text, name);
      const saved = res.data.data;
      setComments((prev) => [
        { id: saved.id, content: saved.content, createdAt: saved.createdAt, authorName: name },
        ...prev,
      ]);
      setDraft("");
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setError(err.response.data?.message ?? "You're commenting too quickly. Try again in a minute.");
      } else {
        setError("Couldn't post your comment. Try again.");
      }
    } finally {
      setPosting(false);
    }
  }

  function handleSubmit() {
    if (!draft.trim() || posting) return;
    // First time commenting on this device — ask who they are before sending.
    if (!authorName) {
      setShowNameGate(true);
      return;
    }
    postComment(authorName);
  }

  function handleConfirmName() {
    const name = nameDraft.trim();
    if (!name) {
      setNameError("Enter a name so people know who's talking.");
      return;
    }
    if (name.length > 40) {
      setNameError("Keep it under 40 characters.");
      return;
    }
    // Permanent for this device — there's no edit affordance once this is set.
    localStorage.setItem(AUTHOR_NAME_KEY, name);
    setAuthorName(name);
    setShowNameGate(false);
    setNameDraft("");
    setNameError(null);
    postComment(name);
  }

  return (
    <>
      {/* Full-screen sheet on mobile, floating rectangle panel on the right on desktop */}
      <div
        className={`fixed inset-0 md:inset-auto md:top-[120px] md:right-6 md:bottom-6 w-full md:max-w-[380px] bg-white z-50 shadow-2xl rounded-none md:rounded-2xl border-0 md:border md:border-gray-200 transition-all duration-300 ease-out flex flex-col font-['Poppins',_sans-serif] ${
          isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full md:translate-x-6 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 shrink-0 rounded-t-none md:rounded-t-2xl">
          <h3 className="text-base font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FiX className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 min-h-0">
          {loading && (
            <div className="space-y-6 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-24 bg-gray-100 rounded" />
                    <div className="h-3.5 w-full bg-gray-100 rounded" />
                    <div className="h-3.5 w-2/3 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && comments.length === 0 && !error && (
            <p className="text-sm text-gray-400 text-center py-8">
              No comments yet. Be the first to say something.
            </p>
          )}

          {!loading &&
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <FiUser className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {comment.authorName}
                    </p>
                    <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mt-1">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {/* New comment input */}
        <div className="border-t border-gray-200 p-4 shrink-0 rounded-b-none md:rounded-b-2xl relative">
          {/* Name gate — floats above the input the first time someone tries to
              comment on this device, without displacing the comment list */}
          {showNameGate && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10">
              <p className="text-sm font-semibold text-gray-900 mb-1">What's your name?</p>
              <p className="text-xs text-gray-400 mb-3">
                This is shown next to your comments — it can't be changed later.
              </p>
              <input
                ref={nameInputRef}
                type="text"
                value={nameDraft}
                onChange={(e) => {
                  setNameDraft(e.target.value);
                  if (nameError) setNameError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmName();
                  }
                }}
                placeholder="Your name"
                maxLength={40}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-1 focus:outline-none focus:border-[#11512a] transition-colors"
              />
              {nameError && <p className="text-xs text-[#680505] mb-2">{nameError}</p>}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNameGate(false);
                    setNameDraft("");
                    setNameError(null);
                  }}
                  className="text-xs font-medium text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmName}
                  className="text-xs font-semibold text-white bg-[#11512a] px-4 py-2 rounded-lg hover:bg-[#0d3f20] transition-colors cursor-pointer"
                >
                  Post comment
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-[#680505] bg-red-50 rounded-lg px-3 py-2 mb-2">
              {error}
            </p>
          )}

          {authorName && (
            <p className="text-xs text-gray-400 mb-2">
              Commenting as <span className="font-semibold text-gray-600">{authorName}</span>
            </p>
          )}

          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Add a comment"
              rows={2}
              disabled={posting}
              className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#11512a] transition-colors disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={posting || !draft.trim()}
              className="w-9 h-9 rounded-full bg-[#11512a] text-white flex items-center justify-center hover:bg-[#0d3f20] transition-colors cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}