import nodemailer from "nodemailer";
import { BRAND } from "./constants";

const transporter = nodemailer.createTransport({
    // Generic configuration; user should provide these in .env
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const MailService = {
    async sendBookingConfirmation(to: string, userName: string, courseTitle: string) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Email service not configured. Check EMAIL_USER and EMAIL_PASS environment variables.");
            return;
        }

        const mailOptions = {
            from: `"${BRAND.name}" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Booking Confirmed: ${courseTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #00e5ff;">Welcome to ${BRAND.name}, ${userName}!</h2>
                    <p>Your booking for <strong>${courseTitle}</strong> has been successfully confirmed.</p>
                    <p>We are excited to have you join our community and begin your leadership journey with <strong>Mridu Bhandari</strong>.</p>
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Course:</strong> ${courseTitle}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Status:</strong> Enrolled</p>
                    </div>
                    <p>You can now access your course from the <a href="${BRAND.mainUrl}/dashboard" style="color: #6366f1;">Dashboard</a>.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">This is an automated email from ${BRAND.name}. Please do not reply to this email.</p>
                </div>
            `,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully:", info.messageId);
            return info;
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    },

    async sendAdminInterestNotification(adminEmail: string, userDetails: any, courseTitle: string) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Email service not configured. Check EMAIL_USER and EMAIL_PASS environment variables.");
            return;
        }

        const mailOptions = {
            from: `"${BRAND.name}" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `New Interest: ${courseTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #6366f1;">New Course Interest Tagged!</h2>
                    <p>A user has shown interest in <strong>${courseTitle}</strong> and filled out the enrollment form.</p>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">
                        <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">User Details:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Name:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b;">${userDetails.fullName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b;">${userDetails.email}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b;">${userDetails.phone}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;"><strong>Company:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b;">${userDetails.company}</td>
                            </tr>
                            ${userDetails.linkedin ? `
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;"><strong>LinkedIn:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b;"><a href="${userDetails.linkedin}" style="color: #00e5ff;">View Profile</a></td>
                            </tr>` : ''}
                        </table>
                    </div>
                    
                    <p style="color: #ef4444; font-weight: bold;">Action Required: Check if the payment was successful through the Razorpay Dashboard.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">MentorLeap Automated Notification System</p>
                </div>
            `,
        };

        try {
            return await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Error sending admin notification:", error);
            throw error;
        }
    }
};

