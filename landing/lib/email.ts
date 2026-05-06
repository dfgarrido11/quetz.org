const FROM = "Quetz.org 🌳 <hola@quetz.org>";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  from: string = FROM
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("[email] RESEND_API_KEY is not set");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Resend error " + res.status + ": " + err);
  }

  const body = await res.json().catch(() => ({}));
  // Log Resend message ID for bounce tracking in Railway logs
  console.log("[email] sent", { to, subject: subject.slice(0, 60), resendId: body.id ?? "unknown" });
}
