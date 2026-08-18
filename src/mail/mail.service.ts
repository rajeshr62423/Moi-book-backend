import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * Sends transactional email via SMTP when SMTP_HOST/SMTP_USER/SMTP_PASS are
 * set, otherwise falls back to an auto-generated Ethereal test account
 * (https://ethereal.email) — mail never leaves the sandbox, but every send
 * gets a preview URL logged so the flow is still verifiable in dev without
 * needing real inbox access.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter!: Transporter<SMTPTransport.SentMessageInfo>;
  private fromAddress = 'DigiMoiBook <no-reply@digimoibook.app>';
  private usingEthereal = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: this.config.get<string>('SMTP_SECURE') === 'true',
        auth: { user, pass },
      });
      this.fromAddress = this.config.get<string>('MAIL_FROM', this.fromAddress);
      this.logger.log(`Mail transport: SMTP (${host})`);
      return;
    }

    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    this.usingEthereal = true;
    this.logger.warn(
      'No SMTP_HOST/SMTP_USER/SMTP_PASS configured — using a throwaway Ethereal test inbox. ' +
        'Emails are not really delivered; each send logs a preview URL instead.',
    );
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const info = await this.transporter.sendMail({
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

    if (this.usingEthereal) {
      this.logger.warn(
        `Password reset email preview: ${nodemailer.getTestMessageUrl(info)}`,
      );
    }
  }
}
