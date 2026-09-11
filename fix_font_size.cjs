const fs = require('fs');
let code = fs.readFileSync('src/components/Read.tsx', 'utf8');

// 1. Add previousFontSettingsRef
code = code.replace(
  'const [pageInputValue, setPageInputValue] = useState("");',
  'const [pageInputValue, setPageInputValue] = useState("");\n  const previousFontSettingsRef = React.useRef({ fontSize: 18, fontFamily: "font-serif", textAlign: "text-left", activeWidth: 0, lastRatio: 0 });'
);

// 2. Replace the text pages calculation useEffect
const oldUseEffect = `  useEffect(() => {
    const activeWidth = pageDimensions.width || containerSize.width;
    if (selectedBook?.fileType === 'text' && textContentRef.current && activeWidth > 0) {
      const timer = setTimeout(() => {
        if (textContentRef.current) {
          const scrollWidth = textContentRef.current.scrollWidth;
          const pages = Math.ceil(scrollWidth / activeWidth);
          setTextPages(Math.max(1, pages));
          
          const headings = textContentRef.current.querySelectorAll('h1, h2, h3');`;

const newUseEffect = `  useEffect(() => {
    const activeWidth = pageDimensions.width || containerSize.width;
    if (selectedBook?.fileType === 'text' && textContentRef.current && activeWidth > 0) {
      const prev = previousFontSettingsRef.current;
      const isFormatChange = prev.fontSize !== fontSize || prev.fontFamily !== fontFamily || prev.textAlign !== textAlign || prev.activeWidth !== activeWidth;
      
      // Calculate ratio before layout change triggers the timeout calculation
      if (isFormatChange && textPages > 0) {
         prev.lastRatio = currentPage / textPages;
      }

      const timer = setTimeout(() => {
        if (textContentRef.current) {
          const scrollWidth = textContentRef.current.scrollWidth;
          const pages = Math.max(1, Math.ceil(scrollWidth / activeWidth));
          
          if (isFormatChange) {
             const newPage = Math.max(0, Math.min(pages - 1, Math.floor(prev.lastRatio * pages)));
             setCurrentPage(newPage);
             previousFontSettingsRef.current = { fontSize, fontFamily, textAlign, activeWidth, lastRatio: prev.lastRatio };
          }
          
          setTextPages(pages);
          
          const headings = textContentRef.current.querySelectorAll('h1, h2, h3');`;

code = code.replace(oldUseEffect, newUseEffect);

fs.writeFileSync('src/components/Read.tsx', code);
console.log("Fixed text pages calculation");
