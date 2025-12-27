import { sendEmail } from './src/services/email.service.js';

async function testSendEmail() {
  try {
    await sendEmail({
      to: 'nagarzb1992@gmail.com', // Replace with your email
      subject: 'Test Email from leads-ai-backend',
      html: '<h1>This is a test email</h1><p>If you see this, sendEmail works!</p>'
    });
    console.log('✅ Test email sent successfully');
  } catch (err) {
    console.error('❌ Failed to send test email:', err);
  }
}

testSendEmail();
