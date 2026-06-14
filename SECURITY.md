# Security Policy

Cloud Practitioner Prep is a static, client-side site. It has no backend, no
database, no server-side code, no accounts, and no authentication. All study
progress is stored in the visitor's own browser through local storage and never
leaves their device. The site collects nothing and transmits nothing.

Because of this, the usual classes of server-side vulnerability do not apply.
The areas that are still worth reporting are things like a cross-site scripting
issue in how content renders, an insecure outbound link, or a dependency with a
known advisory that affects the built site.

## Reporting a vulnerability

Please do not open a public issue for a security report.

Report it privately through GitHub's "Report a vulnerability" feature on the
repository's Security tab, which opens a private advisory. If that is not
available to you, contact the maintainer directly through the email on their
GitHub profile.

Include what you found, how to reproduce it, and the impact you see. You can
expect an acknowledgement within a few days. Confirmed issues will be fixed and
disclosed once a fix is available.

## Supported versions

This is a single, continuously deployed site. Fixes land on the main branch and
are deployed from there. There are no separately maintained release branches.
