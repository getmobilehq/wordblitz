import styles from './GlowButton.module.css';

export default function GlowButton({ children, variant = 'primary', onClick, disabled, style, className = '' }) {
  return (
    <button
      className={`${styles.btn} ${styles[variant] || styles.primary} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
