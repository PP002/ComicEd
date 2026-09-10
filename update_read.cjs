const fs = require('fs');
let code = fs.readFileSync('src/components/Read.tsx', 'utf8');

// 1. Add new state variables
code = code.replace(
  'const [location, setLocation] = useState<string | number>(0);',
  `const [location, setLocation] = useState<string | number>(0);
  const [epubToc, setEpubToc] = useState<any[]>([]);
  const [epubCurrentPage, setEpubCurrentPage] = useState<number>(0);
  const [epubTotalPages, setEpubTotalPages] = useState<number>(0);
  const renditionRef = React.useRef<any>(null);`
);

// 2. Add useEffects for theme and font size
code = code.replace(
  'const [recentBooks, setRecentBooks] = useState<RecentBookMetadata[]>([]);',
  `const [recentBooks, setRecentBooks] = useState<RecentBookMetadata[]>([]);

  React.useEffect(() => {
    if (renditionRef.current) {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      try { renditionRef.current.themes.select(isDark ? 'dark' : 'light'); } catch(e) {}
    }
  }, [theme]);

  React.useEffect(() => {
    if (renditionRef.current && renditionRef.current.book) {
      try {
        renditionRef.current.themes.fontSize(\`\${fontSize}px\`);
        const width = containerSize.width || window.innerWidth;
        const height = containerSize.height || window.innerHeight;
        const chars = Math.max(100, Math.floor((width * height) / (fontSize * fontSize * 1.5)));
        renditionRef.current.book.locations.generate(chars).then(() => {
          setEpubTotalPages(renditionRef.current.book.locations.length());
          if (renditionRef.current.location) {
             setEpubCurrentPage(renditionRef.current.location.start.location);
          }
        });
      } catch(e) {}
    }
  }, [fontSize, containerSize.width, containerSize.height]);`
);

// 3. Update ReactReader props
code = code.replace(
  /showToc=\{false\}[\s\S]*?locationChanged=\{\(epubcition: string\) => setLocation\(epubcition\)\}/,
  `showToc={false}
                        tocChanged={(toc: any) => setEpubToc(toc)}
                        locationChanged={(epubcition: string) => {
                          setLocation(epubcition);
                          if (renditionRef.current && renditionRef.current.location) {
                            setEpubCurrentPage(renditionRef.current.location.start.location);
                          }
                        }}`
);
// swap locationChanged order if the regex missed because of order
code = code.replace(
  /locationChanged=\{\(epubcition: string\) => setLocation\(epubcition\)\}[\s\S]*?showToc=\{false\}/,
  `locationChanged={(epubcition: string) => {
                          setLocation(epubcition);
                          if (renditionRef.current && renditionRef.current.location) {
                            setEpubCurrentPage(renditionRef.current.location.start.location);
                          }
                        }}
                        showToc={false}
                        tocChanged={(toc: any) => setEpubToc(toc)}`
);

