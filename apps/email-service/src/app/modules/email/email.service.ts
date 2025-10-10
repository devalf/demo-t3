import { readFileSync } from 'fs';
import { join } from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as Handlebars from 'handlebars';
import { ApiSendVerificationEmailParams } from '@demo-t3/models';

enum EmailTemplate {
  VERIFICATION = 'verification-email',
}

type TemplateSet = {
  html: HandlebarsTemplateDelegate;
  text: HandlebarsTemplateDelegate;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private templates: Map<EmailTemplate, TemplateSet> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
    this.loadTemplates();
  }

  async sendVerificationEmail(
    params: ApiSendVerificationEmailParams
  ): Promise<void> {
    const { to, name, verificationToken, expirationMinutes } = params;

    const baseUrl = this.configService.get<string>(
      'NX_PUBLIC_EMAIL_VERIFICATION_URL'
    );

    if (!baseUrl) {
      throw new Error(
        'NX_PUBLIC_EMAIL_VERIFICATION_URL environment variable is not configured'
      );
    }

    const verificationUrl = `${baseUrl}?token=${verificationToken}`;

    const templateData = {
      name,
      verificationUrl,
      expirationMinutes,
    };

    const templateSet = this.templates.get(EmailTemplate.VERIFICATION);

    if (!templateSet) {
      throw new Error('Verification email template not loaded');
    }

    const htmlContent = templateSet.html(templateData);
    const textContent = templateSet.text(templateData);

    const fromAddress = this.configService.get<string>(
      'NX_PUBLIC_SMTP_FROM_ADDRESS'
    );
    const fromName = this.configService.get<string>('NX_PUBLIC_SMTP_FROM_NAME');

    if (!fromAddress || !fromName) {
      throw new Error(
        'Email configuration incomplete: NX_PUBLIC_SMTP_FROM_ADDRESS and NX_PUBLIC_SMTP_FROM_NAME are required'
      );
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to,
        subject: 'Verify Your Email - Demo T3',
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(
        `Verification email sent to ${to}. Message ID: ${info.messageId}`
      );
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);

      throw error;
    }
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('NX_PUBLIC_SMTP_HOST');
    const port = this.configService.get<number>('NX_PUBLIC_SMTP_PORT');
    const user = this.configService.get<string>('NX_PUBLIC_SMTP_USER');
    const pass = this.configService.get<string>('NX_PUBLIC_SMTP_PASSWORD');

    if (!host || !port || !user || !pass) {
      throw new Error(
        'SMTP configuration incomplete: NX_PUBLIC_SMTP_HOST, NX_PUBLIC_SMTP_PORT, NX_PUBLIC_SMTP_USER, and NX_PUBLIC_SMTP_PASSWORD are required'
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    this.logger.log(`Email transporter initialized for ${host}:${port}`);
  }

  private loadTemplates() {
    try {
      const templatesPath = join(process.cwd(), 'dist', 'email-templates');

      for (const [key, templateName] of Object.entries(EmailTemplate)) {
        const htmlSource = readFileSync(
          join(templatesPath, `${templateName}.html`),
          'utf-8'
        );
        const textSource = readFileSync(
          join(templatesPath, `${templateName}.txt`),
          'utf-8'
        );

        this.templates.set(EmailTemplate[key as keyof typeof EmailTemplate], {
          html: Handlebars.compile(htmlSource),
          text: Handlebars.compile(textSource),
        });
      }
    } catch (error) {
      this.logger.error(
        'Failed to load email templates. Make sure to run "yarn build:email-templates" first.',
        error
      );

      throw error;
    }
  }
}
