"""
Realistic seed data for BuildPay AI demo environment.
Creates 3 projects with full BOQ, CRs, measurements, variations, IPCs, AI findings, audit events.
"""
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select
from app.core.db import engine, create_db_and_tables
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.project import Project, ProjectStatus
from app.models.boq import BOQ, BOQItem, BOQSection
from app.models.check_request import CheckRequest, CheckRequestStatus
from app.models.document import Document, DocumentEntityType, DocumentStatus
from app.models.measurement import Measurement, MeasurementStatus
from app.models.variation import Variation, VariationStatus
from app.models.ipc import IPC, IPCLine, IPCStatus
from app.models.ai_review import AIReview, AIFinding, AIFindingSeverity
from app.models.audit import AuditEvent, AuditEventType
from app.models.notification import Notification, NotificationType


def seed_all():
    create_db_and_tables()
    with Session(engine) as session:
        # Check if already seeded
        existing = session.exec(select(User)).first()
        if existing:
            print("Database already seeded. Skipping.")
            return

        print("Seeding BuildPay AI demo data...")
        users = _create_users(session)
        projects = _create_projects(session, users)
        boqs = _create_boqs(session, projects, users)
        crs = _create_check_requests(session, projects, boqs, users)
        _create_measurements(session, projects, boqs, crs, users)
        variations = _create_variations(session, projects, boqs, users)
        _create_ipcs(session, projects, boqs, crs, users)
        _create_ai_reviews(session, crs, variations)
        _create_notifications(session, users, crs, variations)
        print("Seeding complete!")


def _create_users(session: Session) -> dict:
    now = datetime.now(timezone.utc)
    users_data = [
        {"email": "admin@buildpay.ai", "full_name": "System Admin", "role": UserRole.ADMIN, "org": "BuildPay AI"},
        {"email": "ahmed.contractor@dha.pk", "full_name": "Ahmed Raza", "role": UserRole.CONTRACTOR, "org": "Raza Construction Co."},
        {"email": "sara.consultant@nec.pk", "full_name": "Sara Khan", "role": UserRole.CONSULTANT, "org": "NEC Engineers"},
        {"email": "bilal.qs@quansurveys.pk", "full_name": "Bilal Malik", "role": UserRole.QUANTITY_SURVEYOR, "org": "Quantity Surveys Ltd."},
        {"email": "client.dha@dha.pk", "full_name": "Col. (R) Tariq Mehmood", "role": UserRole.CLIENT, "org": "DHA Lahore"},
        {"email": "pm.bahria@bahria.pk", "full_name": "Hira Yousaf", "role": UserRole.PROJECT_MANAGER, "org": "Bahria Town"},
        {"email": "contractor2@gulberg.pk", "full_name": "Usman Farooq", "role": UserRole.CONTRACTOR, "org": "Farooq Builders"},
    ]
    result = {}
    for ud in users_data:
        u = User(
            email=ud["email"],
            full_name=ud["full_name"],
            hashed_password=get_password_hash("BuildPay2024!"),
            role=ud["role"],
            organization=ud["org"],
            is_active=True,
            is_verified=True,
            created_at=now,
            updated_at=now,
        )
        session.add(u)
    session.commit()
    all_users = session.exec(select(User)).all()
    for u in all_users:
        result[u.email] = u
    return result


