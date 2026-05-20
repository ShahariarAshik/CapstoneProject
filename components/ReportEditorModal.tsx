"use client";

import { useEffect, useRef } from "react";
import Modal from "@/components/Modal";

interface ReportEditorModalProps {
  reportName: string;
  content: string;
  onClose: () => void;
}

export default function ReportEditorModal({
  reportName,
  content,
  onClose,
}: ReportEditorModalProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content?.trim()
        ? content
        : "<p>No content returned from the API.</p>";
    }
  }, [content]);

  return (
    <Modal
      title={reportName}
      onClose={onClose}
      className="h-[85vh] w-[80vw] max-h-[85vh] max-w-[800px]"
    >
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        className="min-h-full text-sm leading-7 focus:outline-none text-t1 whitespace-pre-wrap"
      />
    </Modal>
  );
}
