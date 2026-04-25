"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaListOl,
    FaListUl,
    FaHeading,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface TiptapProps {
    onChange: (content: string) => void;
    value: string;
    disabled?: boolean;
}

const Tiptap = ({ onChange, value,disabled=false }: TiptapProps) => {
    const [headingLevel, setHeadingLevel] = useState<number | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            BulletList.configure({ HTMLAttributes: { class: "bullet-list" } }),
            OrderedList.configure({ HTMLAttributes: { class: "ordered-list" } }),
            ListItem.configure({ HTMLAttributes: { class: "list-item" } }),
        ],
        content: value || "<p></p>",
        editorProps: {
            attributes: {
                class: "min-h-[100px] p-2 focus:outline-none border border-input rounded-md bg-background",
            },
        },
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            .ProseMirror ul.bullet-list {
                list-style-type: disc;
                padding-left: 1.5rem;
                margin: 0.5rem 0;
            }
            .ProseMirror ol.ordered-list {
                list-style-type: decimal;
                padding-left: 1.5rem;
                margin: 0.5rem 0;
            }
            .ProseMirror li.list-item {
                margin: 0.25rem 0;
            }
            .ProseMirror h1 { font-size: 2em; margin: 0.67em 0; }
            .ProseMirror h2 { font-size: 1.5em; margin: 0.75em 0; }
            .ProseMirror h3 { font-size: 1.17em; margin: 0.83em 0; }
            .ProseMirror h4 { font-size: 1em; margin: 1em 0; }
            .ProseMirror h5 { font-size: 0.83em; margin: 1.33em 0; }
            .ProseMirror h6 { font-size: 0.67em; margin: 1.67em 0; }
        `;
        document.head.appendChild(style);

        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "<p></p>");
        }

        return () => {
            document.head.removeChild(style);
        };
    }, [value, editor]);

    if (!editor) return null;

    const handleHeadingChange = (level: number) => {
        setHeadingLevel(level);
        editor.chain().focus().toggleHeading({ level:level as any }).run();
    };

    return (
        <div className="flex flex-col space-y-2 ">
            <div className="flex flex-wrap items-center gap-2 p-1 border border-muted rounded-md bg-muted/30">
                {/* Heading Selector */}
                <div className="flex items-center gap-1">
                    {/* <FaHeading className="text-muted-foreground" /> */}
                    <Select
                        value={headingLevel?.toString() || "normal"}
                        onValueChange={(value) => {
                            if (value === "normal") {
                                editor.chain().focus().setParagraph().run();
                                setHeadingLevel(null);
                            } else {
                                handleHeadingChange(parseInt(value));
                            }
                        }}
                    >
                        <SelectTrigger className="w-[140px] h-8 text-sm">
                            <SelectValue placeholder="Normal text" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="normal">Normal text</SelectItem>
                            {[1, 2, 3, 4, 5, 6].map((level) => (
                                <SelectItem key={level} value={level.toString()}>
                                    Heading {level}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <span className="h-5 border-l border-border mx-2" />

                {/* Formatting Buttons */}
                {[
                    {
                        icon: <FaBold />,
                        action: () => editor.chain().focus().toggleBold().run(),
                        isActive: editor.isActive("bold"),
                        title: "Bold",
                    },
                    {
                        icon: <FaItalic />,
                        action: () => editor.chain().focus().toggleItalic().run(),
                        isActive: editor.isActive("italic"),
                        title: "Italic",
                    },
                    {
                        icon: <FaUnderline />,
                        action: () => editor.chain().focus().toggleUnderline().run(),
                        isActive: editor.isActive("underline"),
                        title: "Underline",
                    },
                ].map((btn, i) => (
                    <button
                        key={i}
                        onClick={btn.action}
                        className={`p-2 rounded-md transition-colors duration-200 ${
                            btn.isActive ? "bg-primary text-white" : "hover:bg-accent"
                        }`}
                        title={btn.title}
                    >
                        {btn.icon}
                    </button>
                ))}

                <span className="h-5 border-l border-border mx-2" />

                {/* List Buttons */}
                {[
                    {
                        icon: <FaListUl />,
                        action: () => editor.chain().focus().toggleBulletList().run(),
                        isActive: editor.isActive("bulletList"),
                        title: "Bullet List",
                    },
                    {
                        icon: <FaListOl />,
                        action: () => editor.chain().focus().toggleOrderedList().run(),
                        isActive: editor.isActive("orderedList"),
                        title: "Ordered List",
                    },
                ].map((btn, i) => (
                    <button
                        key={i}
                        onClick={btn.action}
                        className={`p-2 rounded-md transition-colors duration-200 ${
                            btn.isActive ? "bg-primary text-white" : "hover:bg-accent"
                        }`}
                        title={btn.title}
                    >
                        {btn.icon}
                    </button>
                ))}
            </div>

            <EditorContent
                editor={editor}
                disabled={disabled}
                className="max-h-[500px]  max-w-full  overflow-scroll border border-input rounded-md bg-background p-2 focus:outline-none"
            />
        </div>
    );
};

export default Tiptap;
