import { query as q } from "faunadb";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { fauna } from "../../../services/fauna";

export default NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        }),
    ],

    callbacks: {
        async session({ session }) {
            try {
                const userActiveSubscription = await fauna.query(
                    q.Get(
                        q.Intersection(
                            q.Match(
                                q.Index("subscription_by_user_ref"),
                                q.Select(
                                    "ref",
                                    q.Get(
                                        q.Match(
                                            q.Index("user_by_email"),
                                            q.Casefold(session.user?.email!)
                                        )
                                    )
                                )
                            ),
                            q.Match(q.Index("subscription_by_status"), "active")
                        )
                    )
                );

                return {
                    activeSubscription: userActiveSubscription,
                    ...session,
                };
            } catch {
                return {
                    activeSubscription: null,
                    ...session,
                };
            }
        },
        async signIn({ user }) {
            const { email } = user;

            try {
                await fauna.query(
                    q.If(
                        q.Not(
                            q.Exists(
                                q.Match(
                                    q.Index("user_by_email"),
                                    q.Casefold(email!)
                                )
                            )
                        ),
                        q.Create(q.Collection("users"), { data: { email } }),
                        q.Get(
                            q.Match(
                                q.Index("user_by_email"),
                                q.Casefold(email!)
                            )
                        )
                    )
                );

                return true;
            } catch (error) {
                return false;
            }
        },
    },
});
