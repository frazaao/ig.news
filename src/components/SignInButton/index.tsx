import styles from "./styles.module.scss";
import { FaGithub, FaTimes } from "react-icons/fa";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SignInButton() {
    const { data: session } = useSession();

    return session ? (
        <button className={styles.signInButton} onClick={() => signOut()}>
            <FaGithub color="#04D361" />
            <span>{session.user?.name}</span>
            <FaTimes color="#737380" />
        </button>
    ) : (
        <button className={styles.signInButton} onClick={() => signIn()}>
            <FaGithub color="#eba417" />
            <span>SignIn with github</span>
        </button>
    );
}
