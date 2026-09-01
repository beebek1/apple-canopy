const donationReceiptTemplate = (donorName: string, amount: number) => {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Your Donation Receipt</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: inherit !important; }
    #MessageViewBody a { color: inherit; text-decoration: none; }
    p { line-height: inherit; }

    @media (max-width: 480px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .heading { font-size: 24px !important; }
      .amount { font-size: 32px !important; }
      .logo-img { width: 140px !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#f7f7f8; -webkit-text-size-adjust:none; text-size-adjust:none;">

  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
    style="mso-table-lspace:0pt; mso-table-rspace:0pt; background-color:#f7f7f8;">
    <tbody><tr><td>

      <!-- Top spacer -->
      <table align="center" width="460" border="0" cellpadding="0" cellspacing="0" role="presentation"
        class="container" style="mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0 auto;">
        <tbody><tr><td style="height:40px; line-height:40px; font-size:1px;">&#8202;</td></tr></tbody>
      </table>

      <!-- Header band -->
      <table align="center" width="460" border="0" cellpadding="0" cellspacing="0" role="presentation"
        class="container" style="mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0 auto;
          background-color:#11512a; border-radius:10px 10px 0 0;">
        <tbody><tr>
          <td style="padding:36px 36px 30px; text-align:center;">
            <img src="https://imageupload.io/f/YvlGk22Y.png" width="150" alt="Apple Canopy"
              class="logo-img"
              style="display:block; margin:0 auto 18px; border:0; outline:none; text-decoration:none;
                width:150px; height:auto; max-width:100%;" />
            <p style="margin:0; font-family:Georgia, 'Times New Roman', serif; font-size:13px;
              letter-spacing:0.06em; color:#B9C7B4; text-transform:uppercase;">
              Donation Receipt
            </p>
          </td>
        </tr></tbody>
      </table>

      <!-- Card -->
      <table align="center" width="460" border="0" cellpadding="0" cellspacing="0" role="presentation"
        class="container"
        style="mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0 auto; background-color:#ffffff;
          border:1px solid #eeeeee; border-top:none; border-radius:0 0 10px 10px;
          box-shadow:0 2px 10px rgba(20,50,70,0.06);">
        <tbody><tr>
          <td style="padding:40px 40px 36px; text-align:center;">

            <h1 class="heading" style="margin:0 0 10px; color:#1a1a1a; font-family:Georgia, 'Times New Roman', serif;
              font-size:26px; font-weight:600; line-height:1.3; text-align:center;">
              Thank you, ${donorName}.
            </h1>

            <p style="margin:0 0 32px; font-family:Arial, Helvetica, sans-serif; font-size:15px;
              color:#5b5b5b; line-height:1.6; text-align:center;">
              Your generosity helps us plant new trees, tend the soil, and grow
              orchards for people who haven't arrived yet.
            </p>

            <!-- Amount block -->
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"
              style="margin:0 0 28px; background-color:#f7f9f6; border-radius:8px;">
              <tbody><tr>
                <td style="padding:26px 24px; text-align:center;">
                  <p style="margin:0 0 6px; font-family:Arial, Helvetica, sans-serif; font-size:12px;
                    letter-spacing:0.04em; color:#8a8a8a; text-transform:uppercase;">
                    Amount donated
                  </p>
                  <p class="amount" style="margin:0; font-family:Georgia, 'Times New Roman', serif;
                    font-size:38px; font-weight:600; color:#11512a; line-height:1.2;">
                    ${formattedAmount}
                  </p>
                </td>
              </tr></tbody>
            </table>

            <!-- Detail rows -->
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"
              style="border-top:1px solid #ececec;">
              <tbody>
                <tr>
                  <td style="padding:16px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:13px;
                    color:#8a8a8a; text-align:left;">Date</td>
                  <td style="padding:16px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:13px;
                    color:#1a1a1a; text-align:right; font-weight:600;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:13px;
                    color:#8a8a8a; text-align:left;">Donor</td>
                  <td style="padding:10px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:13px;
                    color:#1a1a1a; text-align:right; font-weight:600;">${donorName}</td>
                </tr>
              </tbody>
            </table>

            <p style="margin:28px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:13px;
              color:#8a8a8a; line-height:1.6; text-align:center;">
              Please keep this email as your receipt for tax purposes.
            </p>

          </td>
        </tr></tbody>
      </table>

      <!-- Footer -->
      <table align="center" width="460" border="0" cellpadding="0" cellspacing="0" role="presentation"
        class="container" style="mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0 auto;">
        <tbody><tr><td style="padding:24px 16px 0; text-align:center;">
          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px;
            color:#a3a3a3; line-height:1.6; text-align:center;">
            © ${new Date().getFullYear()} Apple Canopy. All rights reserved.
          </p>
        </td></tr></tbody>
      </table>

      <!-- Bottom spacer -->
      <table align="center" width="460" border="0" cellpadding="0" cellspacing="0" role="presentation"
        class="container" style="mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0 auto;">
        <tbody><tr><td style="height:40px; line-height:40px; font-size:1px;">&#8202;</td></tr></tbody>
      </table>

    </td></tr></tbody>
  </table>

</body>
</html>
`;
};

export default donationReceiptTemplate;
