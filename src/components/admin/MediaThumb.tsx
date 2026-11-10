import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * Thumbnail that survives a throttled storage server: when an image fails to load it retries a few
 * times with a growing delay, and only then falls back to a placeholder.
 */
export function MediaThumb({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div
        className={`grid place-items-center bg-muted text-muted-foreground ${className}`}
        title="התמונה לא נטענה"
      >
        <ImageOff className="size-6" />
      </div>
    );
  }
  return (
    <img
      key={attempt}
      src={attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}r=${attempt}`}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => {
        if (attempt >= 3) return setFailed(true);
        window.setTimeout(() => setAttempt((a) => a + 1), 1200 * (attempt + 1));
      }}
    />
  );
}
