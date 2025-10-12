import { useCallback, useState } from "react";

const useOpen = (initialVisiblity = false) => {
  const [isVisible, setVisibility] = useState<boolean>(initialVisiblity);
  const toggle = useCallback(
    () => setVisibility((toggleState) => !toggleState),
    [setVisibility]
  );
  const open = useCallback(() => setVisibility(true), [setVisibility]);
  const close = useCallback(() => setVisibility(false), [setVisibility]);
  return {
    isVisible,
    toggle,
    open,
    close,
  };
};

export default useOpen;
