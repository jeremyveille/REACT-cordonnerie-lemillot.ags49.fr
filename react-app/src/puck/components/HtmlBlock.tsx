import React from 'react';

export interface HtmlBlockProps {
  id?: string;
  html: string;
  className?: string;
}

export const HtmlBlock: React.FC<HtmlBlockProps> = ({
  html = '',
  className = '',
}) => {
  return (
    <div
      className={`puck-html-block ${className}`}
      style={{ margin: '1rem 0', width: '100%' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default HtmlBlock;
