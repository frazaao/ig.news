import Head from "next/head";
import { GetServerSideProps } from "next";
import { stripe } from "../services/stripe";

import { SubscribeButton } from "../components/SubscribeButton";
import styles from "./home.module.scss";

interface HomePageProps {
    price: string;
    priceId: string;
}

export default function Home({ price, priceId }: HomePageProps) {
    return (
        <>
            <Head>
                <title>Ig.news | Início</title>
            </Head>

            <main className={styles.mainContent}>
                <div>
                    <span>👏 Hey, welcome</span>

                    <h1>
                        News about the <strong>React</strong> World
                    </h1>

                    <p>
                        Get access to all the publications
                        <br />
                        <span>for {price} month</span>
                    </p>

                    <SubscribeButton priceId={priceId} />
                </div>

                <img
                    src="/images/woman.png"
                    alt="Woman with glasses sitting in a chair, studying reactjs at a table with notebook, books and a glass of coffee"
                />
            </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const { unit_amount: price, id } = await stripe.prices.retrieve(
        process.env.STRIPE_PRICE_API_ID!
    );

    const priceAmount = (price! / 100).toLocaleString("en-US", {
        currency: "USD",
        style: "currency",
    });

    return {
        props: {
            price: priceAmount,
            priceId: id,
        },
    };
};
