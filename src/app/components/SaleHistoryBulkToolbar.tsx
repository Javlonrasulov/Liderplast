import { Download } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { useApp } from '../i18n/app-context';

type Props = {
  allSelected: boolean;
  onToggleAll: () => void;
  selectedCount: number;
  onBulkDownload: () => void;
  downloading?: boolean;
};

export function SaleHistoryBulkToolbar({
  allSelected,
  onToggleAll,
  selectedCount,
  onBulkDownload,
  downloading = false,
}: Props) {
  const { t } = useApp();

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60">
      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
        <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
        <span>{allSelected ? t.slDeselectAll : t.slSelectAll}</span>
      </label>
      {selectedCount > 0 && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t.slSelectedCount.replace('{n}', String(selectedCount))}
        </span>
      )}
      <button
        type="button"
        disabled={selectedCount === 0 || downloading}
        onClick={onBulkDownload}
        className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold transition-colors"
      >
        <Download size={14} />
        {t.slDownloadSelectedPdf}
      </button>
    </div>
  );
}
