import React from 'react';

export interface RichTextBlockProps {
  id?: string;
  content: string;
  textColor?: string;
  fontSize?: 'small' | 'base' | 'lead' | 'large';
  align?: 'left' | 'center' | 'right' | 'justify';
}

export const RichTextBlock: React.FC<RichTextBlockProps> = ({
  content,
  textColor = 'inherit',
  fontSize = 'base',
  align = 'left',
}) => {
  let sizeStyle = '1rem';
  let lineHeightStyle = 1.65;
  if (fontSize === 'small') {
    sizeStyle = '0.9rem';
    lineHeightStyle = 1.5;
  } else if (fontSize === 'lead') {
    sizeStyle = '1.2rem';
    lineHeightStyle = 1.75;
  } else if (fontSize === 'large') {
    sizeStyle = '1.35rem';
    lineHeightStyle = 1.8;
  }

  // If content contains HTML tags, render dangerouslySetInnerHTML, otherwise normal text with line breaks
  const hasHtml = /<[a-z][\s\S]*>/i.test(content || '');

  return (
    <div
      className="puck-richtext-block"
      style={{
        color: textColor,
        fontSize: sizeStyle,
        lineHeight: lineHeightStyle,
        textAlign: align,
        margin: '1rem 0',
      }}
    >
      {hasHtml ? (
        <div
          className="richtext-html-body"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{content}</p>
      )}
    </div>
  );
};

export default RichTextBlock;
