import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to, message) => {
    try {
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to
        });
        
        console.log('SMS sent: ', result.sid);
        return result;
    } catch (error) {
        console.error('Error sending SMS: ', error);
        throw new Error('Failed to send SMS');
    }
}; 