import React from 'react';

export interface VerticalSpacerProps {
  id?: string;
  heightDesktop?: number;
  heightMobile?: number;
}

export const VerticalSpacer: React.FC<VerticalSpacerProps> = ({
  heightDesktop = 30,
  heightMobile = 20,
}) => {
  return (
    <div
      className="puck-vertical-spacer"
      style={
        {
          '--spacer-h-desktop': `${heightDesktop}px`,
          '--spacer-h-mobile': `${heightMobile}px`,
        } as React.CSSProperties
      }
      aria-hidden="true"
    />
  );
};

export default VerticalSpacer;
