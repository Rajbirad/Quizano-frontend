import React from 'react';
import './StarBorder.css';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  speed?: React.CSSProperties['animationDuration'];
};

const StarBorder = <T extends React.ElementType = 'div'>({
  as,
  className = '',
  speed = '4s',
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'div';

  return (
    <Component
      className={`star-border-container ${className}`}
      {...(rest as any)}
      style={{
        animationDuration: speed,
        ...(rest as any).style
      }}
    >
      <div className="inner-content">{children}</div>
    </Component>
  );
};

export default StarBorder;