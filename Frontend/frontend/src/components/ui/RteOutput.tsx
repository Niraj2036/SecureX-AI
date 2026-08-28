import { useEffect } from "react";

const RichTextPreview = ({ html }: { html: string }) => {
    // Function to remove the list titles before rendering
    const cleanHtml = (rawHtml: string) => {
      if (!rawHtml) return '<p></p>';
      
      // Create a temporary DOM element to parse and manipulate the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = rawHtml;
      
      // Remove any paragraphs that only contain "Bullet Lists:" or "Numbered Lists:"
      const paragraphs = tempDiv.querySelectorAll('p');
      paragraphs.forEach(p => {
        if (p.textContent?.trim() === 'Bullet Lists:' || 
            p.textContent?.trim() === 'Numbered Lists:') {
          p.remove();
        }
      });
      
      return tempDiv.innerHTML;
    };
  
    useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        .rich-text-preview ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .rich-text-preview ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .rich-text-preview li {
          margin: 0.25rem 0;
        }
        .rich-text-preview h1 { font-size: 2em; margin: 0.67em 0; }
        .rich-text-preview h2 { font-size: 1.5em; margin: 0.75em 0; }
        .rich-text-preview h3 { font-size: 1.17em; margin: 0.83em 0; }
        .rich-text-preview h4 { font-size: 1em; margin: 1em 0; }
        .rich-text-preview h5 { font-size: 0.83em; margin: 1.33em 0; }
        .rich-text-preview h6 { font-size: 0.67em; margin: 1.67em 0; }
        .rich-text-preview p { margin: 0.5em 0; }
      `;
      document.head.appendChild(style);
  
      return () => {
        document.head.removeChild(style);
      };
    }, []);
  
    return (
      <div
        className="rich-text-preview mt-2 p-3 border rounded-md bg-gray-50 min-h-[200px] max-[500px] overflow-auto"
        dangerouslySetInnerHTML={{ __html: cleanHtml(html) }}
      />
    );
  };

  export default RichTextPreview;