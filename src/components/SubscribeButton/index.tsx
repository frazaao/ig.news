import styles from "./styles.module.scss";
import { signIn, useSession } from "next-auth/react";
import { getStripe } from "../../services/stripe-js";
import { useRouter } from "next/router";

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();

    async function handleSubscribe() {
        try {
            if (!session) {
                signIn("github");
                return;
            }

            if (session.activeSubscription) {
                router.push("/posts");
                return;
            }

            const { sessionId } = await fetch("/api/subscribe", {
                method: "POST",
            }).then((res) => res.json());

            const stripe = await getStripe();

            stripe?.redirectToCheckout({ sessionId });
        } catch ({ message }) {
            alert(message as string);
        }
    }

    return (
        <button
            onClick={() => handleSubscribe()}
            className={styles.subscribeButton}
        >
            <span>Subscribe now</span>
        </button>
    );
}
