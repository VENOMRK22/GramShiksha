import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { importSyncPayload } from '../../lib/sync';
import type { MergeResult } from '../../lib/sync';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function P2PScan() {
    const { currentUser } = useAuth();
    const { db } = useDatabase();

    const [result, setResult] = useState<MergeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check if scanner is already rendered to avoid double-init in StrictMode
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // ID for the container
        const scannerId = "reader";

        // Prevent double render
        if (scannerRef.current || result) return;

        const onScanSuccess = async (decodedText: string) => {
            if (!db || !currentUser) return;

            try {
                // Determine if valid payload
                // Pause scanning
                scannerRef.current?.clear();

                const mergeRes = await importSyncPayload(db, currentUser.id, decodedText);
                setResult(mergeRes);
            } catch (err: any) {
                console.error("Scan Error", err);
                setError(err.message || "Invalid QR Code");
            }
        };

        const onScanFailure = () => {
            // console.warn(err); // Ignore frame failures
        };

        // Initialize
        try {
            // Delay slightly to ensure DOM is ready
            setTimeout(() => {
                if (!document.getElementById(scannerId)) return;

                const scanner = new Html5QrcodeScanner(
                    scannerId,
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false
                );
                scanner.render(onScanSuccess, onScanFailure);
                scannerRef.current = scanner;
            }, 500);
        } catch (e) {
            setError("Camera Init Failed");
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
                scannerRef.current = null;
            }
        };
    }, [db, currentUser, result]);


    if (result && result.success) {
        return (
            <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Sync Successful!</h2>
                <p className="text-slate-400 text-sm">
                    {result.message}
                </p>

                <div className="bg-black/40 border border-white/5 p-4 rounded-xl w-full max-w-xs space-y-2 text-sm">
                    {result.type === 'profile' ? (
                        <>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Levels Updated</span>
                                <span className="text-white font-bold">{result.details?.levelsUpdated || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Stars Gained</span>
                                <span className="text-white font-bold">{result.details?.newStars || 0}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Resources Added</span>
                            <span className="text-white font-bold">{result.details?.itemsImported || 0}</span>
                        </div>
                    )}
                </div>

                <button onClick={() => window.location.reload()} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all">
                    Done
                </button>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                <AlertTriangle className="w-12 h-12 text-destructive" />
                <h3 className="text-white font-bold">Scan Failed</h3>
                <p className="text-muted-foreground text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/5">Try Again</button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 space-y-4">
            <h2 className="text-white font-bold">Scan Peer Code</h2>
            <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-slate-700 bg-black"></div>
            <p className="text-xs text-slate-500 text-center">Point camera at another student's QR code</p>
        </div>
    );
}
