import { Inject, Injectable, Logger } from '@nestjs/common';
import handlebars from 'handlebars';
import { readFile } from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTransport, Transporter } from 'nodemailer';
import type { Address } from 'nodemailer/lib/mailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import type { MailerOptions } from './mailer.interfaces';

const __dirname = dirname(fileURLToPath(import.meta.url));

@Injectable()
export class MailerService {
  readonly logger = new Logger(MailerService.name);
  private readonly transporter: Transporter;

  constructor(
    @Inject('MAILER_OPTIONS') private readonly options: MailerOptions,
  ) {
    this.transporter = createTransport(this.transport);
  }

  get from(): Address {
    return {
      name: this.options.fromName ?? this.options.fromAddress,
      address: this.options.fromAddress,
    };
  }
  get transport(): SMTPTransport['options'] {
    const baseOptions = {
      from: {
        name: this.options.fromName ?? this.options.fromAddress,
        address: this.options.fromAddress,
      },
      debug: true,
      tls: {
        rejectUnauthorized: false,
      },
    } satisfies SMTPTransport['options'];

    if ('url' in this.options) {
      return {
        ...baseOptions,
        url: this.options.url,
      };
    }
    return {
      ...baseOptions,
      host: this.options.host,
      port: this.options.port,
      secure: this.options.secure,
      ...(this.options.user && this.options.password
        ? {
            auth: {
              user: this.options.user,
              pass: this.options.password,
            },
          }
        : {}),
    } satisfies SMTPTransport['options'];
  }

  async sendMail(
    to: string | string[],
    subject: string,
    html: string,
  ): Promise<void> {
    const response = await this.transporter.sendMail({
      to,
      subject,
      html,
      from: this.from,
    });
    this.logger.debug(response);
  }

  async renderTemplate(
    template: `${string}.hbs`,
    context: Record<string, unknown>,
  ): Promise<string> {
    const templatePath = path.join(__dirname, '..', 'templates', template);
    const templateContent = await readFile(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(templateContent);
    return compiledTemplate(context);
  }
}
