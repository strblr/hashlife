import { useEffect, type DependencyList } from "react";

interface HotKey {
  code?: string;
  key?: string;
  repeat?: boolean;
  action: () => void;
}

export function useHotkeys(hotkeys: HotKey[], deps?: DependencyList) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (IGNORE_TAGS.includes(t.tagName) || t.isContentEditable)
      ) {
        return;
      }
      const hotkey = hotkeys.find(
        k =>
          ((k.code && k.code === e.code) || (k.key && k.key === e.key)) &&
          (!e.repeat || k.repeat)
      );
      if (hotkey) {
        e.preventDefault();
        hotkey.action();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, deps);
}

// Utils

const IGNORE_TAGS = ["INPUT", "TEXTAREA", "SELECT"];
