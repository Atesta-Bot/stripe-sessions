const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const OnrampSessionResource = Stripe.StripeResource.extend({
  create: Stripe.StripeResource.method({
    method: 'POST',
    path: 'crypto/onramp_sessions',
  }),
});

app.use(express.json());
app.use(cors());

app.post("/stripe-session", async (req, res) => {
    try {
      const { transaction_details, customer_information } = req.body;
  
      console.log("transaction_details: ", customer_information);
      // Create an OnrampSession with the order amount and currency
      const onrampSession = await new OnrampSessionResource(stripe).create({
        transaction_details: {
          destination_currency: transaction_details["destination_currency"],
          destination_exchange_amount: transaction_details["destination_exchange_amount"],
          destination_network: "avalanche", // transaction_details["destination_network"],
          wallet_addresses: { ethereum: transaction_details["wallet_address"] },
        },
        customer_information: {
          email: customer_information["email"],
          first_name: customer_information["first_name"],
          last_name: customer_information["last_name"],
          dob: {
            day: customer_information["dob"]["day"],
            month: customer_information["dob"]["month"],
            year: customer_information["dob"]["year"],
          },
        },
        destination_currencies: transaction_details["destination_currencies"],
        destination_networks: ['ethereum', 'avalanche']
      });
  
      console.log("--->> ", onrampSession);
      res.send({
        clientSecret: onrampSession.client_secret,
      });
    } catch (error) {
      console.log("[ Error !!!]: ", error);
      res.send({ message: "Error Occured" }).status(500);
    }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));