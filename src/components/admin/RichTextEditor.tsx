import { useEffect, useState } from "react";
import { EditorContent, useEditor, Node, mergeAttributes, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
  Video,
} from "lucide-react";
import { mediaUrl, youtubeId, type MediaRow } from "@/lib/media";
import { MediaPicker } from "./MediaPicker";

// keeps embedded videos (iframes) that exist in imported content
const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: "560" },
      height: { default: "315" },
      allowfullscreen: { default: "true" },
      frameborder: { default: "0" },
    };
  },
  parseHTML() {
    return [{ tag: "iframe" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["iframe", mergeAttributes(HTMLAttributes)];
  },
});

function Btn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-lg border text-foreground transition-colors hover:bg-accent disabled:opacity-30 ${
        active ? "bg-primary text-primary-foreground hover:bg-primary" : "bg-card"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  onImage,
  onSource,
  source,
}: {
  editor: Editor;
  onImage: () => void;
  onSource: () => void;
  source: boolean;
}) {
  const setLink = () => {
    const prev = editor.getAttributes("link")["href"] as string | undefined;
    const url = window.prompt("כתובת הקישור (השאר ריק להסרה)", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const addVideo = () => {
    const url = window.prompt("קישור YouTube");
    if (!url) return;
    const id = youtubeId(url);
    if (!id) return window.alert("קישור YouTube לא תקין");
    editor
      .chain()
      .focus()
      .insertContent({ type: "iframe", attrs: { src: `https://www.youtube.com/embed/${id}` } })
      .run();
  };
  const c = () => editor.chain().focus();
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/50 p-2">
      <Btn
        label="כותרת גדולה"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => c().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </Btn>
      <Btn
        label="כותרת משנה"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => c().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </Btn>
      <span className="mx-1 h-6 w-px bg-border" />
      <Btn label="מודגש" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()}>
        <Bold className="size-4" />
      </Btn>
      <Btn label="נטוי" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()}>
        <Italic className="size-4" />
      </Btn>
      <Btn
        label="קו תחתון"
        active={editor.isActive("underline")}
        onClick={() => c().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" />
      </Btn>
      <span className="mx-1 h-6 w-px bg-border" />
      <Btn
        label="רשימת תבליטים"
        active={editor.isActive("bulletList")}
        onClick={() => c().toggleBulletList().run()}
      >
        <List className="size-4" />
      </Btn>
      <Btn
        label="רשימה ממוספרת"
        active={editor.isActive("orderedList")}
        onClick={() => c().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </Btn>
      <Btn
        label="ציטוט"
        active={editor.isActive("blockquote")}
        onClick={() => c().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </Btn>
      <span className="mx-1 h-6 w-px bg-border" />
      <Btn
        label="יישור לימין"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => c().setTextAlign("right").run()}
      >
        <AlignRight className="size-4" />
      </Btn>
      <Btn
        label="מרכוז"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => c().setTextAlign("center").run()}
      >
        <AlignCenter className="size-4" />
      </Btn>
      <Btn
        label="יישור לשמאל"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => c().setTextAlign("left").run()}
      >
        <AlignLeft className="size-4" />
      </Btn>
      <span className="mx-1 h-6 w-px bg-border" />
      <Btn label="קישור" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="size-4" />
      </Btn>
      <Btn label="תמונה מהספרייה" onClick={onImage}>
        <ImageIcon className="size-4" />
      </Btn>
      <Btn label="סרטון YouTube" onClick={addVideo}>
        <Video className="size-4" />
      </Btn>
      <Btn label="קו מפריד" onClick={() => c().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </Btn>
      <span className="mx-1 h-6 w-px bg-border" />
      <Btn label="ביטול" disabled={!editor.can().undo()} onClick={() => c().undo().run()}>
        <Undo2 className="size-4" />
      </Btn>
      <Btn label="חזרה" disabled={!editor.can().redo()} onClick={() => c().redo().run()}>
        <Redo2 className="size-4" />
      </Btn>
      <Btn label="קוד HTML" active={source} onClick={onSource}>
        <Code2 className="size-4" />
      </Btn>
    </div>
  );
}

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: Props) {
  const [source, setSource] = useState(false);
  const [picker, setPicker] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: true, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "כתוב כאן את הטקסט…" }),
      Iframe,
    ],
    content: value,
    editorProps: {
      attributes: { class: "rte-content min-h-[240px] px-4 py-3 outline-none", dir: "auto" },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  // keep the editor in sync if the value is replaced from outside (e.g. HTML source mode)
  useEffect(() => {
    if (editor && !source && value !== editor.getHTML() && !(value === "" && editor.isEmpty)) {
      editor.commands.setContent(value, false);
    }
  }, [value, source, editor]);

  if (!editor) return <div className="h-60 rounded-xl border bg-card" />;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Toolbar
        editor={editor}
        source={source}
        onSource={() => setSource((s) => !s)}
        onImage={() => setPicker(true)}
      />
      {source ? (
        <textarea
          dir="ltr"
          rows={14}
          className="block w-full bg-card p-3 font-mono text-sm outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onPick={(rows: MediaRow[]) => {
            const r = rows[0];
            if (r)
              editor
                .chain()
                .focus()
                .setImage({ src: mediaUrl(r.storage_path) })
                .run();
          }}
        />
      )}
    </div>
  );
}
