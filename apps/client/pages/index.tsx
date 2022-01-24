import { User } from '@ticketing/shared/models';

import styles from './index.module.css';

function Index(props: { currentUser?: User }): JSX.Element {
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

// Index.getInitialProps = async () => {
//   return {};
// };

export default Index;
