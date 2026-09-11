const fs = require('fs');
let code = fs.readFileSync('src/components/Read.tsx', 'utf8');

// 1. Add textToc state
code = code.replace(
  'const [textPages, setTextPages] = useState(1);',
  'const [textPages, setTextPages] = useState(1);\n  const [textToc, setTextToc] = useState<{label: string, page: number}[]>([]);'
);

// 2. Update textToc in useEffect
const useEffectTextPages = `          const pages = Math.ceil(scrollWidth / activeWidth);
          setTextPages(Math.max(1, pages));`;
const newUseEffectTextPages = `          const pages = Math.ceil(scrollWidth / activeWidth);
          setTextPages(Math.max(1, pages));
          
          const headings = textContentRef.current.querySelectorAll('h1, h2, h3');
          if (headings.length > 0) {
             const newToc = Array.from(headings).map(h => {
                let current: HTMLElement | null = h as HTMLElement;
                let offsetLeft = 0;
                while (current && current !== textContentRef.current) {
                    offsetLeft += current.offsetLeft;
                    current = current.offsetParent as HTMLElement;
                }
                const page = Math.floor(offsetLeft / activeWidth);
                return { label: h.textContent || '', page };
             }).filter(item => item.label.trim() !== '');
             setTextToc(newToc);
          } else {
             // Fallback for plain text: try to find 'Chapter X' in text content if not HTML
             const isHtml = selectedBook.title.toLowerCase().endsWith('.html') || selectedBook.title.toLowerCase().endsWith('.htm') || (selectedBook.pages[0] && /<[a-z][\\s\\S]*>/i.test(selectedBook.pages[0]));
             if (!isHtml && selectedBook.pages && typeof selectedBook.pages[0] === 'string') {
                 // Text mode has no DOM elements for chapters, so we can't easily find offsetLeft.
                 setTextToc([]); 
             } else {
                 setTextToc([]);
             }
          }`;
code = code.replace(useEffectTextPages, newUseEffectTextPages);

// 3. Render textToc
const textModeRender = `) : selectedBook.fileType === 'text' ? (
                        <div className="p-4 text-xs text-center text-muted-foreground">Text Mode</div>
                      ) : (`;
const newTextModeRender = `) : selectedBook.fileType === 'text' ? (
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                          <div className="text-sm font-bold text-muted-foreground px-2 py-2 mb-2 sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
                            {t("tableOfContents") || "Table of Contents"}
                          </div>
                          {textToc.map((item, idx) => (
                            <div 
                              key={idx}
                              onClick={() => setCurrentPage(item.page)}
                              className="text-xs px-2 py-1.5 hover:bg-muted cursor-pointer rounded-md truncate transition-colors text-foreground"
                            >
                              {item.label}
                            </div>
                          ))}
                          {textToc.length === 0 && (
                            <div className="p-4 text-xs text-center text-muted-foreground">No Table of Contents</div>
                          )}
                        </div>
                      ) : (`;
code = code.replace(textModeRender, newTextModeRender);

fs.writeFileSync('src/components/Read.tsx', code);
console.log("Fixed text TOC");
