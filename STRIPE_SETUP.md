# Stripe Payment Setup Guide

## Getting "Could not find requested resource" Error?

This error typically occurs when Stripe environment variables are not properly configured. Follow these steps:

### 1. Create Stripe Account

1. Go to https://stripe.com and create an account
2. Complete account verification if required

### 2. Get API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 3. Setup Webhook (Important!)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/webhooks/stripe` (or `http://localhost:3000/api/webhooks/stripe` for development)
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `charge.succeeded`
5. Copy the **Webhook secret** (starts with `whsec_`)

### 4. Environment Variables

Create a `.env.local` file in your project root with:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Other required variables
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_32_character_auth_secret
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=your_sender_email
SENDER_NAME=your_sender_name
```

### 5. Test the Configuration

1. Restart your development server
2. Visit `/api/payment-config` to check if all keys are detected
3. Try making a test payment

### Common Issues:

- **Wrong key mode**: Make sure you're using test keys (`sk_test_`, `pk_test_`) in development
- **Missing webhook**: Payments might succeed but orders won't be marked as paid without webhooks
- **Invalid currency**: Make sure your Stripe account supports NOK currency
- **Firewall issues**: Webhooks need to reach your server from Stripe's servers

### Testing:

Use these test card numbers in development:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient funds**: 4000 0000 0000 9995

For any other issues, check the browser console and server logs for specific error messages.
