---
title: Add SSL to your Reverse Proxy
date: 2015-11-10T18:33:00Z
author: smdion
---

This is part of setting up Apache on Docker.  Please look at the [overview page](/blog/2015-11-10-overview-reverse-proxy-with-docker/) for additional info on this process.

## Create SSL Certificate through StartSSL

#### Register for an Account

1. Register for an account – [https://www.startssl.com/?app=11&action=regform](https://www.startssl.com/?app=11&amp;action=regform)
2. Check e-mail for verification code, type in.
3. Generate Private Key

1. This step isn’t for your website.  This is a special key that allows you and only you to access StartSSL’s “authenticate” page which is your Control Panel for the website.
2. BACKUP THESE CERTIFICATES – [https://www.startssl.com/?app=25#4](https://www.startssl.com/?app=25#4)

4. Click “Install”
5. Click “Finish”

#### Validate Ownership of Domain Name

1. We need to validate that we own the Domain Name we want to make an SSL Cert for.
2. From the control panel, click the “Validations Wizard” tab, and select “Domain Name Validation” from the dropdown.
3. Type in your Domain Name
4. Choose an e-mail address where you can receive the validation e-mail (this would have been the -mail you typed in when registering the Domain)
5. Type in the verification code from your e-mail
6. Click Finish

#### Generate Files

1. Click the Certificates Wizard.
2. From the Certificate Target menu, choose Web Server SSL/TLS Certificate, and then click Continue.
3. To avoid having to use terminal commands, I recommend choosing a password at this step. Enter the Key Password and type the same password in Confirm Password. Leave the Keysize at 2048 (Medium). Click Continue. (If you know how to create a certificate signing request or CSR, you can follow the alternate path by clicking skip and entering the CSR in the next field.)
4. The Save Private Key page shows a generated, encrypted private key that’s part of what a server needs to manage TLS connections. Copy and paste the contents into a text file. You need to protect your private key as if your security depends on it—it does! Click Continue.
5. Select the validated domain from the Domain pop-up menu that you want to generate a certificate for, and click Continue.
6. Enter a subdomain or host name, such as “secure” or even “www” to use to associate the certificate with a specific fully qualified domain name. Click Continue.
7. The next step creates a certificate request, which can be useful if you need to regenerate the certificate later, but you can typically ignore, and click Continue.
8. Finally, the certificate is generated, which you can copy out of the Save Certificate screen, and save in a file such as ssl.crt.
9. Click Finish.
10. Down the intermediate file. You download this file as a bundle from the Tool Box tab, clicking SmartCom CA Certificates, and then right-clicking the Class 1 Intermediate Server CA to save it as a standalone file. (StartCom is a valid CA, but this intermediate certificate assures that all clients will correctly validate its status.)

## Recap

Now you have three files you will need to set up TLS on a server.

- The private key file, which is encrypted by default and should be protected at all costs from anyone gaining access to it. (Set permissions in whatever way is available to read-only by the owner, and no access to any other system user; chmod 0400 under Unix, for instance.)
- The certificate file, which contains the public key and other data and is fed out to clients to initiate a secure session.
- The intermediate file, which links the CA used by StartCom to generate this certificate to a higher-level CA that works with all browsers and operating systems.

I would also decrypt the cert.key so that it isn’t necessary to type in your password everytime you restart Apache (not possible in a docker)

Run this command:

    openssl rsa -in cert.key -out decrypted.cert.key
    

#### unRAID Instructions:

Now you have 3 files that will be needed in the configuration files of Apache or Nginx.  I have defined where each file is used below.

- Decrypted SSL File

- Apache – SSLCertificateFile

- Certificate File

- Apache – SSLCertificate

- Intermediate file

- Apache – SSLChainFile

Place in the certs `/config/keys` folder of the Apache docker.
