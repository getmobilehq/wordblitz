import styles from './CategoryCard.module.css';

export default function CategoryCard({ category, categoryData, selected, onClick, wordCount }) {
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      style={{
        '--accentColor': categoryData.color,
        '--glowColor': categoryData.color + '33',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <span className={styles.icon}>{categoryData.icon}</span>
      <span className={styles.label}>{category.replace(/^.+\s/, '')}</span>
      {wordCount != null && <span className={styles.count}>{wordCount} words</span>}
    </div>
  );
}
