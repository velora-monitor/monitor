import { Resend } from "resend";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export type EmailSender = {
  send: (message: EmailMessage) => Promise<void>;
};

export type EmailClient = {
  emails: {
    send: (payload: {
      from: string;
      to: string;
      subject: string;
      text: string;
    }) => Promise<unknown>;
  };
};

const fromAddress = "Velora <alerts@velora.invalid>";

export function createEmailSender(
  apiKey: string | undefined,
  factory: (apiKey: string) => EmailClient = (key) => new Resend(key),
): EmailSender {
  if (!apiKey) {
    return {
      async send() {},
    };
  }

  const resend = factory(apiKey);
  return {
    async send(message) {
      await resend.emails.send({
        from: fromAddress,
        to: message.to,
        subject: message.subject,
        text: message.text,
      });
    },
  };
}
