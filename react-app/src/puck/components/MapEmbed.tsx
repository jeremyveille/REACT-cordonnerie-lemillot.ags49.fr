import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export interface MapEmbedProps {
  id?: string;
  address?: string;
  zoom?: number;
  height?: number;
  title?: string;
}

export const MapEmbed: React.FC<MapEmbedProps> = ({
  address = 'Intermarché - 55 bd Jacques Millot, 49000 Angers',
  zoom = 16,
  height = 320,
  title = 'Cordonnerie Le Millot - Intermarché Madeleine',
}) => {
  const encodedAddress = encodeURIComponent(address);
  // Using openstreetmap or Google maps embed URL
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

  return (
    <div
      className="puck-map-embed-container"
      style={{
        margin: '2rem 0',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="map-header flex items-center justify-between flex-wrap gap-2"
        style={{ marginBottom: '0.75rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={20} color="var(--cordo-chocolate)" />
          <strong style={{ fontFamily: 'var(--font-title)', color: 'var(--cordo-chocolate)' }}>
            {title}
          </strong>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            padding: '0.35rem 0.75rem',
          }}
        >
          <Navigation size={14} />
          <span>Itinéraire Google Maps</span>
        </a>
      </div>

      <div
        className="map-iframe-wrapper"
        style={{
          width: '100%',
          height: `${height}px`,
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid var(--cordo-chocolate)',
          boxShadow: 'var(--cordo-shadow)',
          backgroundColor: '#e5e7eb',
        }}
      >
        <iframe
          src={mapEmbedUrl}
          title={title}
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
          allowFullScreen
        />
      </div>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--cordo-muted)',
          marginTop: '0.5rem',
          textAlign: 'center',
        }}
      >
        Adresse : {address} (Parking gratuit du centre commercial Intermarché)
      </p>
    </div>
  );
};

export default MapEmbed;
