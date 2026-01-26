
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
    /**
     * Send a welcome email to a new user
     * Includes Trustpilot BCC for AFS integration
     * @param {string} email - Recipient email
     * @param {string} name - Recipient name
     */
    async sendWelcomeEmail(email, name) {
        if (!process.env.RESEND_API_KEY) {
            console.warn('⚠️ RESEND_API_KEY is missing. Email skipped.');
            return;
        }

        try {
            const { data, error } = await resend.emails.send({
                from: 'NEXUS <onboarding@resend.dev>', // Update this if you have a custom domain on Resend
                to: [email],
                bcc: ['nexus-morocco.com+d6bcdf65bf@invite.trustpilot.com'], // Trustpilot AFS
                subject: 'Bienvenue sur NEXUS ! 🚀',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Bienvenue, ${name} !</h1>
            <p>Nous sommes ravis de vous compter parmi nous.</p>
            <p>NEXUS est votre compagnon pour réussir votre orientation et vos études.</p>
            <br>
            <p>À très vite sur la plateforme,</p>
            <p><strong>L'équipe NEXUS</strong></p>
          </div>
        `,
            });

            if (error) {
                console.error('Email sending failed:', error);
                return { success: false, error };
            }

            console.log('✅ Welcome email sent to:', email);
            return { success: true, data };
        } catch (err) {
            console.error('Unexpected error sending email:', err);
            return { success: false, error: err };
        }
    }
};
