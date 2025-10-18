import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
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

type EmailMode = 'send' | 'file' | 'both';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private templates: Map<EmailTemplate, TemplateSet> = new Map();
  private readonly emailMode: EmailMode;
  private readonly emailStoragePath: string;

  constructor(private configService: ConfigService) {
    this.emailMode = this.getEmailMode();
    this.emailStoragePath = join(process.cwd(), 'dev', 'non-track', 'mails');

    if (this.emailMode === 'send' || this.emailMode === 'both') {
      this.initializeTransporter();
    }

    if (this.emailMode === 'file' || this.emailMode === 'both') {
      this.initializeFileStorage();
    }

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

    const subject = 'Verify Your Email - Demo T3';

    if (this.emailMode === 'send' || this.emailMode === 'both') {
      if (!fromAddress || !fromName) {
        throw new Error(
          'Email configuration incomplete: NX_PUBLIC_SMTP_FROM_ADDRESS and NX_PUBLIC_SMTP_FROM_NAME are required'
        );
      }

      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      try {
        const info = await this.transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to,
          subject,
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

    if (this.emailMode === 'file' || this.emailMode === 'both') {
      await this.saveEmailToFile({
        to,
        subject,
        htmlContent,
        textContent,
        templateName: EmailTemplate.VERIFICATION,
      });
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
          html: Handlebars.compile(htmlSource, { noEscape: true }),
          text: Handlebars.compile(textSource, { noEscape: true }),
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

  private getEmailMode(): EmailMode {
    const mode = this.configService.get<string>('NX_PUBLIC_EMAIL_MODE');

    if (!mode) {
      return 'send';
    }

    if (mode !== 'send' && mode !== 'file' && mode !== 'both') {
      this.logger.warn(
        `Invalid EMAIL_MODE "${mode}", defaulting to "send" mode. Valid values are: send, file, both`
      );

      return 'send';
    }

    this.logger.log(`Email mode set to: ${mode}`);
    return mode as EmailMode;
  }

  private initializeFileStorage() {
    if (!existsSync(this.emailStoragePath)) {
      mkdirSync(this.emailStoragePath, { recursive: true });
      this.logger.log(
        `Created email storage directory: ${this.emailStoragePath}`
      );
    } else {
      this.logger.log(
        `Email storage directory ready: ${this.emailStoragePath}`
      );
    }
  }

  private async saveEmailToFile(params: {
    to: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    templateName: string;
  }): Promise<void> {
    const { to, subject, htmlContent, textContent, templateName } = params;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedRecipient = to.replace(/[^a-zA-Z0-9@.-]/g, '_');
      const baseFilename = `${timestamp}_${sanitizedRecipient}_${templateName}`;

      const htmlPath = join(this.emailStoragePath, `${baseFilename}.html`);
      const htmlWithMetadata = `<!--
        To: ${to}
        Subject: ${subject}
        Template: ${templateName}
        Timestamp: ${new Date().toISOString()}
        -->
        
        ${htmlContent}`;

      writeFileSync(htmlPath, htmlWithMetadata, 'utf-8');

      const txtPath = join(this.emailStoragePath, `${baseFilename}.txt`);
      const txtWithMetadata = `To: ${to}
        Subject: ${subject}
        Template: ${templateName}
        Timestamp: ${new Date().toISOString()}
        ${'='.repeat(70)}
        
        ${textContent}`;

      writeFileSync(txtPath, txtWithMetadata, 'utf-8');

      this.logger.log(
        `Email saved to files: ${baseFilename}.html and ${baseFilename}.txt`
      );
    } catch (error) {
      this.logger.error(`Failed to save email to file for ${to}`, error);

      throw error;
    }
  }
}
