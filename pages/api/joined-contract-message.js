import { Mailchain } from "@mailchain/sdk";

const mailchain = Mailchain.fromSecretRecoveryPhrase(
  process.env.SECRET_RECOVERY_PHRASE
);

export default async function handler(req, res) {
  try {
    if (req.method != "POST")
      return res.status(405).json({ message: "Please send POST request" });
    const address = req.body.address;
    console.log("hello");
    if (!address)
      return res
        .status(400)
        .json({ message: "Please provide a wallet address" });
    // Trigger mail
    const result = await mailchain.sendMail({
      from: `${process.env.MAILCHAIN_ADMIN_USERNAME}@mailchain.com`,
      to: [`${address}@ethereum.mailchain.com`],
      subject: "Successfully created  a new snowball contract!👋🏻",
      content: {
        text: "You have successfully created a new Snowball Contract! View the details  of your contract here. 👋🏻 Please join our Discord server to access the community",
        html: "<p> You have successfully created a new Snowball Contract! View the details  of your contract here. </p> <p>👋🏻 Please join our Discord server to access the community</p>",
      },
    });

    console.log(result);
    res.json({ message: "Mail sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
