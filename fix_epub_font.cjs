const fs = require('fs');
let code = fs.readFileSync('src/components/Read.tsx', 'utf8');

const oldEpubEffect = `  React.useEffect(() => {
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

const newEpubEffect = `  React.useEffect(() => {
    if (renditionRef.current && renditionRef.current.book) {
      try {
        const currentLocation = renditionRef.current.location;
        const cfi = currentLocation ? currentLocation.start.cfi : null;

        renditionRef.current.themes.fontSize(\`\${fontSize}px\`);
        const width = containerSize.width || window.innerWidth;
        const height = containerSize.height || window.innerHeight;
        const chars = Math.max(100, Math.floor((width * height) / (fontSize * fontSize * 1.5)));
        
        renditionRef.current.book.locations.generate(chars).then(() => {
          setEpubTotalPages(renditionRef.current.book.locations.length());
          if (cfi) {
             renditionRef.current.display(cfi).then(() => {
                if (renditionRef.current.location) {
                   setEpubCurrentPage(renditionRef.current.location.start.location);
                }
             });
          } else if (renditionRef.current.location) {
             setEpubCurrentPage(renditionRef.current.location.start.location);
          }
        });
      } catch(e) {}
    }
  }, [fontSize, containerSize.width, containerSize.height]);`;

code = code.replace(oldEpubEffect, newEpubEffect);

fs.writeFileSync('src/components/Read.tsx', code);
console.log("Fixed epub font size");