// 4. Update getRendition
code = code.replace(
  /getRendition=\{\(rendition: any\) => \{[\s\S]*?const isDark[^;]*;/,
  `getRendition={(rendition: any) => {
                          renditionRef.current = rendition;
                          const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                          
                          rendition.themes.register('light', {
                            'body': { 'background': 'transparent !important', 'color': '#0f172a !important' },
                            'p, span, div, h1, h2, h3, h4, h5, h6, a, li, blockquote': { 'color': '#0f172a !important' },
                            'img': { 'max-width': '100% !important', 'height': 'auto !important' }
                          });
                          rendition.themes.register('dark', {
                            'body': { 'background': 'transparent !important', 'color': '#f8fafc !important' },
                            'p, span, div, h1, h2, h3, h4, h5, h6, a, li, blockquote': { 'color': '#f8fafc !important' },
                            'img': { 'max-width': '100% !important', 'height': 'auto !important' }
                          });
                          rendition.themes.select(isDark ? 'dark' : 'light');
                          rendition.themes.fontSize(\`\${fontSize}px\`);
                          
                          rendition.on('relocated', (location: any) => {
                            if (rendition.book.locations.length()) {
                              setEpubCurrentPage(location.start.location);
                              setEpubTotalPages(rendition.book.locations.length());
                            }
                          });
                          
                          rendition.book.ready.then(() => {
                            const width = containerSize.width || window.innerWidth;
                            const height = containerSize.height || window.innerHeight;
                            const chars = Math.max(100, Math.floor((width * height) / (fontSize * fontSize * 1.5)));
                            rendition.book.locations.generate(chars).then(() => {
                              setEpubTotalPages(rendition.book.locations.length());
                            });
                          });`
);

// Remove the old rendition.themes.default block
code = code.replace(/rendition\.themes\.default\(\{[\s\S]*?\}\);/, '');

// 5. Update TOC rendering in sidebar
code = code.replace(
  /<div className="p-4 text-xs text-center text-muted-foreground">Table of Contents \/ Text Mode<\/div>/,
  `{selectedBook.fileType === 'epub' ? (
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                          <div className="text-sm font-bold text-muted-foreground px-2 py-2 mb-2 sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
                            {t("tableOfContents") || "Table of Contents"}
                          </div>
                          {epubToc.map((item, idx) => (
                            <div 
                              key={idx}
                              onClick={() => setLocation(item.href)}
                              className="text-xs px-2 py-1.5 hover:bg-muted cursor-pointer rounded-md truncate transition-colors text-foreground"
                            >
                              {item.label}
                            </div>
                          ))}
                          {epubToc.length === 0 && (
                            <div className="p-4 text-xs text-center text-muted-foreground">No Table of Contents</div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 text-xs text-center text-muted-foreground">Text Mode</div>
                      )}`
);

// 6. Update pagination logic maxPages
code = code.replace(
  /const maxPages = selectedBook\.fileType === 'pdf' && pdfNumPages \? pdfNumPages : selectedBook\.pages\.length;/g,
  `const maxPages = selectedBook.fileType === 'epub' ? Math.max(1, epubTotalPages) : (selectedBook.fileType === 'pdf' && pdfNumPages ? pdfNumPages : selectedBook.pages?.length || 1);`
);

// update UI page limits
code = code.replace(
  /\/ \{selectedBook\.fileType === 'pdf' && pdfNumPages \? pdfNumPages : selectedBook\.pages\.length\}/g,
  `/ {selectedBook.fileType === 'epub' ? Math.max(1, epubTotalPages) : (selectedBook.fileType === 'pdf' && pdfNumPages ? pdfNumPages : selectedBook.pages?.length || 1)}`
);

code = code.replace(
  /disabled=\{currentPage === \(\(selectedBook\.fileType === 'pdf' && pdfNumPages \? pdfNumPages : selectedBook\.pages\.length\) - 1\)\}/g,
  `disabled={selectedBook.fileType === 'epub' ? (epubCurrentPage >= epubTotalPages) : (currentPage === ((selectedBook.fileType === 'pdf' && pdfNumPages ? pdfNumPages : selectedBook.pages?.length || 1) - 1))}`
);

// replace pageInputValue logic for EPUB
code = code.replace(
  /value=\{pageInputValue\}/,
  `value={selectedBook.fileType === 'epub' && !pageInputValue ? String(epubCurrentPage) : pageInputValue}`
);

code = code.replace(
  /const val = parseInt\(pageInputValue\);\s*const maxPages = selectedBook\.fileType === 'pdf'.*?;\s*if \(!isNaN\(val\) && val >= 1 && val <= maxPages\) \{\s*setCurrentPage\(val - 1\);\s*\}/,
  `const val = parseInt(pageInputValue);
        const maxPages = selectedBook.fileType === 'epub' ? Math.max(1, epubTotalPages) : (selectedBook.fileType === 'pdf' && pdfNumPages ? pdfNumPages : selectedBook.pages?.length || 1);
        if (!isNaN(val) && val >= 1 && val <= maxPages) {
          if (selectedBook.fileType === 'epub' && renditionRef.current) {
            const cfi = renditionRef.current.book.locations.cfiFromLocation(val);
            if (cfi) setLocation(cfi);
          } else {
            setCurrentPage(val - 1);
          }
        }`
);

code = code.replace(
  /\{t\("page"\)\} \{currentPage \+ 1\} \/ \{selectedBook\.pages\.length\}/g,
  `{t("page")} {selectedBook.fileType === 'epub' ? epubCurrentPage : currentPage + 1} / {selectedBook.fileType === 'epub' ? Math.max(1, epubTotalPages) : selectedBook.pages?.length || 1}`
);

fs.writeFileSync('src/components/Read.tsx', code);
console.log("Updated Read.tsx");