def _create_projects(session: Session, users: dict) -> list:
    now = datetime.now(timezone.utc)
    projects_data = [
        {
            "project_number": "DHA-P8-2024-001",
            "name": "DHA Phase 8 — Residential Block C",
            "description": "Double storey residential construction on 10 Marla plot. Civil works including grey structure and finishing.",
            "location": "DHA Phase 8, Sector C, Lahore",
            "client_name": "DHA Lahore",
            "contractor_name": "Raza Construction Co.",
            "consultant_name": "NEC Engineers",
            "status": ProjectStatus.ACTIVE,
            "contract_value": 18500000.0,
            "currency": "PKR",
            "retention_rate": 0.10,
            "boq_type": "10_marla",
            "start_date": datetime(2024, 3, 1, tzinfo=timezone.utc),
            "end_date": datetime(2025, 6, 30, tzinfo=timezone.utc),
            "created_by": users["admin@buildpay.ai"].id,
        },
        {
            "project_number": "BT-GC-2024-002",
            "name": "Bahria Town Golf City — Block A",
            "description": "1 Kanal double storey luxury residence. Complete civil works including premium finishing.",
            "location": "Golf City, Bahria Town, Rawalpindi",
            "client_name": "Bahria Town Private Ltd.",
            "contractor_name": "Raza Construction Co.",
            "consultant_name": "NEC Engineers",
            "status": ProjectStatus.ACTIVE,
            "contract_value": 42000000.0,
            "currency": "PKR",
            "retention_rate": 0.10,
            "boq_type": "1_kanal",
            "start_date": datetime(2024, 1, 15, tzinfo=timezone.utc),
            "end_date": datetime(2025, 12, 31, tzinfo=timezone.utc),
            "created_by": users["admin@buildpay.ai"].id,
        },
        {
            "project_number": "GR-V2-2024-003",
            "name": "Gulberg Residencia — Phase 2 Villas",
            "description": "5 Marla double storey residential unit. Civil and grey structure works.",
            "location": "Phase 2, Gulberg Residencia, Islamabad",
            "client_name": "Gulberg Residencia Developers",
            "contractor_name": "Farooq Builders",
            "consultant_name": "NEC Engineers",
            "status": ProjectStatus.ACTIVE,
            "contract_value": 9800000.0,
            "currency": "PKR",
            "retention_rate": 0.10,
            "boq_type": "5_marla",
            "start_date": datetime(2024, 6, 1, tzinfo=timezone.utc),
            "end_date": datetime(2025, 3, 31, tzinfo=timezone.utc),
            "created_by": users["admin@buildpay.ai"].id,
        },
    ]
    projects = []
    for pd in projects_data:
        p = Project(**pd)
        session.add(p)
        projects.append(p)
    session.commit()
    for p in projects:
        session.refresh(p)
    return projects


def _create_boqs(session: Session, projects: list, users: dict) -> list:
    from app.services.boq_service import import_boq_template
    boqs = []
    boq_types = ["10_marla", "1_kanal", "5_marla"]
    admin = users["admin@buildpay.ai"]
    for project, boq_type in zip(projects, boq_types):
        boq = import_boq_template(session, project.id, boq_type, admin.id)
        boqs.append(boq)
    return boqs


