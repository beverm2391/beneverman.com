"use client";

// Drop-in shim for react-router-dom's useSearchParams, backed by next/navigation
// so the ported Lab keeps its exact `[params, setParams]` tuple API (including
// the functional updater and { replace } option). Isolating the adaptation here
// keeps Lab.tsx near-verbatim.
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type SearchParamsUpdater =
  | URLSearchParams
  | ((prev: URLSearchParams) => URLSearchParams);

export function useSearchParams(): [
  URLSearchParams,
  (next: SearchParamsUpdater, opts?: { replace?: boolean }) => void
] {
  const nextParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const current = useMemo(
    () => new URLSearchParams(nextParams?.toString() ?? ""),
    [nextParams]
  );

  const setSearchParams = useCallback(
    (next: SearchParamsUpdater, opts?: { replace?: boolean }) => {
      const resolved =
        typeof next === "function" ? next(new URLSearchParams(current)) : next;
      const qs = resolved.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (opts?.replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [current, pathname, router]
  );

  return [current, setSearchParams];
}
