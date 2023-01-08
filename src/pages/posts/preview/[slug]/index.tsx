import { GetStaticPaths, GetStaticProps } from "next";
import { getPrismicClient } from "../../../../services/prismic";
import * as Prismic from "@prismicio/helpers";
import Head from "next/head";
import styles from "./style.module.scss";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface PostPreviewProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    };
}

export default function PagePostPreview({ post }: PostPreviewProps) {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.activeSubscription) {
            router.push(`/posts/${post.slug}`);
        }
    }, [session]);

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
                        className={`${styles.postContent} ${styles.previewContent}`}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    ></div>

                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link href="/">Subscribe now 🤗</Link>
                    </div>
                </article>
            </main>
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: "blocking",
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const slug = params?.slug;

    const prismic = getPrismicClient();

    const response = await prismic.getByUID("post", slug as string);

    const post = {
        slug: response.uid,
        title: response.data.title,
        content: Prismic.asHTML(response.data.content.splice(0, 3)),
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
        props: {
            post,
        },
        revalidate: 24 * 60 * 60, // 24 hours
    };
};
