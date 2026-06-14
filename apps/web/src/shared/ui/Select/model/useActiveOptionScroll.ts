import { useEffect } from 'react';

import type { MutableRefObject } from 'react';

export const useActiveOptionScroll = ({
  activeIndex,
  isOpen,
  optionRefs,
}: {
  activeIndex: number;
  isOpen: boolean;
  optionRefs: MutableRefObject<Array<HTMLElement | null>>;
}) => {
  useEffect(() => {
    if (!isOpen || activeIndex < 0) {
      return;
    }

    optionRefs.current[activeIndex]?.scrollIntoView?.({
      block: 'nearest',
    });
  }, [activeIndex, isOpen, optionRefs]);
};
