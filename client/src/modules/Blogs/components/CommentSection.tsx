import { useState } from "react";
import { FiX, FiSend, FiUser } from "react-icons/fi";

interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface CommentSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

// Dummy data. Backend will replace this with real comments for the article.
const DUMMY_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "Priya Sharma",
    text: "MarineTraffic is such an underrated site. I lost an hour on it last week.",
    date: "2h ago",
  },
  {
    id: "c2",
    author: "Daniel Cho",
    text: "The Public Domain Review pick is correct. Their archive of old scientific illustrations is incredible.",
    date: "5h ago",
  },
  {
    id: "c3",
    author: "Wren Alcott",
    text: "Adding Fonts In Use to my bookmarks right now.",
    date: "1d ago",
  },
];

export default function CommentSection({ isOpen, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(DUMMY_COMMENTS);
  const [draft, setDraft] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [askingName, setAskingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  function postComment(author: string) {
    const text = draft.trim();
    if (!text) return;
    // Backend will handle real submission and return the saved comment.
    setComments((prev) => [
      { id: `local-${Date.now()}`, author, text, date: "Just now" },
      ...prev,
    ]);
    setDraft("");
  }

  function handleSubmit() {
    if (!draft.trim()) return;
    if (username) {
      postComment(username);
    } else {
      setNameInput("");
      setAskingName(true);
    }
  }

  function handleConfirmName() {
    const trimmed = nameInput.trim();
    // Backend will assign a real guest identity. For now, fall back to a random guest tag.
    const finalName = trimmed || `Guest${Math.floor(1000 + Math.random() * 9000)}`;
    setUsername(finalName);
    setAskingName(false);
    postComment(finalName);
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
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                <FiUser className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {comment.author}
                  </p>
                  <span className="text-xs text-gray-400">{comment.date}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* New comment input */}
        <div className="border-t border-gray-200 p-4 shrink-0 rounded-b-none md:rounded-b-2xl relative">
          {username && (
            <p className="text-xs text-gray-400 mb-2">
              Posting as <span className="font-semibold text-gray-600">{username}</span>
            </p>
          )}
          {askingName && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10">
              <p className="text-sm font-semibold text-gray-900 mb-1">Add a name</p>
              <p className="text-xs text-gray-400 mb-3">
                Pick a name to post with. Leave it blank for a guest name.
              </p>
              <input
                type="text"
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirmName()}
                placeholder="Your name"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-[#11512a] transition-colors"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAskingName(false)}
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
              className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#11512a] transition-colors"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="w-9 h-9 rounded-full bg-[#11512a] text-white flex items-center justify-center hover:bg-[#0d3f20] transition-colors cursor-pointer shrink-0"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}