def _create_check_requests(session: Session, projects: list, boqs: list, users: dict) -> list:
    from sqlmodel import select
    contractor = users["ahmed.contractor@dha.pk"]
    consultant = users["sara.consultant@nec.pk"]
    client = users["client.dha@dha.pk"]
    contractor2 = users["contractor2@gulberg.pk"]
    now = datetime.now(timezone.utc)
    crs = []

    # Project 1 (DHA 10 Marla) — various CRs at different stages
    boq1_items = session.exec(select(BOQItem).where(BOQItem.boq_id == boqs[0].id)).all()
    item_map_1 = {i.item_code: i for i in boq1_items}

    cr_data_p1 = [
        {
            "cr_number": "CR-001-0001",
            "boq_item": "MOB-01",
            "description": "Mobilization and site establishment for DHA Phase 8 Block C residential project. Setting out of boundaries and installation of site office.",
            "requested_quantity": 1.0,
            "status": CheckRequestStatus.APPROVED,
            "submitted_by": contractor,
            "approved_by": client,
            "days_ago_submitted": 45,
            "days_ago_decided": 40,
            "decision_notes": "Approved. Site establishment verified on inspection.",
        },
        {
            "cr_number": "CR-001-0002",
            "boq_item": "MOB-02",
            "description": "Temporary site office, safety barricading and basic welfare facilities for construction team.",
            "requested_quantity": 1.0,
            "status": CheckRequestStatus.APPROVED,
            "submitted_by": contractor,
            "approved_by": client,
            "days_ago_submitted": 43,
            "days_ago_decided": 38,
            "decision_notes": "Approved following site inspection.",
        },
        {
            "cr_number": "CR-001-0003",
            "boq_item": "GRY-02",
            "description": "Foundation excavation completed for 10 Marla plot. Includes disposal of excavated material within site boundary.",
            "requested_quantity": 1100.0,
            "status": CheckRequestStatus.APPROVED,
            "submitted_by": contractor,
            "approved_by": client,
            "days_ago_submitted": 30,
            "days_ago_decided": 25,
            "decision_notes": "Quantity verified by site engineer. Approved.",
        },
        {
            "cr_number": "CR-001-0004",
            "boq_item": "GRY-05",
            "description": "Reinforced concrete works in footings, columns and ground floor slab. Mix design 1:2:4 as per structural drawings.",
            "requested_quantity": 800.0,
            "status": CheckRequestStatus.HUMAN_REVIEW,
            "submitted_by": contractor,
            "approved_by": None,
            "days_ago_submitted": 5,
            "days_ago_decided": None,
            "decision_notes": None,
        },
        {
            "cr_number": "CR-001-0005",
            "boq_item": "GRY-06",
            "description": "Supply and fix reinforcement steel for RCC works including footings, columns, beams and roof slab.",
            "requested_quantity": 12000.0,
            "status": CheckRequestStatus.SUBMITTED,
            "submitted_by": contractor,
            "approved_by": None,
            "days_ago_submitted": 2,
            "days_ago_decided": None,
            "decision_notes": None,
        },
        {
            "cr_number": "CR-001-0006",
            "boq_item": "GRY-07",
            "description": "Supply, erect and strike formwork/shuttering to RCC works.",
            "requested_quantity": 5000.0,
            "status": CheckRequestStatus.DRAFT,
            "submitted_by": contractor,
            "approved_by": None,
            "days_ago_submitted": None,
            "days_ago_decided": None,
            "decision_notes": None,
        },
    ]

    for crd in cr_data_p1:
        item = item_map_1.get(crd["boq_item"])
        if not item:
            continue
        cr = CheckRequest(
            cr_number=crd["cr_number"],
            project_id=projects[0].id,
            boq_item_id=item.id,
            submitted_by=crd["submitted_by"].id,
            status=crd["status"],
            description=crd["description"],
            requested_quantity=crd["requested_quantity"],
            unit=item.unit,
            ai_confidence=0.87 if crd["status"] in [CheckRequestStatus.HUMAN_REVIEW, CheckRequestStatus.APPROVED] else None,
            approved_by=crd["approved_by"].id if crd["approved_by"] else None,
            decision_notes=crd["decision_notes"],
            submitted_at=now - timedelta(days=crd["days_ago_submitted"]) if crd["days_ago_submitted"] else None,
            decided_at=now - timedelta(days=crd["days_ago_decided"]) if crd["days_ago_decided"] else None,
            created_at=now - timedelta(days=(crd["days_ago_submitted"] or 0) + 1),
            updated_at=now,
        )
        session.add(cr)
        # Update BOQ item executed qty for approved CRs
        if crd["status"] == CheckRequestStatus.APPROVED:
            item.executed_quantity += crd["requested_quantity"]
            item.certified_quantity += crd["requested_quantity"]
            session.add(item)
        crs.append(cr)

    session.commit()
    for cr in crs:
        session.refresh(cr)

    # Create audit events for CRs
    for cr in crs:
        if cr.submitted_at:
            ae = AuditEvent(
                project_id=projects[0].id,
                entity_type="check_request",
                entity_id=cr.id,
                entity_reference=cr.cr_number,
                event_type=AuditEventType.SUBMITTED,
                description=f"Ahmed Raza submitted {cr.cr_number} for review",
                actor_name="Ahmed Raza",
                actor_role="contractor",
                new_state="submitted",
                created_at=cr.submitted_at,
            )
            session.add(ae)
            if cr.status == CheckRequestStatus.APPROVED and cr.decided_at:
                ae2 = AuditEvent(
                    project_id=projects[0].id,
                    entity_type="check_request",
                    entity_id=cr.id,
                    entity_reference=cr.cr_number,
                    event_type=AuditEventType.APPROVED,
                    description=f"Col. (R) Tariq Mehmood approved {cr.cr_number}",
                    actor_name="Col. (R) Tariq Mehmood",
                    actor_role="client",
                    previous_state="submitted",
                    new_state="approved",
                    created_at=cr.decided_at,
                )
                session.add(ae2)

    session.commit()
    return crs


