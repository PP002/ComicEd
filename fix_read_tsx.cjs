const fs = require('fs');
let code = fs.readFileSync('src/components/Read.tsx', 'utf8');

// 1. Add textToc state
if (!code.includes('const [textToc, setTextToc]')) {
    code = code.replace(
      'const [textPages, setTextPages] = useState(1);',
      'const [textPages, setTextPages] = useState(1);\n  const [textToc, setTextToc] = useState<any[]>([]);'
    );
}

// 2. Update textPages calculation and generate textToc in useEffect
const textPagesUseEffectPattern = /const pages = Math\.ceil\(scrollWidth \/ activeWidth\);\s*setTextPages\(Math\.max\(1, pages\)\);/g;
if (code.includes('const pages = Math.ceil(scrollWidth / activeWidth);')) {
    const newUseEffectTextPages = `const pages = Math.ceil(scrollWidth / activeWidth);
          setTextPages(Math.max(1, pages));
          
          const headings = textContentRef.current.querySelectorAll('h1, h2, h3');
          if (headings.length > 0) {
             const newToc = Array.from(headings).map(h => {
                let current = h;
                let offsetLeft = 0;
                while (current && current !== textContentRef.current) {
                    offsetLeft += current.offsetLeft || 0;
                    current = current.offsetParent;
                }
                const page = Math.floor(offsetLeft / activeWidth);
                return { label: h.textContent || '', page };
             }).filter(item => item.label.trim() !== '');
             setTextToc(newToc);
          } else {
             setTextToc([]);
          }`;
    code = code.replace(textPagesUseEffectPattern, newUseEffectTextPages);
}

// 3. Fix maxPages calculation for the pagination input (onChange)
const maxPagesInputPattern = /const maxPages = selectedBook\.fileType === 'epub' \? Math\.max\(1, epubTotalPages\) : \(selectedBook\.fileType === 'pdf' && pdfNumPages \? pdfNumPages : selectedBook\.pages\?\.length \|\| 1\);/g;
const newMaxPagesInput = `const maxPages = selectedBook.fileType === 'epub' ? Math.max(1, epubTotalPages) : selectedBook.fileType === 'text' ? textPages : (selectedBook.fileType === 'pdf' && pdfNumPages ? pdfNumPages : selectedBook.pages?.length || 1);`;
code = code.replace(maxPagesInputPattern, newMaxPagesInput);

// 4. Fix maxPages display logic in pagination
const displayMaxPagesPattern = /\{selectedBook\.fileType === 'epub' \? Math\.max\(1, epubTotalPages\) : \(selectedBook\.fileType === 'pdf' && pdfNumPages \? pdfNumPages : selectedBook\.pages\?\.length \|\| 1\)\}/g;
const newDisplayMaxPages = `{selectedBook.fileType === 'epub' ? Math.max(1, epubTotalPages) : selectedBook.fileType === 'text' ? textPages : (selectedBook.fileType === 'pdf' && pdfNumPages ? pdfNumPages : selectedBook.pages?.length || 1)}`;
code = code.replace(displayMaxPagesPattern, newDisplayMaxPages);
// Wait, is there a different pattern for the display logic? Let me check line 1388 first.
// Oh wait, line 1388 is: / {selectedBook.fileType === 'epub' ? Math.max(1, epubTotalPages) : (selectedBook.fileType === 'pdf' && pdfNumPages ? pdfNumPages : selectedBook.pages?.length || 1)}
const displayMaxPagesPattern2 = /\{selectedBook\.fileType === 'epub' \? Math\.max\(1, epubTotalPages\) : \(selectedBook\.fileType === 'pdf' && pdfNumPages \? pdfNumPages : selectedBook\.pages\?\.length \|\| 1\)\}/g;
code = code.replace(displayMaxPagesPattern2, newDisplayMaxPages);

// 5. Fix disabled state of next button
const disabledNextPattern = /\(currentPage === \(\(selectedBook\.fileType === 'pdf' && pdfNumPages \? pdfNumPages : selectedBook\.pages\?\.length \|\| 1\) - 1\)\)/g;
const newDisabledNext = `(currentPage === ((selectedBook.fileType === 'text' ? textPages : selectedBook.fileType === 'pdf' && pdfNumPages ? pdfNumPages : selectedBook.pages?.length || 1) - 1))`;
code = code.replace(disabledNextPattern, newDisabledNext);

// 6. Fix Text Mode Sidebar TOC
const textModeTOCPattern = /\) : selectedBook\.fileType === 'text' \? \(\s*<div className="p-4 text-xs text-center text-muted-foreground">Text Mode<\/div>\s*\) : \(/g;
const newTextModeTOC = `) : selectedBook.fileType === 'text' ? (
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
code = code.replace(textModeTOCPattern, newTextModeTOC);

fs.writeFileSync('src/components/Read.tsx', code);
console.log("Fixes applied successfully.");
