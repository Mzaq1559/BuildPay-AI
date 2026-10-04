import openpyxl
from pathlib import Path
from sqlmodel import Session, select
from app.models.boq import BOQ, BOQItem, BOQSection

BOQ_TEMPLATES = {
    "5_marla": {
        "name": "5 Marla Double Storey Civil BOQ",
        "plot_area_sqft": 1125,
        "covered_area_sqft": 2250,
        "file": "5_marla_double_storey_civil_boq.xlsx",
    },
    "10_marla": {
        "name": "10 Marla Double Storey Civil BOQ",
        "plot_area_sqft": 2250,
        "covered_area_sqft": 4500,
        "file": "10_marla_double_storey_civil_boq.xlsx",
    },
    "1_kanal": {
        "name": "1 Kanal Double Storey Civil BOQ",
        "plot_area_sqft": 5445,
        "covered_area_sqft": 10890,
        "file": "1_kanal_double_storey_civil_boq.xlsx",
    },
}

def _get_docs_dir() -> Path:
    base = Path(__file__).resolve().parent
    candidates = [
        base.parent.parent / "docs",
        base.parent / "docs",
        base.parent.parent.parent / "docs",
    ]
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]


DOCS_DIR = _get_docs_dir()


def import_boq_template(
    session: Session,
    project_id: int,
    boq_type: str,
    created_by: int | None = None,
) -> BOQ:
    if boq_type not in BOQ_TEMPLATES:
        raise ValueError(f"Unknown BOQ type: {boq_type}. Must be one of {list(BOQ_TEMPLATES.keys())}")

    existing_boq = session.exec(select(BOQ).where(BOQ.project_id == project_id)).first()
    if existing_boq:
        return existing_boq

    tmpl = BOQ_TEMPLATES[boq_type]
    xlsx_path = DOCS_DIR / tmpl["file"]

    boq = BOQ(
        project_id=project_id,
        name=tmpl["name"],
        boq_type=boq_type,
        currency="PKR",
        plot_area_sqft=tmpl["plot_area_sqft"],
        covered_area_sqft=tmpl["covered_area_sqft"],
        storeys=2,
        created_by=created_by,
    )
    session.add(boq)
    session.commit()
    session.refresh(boq)

    items = _parse_boq_excel(xlsx_path, boq.id)
    for item in items:
        session.add(item)
    session.commit()

    return boq


def _parse_boq_excel(xlsx_path: Path, boq_id: int) -> list[BOQItem]:
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    ws = wb.active
    items = []

    HEADER_ROW = 9  # Row 9 has headers: Item Code, Section, Description, Unit, Qty, Unit Rate, Amount...
    DATA_START = 10

    for row_idx in range(DATA_START, ws.max_row + 1):
        row = [ws.cell(row=row_idx, column=c).value for c in range(1, 11)]
        item_code = row[0]
        if not item_code or not isinstance(item_code, str):
            continue
        if item_code.startswith("Total") or item_code.startswith("TOTAL"):
            continue

        section_str = str(row[1] or "Other")
        section_map = {
            "Mobilization": BOQSection.MOBILIZATION,
            "Grey Structure": BOQSection.GREY_STRUCTURE,
            "Finishing": BOQSection.FINISHING,
        }
        section = section_map.get(section_str, BOQSection.OTHER)

        description = str(row[2] or "")
        unit = str(row[3] or "")
        try:
            qty = float(row[4] or 0)
            rate = float(row[5] or 0)
        except (ValueError, TypeError):
            continue

        amount = round(qty * rate, 2)

        item = BOQItem(
            boq_id=boq_id,
            item_code=item_code,
            section=section,
            description=description,
            unit=unit,
            original_quantity=qty,
            unit_rate=rate,
            amount=amount,
            executed_quantity=0.0,
            certified_quantity=0.0,
            approved_variation_quantity=0.0,
            current_approved_quantity=qty,  # starts at original
        )
        items.append(item)

    return items


def get_boq_with_items(session: Session, boq_id: int) -> tuple[BOQ | None, list[BOQItem]]:
    from sqlmodel import select
    boq = session.get(BOQ, boq_id)
    if not boq:
        return None, []
    items = session.exec(select(BOQItem).where(BOQItem.boq_id == boq_id)).all()
    return boq, list(items)
