import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/StaffLayout";
import QRScanner from "../../components/QRScanner";
import { Scan } from "@phosphor-icons/react";

export default function ScanPage() {
  const navigate = useNavigate();

  const handleScan = (result: string) => {
    try {
      const url = new URL(result);
      const productId = url.searchParams.get("p");
      if (productId) {
        navigate(`/staff/entry?product_id=${productId}`);
      }
    } catch {
      alert("Invalid QR code");
    }
  };

  return (
    <StaffLayout>
      <div className="flex flex-col items-center py-4">
        <div className="flex items-center gap-2 mb-1">
          <Scan className="h-5 w-5 text-[#1a1a2e]" />
          <h2 className="text-lg font-semibold text-slate-900">Scan Product</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6 text-center">Point camera at the QR label on the product</p>
        <div className="w-full max-w-sm [&_button]:bg-slate-100 [&_button]:border [&_button]:border-slate-200 [&_button]:rounded-md [&_button]:px-3 [&_button]:py-1.5 [&_button]:text-sm [&_button]:text-slate-700 [&_button]:mt-2">
          <QRScanner onScan={handleScan} />
        </div>
      </div>
    </StaffLayout>
  );
}
