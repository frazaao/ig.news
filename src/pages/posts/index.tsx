import Link from "next/link";
import Head from "next/head";
import { GetStaticProps } from "next";

import styles from "./styles.module.scss";
import { getPrismicClient } from "../../services/prismic";

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
};

interface PostsPageProps {
    posts: Post[];
}

export default function PostsPage({ posts }: PostsPageProps) {
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map((post) => {
                        return (
                            <Link href={`/posts/${post.slug}`} key={post.slug}>
                                <time>{post.updatedAt}</time>

                                <strong>{post.title}</strong>

                                <p>{post.excerpt}</p>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient();

    const response = await prismic.getAllByType("post", {
        fetch: ["post.title", "post.content"],
    });

    const posts = response.map((post) => {
        const firstParagraph =
            post.data.content.find(
                (content: any) => content.type === "paragraph"
            )?.text ?? " ";

        return {
            slug: post.uid,
            title: post.data.title,
            excerpt: firstParagraph,
            updatedAt: new Date(post.last_publication_date).toLocaleDateString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                }
            ),
        };
    });

    return {
        props: { posts },
    };
};
