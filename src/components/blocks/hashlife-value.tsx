import { useLayoutEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { useHashlifeStore, type HashlifeStore } from "@/stores";

export interface HashlifeValueProps<
  T extends any[]
> extends ComponentPropsWithoutRef<"span"> {
  selector: (state: HashlifeStore) => T;
  transform: (...value: NoInfer<T>) => string;
}

export function HashlifeValue<const T extends any[]>({
  selector,
  transform,
  ...props
}: HashlifeValueProps<T>) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const { current } = ref;
    if (!current) return;
    let values = selector(useHashlifeStore.getState());
    current.textContent = transform(...values);
    return useHashlifeStore.subscribe(state => {
      const newValues = selector(state);
      if (newValues.some((v, i) => !Object.is(v, values[i]))) {
        values = newValues;
        current.textContent = transform(...values);
      }
    });
  }, []);

  return <span ref={ref} {...props} />;
}
