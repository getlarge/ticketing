import './header.module.css';

import { UserResponse } from '@ticketing/shared/models';
import Link from 'next/link';

export interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUser?: UserResponse;
}

export function Header(props: HeaderProps): JSX.Element {
  const { currentUser } = props;
  const links = [
    !currentUser && { label: 'Sign up', href: '/auth/sign-up' },
    !currentUser && { label: 'Sign in', href: '/auth/sign-in' },
    currentUser && { label: 'Sign out', href: '/auth/sign-out' },
  ]
    .filter((link) => !!link)
    .map(({ label, href }) => (
      <li key={href} className="nav-item">
        <Link href={href}>
          <a className="nav-link">{label}</a>
        </Link>
      </li>
    ));

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    /* <img src="/nx-logo-white.svg" alt="Nx logo" width="75" height="50" /> */
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">Tix</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
}

export default Header;
