'use client';

import { useEffect, useState } from 'react';

type Op = '+' | '−' | '×' | '÷' | null;

function apply(a: number, b: number, op: Op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function format(n: number) {
  if (!isFinite(n)) return 'Error';
  const s = String(parseFloat(n.toPrecision(12)));
  return s.length > 11 ? n.toExponential(5) : s;
}

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [fresh, setFresh] = useState(true);

  const digit = (d: string) => {
    if (fresh) { setDisplay(d === '.' ? '0.' : d); setFresh(false); return; }
    if (d === '.' && display.includes('.')) return;
    if (display.replace('-', '').replace('.', '').length >= 9) return;
    setDisplay(display === '0' && d !== '.' ? d : display + d);
  };
  const operator = (o: Op) => {
    const cur = parseFloat(display);
    if (acc !== null && !fresh) { const r = apply(acc, cur, op); setAcc(r); setDisplay(format(r)); } else setAcc(cur);
    setOp(o); setFresh(true);
  };
  const equals = () => {
    if (acc === null || op === null) return;
    const r = apply(acc, parseFloat(display), op);
    setDisplay(format(r)); setAcc(null); setOp(null); setFresh(true);
  };
  const clear = () => { setDisplay('0'); setAcc(null); setOp(null); setFresh(true); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9.]$/.test(e.key)) digit(e.key);
      else if (e.key === '+') operator('+');
      else if (e.key === '-') operator('−');
      else if (e.key === '*') operator('×');
      else if (e.key === '/') { e.preventDefault(); operator('÷'); }
      else if (e.key === 'Enter' || e.key === '=') equals();
      else if (e.key === 'Escape' || e.key === 'c') clear();
      else if (e.key === 'Backspace') setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const key = 'h-full rounded-full text-[22px] font-medium active:brightness-125 transition';
  const grey = `${key} bg-[#A5A5A5] text-black`;
  const dark = `${key} bg-[#333] text-white`;
  const orange = (o: Op) => `${key} ${op === o && fresh ? 'bg-white text-[#FF9F0A]' : 'bg-[#FF9F0A] text-white'}`;

  return (
    <div className="h-full bg-black p-3 flex flex-col select-none">
      <div className="flex-1 flex items-end justify-end px-2 pb-2 text-white text-[52px] font-light tabular-nums truncate">{display}</div>
      <div className="grid grid-cols-4 grid-rows-5 gap-2.5 h-[68%]">
        <button className={grey} onClick={clear}>{display === '0' ? 'AC' : 'C'}</button>
        <button className={grey} onClick={() => setDisplay(format(-parseFloat(display)))}>±</button>
        <button className={grey} onClick={() => setDisplay(format(parseFloat(display) / 100))}>%</button>
        <button className={orange('÷')} onClick={() => operator('÷')}>÷</button>
        {['7', '8', '9'].map((d) => <button key={d} className={dark} onClick={() => digit(d)}>{d}</button>)}
        <button className={orange('×')} onClick={() => operator('×')}>×</button>
        {['4', '5', '6'].map((d) => <button key={d} className={dark} onClick={() => digit(d)}>{d}</button>)}
        <button className={orange('−')} onClick={() => operator('−')}>−</button>
        {['1', '2', '3'].map((d) => <button key={d} className={dark} onClick={() => digit(d)}>{d}</button>)}
        <button className={orange('+')} onClick={() => operator('+')}>+</button>
        <button className={`${dark} col-span-2 text-left pl-6`} onClick={() => digit('0')}>0</button>
        <button className={dark} onClick={() => digit('.')}>.</button>
        <button className={`${key} bg-[#FF9F0A] text-white`} onClick={equals}>=</button>
      </div>
    </div>
  );
}
