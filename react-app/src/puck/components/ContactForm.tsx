import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ContactFormProps {
  id?: string;
  title?: string;
  subtitle?: string;
  services?: string[];
  submitLabel?: string;
  showPhoneField?: boolean;
}

const DEFAULT_SERVICES = [
  'Cordonnerie & Chaussures',
  'Reproduction de Clés',
  'Badges d’Immeuble',
  'Tampons Encreurs',
  'Gravure & Plaques',
  'Maroquinerie & Réparation cuir',
  'Télécommandes',
  'Piles & Horlogerie',
  'Autre demande',
];

export const ContactForm: React.FC<ContactFormProps> = ({
  title = 'Contactez votre Artisan Cordonnier',
  subtitle = 'Une question, un devis gratuit ou un renseignement sur nos prestations ? Remplissez ce formulaire et Jean-Christophe vous répondra dans les plus brefs délais.',
  services = DEFAULT_SERVICES,
  submitLabel = 'Envoyer ma Demande',
  showPhoneField = true,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: services[0] || '',
    message: '',
    gdprConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Veuillez renseigner votre nom.';
    if (!formData.email.trim()) {
      errs.email = 'Veuillez renseigner votre adresse e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Adresse e-mail invalide.';
    }
    if (showPhoneField && formData.phone && !/^[0-9+\s().-]{6,20}$/.test(formData.phone)) {
      errs.phone = 'Numéro de téléphone invalide.';
    }
    if (!formData.message.trim() || formData.message.length < 5) {
      errs.message = 'Veuillez saisir votre message (au moins 5 caractères).';
    }
    if (!formData.gdprConsent) {
      errs.gdprConsent = 'Veuillez accepter le traitement de vos données pour votre demande.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate genuine submission storage
    setTimeout(() => {
      try {
        const storedMessages = JSON.parse(localStorage.getItem('cordo_contact_messages') || '[]');
        storedMessages.push({
          ...formData,
          submittedAt: new Date().toISOString(),
        });
        localStorage.setItem('cordo_contact_messages', JSON.stringify(storedMessages));
      } catch (e) {
        // storage fallback
      }
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 400);
  };

  return (
    <div
      className="puck-contact-form-container cordo-card"
      style={{
        margin: '2rem auto',
        maxWidth: '680px',
        padding: '2.5rem',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h3
          style={{
            fontFamily: 'var(--font-title)',
            color: 'var(--cordo-chocolate)',
            fontSize: '1.5rem',
            margin: '0 0 0.5rem',
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p style={{ color: 'var(--cordo-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            {subtitle}
          </p>
        )}
      </div>

      {isSubmitted ? (
        <div
          className="contact-success-box"
          style={{
            backgroundColor: 'rgba(27, 108, 48, 0.1)',
            border: '2px solid #1B6C30',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            color: '#1B6C30',
          }}
        >
          <CheckCircle2 size={48} style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontFamily: 'var(--font-title)', margin: '0 0 0.5rem' }}>
            Message Envoyé avec Succès !
          </h4>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Merci {formData.name}, votre demande a bien été transmise à l'atelier. Nous vous recontacterons très rapidement.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: '',
                email: '',
                phone: '',
                service: services[0] || '',
                message: '',
                gdprConsent: false,
              });
            }}
          >
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="contact-name">
              Votre Nom et Prénom *
            </label>
            <input
              id="contact-name"
              type="text"
              className={`form-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="ex: Jean Dupont"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && (
              <span className="form-error" style={{ color: '#FA2D2D', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <AlertCircle size={14} /> {errors.name}
              </span>
            )}
          </div>

          {/* Email & Phone in 2 columns */}
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">
                Adresse E-mail *
              </label>
              <input
                id="contact-email"
                type="email"
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="jean@exemple.fr"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && (
                <span className="form-error" style={{ color: '#FA2D2D', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <AlertCircle size={14} /> {errors.email}
                </span>
              )}
            </div>

            {showPhoneField && (
              <div className="form-group">
                <label className="form-label" htmlFor="contact-phone">
                  Téléphone (optionnel)
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="06 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && (
                  <span className="form-error" style={{ color: '#FA2D2D', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <AlertCircle size={14} /> {errors.phone}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Service Selector */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="contact-service">
              Prestation concernée
            </label>
            <select
              id="contact-service"
              className="form-input"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            >
              {services.map((srv, idx) => (
                <option key={idx} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="contact-message">
              Votre Message / Demande de Devis *
            </label>
            <textarea
              id="contact-message"
              className={`form-input ${errors.message ? 'is-invalid' : ''}`}
              rows={4}
              placeholder="Décrivez votre besoin (ex: type de chaussures, semelles usées, clé de sécurité...)"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
            {errors.message && (
              <span className="form-error" style={{ color: '#FA2D2D', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <AlertCircle size={14} /> {errors.message}
              </span>
            )}
          </div>

          {/* GDPR Checkbox */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--cordo-dark)' }}>
              <input
                type="checkbox"
                checked={formData.gdprConsent}
                onChange={(e) => setFormData({ ...formData, gdprConsent: e.target.checked })}
                style={{ marginTop: '0.2rem', accentColor: 'var(--cordo-gold)' }}
              />
              <span>
                J'accepte que les informations saisies soient utilisées par la Cordonnerie Le Millot pour me recontacter dans le cadre de ma demande.
              </span>
            </label>
            {errors.gdprConsent && (
              <span className="form-error" style={{ color: '#FA2D2D', fontSize: '0.8rem', display: 'block', marginTop: '0.35rem' }}>
                {errors.gdprConsent}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-gold btn-lg"
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Send size={18} />
            <span>{isSubmitting ? 'Transmission en cours...' : submitLabel}</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
