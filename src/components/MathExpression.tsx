'use client';

import React from 'react';
import Latex from 'react-latex-next';

interface MathExpressionProps {
  children: string;
  className?: string;
}

export default function MathExpression({ children, className = '' }: MathExpressionProps) {
  return (
    <span className={className}>
      <Latex>{children}</Latex>
    </span>
  );
}