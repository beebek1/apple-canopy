const verifyIdentityEmailTemplate = (username: string, password: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Your Account Credentials</title>
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
      .heading { font-size: 22px !important; }
      .logo-img { width: 140px !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#f7f7f8; -webkit-text-size-adjust:none; text-size-adjust:none;">

  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
    style="mso-table-lspace:0pt; mso-table-rspace:0pt; background-color:#f7f7f8;">
    <tbody><tr><td>

      <!-- Top spacer -->
      <table align="center" width="420" border="0" cellpadding="0" cellspacing="0" role="presentation"
        class="container" style="mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0 auto;">
        <tbody><tr><td style="height:40px; line-height:40px; font-size:1px;">&#8202;</td></tr></tbody>
      </table>

      <!-- Card -->
      <table align="center" width="420" border="0" cellpadding="0" cellspacing="0" role="presentation"
        class="container"
        style="mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0 auto; background-color:#ffffff;
          border:1px solid #eeeeee; border-radius:8px; box-shadow:0 2px 8px rgba(20,50,70,0.08);">
        <tbody><tr>
          <td style="padding:44px 36px 48px; text-align:center;">

            <!-- Logo: fixed width, auto height so the wide lockup isn't squeezed into a square box -->
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 28px;">
              <tbody><tr><td style="text-align:center;">
                <img src="https://imageupload.io/f/YvlGk22Y.png" width="180" alt="Apple Canopy"
                  class="logo-img"
                  style="display:block; margin:0 auto; border:0; outline:none; text-decoration:none;
                    width:180px; height:auto; max-width:100%;" />
              </td></tr></tbody>
            </table>

            <h1 class="heading" style="margin:0 0 8px; color:#1a1a1a; font-family:Arial, Helvetica, sans-serif;
              font-size:21px; font-weight:600; line-height:1.3; text-align:center;">
              Hi ${username},
            </h1>

            <p style="margin:0 0 28px; font-family:Arial, Helvetica, sans-serif; font-size:15px;
              color:#5b5b5b; line-height:1.6; text-align:center;">
              We've generated your account credentials below
            </p>

            <!-- Credentials box -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
              style="background-color:#f5f6f7; border:1px solid #e8e9eb; border-radius:8px; margin:0 0 28px;">
              <tbody>
                <tr>
                  <td style="padding:22px 24px 10px; text-align:center;">
                    <p style="margin:0 0 4px; font-family:Arial, Helvetica, sans-serif; font-size:11px;
                      font-weight:bold; letter-spacing:0.06em; color:#11512a; text-transform:uppercase; text-align:center;">
                      Username
                    </p>
                    <p style="margin:0; font-family:'Courier New', monospace; font-size:17px;
                      font-weight:bold; color:#1a1a1a; text-align:center;">
                      ${username}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px 22px; text-align:center; border-top:1px solid #e2e2e2;">
                    <p style="margin:12px 0 4px; font-family:Arial, Helvetica, sans-serif; font-size:11px;
                      font-weight:bold; letter-spacing:0.06em; color:#7a1414; text-transform:uppercase; text-align:center;">
                      Password
                    </p>
                    <p style="margin:0; font-family:'Courier New', monospace; font-size:17px;
                      font-weight:bold; color:#1a1a1a; text-align:center;">
                      ${password}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <p style="margin:0 0 4px; font-family:Arial, Helvetica, sans-serif; font-size:14px;
              color:#5b5b5b; line-height:1.6; text-align:center;">
              Please keep these credentials confidential and avoid sharing them with anyone.
            </p>
            <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:14px;
              color:#8a8a8a; line-height:1.6; text-align:center;">
              If you didn't request this, you can safely ignore this email.
            </p>

          </td>
        </tr></tbody>
      </table>

      <!-- Footer -->
      <table align="center" width="420" border="0" cellpadding="0" cellspacing="0" role="presentation"
        class="container" style="mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0 auto;">
        <tbody><tr><td style="padding:24px 16px 0; text-align:center;">
          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px;
            color:#a3a3a3; line-height:1.6; text-align:center;">
            © ${new Date().getFullYear()} Apple Canopy. All rights reserved.
          </p>
        </td></tr></tbody>
      </table>

      <!-- Bottom spacer -->
      <table align="center" width="420" border="0" cellpadding="0" cellspacing="0" role="presentation"
        class="container" style="mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0 auto;">
        <tbody><tr><td style="height:40px; line-height:40px; font-size:1px;">&#8202;</td></tr></tbody>
      </table>

    </td></tr></tbody>
  </table>

</body>
</html>
`;

export default verifyIdentityEmailTemplate;
