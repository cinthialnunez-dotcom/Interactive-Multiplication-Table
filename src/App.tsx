/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Volume2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GripHorizontal,
  GripVertical,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function App() {
  // Independent state for row and column selection
  const [selectedRow, setSelectedRow] = useState<number>(4);
  const [selectedCol, setSelectedCol] = useState<number>(6);
  const [hideAnswer, setHideAnswer] = useState<boolean>(false);
  const [showKeyGuide, setShowKeyGuide] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Dragging interaction state
  const [isDraggingRow, setIsDraggingRow] = useState<boolean>(false);
  const [isDraggingCol, setIsDraggingCol] = useState<boolean>(false);

  // Drag tracking refs
  const gridRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMoved = useRef<boolean>(false);

  // Reset to 1 x 1
  const handleReset = () => {
    setSelectedRow(1);
    setSelectedCol(1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is interacting with an input/textarea if any
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedRow((prev) => Math.max(1, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedRow((prev) => Math.min(12, prev + 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedCol((prev) => Math.max(1, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedCol((prev) => Math.min(12, prev + 1));
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleReset();
          break;
        case 'h':
        case 'H':
        case ' ':
          e.preventDefault();
          setHideAnswer((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Text to speech for special education reinforcement
  const speakEquation = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const answer = selectedRow * selectedCol;
    const text = hideAnswer
      ? `${selectedRow} times ${selectedCol} equals what? Can you solve it?`
      : `${selectedRow} times ${selectedCol} equals ${answer}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; // slightly slower for better comprehension
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [selectedRow, selectedCol, hideAnswer]);

  // Handle Dragging Horizontal Bar (Row Selector)
  const handleRowPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingRow(true);
    hasMoved.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleRowPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRow || !gridRef.current) return;
    const dy = Math.abs(e.clientY - dragStartPos.current.y);
    const dx = Math.abs(e.clientX - dragStartPos.current.x);
    if (dy > 4 || dx > 4) {
      hasMoved.current = true;
    }

    const rect = gridRef.current.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const rowHeight = rect.height / 13;
    const row = Math.floor(relY / rowHeight);
    const clampedRow = Math.max(1, Math.min(12, row));
    if (clampedRow !== selectedRow) {
      setSelectedRow(clampedRow);
    }
  };

  const handleRowPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRow) return;
    setIsDraggingRow(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // If it was just a quick click on the bar without moving, determine column clicked
    if (!hasMoved.current && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const colWidth = rect.width / 13;
      const col = Math.floor(relX / colWidth);
      if (col >= 1 && col <= 12) {
        setSelectedCol(col);
      }
    }
  };

  // Handle Dragging Vertical Bar (Column Selector)
  const handleColPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCol(true);
    hasMoved.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleColPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCol || !gridRef.current) return;
    const dx = Math.abs(e.clientX - dragStartPos.current.x);
    const dy = Math.abs(e.clientY - dragStartPos.current.y);
    if (dx > 4 || dy > 4) {
      hasMoved.current = true;
    }

    const rect = gridRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const colWidth = rect.width / 13;
    const col = Math.floor(relX / colWidth);
    const clampedCol = Math.max(1, Math.min(12, col));
    if (clampedCol !== selectedCol) {
      setSelectedCol(clampedCol);
    }
  };

  const handleColPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingCol) return;
    setIsDraggingCol(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // If it was just a quick click on the bar without moving, determine row clicked
    if (!hasMoved.current && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      const rowHeight = rect.height / 13;
      const row = Math.floor(relY / rowHeight);
      if (row >= 1 && row <= 12) {
        setSelectedRow(row);
      }
    }
  };

  // Click on a cell or header
  const handleCellClick = (r: number, c: number) => {
    if (r === 0 && c === 0) return;
    if (r === 0) {
      // Clicked column header
      setSelectedCol(c);
    } else if (c === 0) {
      // Clicked row header
      setSelectedRow(r);
    } else {
      // Clicked table cell
      setSelectedRow(r);
      setSelectedCol(c);
    }
  };

  const currentAnswer = selectedRow * selectedCol;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 select-none">
      {/* Invisible screen reader announcer */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {hideAnswer
          ? `Selected ${selectedRow} times ${selectedCol}. Answer is hidden.`
          : `Selected ${selectedRow} times ${selectedCol} equals ${currentAnswer}.`}
      </div>

      {/* Main Container */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-3 md:gap-4 my-auto">
        {/* Top Control Bar with Accessibility Buttons */}
        <header className="w-full flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Reset chart to 1 × 1 (Shortcut: R)"
              aria-label="Reset chart to 1 times 1"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => setHideAnswer((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 border text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer ${
                hideAnswer
                  ? 'bg-amber-100 border-amber-400 text-amber-900 hover:bg-amber-200'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
              title="Toggle hiding answer for practice (Shortcut: Space or H)"
              aria-label={hideAnswer ? 'Show Answer' : 'Hide Answer'}
            >
              {hideAnswer ? (
                <>
                  <Eye className="w-4 h-4 text-amber-700" />
                  <span>Show Answer</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-slate-600" />
                  <span>Hide Answer</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={speakEquation}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer ${
                isSpeaking ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
              }`}
              title="Listen to the equation aloud"
              aria-label="Read equation aloud"
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-emerald-600' : 'text-slate-600'}`} />
              <span className="hidden sm:inline">Listen</span>
            </button>

            <button
              onClick={() => setShowKeyGuide((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-2 sm:px-3 sm:py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Keyboard and touch guide"
              aria-label="Keyboard shortcuts and guide"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Keys</span>
            </button>
          </div>
        </header>

        {/* Keyboard Shortcut & Gesture Helper Drawer */}
        {showKeyGuide && (
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs sm:text-sm text-blue-900 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span><strong className="font-semibold">Drag:</strong> Blue bar up/down, Yellow bar left/right</span>
              <span><strong className="font-semibold">Tap:</strong> Any row, column, or cell to jump</span>
              <span><strong className="font-semibold">Keys:</strong> ⬆ ⬇ Rows, ⬅ ➡ Columns</span>
              <span><strong className="font-semibold">Space:</strong> Hide/Show Answer</span>
              <span><strong className="font-semibold">R:</strong> Reset</span>
            </div>
            <button
              onClick={() => setShowKeyGuide(false)}
              className="text-xs text-blue-700 hover:text-blue-900 underline font-semibold ml-auto cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MULTIPLICATION TABLE WRAPPER (Visual Reference Match)     */}
        {/* ========================================================= */}
        <div className="w-full flex flex-col items-center">
          {/* Table Container Card */}
          <div className="w-full max-w-[720px] bg-white rounded-t-md shadow-md border-2 border-[#527752] flex flex-col">
            {/* Top Green Title Bar */}
            <div
              className="w-full py-2 sm:py-2.5 px-4 text-center text-slate-900 font-extrabold text-sm sm:text-base md:text-lg tracking-wider border-b-2 border-[#527752]"
              style={{ backgroundColor: '#389e36' }}
            >
              MULTIPLICATION TABLE
            </div>

            {/* Interactive Grid Area */}
            {/* Note: Padding on sides accommodates the grip handles on bars */}
            <div className="p-3 sm:p-4 md:p-5 flex items-center justify-center bg-white">
              <div
                ref={gridRef}
                className="relative w-full aspect-square border border-[#829582] select-none touch-none"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(13, minmax(0, 1fr))',
                }}
              >
                {/* ---------------------------------------------------- */}
                {/* 1. Underlying 13 x 13 Grid Cells                     */}
                {/* ---------------------------------------------------- */}
                {/* Row 0: Header Row */}
                {/* Corner Cell (0,0) */}
                <div
                  onClick={() => handleCellClick(0, 0)}
                  className="flex items-center justify-center border border-[#829582] text-xs sm:text-sm md:text-base font-bold text-slate-900"
                  style={{ backgroundColor: '#d4ebd4' }}
                >
                  <span className="text-base sm:text-lg md:text-xl">×</span>
                </div>

                {/* Column Headers (0, 1..12) */}
                {NUMBERS.map((c) => {
                  const isSelected = selectedCol === c;
                  return (
                    <button
                      key={`col-hdr-${c}`}
                      onClick={() => handleCellClick(0, c)}
                      className={`flex items-center justify-center border border-[#829582] text-xs sm:text-sm md:text-base font-bold text-slate-900 transition-colors cursor-pointer ${
                        isSelected ? 'ring-2 ring-amber-500 font-black' : 'hover:brightness-95'
                      }`}
                      style={{ backgroundColor: '#d4ebd4' }}
                      title={`Click to select Column ${c}`}
                      aria-label={`Column ${c}`}
                    >
                      {c}
                    </button>
                  );
                })}

                {/* Data Rows (1..12) */}
                {NUMBERS.map((r) => {
                  const isRowSelected = selectedRow === r;

                  return (
                    <React.Fragment key={`row-${r}`}>
                      {/* Row Header (r, 0) */}
                      <button
                        onClick={() => handleCellClick(r, 0)}
                        className={`flex items-center justify-center border border-[#829582] text-xs sm:text-sm md:text-base font-bold text-slate-900 transition-colors cursor-pointer ${
                          isRowSelected ? 'ring-2 ring-blue-600 font-black' : 'hover:brightness-95'
                        }`}
                        style={{ backgroundColor: '#d4ebd4' }}
                        title={`Click to select Row ${r}`}
                        aria-label={`Row ${r}`}
                      >
                        {r}
                      </button>

                      {/* Data Cells (r, 1..12) */}
                      {NUMBERS.map((c) => {
                        const isColSelected = selectedCol === c;
                        const isIntersecting = isRowSelected && isColSelected;
                        const cellValue = r * c;

                        return (
                          <div
                            key={`cell-${r}-${c}`}
                            onClick={() => handleCellClick(r, c)}
                            className={`relative flex items-center justify-center border border-[#829582] bg-white transition-all cursor-pointer ${
                              isIntersecting
                                ? 'z-10'
                                : 'hover:bg-slate-100'
                            }`}
                            title={`Row ${r} × Column ${c} = ${cellValue}`}
                          >
                            {isIntersecting ? (
                              hideAnswer ? (
                                <span className="font-black text-xs sm:text-sm md:text-base lg:text-lg text-emerald-800 bg-emerald-100/80 px-1 rounded">
                                  ?
                                </span>
                              ) : (
                                <span className="font-extrabold text-xs sm:text-sm md:text-base lg:text-lg text-slate-950 scale-110">
                                  {cellValue}
                                </span>
                              )
                            ) : (
                              <span className="font-medium text-[11px] sm:text-xs md:text-sm lg:text-base text-slate-900 tabular-nums">
                                {cellValue}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* ---------------------------------------------------- */}
                {/* 2. Interactive Highlighting Bars (CSS Overlays)      */}
                {/* ---------------------------------------------------- */}

                {/* HORIZONTAL BAR (Row Selector - Transparent Blue) */}
                <div
                  onPointerDown={handleRowPointerDown}
                  onPointerMove={handleRowPointerMove}
                  onPointerUp={handleRowPointerUp}
                  onPointerCancel={handleRowPointerUp}
                  className="absolute z-15 left-0 right-0 border-y-2 border-blue-600 cursor-ns-resize transition-all duration-75 group select-none touch-none"
                  style={{
                    top: `${(selectedRow / 13) * 100}%`,
                    height: `${(1 / 13) * 100}%`,
                    backgroundColor: 'rgba(59, 130, 246, 0.28)',
                  }}
                  title={`Row ${selectedRow} (Drag up/down to move)`}
                  aria-label={`Row selector on row ${selectedRow}`}
                >
                  {/* Left Grab Handle */}
                  <div
                    className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-7 sm:h-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-l flex items-center justify-center shadow-md cursor-ns-resize"
                    title={`Drag Row ${selectedRow}`}
                  >
                    <GripVertical className="w-3 h-3 text-white" />
                  </div>

                  {/* Right Grab Handle */}
                  <div
                    className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-7 sm:h-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-r flex items-center justify-center shadow-md cursor-ns-resize"
                    title={`Drag Row ${selectedRow}`}
                  >
                    <GripVertical className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* VERTICAL BAR (Column Selector - Transparent Yellow) */}
                <div
                  onPointerDown={handleColPointerDown}
                  onPointerMove={handleColPointerMove}
                  onPointerUp={handleColPointerUp}
                  onPointerCancel={handleColPointerUp}
                  className="absolute z-15 top-0 bottom-0 border-x-2 border-amber-500 cursor-ew-resize transition-all duration-75 group select-none touch-none"
                  style={{
                    left: `${(selectedCol / 13) * 100}%`,
                    width: `${(1 / 13) * 100}%`,
                    backgroundColor: 'rgba(245, 158, 11, 0.32)',
                  }}
                  title={`Column ${selectedCol} (Drag left/right to move)`}
                  aria-label={`Column selector on column ${selectedCol}`}
                >
                  {/* Top Grab Handle */}
                  <div
                    className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 h-4 sm:h-5 w-7 sm:w-8 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-t flex items-center justify-center shadow-md cursor-ew-resize"
                    title={`Drag Column ${selectedCol}`}
                  >
                    <GripHorizontal className="w-3 h-3 text-white" />
                  </div>

                  {/* Bottom Grab Handle */}
                  <div
                    className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 h-4 sm:h-5 w-7 sm:w-8 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-b flex items-center justify-center shadow-md cursor-ew-resize"
                    title={`Drag Column ${selectedCol}`}
                  >
                    <GripHorizontal className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* 3. Intersection Highlight Box                        */}
                {/* ---------------------------------------------------- */}
                <div
                  className="absolute z-25 pointer-events-none transition-all duration-75 rounded-xs"
                  style={{
                    top: `${(selectedRow / 13) * 100}%`,
                    left: `${(selectedCol / 13) * 100}%`,
                    width: `${(1 / 13) * 100}%`,
                    height: `${(1 / 13) * 100}%`,
                    boxShadow: '0 0 0 3px #16a34a, inset 0 0 0 2px #15803d',
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MULTIPLICATION EQUATION DISPLAY (Section 5)              */}
        {/* ========================================================= */}
        <section
          className="w-full max-w-[720px] bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col items-center gap-3"
          aria-label="Multiplication Equation"
        >
          {/* Large Equation Text */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tight">
            {/* Factor 1 (Row) - Blue */}
            <span
              className="text-blue-600 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200"
              title={`Row factor: ${selectedRow}`}
            >
              {selectedRow}
            </span>

            {/* Multiply Sign */}
            <span className="text-slate-500 font-bold text-2xl sm:text-3xl md:text-4xl">
              ×
            </span>

            {/* Factor 2 (Column) - Yellow / Dark Gold for strong contrast */}
            <span
              className="text-amber-700 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200"
              title={`Column factor: ${selectedCol}`}
            >
              {selectedCol}
            </span>

            {/* Equals Sign */}
            <span className="text-slate-500 font-bold text-2xl sm:text-3xl md:text-4xl">
              =
            </span>

            {/* Answer (Product) - Green or Hidden */}
            {hideAnswer ? (
              <button
                onClick={() => setHideAnswer(false)}
                className="text-emerald-700 bg-emerald-50 border-2 border-dashed border-emerald-400 px-3 py-0.5 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Click to reveal answer"
                aria-label="Answer hidden. Click to reveal."
              >
                ?
              </button>
            ) : (
              <span
                className="text-emerald-700 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-300"
                title={`Product: ${currentAnswer}`}
              >
                {currentAnswer}
              </span>
            )}
          </div>

          {/* Scaffolding Sub-labels (Row, Column, Answer) */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              Row {selectedRow}
            </span>
            <span className="text-amber-700 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              Column {selectedCol}
            </span>
            <span className="text-emerald-700 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Answer {hideAnswer ? '(Hidden)' : currentAnswer}
            </span>
          </div>

          {/* Fine Motor Stepper Controls for Elementary & SPED Accessibility */}
          <div className="w-full pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {/* Row Stepper (Blue) */}
            <div className="flex items-center gap-1.5 bg-blue-50/70 p-1 rounded-lg border border-blue-200">
              <span className="text-xs font-bold text-blue-900 px-1">Row:</span>
              <button
                onClick={() => setSelectedRow((r) => Math.max(1, r - 1))}
                disabled={selectedRow <= 1}
                className="p-1 sm:p-1.5 bg-white rounded border border-blue-300 text-blue-700 hover:bg-blue-100 active:bg-blue-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Decrease row"
                aria-label="Decrease row"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-bold text-sm text-blue-900 tabular-nums">
                {selectedRow}
              </span>
              <button
                onClick={() => setSelectedRow((r) => Math.min(12, r + 1))}
                disabled={selectedRow >= 12}
                className="p-1 sm:p-1.5 bg-white rounded border border-blue-300 text-blue-700 hover:bg-blue-100 active:bg-blue-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Increase row"
                aria-label="Increase row"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Column Stepper (Yellow / Gold) */}
            <div className="flex items-center gap-1.5 bg-amber-50/70 p-1 rounded-lg border border-amber-200">
              <span className="text-xs font-bold text-amber-900 px-1">Col:</span>
              <button
                onClick={() => setSelectedCol((c) => Math.max(1, c - 1))}
                disabled={selectedCol <= 1}
                className="p-1 sm:p-1.5 bg-white rounded border border-amber-300 text-amber-800 hover:bg-amber-100 active:bg-amber-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Decrease column"
                aria-label="Decrease column"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-bold text-sm text-amber-900 tabular-nums">
                {selectedCol}
              </span>
              <button
                onClick={() => setSelectedCol((c) => Math.min(12, c + 1))}
                disabled={selectedCol >= 12}
                className="p-1 sm:p-1.5 bg-white rounded border border-amber-300 text-amber-800 hover:bg-amber-100 active:bg-amber-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Increase column"
                aria-label="Increase column"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Discreet Classroom Note */}
      <footer className="w-full text-center text-[11px] sm:text-xs text-slate-600 py-1">
        Interactive 1–12 Multiplication Chart · Drag bars or tap headers/cells to explore facts
      </footer>
    </div>
  );
}
