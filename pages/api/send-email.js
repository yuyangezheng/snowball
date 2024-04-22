import { Mailchain } from "@mailchain/sdk";

const mailchain = Mailchain.fromSecretRecoveryPhrase(
  process.env.SECRET_RECOVERY_PHRASE
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Trigger mail
    console.log(to);
    const result = await mailchain.sendMail({
      from: `${process.env.MAILCHAIN_ADMIN_USERNAME}@mailchain.com`,
      to: [`${to}@ethereum.mailchain.com`],
      subject,
      content: {
        text,
        html,
      },
    });

    res.json({ message: "Mail sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
