import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const BREVO_SMTP_HOST = 'smtp-relay.brevo.com';
const BREVO_SMTP_PORT = 587;

/** Sends transactional email via Brevo's SMTP relay. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const senderMail = this.config.getOrThrow<string>('SENDER_MAIL');
    const fromName = this.config.get<string>('MAIL_FROM_NAME', 'DigiMoiBook');
    this.fromAddress = `${fromName} <${senderMail}>`;

    // Brevo's SMTP auth login is a dashboard-assigned identity, distinct
    // from the "from" sender address — see Settings > SMTP & API > SMTP tab.
    this.transporter = nodemailer.createTransport({
      host: BREVO_SMTP_HOST,
      port: BREVO_SMTP_PORT,
      secure: false,
      auth: {
        user: this.config.getOrThrow<string>('BREVO_SMTP_LOGIN'),
        pass: this.config.getOrThrow<string>('BREVO_SMTP_API_KEY'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject: 'Reset your DigiMoiBook password',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;">
            <h2 style="color:#5B4330;">Reset your password</h2>
            <p>We received a request to reset your DigiMoiBook password. This link expires in 15 minutes.</p>
            <p><a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#C99132;color:#fff;border-radius:8px;text-decoration:none;">Reset Password</a></p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
        text: `Reset your DigiMoiBook password: ${resetLink} (expires in 15 minutes)`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send password reset email to ${to}: ${message}`);
      throw new Error('Could not send password reset email');
    }
  }
}
