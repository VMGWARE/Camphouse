# Security Policy for Camphouse Repository

## Reporting a Vulnerability

### Reporting a Security Issue

If you discover a security vulnerability within Camphouse, please send an email to the maintainers of the repository at developers@vmgware.dev. All security vulnerabilities will be promptly addressed.

Please **DO NOT** create public GitHub issues for security vulnerabilities. Use email communication instead to ensure the vulnerability isn't exposed to malicious actors.

### How We Handle Vulnerabilities

1. **Acknowledgment**: Upon receiving the vulnerability report, the team will acknowledge receipt of the vulnerability and will send you an estimated timeline for a fix.

2. **Validation**: The team will work to validate the reported vulnerability. If it is valid, the severity of the vulnerability will be determined.

3. **Addressing the Vulnerability**: If the vulnerability is confirmed, the team will work on a fix, test it, and subsequently roll out the updates to the repository and any affected deployments.

4. **Disclosure**: After the vulnerability has been fixed, the details of the vulnerability and the remediation steps will be disclosed on the repository's `SECURITY.md` or relevant channels.

5. **Recognition**: We appreciate the responsible disclosure of vulnerabilities and will give credit to users who responsibly report vulnerabilities to us.

## Best Practices

- Ensure you pull the latest changes from the `main` or default branch regularly to incorporate the latest security patches.
- Ensure your MongoDB and other dependencies are secure and properly configured to resist attacks.
- Protect your `.env` file and never expose secrets or credentials in the code, commit logs, or public spaces.
- Use strong, unique passwords for your MongoDB instance and regularly rotate them.
- Enable and enforce Multi-Factor Authentication (MFA) wherever possible.
- If using Docker, follow the principle of least privilege and don't run containers as root unless necessary.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| < 1.0   | :x:                |

Only the latest major version is actively supported with security updates. If you are using an older version, please consider updating to the latest version.

## External Links

For general details about best security practices in Node.js, MongoDB, and Vue.js, please consult:

- [Node.js Security](https://nodejs.org/en/security/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [Vue.js Security](https://vuejs.org/v2/guide/security.html)

---

This security policy is a living document and can be updated to reflect the latest best practices and lessons learned from vulnerability reports. We are committed to ensuring the security of Camphouse and its community. If you have suggestions to improve this security policy, please open an issue in the repository.
