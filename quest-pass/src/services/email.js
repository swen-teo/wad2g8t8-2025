const EMAILJS_API_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

function normalizePoints(points) {
  const numeric = Number(points);
  if (Number.isFinite(numeric)) {
    return numeric;
  }
  return '';
}

/**
 * Sends a reward unlock email using EmailJS' REST API.
 *
 * @param {Object} options
 * @param {string} options.toEmail - Recipient email address
 * @param {string} [options.toName] - Recipient name
 * @param {number|string} [options.pointsEarned] - Points earned for the event
 * @param {string} [options.eventName] - Name of the event
 * @param {string} [options.rewardCode] - Unlocked reward code
 * @param {string} [options.appName='Quest Pass'] - Application name shown in the email
 * @returns {Promise<{success: boolean, error?: Error, skipped?: boolean}>}
 */
export async function sendRewardUnlockEmail({
  toEmail,
  toName = '',
  pointsEarned = '',
  eventName = '',
  rewardCode = '',
  appName = 'Quest Pass',
} = {}) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS environment variables are not fully configured.');
    return { success: false, skipped: true };
  }

  if (!toEmail) {
    console.warn('sendRewardUnlockEmail called without a recipient email address.');
    return { success: false, skipped: true };
  }

  const payload = {
    service_id: SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id: PUBLIC_KEY,
    template_params: {
      to_email: toEmail,
      to_name: toName,
      points_earned: normalizePoints(pointsEarned),
      event_name: eventName,
      reward_code: rewardCode,
      app_name: appName,
    },
  };

  try {
    const response = await fetch(EMAILJS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`EmailJS request failed: ${response.status} ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send reward unlock email:', error);
    return { success: false, error };
  }
}

export default {
  sendRewardUnlockEmail,
};
