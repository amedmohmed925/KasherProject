# Subscription Management Endpoints

## 1. Approve/Reject Subscription

### Endpoint
`POST /api/superAdmin/subscriptions/approve`

### Description
Allows the Super Admin to approve or reject a subscription request. If rejected, an email and a rejection message are sent to the tenant's admin.

### Request Body
```json
{
  "subscriptionId": "<subscription_id>",
  "status": "approved | rejected",
  "rejectionReason": "<reason_for_rejection>" // Required if status is 'rejected'
}
```

### Response
#### Success
```json
{
  "message": "Subscription <status> successfully"
}
```

#### Errors
- `400`: Invalid status or missing rejection reason.
- `403`: Forbidden, only accessible by Super Admin.
- `404`: Subscription or tenant not found.
- `500`: Server error.

### Notes
- Sends an email to the admin of the tenant if the subscription is rejected.
- Sends a rejection message using the integrated messaging system.

---

## 2. List All Subscriptions

### Endpoint
`GET /api/superAdmin/subscriptions`

### Description
Fetches all subscriptions with tenant and admin information.

### Response
#### Success
```json
[
  {
    "subscription": { ... },
    "tenant": { ... },
    "admin": {
      "name": "<admin_name>",
      "email": "<admin_email>",
      "phone": "<admin_phone>"
    }
  }
]
```

#### Errors
- `500`: Server error.

---

## 3. Approve/Reject Subscription

### Endpoint
`POST /api/superAdmin/subscriptions/approve`

### Description
Allows the Super Admin to approve or reject a subscription request. If rejected, an email and a rejection message are sent to the tenant's admin and the responsible admin.

### Request Body
```json
{
  "subscriptionId": "<subscription_id>",
  "status": "approved | rejected",
  "rejectionReason": "<reason_for_rejection>" // Required if status is 'rejected'
}
```

### Response
#### Success
```json
{
  "message": "Subscription <status> successfully"
}
```

#### Errors
- `400`: Invalid status or missing rejection reason.
- `403`: Forbidden, only accessible by Super Admin.
- `404`: Subscription or tenant not found.
- `500`: Server error.

### Notes
- Sends an email to the admin of the tenant if the subscription is rejected.
- Sends a rejection message to the responsible admin.

---

## 4. List All Subscriptions

### Endpoint
`GET /api/superAdmin/subscriptions`

### Description
Fetches all subscriptions with tenant and admin information.

### Response
#### Success
```json
[
  {
    "subscription": {
      "id": "<subscription_id>",
      "plan": "<plan_name>",
      "price": "<price>",
      "startDate": "<start_date>",
      "endDate": "<end_date>",
      "status": "<status>",
      "paymentConfirmed": true | false,
      "receiptImage": "<receipt_url>",
      "paidAmountText": "<amount_text>",
      "duration": "<duration>",
      "customNotes": "<notes>",
      "receiptFileName": "<file_name>",
      "createdAt": "<creation_date>"
    },
    "tenant": {
      "id": "<tenant_id>",
      "name": "<tenant_name>",
      "email": "<tenant_email>"
    },
    "admin": {
      "id": "<admin_id>",
      "name": "<admin_name>",
      "email": "<admin_email>",
      "phone": "<admin_phone>",
      "companyName": "<company_name>",
      "companyAddress": "<company_address>"
    }
  }
]
```

#### Errors
- `500`: Server error.

### Notes
- Includes tenant and admin details for each subscription.

---

## Utilities
- **Email Notifications**: Sends email notifications for subscription rejections.
- **Messaging System**: Sends rejection messages to the tenant's admin.
