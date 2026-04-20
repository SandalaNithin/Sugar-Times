"use client";
import { forwardRef } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const QuillEditor = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-2xl border-2 border-slate-100" />
});

const RichTextEditor = forwardRef(({ value, onChange, placeholder, onImageUpload }, ref) => {
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "clean"],
        [{ align: [] }],
      ],
      handlers: {
        image: onImageUpload ? onImageUpload : undefined,
      },
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "link",
    "image",
    "align",
  ];

  return (
    <div className="rich-text-editor @container">
      <QuillEditor
        ref={ref}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        className="bg-white rounded-2xl overflow-hidden border-2 border-slate-50 focus-within:border-green-500 transition-all text-sm font-medium"
      />
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          background: #f8fafc;
          border-bottom: 2px solid #f1f5f9 !important;
          padding: 12px 16px !important;
          border-radius: 16px 16px 0 0;
        }
        .ql-container.ql-snow {
          border: none !important;
          min-height: 350px;
          font-family: inherit !important;
          font-size: 14px !important;
        }
        .ql-editor {
          padding: 24px !important;
          line-height: 1.8 !important;
        }
        .ql-editor p {
          margin-bottom: 1.5em !important;
        }
        .ql-editor img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 32px auto !important;
          border-radius: 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .ql-editor.ql-blank::before {
          color: #94a3b8 !important;
          font-style: normal !important;
          font-weight: 600 !important;
          left: 24px !important;
        }
      `}</style>
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
