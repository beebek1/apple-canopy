import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdArrowBack, MdImage, MdCheckCircle, MdErrorOutline } from "react-icons/md";
import { listPublicStatusesApi, upsertStatusApi } from "./status.api"; // adjust path
import { CATEGORIES } from "../../shared/categories";

const HEADING_LIMIT = 50;
const SLOTS = [1, 2, 3] as const;

type BodyType = "paragraph" | "quote";

type SlotData = {
  category: string;
  heading: string;
  body: string;
  bodyType: BodyType;
  image: string | null;
};

const emptySlot: SlotData = {
  category: "",
  heading: "",
  body: "",
  bodyType: "paragraph",
  image: null,
};

export default function StatusEditPage() {
  const { slot: slotParam } = useParams<{ slot: string }>();
  const navigate = useNavigate();

  const initialSlot = Number(slotParam) || SLOTS[0];

  const [loading, setLoading] = useState(true);
  const [activeSlot, setActiveSlot] = useState<number>(initialSlot);
  const [allSlots, setAllSlots] = useState<Record<number, SlotData>>({});

  const [category, setCategory] = useState("");
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [bodyType, setBodyType] = useState<BodyType>("paragraph");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load every slot once, up front, so switching tabs is instant.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listPublicStatusesApi();
        if (cancelled) return;
        const next: Record<number, SlotData> = {};
        res.data.data.forEach((s) => {
          next[s.slot] = {
            category: s.category,
            heading: s.heading,
            body: s.body,
            bodyType: s.bodyType,
            image: s.image,
          };
        });
        setAllSlots(next);
        applySlot(initialSlot, next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (preview && file) URL.revokeObjectURL(preview);
    };
  }, [preview, file]);

  function applySlot(slotNum: number, source: Record<number, SlotData>) {
    const data = source[slotNum] ?? emptySlot;
    setCategory(data.category);
    setIsCustomCategory(Boolean(data.category) && !CATEGORIES.includes(data.category as any));
    setHeading(data.heading);
    setBody(data.body);
    setBodyType(data.bodyType);
    setPreview(data.image);
    setFile(null);
    setMessage(null);
  }

  function handleSwitchSlot(slotNum: number) {
    if (slotNum === activeSlot || saving) return;
    if (preview && file) URL.revokeObjectURL(preview);
    setActiveSlot(slotNum);
    navigate(`/admin/status/${slotNum}`, { replace: true });
    applySlot(slotNum, allSlots);
  }

  function handleFile(selected: File | undefined) {
    if (!selected) return;
    if (preview && file) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSave() {
    setMessage(null);
    if (!category.trim() || !heading.trim() || !body.trim()) {
      setMessage({ type: "error", text: "Fill in category, heading, and body first." });
      return;
    }
    if (heading.length > HEADING_LIMIT) {
      setMessage({ type: "error", text: `Heading can't exceed ${HEADING_LIMIT} characters.` });
      return;
    }
    if (!file) {
      setMessage({ type: "error", text: "Choose an image — saving replaces this slot's image too." });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("category", category.trim());
      formData.append("heading", heading.trim());
      formData.append("body", body.trim());
      formData.append("bodyType", bodyType);
      formData.append("image", file);

      const response = await upsertStatusApi(activeSlot, formData);
      setMessage({ type: "success", text: response.data?.message ?? "Status updated." });
      setTimeout(() => navigate("/"), 800);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message ?? "Couldn't save this slot. Try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Poppins',_sans-serif] px-4 sm:px-6 py-10 animate-pulse">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="h-6 w-40 bg-gray-100 rounded" />
          <div className="h-9 w-full bg-gray-100 rounded-full" />
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-lg" />
          <div className="h-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Poppins',_sans-serif] px-4 sm:px-6 py-10">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#11512a] mb-6 cursor-pointer"
        >
          <MdArrowBack className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-xl font-semibold text-gray-900 mb-1">Edit hero status</h1>
        <p className="text-sm text-gray-500 mb-5">
          Pick a slot below, edit it, and save — you can swap between all three without leaving this page.
        </p>

        {/* Slot switcher */}
        <div className="flex items-center gap-2 mb-8 p-1 bg-gray-50 rounded-full w-fit">
          {SLOTS.map((s) => {
            const isActive = s === activeSlot;
            const hasContent = Boolean(allSlots[s]);
            return (
              <button
                key={s}
                type="button"
                disabled={saving}
                onClick={() => handleSwitchSlot(s)}
                className={`relative flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer disabled:cursor-not-allowed ${
                  isActive
                    ? "bg-[#11512a] text-white shadow-sm"
                    : "text-gray-500 hover:bg-white hover:text-[#11512a]"
                }`}
              >
                Slot {s}
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasContent ? (isActive ? "bg-white" : "bg-[#11512a]") : "bg-gray-300"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="space-y-5">
          {/* Image */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#11512a]/40 overflow-hidden relative cursor-pointer"
            >
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-gray-400">
                  <MdImage className="w-6 h-6" />
                  <span className="text-xs font-medium">Click to upload a landscape image</span>
                </div>
              )}
              <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-white bg-black/60 px-2 py-1 rounded-full">
                {file ? "New image selected" : preview ? "Click to replace" : "Click to upload"}
              </span>
            </button>
          </div>


          {/* Category */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>

            <select
              value={isCustomCategory ? "__custom__" : category}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__custom__") {
                  setIsCustomCategory(true);
                  setCategory("");
                } else {
                  setIsCustomCategory(false);
                  setCategory(val);
                }
              }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#11512a] transition-colors bg-white cursor-pointer"
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__custom__">Custom…</option>
            </select>

            {isCustomCategory && (
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Type a custom category"
                autoFocus
                className="w-full mt-2 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#11512a] transition-colors"
              />
            )}
          </div>

          {/* Heading */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">Heading</label>
              <span className={`text-[11px] ${heading.length > HEADING_LIMIT ? "text-[#680505] font-semibold" : "text-gray-400"}`}>
                {heading.length}/{HEADING_LIMIT}
              </span>
            </div>
            <textarea
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              rows={2}
              maxLength={HEADING_LIMIT}
              placeholder="PROJECT NAME GOES HERE"
              className="w-full resize-none text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#11512a] transition-colors"
            />
          </div>

          {/* Body type */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Body style</label>
            <div className="flex gap-2">
              {(["paragraph", "quote"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBodyType(t)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer capitalize ${
                    bodyType === t
                      ? "bg-[#11512a] border-[#11512a] text-white"
                      : "border-gray-200 text-gray-500 hover:border-[#11512a]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              {bodyType === "quote" ? "Quote" : "Paragraph"}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder={bodyType === "quote" ? "A short, quotable line…" : "A sentence or two of context…"}
              className="w-full resize-none text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#11512a] transition-colors"
            />
          </div>

          {/* Inline message — errors AND success show here */}
          {message && (
            <p
              className={`flex items-center gap-1.5 text-xs rounded-lg px-3 py-2 ${
                message.type === "error"
                  ? "text-[#680505] bg-red-50"
                  : "text-[#11512a] bg-green-50"
              }`}
            >
              {message.type === "error" ? (
                <MdErrorOutline className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <MdCheckCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              {message.text}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full text-sm font-semibold text-white bg-[#11512a] py-2.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save status"}
          </button>
        </div>
      </div>
    </div>
  );
}