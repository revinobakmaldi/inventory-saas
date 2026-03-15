import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Props {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: Props) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );
    scanner.render(
      (result) => {
        scanner.clear();
        onScan(result);
      },
      (error) => onError?.(error),
    );
    return () => { scanner.clear().catch(() => {}); };
  }, []);

  return <div id="qr-reader" />;
}
