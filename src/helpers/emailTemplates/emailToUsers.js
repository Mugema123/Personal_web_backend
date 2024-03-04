export default function emailUsersTemp({ body, name }) {
  return `
            <!doctype html>
            <html lang="en" 
                xmlns="http://www.w3.org/1999/xhtml" 
                xmlns:v="urn:schemas-microsoft-com:vml" 
                xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="x-apple-disable-message-reformatting">
                
                <title>MUGEMA</title>
                
                <!--[if gte mso 9]>
                <xml>
                <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
                
            </head>
            <body style="margin:0; padding:0; background:#eeeeee;">
                
            
                <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
                    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
                </div>
                
                <center>
                
                <div style="width:80%; background:#ffffff; padding:30px 20px; text-align:left; font-family: 'Arial', sans-serif;">
                
                <!--[if mso]>
                <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#ffffff">
                <tr>
                <td align="left" valign="top" style="font-family: 'Arial', sans-serif; padding:20px;">
                <![endif]--> 
                
                <h1 style="font-size:16px; line-height:22px; font-weight:normal; color:#333333;">
                    Hello ${name},
                </h1>
                
                <p style="font-size:14px; line-height:24px; color:#666666; margin-bottom:30px;">
                    ${body}
                </p>
                
                
                
                <hr style="border:none; height:1px; color:#dddddd; background:#dddddd; width:100%; margin-bottom:20px;">
                
                <p style="font-size:12px; line-height:18px; color:#999999; margin-bottom:10px; text-align: center;">
                    &copy; Copyright
                    <a href="https://MUGEMA.rw" 
                    style="font-size:12px; line-height:18px; color:#3aaf47; text-decoration: none; font-weight:bold;">
                    MUGEMA ${new Date().getFullYear()}</a>, All Rights Reserved.
                </p>
                
                <!--[if mso | IE]>
                </td>
                </tr>
                </table>
                <![endif]-->
                
                </div>
                
                </center>
                
            </body>
            </html>                                             
            `;
}
