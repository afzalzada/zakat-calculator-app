
"use client";

import React, { useEffect } from 'react';

export function BuyMeACoffeeButton() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.async = true;
    script.onload = () => {
      // The script has a global object it uses to initialize buttons
      const bmc = (window as any).Cofeed;
      if (bmc) {
        bmc.init('Buy me a coffee', '#FFDD00', 'afzalzada');
      }
    };
    
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
      // Clean up the script and the widget it creates to prevent memory leaks
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      
      const bmcWidget = document.getElementById('bmc-wbtn');
      if (bmcWidget) {
        bmcWidget.remove();
      }
       if ((window as any).Cofeed) {
        delete (window as any).Cofeed;
      }
    };
  }, []);

  return <a className="bmc-button" target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/afzalzada"></a>;
}