def _create_measurements(session: Session, projects: list, boqs: list, crs: list, users: dict):
    consultant = users["sara.consultant@nec.pk"]
    now = datetime.now(timezone.utc)
    approved_crs = [cr for cr in crs if cr.status == CheckRequestStatus.APPROVED]
    boq_items = session.exec(select(BOQItem).where(BOQItem.boq_id == boqs[0].id)).all()
    item_map = {i.id: i for i in boq_items}

    for cr in approved_crs[:3]:
        item = item_map.get(cr.boq_item_id)
        if not item:
            continue
        prev_cert = item.certified_quantity - cr.requested_quantity
        m = Measurement(
            project_id=projects[0].id,
            check_request_id=cr.id,
            boq_item_id=item.id,
            recorded_by=consultant.id,
            verified_by=consultant.id,
            status=MeasurementStatus.VERIFIED,
            current_quantity=cr.requested_quantity,
            previously_certified_quantity=prev_cert,
            cumulative_quantity=prev_cert + cr.requested_quantity,
            remaining_approved_quantity=item.current_approved_quantity - (prev_cert + cr.requested_quantity),
            measurement_date=cr.decided_at or now - timedelta(days=10),
            location_description=f"Site: DHA Phase 8, Block C — {item.section.value}",
            comments="Measurement verified on site. Quantities confirmed.",
            is_overrun=False,
            overrun_quantity=0.0,
            created_at=cr.decided_at or now - timedelta(days=10),
            updated_at=now,
        )
        session.add(m)

    session.commit()


def _create_variations(session: Session, projects: list, boqs: list, users: dict) -> list:
    contractor = users["ahmed.contractor@dha.pk"]
    client = users["client.dha@dha.pk"]
    now = datetime.now(timezone.utc)
    boq_items = session.exec(select(BOQItem).where(BOQItem.boq_id == boqs[0].id)).all()
    item_map = {i.item_code: i for i in boq_items}
    variations = []

    # Variation 1: GRY-02 excavation overrun — APPROVED
    item = item_map.get("GRY-02")
    if item:
        v1 = Variation(
            variation_number="VAR-001-0001",
            project_id=projects[0].id,
            boq_item_id=item.id,
            submitted_by=contractor.id,
            status=VariationStatus.APPROVED,
            original_boq_quantity=item.original_quantity,
            previously_approved_variation=0.0,
            current_approved_quantity=item.original_quantity,
            previously_certified_quantity=1100.0,
            required_cumulative_quantity=1500.0,
            proposed_additional_quantity=200.0,
            revised_proposed_quantity=item.original_quantity + 200.0,
            boq_rate=item.unit_rate,
            estimated_variation_value=200.0 * item.unit_rate,
            justification="Additional excavation required due to unexpected rock formation at foundation level. Structural engineer confirmed additional 200 CFT necessary for proper foundation depth as per soil report.",
            approved_by=client.id,
            decision_notes="Variation approved. Site conditions verified by NEC Engineers. Additional cost justified.",
            submitted_at=now - timedelta(days=22),
            decided_at=now - timedelta(days=18),
            created_at=now - timedelta(days=23),
            updated_at=now,
        )
        session.add(v1)
        # Update BOQ item
        item.approved_variation_quantity += 200.0
        item.current_approved_quantity = item.original_quantity + 200.0
        session.add(item)
        variations.append(v1)

    # Variation 2: GRY-05 RCC — SUBMITTED for review
    item2 = item_map.get("GRY-05")
    if item2:
        v2 = Variation(
            variation_number="VAR-001-0002",
            project_id=projects[0].id,
            boq_item_id=item2.id,
            submitted_by=contractor.id,
            status=VariationStatus.HUMAN_REVIEW,
            original_boq_quantity=item2.original_quantity,
            previously_approved_variation=0.0,
            current_approved_quantity=item2.original_quantity,
            previously_certified_quantity=800.0,
            required_cumulative_quantity=2300.0,
            proposed_additional_quantity=200.0,
            revised_proposed_quantity=item2.original_quantity + 200.0,
            boq_rate=item2.unit_rate,
            estimated_variation_value=200.0 * item2.unit_rate,
            justification="First floor structural design change required additional RCC volume. Structural drawings revised per architect's instruction dated 15-Sep-2024.",
            ai_confidence=0.84,
            submitted_at=now - timedelta(days=4),
            created_at=now - timedelta(days=5),
            updated_at=now,
        )
        session.add(v2)
        variations.append(v2)

    session.commit()
    for v in variations:
        session.refresh(v)
    return variations


