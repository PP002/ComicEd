const fs = require('fs');
let code = fs.readFileSync('src/components/Read.tsx', 'utf8');

const useEffectsToRemove = `  React.useEffect(() => {
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
  }, [fontSize, containerSize.width, containerSize.height]);`;

code = code.replace(useEffectsToRemove, '');

const insertionPoint = `const [fontSize, setFontSize] = useState<number>(18);`;

code = code.replace(insertionPoint, insertionPoint + '\n\n' + useEffectsToRemove);

fs.writeFileSync('src/components/Read.tsx', code);
console.log("Moved useEffects");
