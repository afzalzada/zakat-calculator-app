"use client";

import React, { useEffect } from 'react';

export function BuyMeACoffeeButton() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.async = true;
    script.setAttribute('data-name', 'bmc-button');
    script.setAttribute('data-slug', 'afzalzada');
    script.setAttribute('data-color', '#FFDD00');
    script.setAttribute('data-emoji', '');
    script.setAttribute('data-font', 'Cookie');
    script.setAttribute('data-text', 'Buy me a coffee');
    script.setAttribute('data-outline-color', '#000000');
    script.setAttribute('data-font-color', '#000000');
    script.setAttribute('data-coffee-color', '#ffffff');
    
    document.head.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      // This is important to avoid memory leaks and duplicate scripts
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      // The script might also create a global object we need to clean up
      if ((window as any).Cofeed) {
        delete (window as any).Cofeed;
      }
    };
  }, []);

  return <a className="bmc-button" target="_blank" href="https://www.buymeacoffee.com/afzalzada"></a>;
}
