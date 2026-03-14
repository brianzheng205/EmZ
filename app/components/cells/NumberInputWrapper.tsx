"use client";

import { KeyboardEvent, ReactNode, forwardRef } from "react";
import {
  NumberInputField,
  NumberInputProps,
} from "../../../mui-treasury/components/number-input";

type NumberInputWrapperProps = Omit<NumberInputProps, "ref"> & {
  onSubmit?: () => void;
  label?: ReactNode;
  helperText?: ReactNode;
};

export const NumberInputWrapper = forwardRef<
  HTMLDivElement,
  NumberInputWrapperProps
>(({ onSubmit, onKeyDown, ...props }, ref) => {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && onSubmit) {
      event.preventDefault();
      onSubmit();
    }

    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  return <NumberInputField ref={ref} onKeyDown={handleKeyDown} {...props} />;
});

NumberInputWrapper.displayName = "NumberInputWrapper";
