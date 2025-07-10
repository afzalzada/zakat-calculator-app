
"use client";

import React, { useEffect } from 'react';

const BuyMeACoffeeButton = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js';
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
    
    const container = document.getElementById('bmc-button-container');
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(script);
    }

    return () => {
      if (container && script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, []);

  return <div id="bmc-button-container"></div>;
};

export default BuyMeACoffeeButton;
