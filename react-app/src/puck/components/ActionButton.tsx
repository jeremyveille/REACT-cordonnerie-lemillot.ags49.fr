import React from 'react';

export interface ActionButtonProps {
  id?: string;
  label: string;
  url?: string;
  variant?: 'primary' | 'secondary' | 'gold' | 'chocolate' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  openModalId?: string;
  retroShadow?: boolean;
  align?: 'left' | 'center' | 'right';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  url = '#',
  variant = 'gold',
  size = 'md',
  icon,
  openModalId,
  retroShadow = true,
  align = 'center',
}) => {
  let btnClass = 'btn-gold';
  if (variant === 'chocolate' || variant === 'primary') btnClass = 'btn-primary';
  else if (variant === 'secondary') btnClass = 'btn-secondary';
  else if (variant === 'outline') btnClass = 'btn-outline';

  let sizeClass = '';
  if (size === 'sm') sizeClass = 'btn-sm';
  else if (size === 'lg') sizeClass = 'btn-lg';

  // Handle popup triggers from elementor migration
  const isModalTrigger = !!openModalId || url.includes('elementor-action');

  const handleClick = (e: React.MouseEvent) => {
    if (isModalTrigger) {
      e.preventDefault();
      // Dispatch custom event for modal system if openModalId is present
      const modalTarget = openModalId || '400';
      window.dispatchEvent(
        new CustomEvent('cordo:openModal', { detail: { templateId: modalTarget } })
      );
    }
  };

  return (
    <div
      className="puck-action-button-container"
      style={{
        textAlign: align,
        margin: '1.25rem 0',
        width: '100%',
      }}
    >
      <a
        href={url}
        onClick={handleClick}
        className={`btn ${btnClass} ${sizeClass} ${retroShadow ? 'btn-retro-shadow' : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontFamily: 'var(--font-title)',
          textDecoration: 'none',
        }}
      >
        {icon && <span className={`button-icon ${icon}`} />}
        <span>{label || 'Découvrir'}</span>
      </a>
    </div>
  );
};

export default ActionButton;
