import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // 📩 1️⃣ Gửi mã kích hoạt tài khoản
  async sendActivationCode(email: string, fullName: string, code: string) {
    const mailOptions = {
      from: `"TakeCareMe" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Mã kích hoạt tài khoản TakeCareMe',
      html: `
        <div style="font-family:sans-serif;line-height:1.6;">
          <h2>Xin chào ${fullName},</h2>
          <p>Bạn vừa đăng ký tài khoản TakeCareMe.</p>
          <p>Mã kích hoạt của bạn là:</p>
          <div style="font-size:28px;font-weight:bold;color:#1a73e8;letter-spacing:2px;">
            ${code}
          </div>
          <p>Vui lòng nhập mã này vào ứng dụng trong vòng 15 phút để kích hoạt tài khoản.</p>
          <br/>
          <p>Trân trọng,<br/>Đội ngũ TakeCareMe</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 Đã gửi mã kích hoạt tới ${email}`);
    } catch (error) {
      this.logger.error('❌ Lỗi khi gửi email kích hoạt:', error);
    }
  }

  // 📨 2️⃣ Gửi mail khi kích hoạt thành công
  async sendActivationSuccess(email: string, fullName: string) {
    const mailOptions = {
      from: `"TakeCareMe" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Kích hoạt tài khoản thành công',
      html: `
        <div style="font-family:sans-serif;line-height:1.6;">
          <h2>Xin chào ${fullName},</h2>
          <p>Tài khoản TakeCareMe của bạn đã được kích hoạt thành công 🎉.</p>
          <p>Bây giờ bạn có thể đăng nhập và bắt đầu sử dụng hệ thống.</p>
          <br/>
          <p>Trân trọng,<br/>Đội ngũ TakeCareMe</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 Đã gửi thông báo kích hoạt thành công tới ${email}`);
    } catch (error) {
      this.logger.error('❌ Lỗi khi gửi email xác nhận kích hoạt:', error);
    }
  }
}
