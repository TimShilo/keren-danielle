import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { trackPointer } from "./FxButton";

/** Lightbox that plays a YouTube video (with sound) only while open. */
export function VideoModal({
  youtubeId,
  title,
  open,
  onOpenChange,
}: {
  youtubeId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          dir="rtl"
          aria-describedby={undefined}
          className="site-theme fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 bg-transparent outline-none"
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
            {open && (
              <iframe
                className="size-full"
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="סגירה"
            onPointerEnter={trackPointer}
            onPointerMove={trackPointer}
            className="fx-btn fx-white absolute -top-12 end-0 size-10 items-center justify-center"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
