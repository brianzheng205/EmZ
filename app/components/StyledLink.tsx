import { LinkProps } from "next/link";
import Link from "next/link";

import { CSSProperties } from "react";

const linkStyle: CSSProperties = {
  textDecoration: "none",
  color: "inherit",
};

export default function StyledLink(
  props: LinkProps & { children: React.ReactNode }
) {
  return (
    <Link {...props} style={linkStyle}>
      {props.children}
    </Link>
  );
}
