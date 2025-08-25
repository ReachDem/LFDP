import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = `send.dev@latioms.co`;

export async function POST(req: Request) {
  try {
    const { recipients, subject, content } = await req.json();

    // Envoi en batch
    const batchPromises = recipients.map((recipient: string) =>
      resend.emails.send({
        from: FROM_EMAIL,
        to: recipient,
        subject: subject,
        html: content,
      })
    );

    const results = await Promise.allSettled(batchPromises);

    const successes = results.filter((r) => r.status === "fulfilled").length;
    const failures = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      data: {
        total: recipients.length,
        successes,
        failures,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `Erreur lors de l'envoi des emails: ${err}` },
      { status: 500 }
    );
  }
}