def _create_ipcs(session: Session, projects: list, boqs: list, crs: list, users: dict):
    client = users["client.dha@dha.pk"]
    now = datetime.now(timezone.utc)
    approved_crs = [cr for cr in crs if cr.status == CheckRequestStatus.APPROVED]

    boq_items = session.exec(select(BOQItem).where(BOQItem.boq_id == boqs[0].id)).all()
    item_map = {i.id: i for i in boq_items}

    # IPC Period 1 (Certified)
    ipc1 = IPC(
        ipc_number="IPC-001-001",
        project_id=projects[0].id,
        period_number=1,
        status=IPCStatus.CERTIFIED,
        period_start=now - timedelta(days=60),
        period_end=now - timedelta(days=30),
        submitted_at=now - timedelta(days=28),
        decided_at=now - timedelta(days=22),
        certified_by=client.id,
        decision_notes="IPC Period 1 certified. Mobilization and initial works verified.",
        created_at=now - timedelta(days=30),
        updated_at=now,
    )
    gross = 0.0
    lines = []
    for cr in approved_crs[:2]:  # First 2 approved CRs in IPC 1
        item = item_map.get(cr.boq_item_id)
        if not item:
            continue
        current_amt = round(cr.requested_quantity * item.unit_rate, 2)
        gross += current_amt
        lines.append((cr, item, current_amt))

    ipc1.gross_amount = round(gross, 2)
    ipc1.retention_amount = round(gross * 0.10, 2)
    ipc1.net_payable = round(gross * 0.90, 2)
    ipc1.previous_certified_total = 0.0
    ipc1.current_certified_amount = ipc1.gross_amount
    ipc1.cumulative_certified_amount = ipc1.gross_amount
    session.add(ipc1)
    session.commit()
    session.refresh(ipc1)

    prev_qty = {}
    for cr, item, current_amt in lines:
        line = IPCLine(
            ipc_id=ipc1.id,
            boq_item_id=item.id,
            check_request_id=cr.id,
            description=item.description,
            unit=item.unit,
            boq_rate=item.unit_rate,
            previous_quantity=0.0,
            current_quantity=cr.requested_quantity,
            cumulative_quantity=cr.requested_quantity,
            current_amount=current_amt,
            cumulative_amount=current_amt,
        )
        session.add(line)
        prev_qty[item.id] = cr.requested_quantity

    # IPC Period 2 (Draft)
    cr3 = approved_crs[2] if len(approved_crs) > 2 else None
    if cr3:
        item3 = item_map.get(cr3.boq_item_id)
        if item3:
            gross2 = round(cr3.requested_quantity * item3.unit_rate, 2)
            ipc2 = IPC(
                ipc_number="IPC-001-002",
                project_id=projects[0].id,
                period_number=2,
                status=IPCStatus.HUMAN_REVIEW,
                period_start=now - timedelta(days=29),
                period_end=now - timedelta(days=1),
                submitted_at=now - timedelta(days=1),
                gross_amount=gross2,
                retention_amount=round(gross2 * 0.10, 2),
                net_payable=round(gross2 * 0.90, 2),
                previous_certified_total=ipc1.gross_amount,
                current_certified_amount=gross2,
                cumulative_certified_amount=ipc1.gross_amount + gross2,
                created_at=now - timedelta(days=2),
                updated_at=now,
            )
            session.add(ipc2)
            session.commit()
            session.refresh(ipc2)

            line2 = IPCLine(
                ipc_id=ipc2.id,
                boq_item_id=item3.id,
                check_request_id=cr3.id,
                description=item3.description,
                unit=item3.unit,
                boq_rate=item3.unit_rate,
                previous_quantity=0.0,
                current_quantity=cr3.requested_quantity,
                cumulative_quantity=cr3.requested_quantity,
                current_amount=gross2,
                cumulative_amount=gross2,
            )
            session.add(line2)

    session.commit()


