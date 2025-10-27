import { useEffect } from 'react';

export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
  useEffect(() => {
    let buffer = '';
    let timeout: any;

    const handleKeyPress = (e: KeyboardEvent) => {
      clearTimeout(timeout);

      if (e.key === 'Enter') {
        if (buffer.length > 0) {
          onScan(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }

      timeout = setTimeout(() => {
        buffer = '';
      }, 100);
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(timeout);
    };
  }, [onScan]);
};
