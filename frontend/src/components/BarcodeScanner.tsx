import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Camera } from 'lucide-react';

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    startScan();
    return () => stopScan();
  }, []);

  const startScan = async () => {
    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const devices = await (reader as any).listVideoInputDevices();
      const backCamera = devices.find((d: any) =>
        d.label.toLowerCase().includes('back')
      ) || devices[0];

      if (!backCamera) {
        setError('No se encontró cámara');
        return;
      }

      setScanning(true);
      reader.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            onScan(result.getText());
            stopScan();
            onClose();
          }
        }
      );
    } catch (err) {
      setError('Error al iniciar la cámara');
      console.error(err);
    }
  };

  const stopScan = () => {
    if (readerRef.current) {
      (readerRef.current as any).reset?.();
    }
    setScanning(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full">
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Escanear Código</h2>
            <button
              onClick={onClose}
              className="text-white p-2 hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-8">
          <div className="text-white text-center space-y-2">
            <div className="border-2 border-white/50 rounded-lg h-32 mx-auto max-w-sm" />
            <p className="text-sm">Apunte la cámara al código de barras</p>
          </div>
        </div>
      </div>
    </div>
  );
}
