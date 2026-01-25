# Security Policy

## 🔒 Security at BTS Neural Archive

We take the security of the BTS Neural Archive seriously. Although this is primarily a portfolio and educational project, we're committed to addressing any security concerns promptly and responsibly.

## 📋 Supported Versions

Currently, we support the latest version of the project. Security updates will be applied to the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| Latest (main branch) | :white_check_mark: |
| Older commits | :x: |

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability in the BTS Neural Archive, please follow these steps:

### 1. **Do Not** Open a Public Issue

Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.

### 2. Report Privately

Send a detailed report to:

**Email:** 53210833+itsmepraks@users.noreply.github.com

**Subject:** `[SECURITY] BTS Neural Archive - [Brief Description]`

### 3. Include Detailed Information

Please include as much of the following information as possible:

- **Type of vulnerability** (e.g., XSS, dependency vulnerability, etc.)
- **Location of the issue** (file path, line number, or URL)
- **Step-by-step reproduction instructions**
- **Proof of concept or exploit code** (if possible)
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)

### 4. Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 5 business days
- **Fix Timeline:** Depends on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Best effort basis

## 🛡️ Security Best Practices

This project follows these security practices:

### Dependencies
- Regular dependency updates via Dependabot
- Automated security vulnerability scanning
- Minimal dependency footprint

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Automated CI/CD checks

### Frontend Security
- No sensitive data storage in frontend
- Input sanitization where applicable
- Content Security Policy headers (when deployed)
- HTTPS-only in production

## 🔍 Security Considerations

### This is a Frontend-Only Application

Please note:
- This is a **client-side React application**
- No backend server or database
- No user authentication or data storage
- No API keys or secrets in the codebase

### Common Concerns

**XSS Protection:**
- React's built-in XSS protection via JSX
- Careful handling of `dangerouslySetInnerHTML` (avoided where possible)

**Dependency Vulnerabilities:**
- Regular updates via `npm audit`
- Automated PRs from Dependabot

**Build Security:**
- Dependencies locked with `package-lock.json`
- CI/CD pipeline validation

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/security)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)

## 🙏 Recognition

We appreciate security researchers and users who help keep the BTS Neural Archive safe. Contributors who responsibly disclose security issues will be:

- Credited in the CHANGELOG (if desired)
- Thanked in the project README
- Given priority response and updates

## ⚖️ Disclosure Policy

- We follow a **coordinated disclosure** approach
- Security fixes will be released as soon as possible
- Public disclosure will occur after a fix is available
- Credit will be given to the reporter (unless anonymity is requested)

---

**Thank you for helping keep BTS Neural Archive secure!** 💜

*"진정한 용기는 두려워도 맞서는 것 (True courage is facing your fears)" — BTS*

## 📧 Contact

**Project Maintainer:** Prakriti Bista  
**GitHub:** [@itsmepraks](https://github.com/itsmepraks)  
**Website:** [praks.me](https://praks.me)
