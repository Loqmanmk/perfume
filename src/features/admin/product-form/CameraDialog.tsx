import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCcw, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

interface CameraDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photo: Blob) => void;
}

type Facing = 'environment' | 'user';

function describeCameraError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError') return 'Camera access was blocked. Allow it in your browser settings, or upload a photo instead.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No camera was found on this device. Upload a photo instead.';
  if (name === 'NotReadableError') return 'The camera is being used by another app. Close it and try again.';
  return 'The camera could not be opened. Upload a photo instead.';
}

/** Live camera preview with capture, retake and use. Uses the back camera on phones. */
export function CameraDialog({ isOpen, onClose, onCapture }: CameraDialogProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState<Facing>('environment');
  const [error, setError] = useState<string>();
  const [isReady, setIsReady] = useState(false);
  const [captured, setCaptured] = useState<{ blob: Blob; url: string }>();

  // Open the camera while the dialog is showing and no photo is under review.
  useEffect(() => {
    if (!isOpen || captured) return;

    let stream: MediaStream | undefined;
    let cancelled = false;
    setError(undefined);
    setIsReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot open the camera here. Upload a photo instead.');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1920 } },
        audio: false,
      })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = mediaStream;
        if (video.current) video.current.srcObject = mediaStream;
      })
      .catch((cameraError: unknown) => {
        if (!cancelled) setError(describeCameraError(cameraError));
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [isOpen, facing, captured]);

  // Release the preview image when it is no longer shown.
  useEffect(() => () => captured && URL.revokeObjectURL(captured.url), [captured]);

  const takePhoto = () => {
    const source = video.current;
    if (!source?.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = source.videoWidth;
    canvas.height = source.videoHeight;
    canvas.getContext('2d')?.drawImage(source, 0, 0);
    canvas.toBlob((blob) => blob && setCaptured({ blob, url: URL.createObjectURL(blob) }), 'image/jpeg', 0.92);
  };

  const close = () => {
    setCaptured(undefined);
    onClose();
  };

  const usePhoto = () => {
    if (captured) onCapture(captured.blob);
    close();
  };

  return (
    <Dialog isOpen={isOpen} onClose={close} title="Take a photo" className="max-w-2xl">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black">
        {captured ? (
          <img src={captured.url} alt="The photo you just took" className="h-full w-full object-contain" />
        ) : (
          <video
            ref={video}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setIsReady(true)}
            className="h-full w-full object-contain"
            aria-label="Camera preview"
          />
        )}

        {error && (
          <p role="alert" className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-cream">
            {error}
          </p>
        )}
        {!error && !captured && !isReady && (
          <p className="absolute inset-0 grid place-items-center text-sm text-muted" role="status">
            Opening the camera…
          </p>
        )}
      </div>

      <p className="mt-4 text-sm text-muted">
        Tip: place the bottle in the middle of the frame, in soft daylight, against a plain background.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {captured ? (
          <>
            <Button variant="outline" onClick={() => setCaptured(undefined)}>
              <RefreshCcw size={15} aria-hidden /> Retake
            </Button>
            <Button onClick={usePhoto}>Use this photo</Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => setFacing((current) => (current === 'environment' ? 'user' : 'environment'))}
              disabled={!!error}
            >
              <SwitchCamera size={16} aria-hidden /> Switch camera
            </Button>
            <Button onClick={takePhoto} disabled={!isReady || !!error} size="lg">
              <Camera size={18} aria-hidden /> Capture
            </Button>
          </>
        )}
      </div>
    </Dialog>
  );
}
