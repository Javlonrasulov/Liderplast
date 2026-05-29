import React, { useId, useRef } from 'react';
import { Paperclip, X } from 'lucide-react';
import { useApp } from '../i18n/app-context';
import { cn } from './ui/utils';

interface FilePickerFieldProps {
  accept?: string;
  fileName?: string | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

export function FilePickerField({
  accept,
  fileName,
  onFile,
  disabled,
  className,
}: FilePickerFieldProps) {
  const { t } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const clear = () => {
    onFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm transition-colors dark:border-slate-600 dark:bg-slate-700/40',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20',
        )}
      >
        <Paperclip size={16} className="shrink-0 text-slate-400" />
        <span className="font-medium text-indigo-600 dark:text-indigo-400">{t.caChooseFile}</span>
        <span className="truncate text-slate-500 dark:text-slate-400">
          {fileName?.trim() ? fileName : t.caNoFileChosen}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            onFile(file);
          }}
        />
      </label>
      {fileName?.trim() && !disabled && (
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
        >
          <X size={12} />
          {t.caRemoveFile}
        </button>
      )}
    </div>
  );
}
