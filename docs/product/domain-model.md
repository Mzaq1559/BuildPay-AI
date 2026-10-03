# Domain Model

- **Project**: The root entity representing a construction project.
- **BOQ / BOQItem**: Bill of Quantities, the contract baseline.
- **Check Request**: Contractor's submission for completed work.
- **Evidence**: Documents/images supporting a check request.
- **Measurement**: Quantified work completed.
- **Variation**: Change in scope or cost.
- **IPC (Interim Payment Certificate)**: The financial payment application.
- **Approval**: Sign-off action on entities (CRs, Variations, IPCs).
- **AuditEvent**: Immutable log of system events.
- **AIReview / AIFinding**: AI analysis results.
