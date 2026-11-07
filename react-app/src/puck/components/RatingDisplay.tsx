import React from 'react';
import { Star } from 'lucide-react';

export interface RatingDisplayProps {
  id?: string;
  title?: string;
  score?: number;
  totalStars?: number;
  reviewCount?: number;
  starsColor?: string;
  comment?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  title = 'Vos avis :',
  score = 5,
  totalStars = 5,
  reviewCount = 42,
  starsColor = 'var(--cordo-yellow)',
  comment = 'Travail d’artisan remarquable, accueil chaleureux et tarifs très honnêtes.',
}) => {
  const stars = Array.from({ length: totalStars }, (_, i) => i < Math.round(score));

  return (
    <div
      className="puck-rating-display cordo-card"
      style={{
        margin: '1.5rem auto',
        padding: '1.5rem 2rem',
        maxWidth: '520px',
        textAlign: 'center',
        backgroundColor: 'var(--cordo-cream)',
      }}
    >
      {title && (
        <h4
          style={{
            fontFamily: 'var(--font-title)',
            color: 'var(--cordo-chocolate)',
            margin: '0 0 0.75rem',
            fontSize: '1.1rem',
          }}
        >
          {title}
        </h4>
      )}

      {/* Stars row */}
      <div
        className="stars-row"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.35rem',
          marginBottom: '0.75rem',
        }}
        aria-label={`Note de ${score} sur ${totalStars}`}
      >
        {stars.map((filled, idx) => (
          <Star
            key={idx}
            size={24}
            fill={filled ? starsColor : 'transparent'}
            color={starsColor}
            strokeWidth={1.5}
          />
        ))}
      </div>

      <div
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--cordo-chocolate)',
          marginBottom: '0.5rem',
        }}
      >
        <span>{score.toFixed(1)} / {totalStars}</span>
        {reviewCount && (
          <span style={{ fontSize: '0.85rem', color: 'var(--cordo-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
            ({reviewCount} avis Google vérifiés)
          </span>
        )}
      </div>

      {comment && (
        <blockquote
          style={{
            margin: '0.75rem 0 0',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            color: 'var(--cordo-muted)',
            lineHeight: 1.5,
          }}
        >
          « {comment} »
        </blockquote>
      )}
    </div>
  );
};

export default RatingDisplay;
