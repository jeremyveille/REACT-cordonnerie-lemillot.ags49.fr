import React from 'react';

export interface HeadingBlockProps {
  id?: string;
  text: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  align?: 'left' | 'center' | 'right';
  color?: string;
  fontFamily?: 'Audiowide' | 'Roboto' | 'Roboto Slab';
  subtitle?: string;
  textShadow3D?: boolean;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  text,
  level = 'h2',
  align = 'center',
  color = 'var(--cordo-chocolate)',
  fontFamily = 'Audiowide',
  subtitle,
  textShadow3D = false,
}) => {
  const Tag = (level || 'h2') as keyof JSX.IntrinsicElements;

  const fontStyle =
    fontFamily === 'Audiowide'
      ? 'var(--font-title)'
      : fontFamily === 'Roboto Slab'
      ? 'var(--font-secondary)'
      : 'var(--font-body)';

  const shadowStyle = textShadow3D ? '2px 2px 0px var(--cordo-gold)' : undefined;

  return (
    <div
      className="puck-heading-block"
      style={{
        textAlign: align,
        margin: '1.5rem 0 1rem',
        width: '100%',
      }}
    >
      <Tag
        style={{
          color: color,
          fontFamily: fontStyle,
          textShadow: shadowStyle,
          margin: 0,
          lineHeight: 1.25,
        }}
      >
        {text}
      </Tag>
      {subtitle && (
        <p
          className="heading-subtitle"
          style={{
            color: 'var(--cordo-muted)',
            marginTop: '0.5rem',
            marginBottom: 0,
            fontSize: '1.05rem',
            maxWidth: '720px',
            marginLeft: align === 'center' ? 'auto' : undefined,
            marginRight: align === 'center' ? 'auto' : undefined,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default HeadingBlock;
