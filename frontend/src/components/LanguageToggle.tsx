import React from 'react';
import { useLanguageContext } from '../contexts/LanguageContext';
import './LanguageToggle.css';

export interface LanguageToggleProps {
  className?: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'switch' | 'tabs';
}

/**
 * Language Toggle Component for Chronicler Application
 * 
 * Provides elvish-professional interface for switching between:
 * - Sindarin (Elvish) - Primary scholarly language
 * - English ("Hobbitish") - Secondary accessible language
 * 
 * Follows brand guide specifications for cultural authenticity
 */
export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  style = {},
  showLabel = true,
  size = 'medium',
  variant = 'button'
}) => {
  const { 
    language, 
    toggleLanguage
    // shouldUseTengwar // TODO: Implement Tengwar script support
  } = useLanguageContext();

  const isElvish = language === 'sindarin';
  
  // Enhanced button text with native script for target language
  const getToggleText = () => {
    if (isElvish) {
      // In Sindarin mode: show "Hobbit (English)" in Latin font (readable by English speakers)
      return 'Hobbit (English)';
    } else {
      // In English mode: return JSX with "Elf" + Sindarin in Tengwar font
      return (
        <>
          Elf (<span className="tengwar-text">Sindarin</span>)
        </>
      );
    }
  };

  // Handle language toggle with elvish courtesy
  const handleLanguageToggle = () => {
    toggleLanguage();
    
    // Emit custom event for other components that might need to update
    const eventDetail = {
      newLanguage: isElvish ? 'english' : 'sindarin',
      wasElvish: isElvish,
      culturalTransition: true
    };
    
    window.dispatchEvent(new CustomEvent('chronicler-language-toggled', {
      detail: eventDetail
    }));
  };

  // Removed script toggle - keeping it simple

  // Render based on variant
  const renderToggle = () => {
    switch (variant) {
      case 'switch':
        return (
          <div className={`language-switch language-switch--${size} ${className}`} style={style}>
            {showLabel && (
              <label className="language-switch__label">
                {isElvish ? 'Sindarin' : 'English'}
              </label>
            )}
            <div className="language-switch__container">
              <input
                type="checkbox"
                className="language-switch__input"
                checked={!isElvish}
                onChange={handleLanguageToggle}
                aria-label={`Switch to ${isElvish ? 'English' : 'Sindarin'} language`}
              />
              <div className="language-switch__slider">
                <div className="language-switch__thumb">
                  {isElvish ? '🧙‍♂️' : '🧙‍♂️'}
                </div>
              </div>
              <div className="language-switch__labels">
                <span className={`language-switch__label-left ${isElvish ? 'active' : ''}`}>
                  Sin
                </span>
                <span className={`language-switch__label-right ${!isElvish ? 'active' : ''}`}>
                  Eng
                </span>
              </div>
            </div>
          </div>
        );

      case 'tabs':
        return (
          <div className={`language-tabs language-tabs--${size} ${className}`} style={style}>
            <div className="language-tabs__container">
              <button
                className={`language-tabs__tab ${isElvish ? 'active' : ''}`}
                onClick={() => !isElvish && handleLanguageToggle()}
                disabled={isElvish}
                aria-label="Switch to Sindarin (Elvish)"
              >
                <span className="language-tabs__tab-text">Sindarin</span>
                <span className="language-tabs__tab-icon">🧝‍♂️</span>
              </button>
              <button
                className={`language-tabs__tab ${!isElvish ? 'active' : ''}`}
                onClick={() => isElvish && handleLanguageToggle()}
                disabled={!isElvish}
                aria-label="Switch to English (Hobbitish)"
              >
                <span className="language-tabs__tab-text">Hobbitish</span>
                <span className="language-tabs__tab-icon">🧙‍♂️</span>
              </button>
            </div>
          </div>
        );

      default: // button variant
        return (
          <div className={`language-toggle-container ${className}`} style={style}>
            <button
              className={`language-toggle language-toggle--${size} ${isElvish ? 'elvish-mode' : 'hobbit-mode'}`}
              onClick={handleLanguageToggle}
              aria-label={`Switch to ${isElvish ? 'Hobbit (English)' : 'Elf (Sindarin)'} language`}
              title={`Currently in ${isElvish ? 'Elf (Sindarin)' : 'Hobbit (English)'} mode. Click to switch.`}
            >
              <span className="language-toggle__icon">
                {isElvish ? '🧙‍♂️' : '🧝‍♂️'}
              </span>
              {showLabel && (
                <span className="language-toggle__text">
                  {getToggleText()}
                </span>
              )}
              <span className="language-toggle__arrow">
                ⟷
              </span>
            </button>
            
            {/* Remove confusing script toggle - keep it simple */}
          </div>
        );
    }
  };

  return renderToggle();
};

/**
 * Compact Language Toggle for header use
 * Pre-configured for elvish professional standards
 */
export const HeaderLanguageToggle: React.FC = () => (
  <LanguageToggle
    size="small"
    variant="button"
    showLabel={true}
    className="header-language-toggle"
  />
);

/**
 * Tab-style Language Toggle for settings
 * Professional elvish interface for preference selection
 */
export const SettingsLanguageToggle: React.FC = () => (
  <LanguageToggle
    size="large"
    variant="tabs"
    showLabel={true}
    className="settings-language-toggle"
  />
);

export default LanguageToggle;