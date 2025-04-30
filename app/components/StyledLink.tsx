import { LinkProps } from "next/link";
import Link from "next/link";
import { CSSProperties } from "react";

const linkStyle: CSSProperties = {
  textDecoration: "none",
  color: "inherit",
};

interface StyledLinkProps extends LinkProps {
  children: React.ReactNode;
}

export default function StyledLink({
  href,
  as,
  children,
  ...props
}: StyledLinkProps) {
  return (
    <Link href={href} as={as} style={linkStyle} {...props}>
      {children}
    </Link>
  );
}
