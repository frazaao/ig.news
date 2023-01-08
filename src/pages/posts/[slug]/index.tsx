import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { getPrismicClient } from "../../../services/prismic";
import * as Prismic from "@prismicio/helpers";
import Head from "next/head";
import styles from "./style.module.scss";

interface PostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    };
}

export default function PagePost({ post }: PostProps) {
    return (
        <>
            <Head>
                <title>{`${post.title} | Ignews`}</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>

                    <div
                        className={styles.postContent}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    ></div>
                </article>
            </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({
    req,
    params,
}) => {
    const session = await getSession({ req });
    const slug = params?.slug;

    if (!session?.activeSubscription) {
        return {
            redirect: {
                destination: `/posts/preview/${slug}`,
                permanent: false,
            },
        };
    }

    const prismic = getPrismicClient();

    const response = await prismic.getByUID("post", slug as string);

    const post = {
        slug: response.uid,
        title: response.data.title,
        content: Prismic.asHTML(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        ),
    };

    return {
        props: { post },
    };
};
