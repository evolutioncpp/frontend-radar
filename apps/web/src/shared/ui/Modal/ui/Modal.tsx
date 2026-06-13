import clsx from 'clsx';
import { X } from 'lucide-react';
import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock } from '@/shared/lib/use-body-scroll-lock';

import s from './Modal.module.scss';
import { useModalEscapeClose } from '../model/useModalEscapeClose';
import { useModalFocusTrap } from '../model/useModalFocusTrap';

import type { HTMLAttributes, ReactNode } from 'react';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children: ReactNode;
  closeLabel: string;
  description?: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  title: ReactNode;
}

export const Modal = ({
  children,
  className,
  closeLabel,
  description,
  footer,
  isOpen,
  onClose,
  size = 'md',
  title,
  ...props
}: ModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(isOpen);
  useModalEscapeClose(isOpen, onClose);
  useModalFocusTrap({
    containerRef: contentRef,
    initialFocusRef: closeButtonRef,
    isOpen,
  });

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className={s.overlay}>
      <div
        aria-hidden="true"
        className={s.backdrop}
        data-modal-backdrop=""
        onPointerDown={onClose}
      />
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={clsx(s.modal, s[`modal_${size}`], className)}
        ref={contentRef}
        role="dialog"
        tabIndex={-1}
        {...props}
      >
        <div className={s.header}>
          <div className={s.heading}>
            <h2 className={s.title} id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className={s.description} id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>

          <button
            aria-label={closeLabel}
            className={s.closeButton}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className={s.body}>{children}</div>

        {footer ? <div className={s.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
};
