import React from 'react';
import { CheckCircle } from 'lucide-react';

export interface FeatureItem {
  text: string;
  icon?: string;
  link?: string;
}

export interface FeatureIconListProps {
  id?: string;
  title?: string;
  items: FeatureItem[];
  color?: string;
}

export const FeatureIconList: React.FC<FeatureIconListProps> = ({
  title,
  items = [],
  color = 'var(--cordo-chocolate)',
}) => {
  return (
    <div className="puck-feature-icon-list" style={{ margin: '1.25rem 0', width: '100%' }}>
      {title && (
        <h4
          style={{
            fontFamily: 'var(--font-title)',
            color: color,
            marginBottom: '0.75rem',
          }}
        >
          {title}
        </h4>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {items.map((item, idx) => (
          <li
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.95rem',
              color: 'var(--cordo-dark)',
            }}
          >
            <CheckCircle size={18} color="var(--cordo-green)" style={{ flexShrink: 0 }} />
            {item.link ? (
              <a href={item.link} style={{ color: color, textDecoration: 'underline' }}>
                {item.text}
              </a>
            ) : (
              <span>{item.text}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeatureIconList;
