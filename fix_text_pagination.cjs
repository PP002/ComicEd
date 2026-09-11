const fs = require('fs');
let code = fs.readFileSync('src/components/Read.tsx', 'utf8');

// replace maxPages logic in onChange
code = code.replace(
  /const maxPages = selectedBook\.fileType === 'epub' \? Math\.max\(1, epubTotalPages\) : \(selectedBook\.fileType === 'pdf' && pdfNumPages \? pdfNumPages : selectedBook\.pages\?\.length \|\| 1\);/g,
  `const maxPages = selectedBook.fileType === 'epub' ? Math.max(1, epubTotalPages) : selectedBook.fileType === 'text' ? textPages : (selectedBook.fileType === 'pdf' && pdfNumPages ? pdfNumPages : selectedBook.pages?.length || 1);`
);

// replace maxPages logic in display
code = code.replace(
  /\{selectedBook\.fileType === 'epub' \? Math\.max\(1, epubTotalPages\) : selectedBook\.pages\?\.length \|\| 1\}/g,
  `{selectedBook.fileType === 'epub' ? Math.max(1, epubTotalPages) : selectedBook.fileType === 'text' ? textPages : selectedBook.pages?.length || 1}`
);

// replace disabled logic for text mode
code = code.replace(
  /\(currentPage === \(\(selectedBook\.fileType === 'pdf' && pdfNumPages \? pdfNumPages : selectedBook\.pages\?\.length \|\| 1\) - 1\)\)/g,
  `(currentPage === ((selectedBook.fileType === 'text' ? textPages : selectedBook.fileType === 'pdf' && pdfNumPages ? pdfNumPages : selectedBook.pages?.length || 1) - 1))`
);

fs.writeFileSync('src/components/Read.tsx', code);
console.log("Fixed text pagination");