def _create_ai_reviews(session: Session, crs: list, variations: list):
    now = datetime.now(timezone.utc)
    for entity_list, entity_type in [(crs, "check_request"), (variations, "variation")]:
        for entity in entity_list[:4]:
            if entity.status in [CheckRequestStatus.DRAFT, VariationStatus.DRAFT]:
                continue
            project_id = entity.project_id
            review = AIReview(
                entity_type=entity_type,
                entity_id=entity.id,
                project_id=project_id,
                status="completed",
                overall_confidence=0.87,
                overall_recommendation="No significant issues identified" if entity.status == "approved" else "Review required — warnings present",
                agents_run=["BOQ & Activity Agent", "Check Request Agent", "Document & Evidence Agent", "Measurement & Quantity Agent", "History & Duplicate Detection Agent", "Review & Audit Agent"],
                summary="6 agents completed. 2 checks passed, 1 warning, 0 critical. All findings are AI recommendations — human approval required.",
                started_at=now - timedelta(minutes=15),
                completed_at=now - timedelta(minutes=12),
                created_at=now - timedelta(minutes=16),
            )
            session.add(review)
            session.commit()
            session.refresh(review)

            # Add findings
            findings_data = [
                {
                    "agent_name": "BOQ & Activity Agent",
                    "severity": AIFindingSeverity.OK,
                    "finding": f"BOQ item verified. Requested quantity within approved limits.",
                    "confidence": 0.98,
                    "evidence": [{"field": "remaining_approved", "value": 500}],
                },
                {
                    "agent_name": "Document & Evidence Agent",
                    "severity": AIFindingSeverity.WARNING,
                    "finding": "1 document uploaded but not yet verified. Reviewer should verify evidence before approving.",
                    "confidence": 0.90,
                    "evidence": [{"filename": "site_photos.pdf", "status": "uploaded"}],
                    "recommendation": "Verify uploaded document against site conditions.",
                },
                {
                    "agent_name": "Measurement & Quantity Agent",
                    "severity": AIFindingSeverity.OK,
                    "finding": "Quantity check passed. Cumulative within approved limits.",
                    "confidence": 0.96,
                    "evidence": [],
                },
                {
                    "agent_name": "History & Duplicate Detection Agent",
                    "severity": AIFindingSeverity.INFO,
                    "finding": "Prior Check Request history reviewed. No duplicate quantities detected.",
                    "confidence": 0.95,
                    "evidence": [],
                },
                {
                    "agent_name": "Review & Audit Agent",
                    "severity": AIFindingSeverity.INFO,
                    "finding": "AI review package consolidated. All findings above are AI recommendations only. Human authority must make final decision.",
                    "confidence": 1.0,
                    "recommendation": "Review all findings and exercise human judgment before deciding.",
                },
            ]
            for fd in findings_data:
                f = AIFinding(
                    review_id=review.id,
                    agent_name=fd["agent_name"],
                    severity=fd["severity"],
                    finding=fd["finding"],
                    confidence=fd["confidence"],
                    evidence=fd.get("evidence", []),
                    recommendation=fd.get("recommendation"),
                    created_at=review.completed_at,
                )
                session.add(f)

            # Link review to entity
            if entity_type == "check_request" and entity.ai_confidence:
                entity.ai_review_id = review.id
                session.add(entity)

    session.commit()


def _create_notifications(session: Session, users: dict, crs: list, variations: list):
    now = datetime.now(timezone.utc)
    client = users["client.dha@dha.pk"]
    contractor = users["ahmed.contractor@dha.pk"]

    pending_crs = [cr for cr in crs if cr.status in [CheckRequestStatus.HUMAN_REVIEW]]
    for cr in pending_crs:
        n = Notification(
            user_id=client.id,
            project_id=cr.project_id,
            notification_type=NotificationType.APPROVAL_REQUIRED,
            title="Check Request Awaiting Your Approval",
            message=f"{cr.cr_number} has completed AI review and requires your decision (Approve / Return / Reject).",
            entity_type="check_request",
            entity_id=cr.id,
            entity_reference=cr.cr_number,
            is_read=False,
            created_at=now - timedelta(hours=2),
        )
        session.add(n)

    pending_vars = [v for v in variations if v.status == VariationStatus.HUMAN_REVIEW]
    for v in pending_vars:
        n2 = Notification(
            user_id=client.id,
            project_id=v.project_id,
            notification_type=NotificationType.APPROVAL_REQUIRED,
            title="Variation Awaiting Approval",
            message=f"{v.variation_number} requires your review and decision.",
            entity_type="variation",
            entity_id=v.id,
            entity_reference=v.variation_number,
            is_read=False,
            created_at=now - timedelta(hours=1),
        )
        session.add(n2)

    # AI finding notification
    n3 = Notification(
        user_id=contractor.id,
        project_id=1,
        notification_type=NotificationType.AI_FINDING,
        title="AI Review Completed",
        message="AI review for CR-001-0004 is complete. 1 warning identified. Awaiting human decision.",
        entity_type="check_request",
        entity_id=4,
        entity_reference="CR-001-0004",
        is_read=True,
        created_at=now - timedelta(hours=5),
    )
    session.add(n3)
    session.commit()


if __name__ == "__main__":
    seed_all()
