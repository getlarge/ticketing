import styles from './index.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Index(props: { currentUser: any }): JSX.Element {
  const { currentUser } = props;
  return (
    <div className={styles.page}>
      {currentUser ? (
        <h2>You are signed in</h2>
      ) : (
        <h2>You are not signed in</h2>
      )}
    </div>
  );
}

export default Index;
