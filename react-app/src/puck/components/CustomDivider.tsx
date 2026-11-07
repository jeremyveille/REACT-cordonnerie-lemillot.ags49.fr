import React from 'react';

export interface CustomDividerProps {
  id?: string;
  text?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted' | 'double';
  thickness?: number;
  width?: string;
  showDiamond?: boolean;
}

export const CustomDivider: React.FC<CustomDividerProps> = ({
  text,
  color = 'var(--cordo-chocolate)',
  style = 'dotted',
  thickness = 2,
  width = '100%',
  showDiamond,
}) => {
  const isPlaceholder = text === 'Séparateur' || text === 'separateur';
  const hasText = Boolean(text && !isPlaceholder);
  const renderDiamond = showDiamond !== undefined ? showDiamond : (hasText && style !== 'dotted');
  const hasCenter = hasText || renderDiamond;

  return (
    <div
      className="puck-custom-divider"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        margin: '1.25rem auto',
        gap: hasCenter ? '1rem' : '0',
      }}
    >
      <div
        className="divider-line divider-line-left"
        style={{
          flex: 1,
          borderTop: `${thickness}px ${style} ${color}`,
          height: 0,
        }}
      />
      {hasCenter && (
        <div
          className="divider-center"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: color,
            fontFamily: 'var(--font-title)',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {renderDiamond && <span className="divider-diamond">◆</span>}
          {hasText && <span className="divider-text">{text}</span>}
          {renderDiamond && hasText && <span className="divider-diamond">◆</span>}
        </div>
      )}
      <div
        className="divider-line divider-line-right"
        style={{
          flex: 1,
          borderTop: `${thickness}px ${style} ${color}`,
          height: 0,
        }}
      />
    </div>
  );
};

export default CustomDivider;
