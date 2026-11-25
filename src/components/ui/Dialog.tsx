import { useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { useModalBehaviour } from '@/lib/hooks/useModalBehaviour';
import { Button } from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/** Centred modal with focus trapping, Escape to close and a dimmed backdrop. */
export function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalBehaviour(isOpen, onClose, panel);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn('hairline relative w-full max-w-lg rounded-3xl border bg-ink-900 p-6 shadow-2xl md:p-8', className)}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="text-3xl">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 -mt-1 grid size-11 shrink-0 place-items-center rounded-full text-cream transition-colors hover:text-gold"
                aria-label="Close"
              >
                <X size={20} aria-hidden />
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isWorking?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before an action that cannot be undone. */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  isWorking,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-muted">{message}</p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={isWorking} className="bg-danger text-ink-950 hover:bg-danger/80">
          {isWorking ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
