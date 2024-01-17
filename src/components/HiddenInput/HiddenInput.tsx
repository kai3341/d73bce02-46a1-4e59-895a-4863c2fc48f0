import React, { ReactNode } from 'react';
import "./HiddenInput.css";

export type HiddenInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  className?: string,
  children?: ReactNode,
}


export function HiddenInput(props: HiddenInputProps) {
  const { className: oldClassName, children } = props;
  const classNames = ["hidden-input"];
  oldClassName && classNames.push(oldClassName);
  const className = classNames.join(" ") as string;
  const newProps = {...props, className}
  delete newProps["children"];
  const inputElement = <input {...newProps} />
  return children
  ? <>{inputElement}{children}</>
  : inputElement
}
