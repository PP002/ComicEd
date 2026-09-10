const fs = require('fs');
let code = fs.readFileSync('src/components/Read.tsx', 'utf8');

// We are going to replace everything from `) : selectedBook.fileType === 'epub' ? (` 
// up to `) : (` before `selectedBook.pages.map`

const matchStr = `                   ) : selectedBook.fileType === 'epub' ? (                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">                          <div className="text-sm font-bold text-muted-foreground px-2 py-2 mb-2 sticky top-0 bg-background/95 backdrop-blur z-10 border-b">                            {t("tableOfContents") || "Table of Contents"}                          </div>                          {epubToc.map((item, idx) => (                            <div                               key={idx}                              onClick={() => setLocation(item.href)}                              className="text-xs px-2 py-1.5 hover:bg-muted cursor-pointer rounded-md truncate transition-colors text-foreground"                            >                              {item.label}                            </div>                          ))}                          {epubToc.length === 0 && (                            <div className="p-4 text-xs text-center text-muted-foreground">No Table of Contents</div>                          )}                        </div>                      ) : (                        <div className="p-4 text-xs text-center text-muted-foreground">Text Mode</div>                      )}                    ) : (`.replace(/\s+/g, ' ');

// But because of formatting spaces, regex is safer. Let's find the exact bounds.
const regex = /\) : selectedBook\.fileType === 'epub' \? \([\s\S]*?Text Mode<\/div>\s*\)\}\s*\) : \(/m;
const replacement = `) : selectedBook.fileType === 'epub' ? (
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
                      ) : selectedBook.fileType === 'text' ? (
                        <div className="p-4 text-xs text-center text-muted-foreground">Text Mode</div>
                      ) : (`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/Read.tsx', code);
console.log("Fixed syntax completely!");
