import shutil
import subprocess
import tempfile
from pathlib import Path

from app.knowledge.parsers.pptx_parser import parse_pptx
from app.knowledge.parsers.xlsx_parser import parse_xlsx
from app.knowledge.schemas import DocumentChunk


class LegacyConversionError(ValueError):
    """Raised when legacy Office conversion is disabled or unavailable."""


def parse_legacy(path: Path, relative_path: str, enabled: bool) -> list[DocumentChunk]:
    if not enabled:
        raise LegacyConversionError(
            "Legacy .ppt/.xls conversion is disabled. Set ENABLE_LEGACY_CONVERSION=true and install LibreOffice."
        )
    executable = shutil.which("libreoffice") or shutil.which("soffice")
    if not executable:
        raise LegacyConversionError("LibreOffice was not found; cannot convert legacy .ppt/.xls files.")
    target_suffix = ".pptx" if path.suffix.lower() == ".ppt" else ".xlsx"
    with tempfile.TemporaryDirectory(prefix="engineering-ai-convert-") as temporary:
        output_dir = Path(temporary)
        try:
            result = subprocess.run(
                [executable, "--headless", "--convert-to", target_suffix.lstrip("."),
                 "--outdir", str(output_dir), str(path)],
                check=False, capture_output=True, text=True, timeout=90,
            )
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise LegacyConversionError(f"LibreOffice conversion failed: {exc}") from exc
        converted = output_dir / f"{path.stem}{target_suffix}"
        if result.returncode != 0 or not converted.is_file():
            detail = (result.stderr or result.stdout or "No conversion details returned").strip()
            raise LegacyConversionError(f"LibreOffice conversion failed: {detail}")
        if target_suffix == ".pptx":
            return parse_pptx(converted, relative_path)
        return parse_xlsx(converted, relative_path)
