import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItemData {
  title?: string;
  header?: string;
  content: string;
  icon?: string;
}

export interface AccordionCollapseProps {
  id?: string;
  title?: string;
  items: AccordionItemData[];
  allowMultipleOpen?: boolean;
  initialOpenIndex?: number;
}

export const AccordionCollapse: React.FC<AccordionCollapseProps> = ({
  title,
  items = [],
  allowMultipleOpen = false,
  initialOpenIndex,
}) => {
  const [openIndices, setOpenIndices] = useState<number[]>(() => {
    if (typeof initialOpenIndex === 'number' && initialOpenIndex >= 0) {
      return [initialOpenIndex];
    }
    return [];
  });

  const toggleItem = (idx: number) => {
    if (openIndices.includes(idx)) {
      setOpenIndices(openIndices.filter((i) => i !== idx));
    } else {
      if (allowMultipleOpen) {
        setOpenIndices([...openIndices, idx]);
      } else {
        setOpenIndices([idx]);
      }
    }
  };

  return (
    <div className="puck-accordion-container" style={{ margin: '1.5rem 0', width: '100%' }}>
      {title && (
        <h3
          style={{
            fontFamily: 'var(--font-title)',
            color: 'var(--cordo-chocolate)',
            marginBottom: '1rem',
          }}
        >
          {title}
        </h3>
      )}

      <div className="accordion-list">
        {items.map((item, idx) => {
          const isOpen = openIndices.includes(idx);
          const itemTitle = item.title || item.header || `Section ${idx + 1}`;
          const contentId = `accordion-panel-${idx}`;
          const headerId = `accordion-header-${idx}`;

          return (
            <div
              key={idx}
              className={`accordion-item-card ${isOpen ? 'is-open' : ''}`}
              style={{
                marginBottom: '0.75rem',
                border: '2px solid var(--cordo-chocolate)',
                borderRadius: '8px',
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: isOpen ? '4px 4px 0px 0px var(--cordo-chocolate)' : '2px 2px 0px 0px var(--cordo-chocolate)',
                transition: 'box-shadow var(--transition-fast), border-color var(--transition-fast)',
              }}
            >
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleItem(idx)}
                className="accordion-header-btn"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: isOpen ? 'var(--cordo-cream)' : 'white',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-title)',
                  fontSize: '1rem',
                  color: 'var(--cordo-chocolate)',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  {item.icon && <span className={item.icon} />}
                  <span>{itemTitle}</span>
                </span>
                <ChevronDown
                  size={20}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                    color: isOpen ? 'var(--cordo-gold)' : 'var(--cordo-chocolate)',
                    flexShrink: 0,
                  }}
                />
              </button>

              <div
                id={contentId}
                role="region"
                aria-labelledby={headerId}
                className={`accordion-body-collapse ${isOpen ? 'expanded' : 'collapsed'}`}
                style={{
                  display: isOpen ? 'block' : 'none',
                  padding: '1.25rem',
                  borderTop: isOpen ? '1px solid var(--cordo-border)' : 'none',
                  backgroundColor: 'white',
                  lineHeight: 1.65,
                  fontSize: '0.95rem',
                }}
              >
                {/* HTML content support */}
                {/<[a-z][\s\S]*>/i.test(item.content) ? (
                  <div
                    className="accordion-html-content"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                ) : (
                  <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{item.content}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccordionCollapse;
