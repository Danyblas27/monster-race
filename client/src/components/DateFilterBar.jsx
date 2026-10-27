import React, { useRef } from 'react';
import { Calendar, Download, Upload, ShieldCheck, Database } from 'lucide-react';

export default function DateFilterBar({
  availableDates = [],
  selectedDate = 'all',
  onSelectDate,
  monsters = [],
  today = '',
  onExportBackup,
  onImportBackup
}) {
  const fileInputRef = useRef(null);

  // Compute total votes for all days
  const allVotesCount = monsters.reduce((sum, m) => sum + (m.ballots ? m.ballots.length : (m.votes || 0)), 0);

  // Compute votes for a specific date
  const getVotesCountForDate = (dateStr) => {
    return monsters.reduce((sum, m) => {
      if (!Array.isArray(m.ballots)) return sum;
      return sum + m.ballots.filter((b) => b.date === dateStr).length;
    }, 0);
  };

  const formatDateLabel = (dateStr) => {
    if (dateStr === today) {
      return `Today (${dateStr.slice(5)})`;
    }
    // E.g. "2026-10-26" -> "Oct 26"
    try {
      const [year, month, day] = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(month, 10) - 1;
      return `${monthNames[mIdx] || month} ${day}`;
    } catch {
      return dateStr;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImportBackup) {
      onImportBackup(file);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-[#2a232b] border border-[#493e4c] rounded-2xl p-3 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Date Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
        <div className="flex items-center gap-1.5 text-xs text-[#c9bfcc] font-bold uppercase tracking-wider shrink-0 mr-1 select-none">
          <Calendar className="w-3.5 h-3.5 text-[#FB702D]" />
          <span>Filter Day:</span>
        </div>

        {/* All Days Button */}
        <button
          onClick={() => onSelectDate('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
            selectedDate === 'all'
              ? 'bg-[#862FE0] text-white shadow-md shadow-[#862FE0]/40 ring-1 ring-white/30'
              : 'bg-[#211c22] text-[#c9bfcc] border border-[#493e4c] hover:text-white hover:border-[#862FE0]/60'
          }`}
        >
          <span>All Days</span>
          <span
            className={`px-1.5 py-0.2 rounded-md font-mono text-[11px] font-bold ${
              selectedDate === 'all'
                ? 'bg-[#211c22]/60 text-[#88E032]'
                : 'bg-[#373038] text-[#88E032]'
            }`}
          >
            {allVotesCount}
          </span>
        </button>

        {/* Individual Dates */}
        {availableDates.map((dateStr) => {
          const isSelected = selectedDate === dateStr;
          const count = getVotesCountForDate(dateStr);
          const isToday = dateStr === today;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                isSelected
                  ? 'bg-[#FB702D] text-white shadow-md shadow-[#FB702D]/40 ring-1 ring-white/30'
                  : 'bg-[#211c22] text-[#c9bfcc] border border-[#493e4c] hover:text-white hover:border-[#FB702D]/60'
              }`}
            >
              <span>{formatDateLabel(dateStr)}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md font-mono text-[11px] font-bold ${
                  isSelected
                    ? 'bg-[#211c22]/60 text-white'
                    : 'bg-[#373038] text-[#FFC341]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Persistence & Backup Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        {/* Hidden File Input for Restore */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Download Backup Button */}
        <button
          onClick={onExportBackup}
          title="Download full JSON backup of all votes and dates"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#211c22] border border-[#493e4c] text-xs font-medium text-[#c9bfcc] hover:text-white hover:border-[#88E032]/60 hover:bg-[#373038] transition"
        >
          <Download className="w-3.5 h-3.5 text-[#88E032]" />
          <span className="hidden sm:inline">Backup</span>
        </button>

        {/* Restore Backup Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Restore votes from a previously downloaded JSON backup"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#211c22] border border-[#493e4c] text-xs font-medium text-[#c9bfcc] hover:text-white hover:border-[#FFC341]/60 hover:bg-[#373038] transition"
        >
          <Upload className="w-3.5 h-3.5 text-[#FFC341]" />
          <span className="hidden sm:inline">Restore</span>
        </button>
      </div>
    </div>
  );
}