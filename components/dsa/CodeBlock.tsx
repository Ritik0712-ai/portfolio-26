'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('go', go);

export default function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-lg overflow-hidden border border-border">
      <button
        onClick={() => {
          navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="absolute top-2 right-2 z-10 p-1.5 rounded bg-white/10 text-white/80 hover:bg-white/20"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      <SyntaxHighlighter language={language} style={oneDark} customStyle={{ margin: 0, fontSize: 13, padding: '1rem 1.25rem' }} showLineNumbers>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
