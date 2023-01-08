import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../services/stripe";
import { getSession } from "next-auth/react";
import { fauna } from "../../services/fauna";
import { query as q } from "faunadb";

interface FaunaStripeCustomerInterface {
    data: {
        email: string;
        stripe_customer_id?: string;
    };
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const session = await getSession({ req });

        const faunaStripeCustomer: FaunaStripeCustomerInterface =
            await getFaunaStripeCustomer(session?.user?.email!);

        if (!faunaStripeCustomer.data.stripe_customer_id) {
            const stripeCustomerId = await createStripeCustomer(
                session?.user?.email!
            );
            await updateFaunaStripeCustomer(
                session?.user?.email!,
                stripeCustomerId
            );

            faunaStripeCustomer.data.stripe_customer_id = stripeCustomerId;
        }

        const stripeCheckoutSession = await createStripeCheckoutSession(
            faunaStripeCustomer
        );

        return res.status(200).json({ sessionId: stripeCheckoutSession.id });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method not allowed");
    }
}

async function createStripeCustomer(email: string) {
    const stripeCustomer = await stripe.customers.create({
        email: email,
    });

    return stripeCustomer.id;
}

async function updateFaunaStripeCustomer(
    email: string,
    stripe_customer_id: string
) {
    await fauna.query(
        q.Update(
            q.Select("ref", q.Get(q.Match(q.Index("user_by_email"), email))),
            {
                data: {
                    email,
                    stripe_customer_id,
                },
            }
        )
    );
}

async function getFaunaStripeCustomer(email: string) {
    const customer: FaunaStripeCustomerInterface = await fauna.query(
        q.Get(q.Match(q.Index("user_by_email"), email))
    );

    return customer;
}

async function createStripeCheckoutSession(
    faunaStripeCustomer: FaunaStripeCustomerInterface
) {
    const checkoutSession = await stripe.checkout.sessions.create({
        customer: faunaStripeCustomer.data.stripe_customer_id,
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        line_items: [
            {
                price: process.env.STRIPE_PRICE_API_ID!,
                quantity: 1,
            },
        ],
        mode: "subscription",
        allow_promotion_codes: true,
        success_url: process.env.STRIPE_SUCCESS_URL!,
        cancel_url: process.env.STRIPE_CANCEL_URL!,
    });

    return checkoutSession;
}
