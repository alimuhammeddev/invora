import { useEffect, useRef, useState } from "react";

export function useMinimumLoadingTime(
  isLoading: boolean,
  minimumDuration = 500,
) {
  const [showLoading, setShowLoading] = useState(isLoading);
  const loadingStartedAt = useRef<number | null>(
    isLoading ? Date.now() : null,
  );

  useEffect(() => {
    if (isLoading) {
      loadingStartedAt.current = Date.now();
      setShowLoading(true);
      return;
    }

    if (loadingStartedAt.current === null) {
      setShowLoading(false);
      return;
    }

    const remaining =
      minimumDuration - (Date.now() - loadingStartedAt.current);
    if (remaining <= 0) {
      loadingStartedAt.current = null;
      setShowLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      loadingStartedAt.current = null;
      setShowLoading(false);
    }, remaining);

    return () => clearTimeout(timeoutId);
  }, [isLoading, minimumDuration]);

  return showLoading;
}