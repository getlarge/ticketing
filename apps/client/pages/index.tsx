import { UserResponse } from '@ticketing/shared/models';

import styles from './index.module.css';

export function Index(props: { currentUser: UserResponse }): JSX.Element {
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
