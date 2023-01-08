import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";

interface ActiveLinkProps extends LinkProps {
    children: React.ReactNode;
    activeClassName: string;
}

export function ActiveLink({
    children,
    activeClassName,
    ...rest
}: ActiveLinkProps) {
    const { asPath } = useRouter();

    const className = rest.href === asPath ? activeClassName : "";

    return (
        <Link className={className} {...rest}>
            {children}
        </Link>
    );
}
