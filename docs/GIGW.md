## Purpose

This project aims to comply with the Government of India's Guidelines for Indian Government Websites (GIGW) 3.0 wherever applicable.

All pages, components, and features should be developed with accessibility, usability, security, and citizen-centric design as the highest priorities.

---

# General Rules

Always:

- Follow GIGW 3.0 recommendations.
- Prefer accessibility over visual effects.
- Keep interfaces simple and intuitive.
- Maintain consistency across all pages.
- Design for all users regardless of device or ability.

---

# Accessibility

Accessibility is mandatory, not optional.

Every page must:

- Use semantic HTML.
- Maintain a logical heading hierarchy (H1–H6).
- Be fully navigable using only the keyboard.
- Include visible keyboard focus indicators.
- Support screen readers.
- Provide descriptive link text.
- Include meaningful alt text for informative images.
- Mark decorative images appropriately.
- Associate labels with all form fields.
- Display clear validation messages.
- Maintain sufficient color contrast.
- Avoid using color alone to convey meaning.

Target compliance:

- WCAG 2.2 Level AA

---

# Responsive Design

The website must function correctly on:

- Desktop
- Laptop
- Tablet
- Mobile devices

Content should never require horizontal scrolling.

---

# Navigation

Navigation should:

- Be consistent across the website.
- Clearly indicate the current page.
- Support keyboard navigation.
- Include breadcrumb navigation where appropriate.
- Provide a sitemap.
- Include a "Skip to Main Content" link.

---

# Content

Content should be:

- Accurate
- Up-to-date
- Easy to understand
- Free from spelling and grammar errors

Avoid unnecessary technical jargon where plain language is sufficient.

---

# Images

Images should:

- Be optimized for web delivery.
- Include descriptive alt text where applicable.
- Not contain essential information that is unavailable as text.
- Scale correctly on different screen sizes.

---

# Documents

Downloadable files should:

- Prefer PDF format unless another format is required.
- Have meaningful filenames.
- Clearly indicate file type and size.
- Be accessible where possible.

Example:

Annual_Report_2025.pdf (2.4 MB)

---

# Forms

Forms must:

- Validate user input.
- Clearly indicate required fields.
- Display understandable error messages.
- Preserve entered values after validation errors.
- Be fully keyboard accessible.

---

# Search

The website search should:

- Be available from every page.
- Return relevant results.
- Handle common spelling variations where practical.
- Display meaningful messages when no results are found.

---

# Performance

Pages should:

- Load quickly.
- Optimize images.
- Minimize JavaScript.
- Avoid unnecessary third-party scripts.
- Reduce unnecessary network requests.

Performance should never compromise accessibility.

---

# Security

Follow secure development practices.

Always:

- Validate all input.
- Sanitize user-generated content.
- Protect against common OWASP vulnerabilities.
- Use HTTPS in production.
- Store secrets securely.
- Never expose sensitive information.

---

# Privacy

Only collect information that is necessary.

Personal information should:

- Be handled securely.
- Be protected from unauthorized access.
- Follow applicable government policies.

---

# Browser Support

Support the latest stable versions of major browsers, including:

- Chrome
- Edge
- Firefox
- Safari

The website should degrade gracefully if a feature is unsupported.

---

# Metadata

Every page should include:

- Unique page title
- Meta description
- Canonical URL
- Open Graph metadata where appropriate

---

# URLs

URLs should:

- Be human-readable.
- Use lowercase letters.
- Use hyphens instead of spaces.
- Avoid unnecessary query parameters.

Example:

/hydroelectric-projects

---

# Error Pages

Provide user-friendly pages for:

- 404 Not Found
- 500 Internal Server Error

Error pages should help users continue navigating the website.

---

# Footer

Every page should include a consistent footer containing:

- Copyright
- Privacy Policy
- Terms & Conditions
- Accessibility Statement
- Copyright Policy
- Hyperlinking Policy
- Website Policies
- Help
- Contact Information
- Last Updated Date

---

# Header

The header should consistently include:

- Government Identity
- JKSPDC Logo
- Main Navigation
- Search
- Accessibility Options (if implemented)

---

# AI Development Rules

AI-generated code must never:

- Ignore accessibility requirements.
- Break semantic HTML structure.
- Introduce inaccessible UI patterns.
- Remove required government information.
- Sacrifice compliance for aesthetics.

When in doubt, prefer the implementation that best aligns with GIGW 3.0 and WCAG 2.2 AA.

---

# Compliance Checklist

Before merging any feature, verify:

- Semantic HTML is used.
- Accessibility requirements are met.
- Responsive behavior is verified.
- Keyboard navigation works.
- Screen reader compatibility is maintained.
- Performance is acceptable.
- Security considerations have been addressed.
- Government branding remains consistent.

---