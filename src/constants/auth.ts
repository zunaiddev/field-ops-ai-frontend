export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const SLUG_REGEX = /^[a-z0-9-]+$/
export const PHONE_REGEX = /^\+?[0-9\s\-().]{7,20}$/

export const COMMON_TIMEZONES = [
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT, UTC+10/+11)' },
  { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEST/AEDT, UTC+10/+11)' },
  { value: 'Australia/Brisbane', label: 'Australia/Brisbane (AEST, UTC+10)' },
  { value: 'Australia/Perth', label: 'Australia/Perth (AWST, UTC+8)' },
  { value: 'America/New_York', label: 'America/New_York (Eastern Time, UTC-5/-4)' },
  { value: 'America/Chicago', label: 'America/Chicago (Central Time, UTC-6/-5)' },
  { value: 'America/Denver', label: 'America/Denver (Mountain Time, UTC-7/-6)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time, UTC-8/-7)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST, UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST, UTC+1/+2)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST, UTC+1/+2)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+5:30)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, UTC+9)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT, UTC+12/+13)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
]

export const COMMON_CURRENCIES = [
  { value: 'AUD', label: 'AUD ($) - Australian Dollar' },
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'GBP', label: 'GBP (£) - British Pound' },
  { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
  { value: 'NZD', label: 'NZD ($) - New Zealand Dollar' },
  { value: 'SGD', label: 'SGD ($) - Singapore Dollar' },
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
]
