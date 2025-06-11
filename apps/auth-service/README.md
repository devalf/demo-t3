

### Token verification
This endpoint is intended for one-time token verification and should not be used for repeated or continuous validation.
For a robust architecture, an `in-memory` solution should be implemented to store and manage already verified tokens efficiently.

In the context of this demo project, such functionality will be provided via a shared Redis instance.

