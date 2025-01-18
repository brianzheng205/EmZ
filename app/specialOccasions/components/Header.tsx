import Link from "next/link";

import styles from "./Header.module.css";

export default function Header() {
  return (
    <div className={styles.container}>
      <Link className={styles.link} href="/">
        Home
      </Link>
    </div>
  );
}
