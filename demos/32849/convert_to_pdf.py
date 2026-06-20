import re
from pathlib import Path
from weasyprint import HTML, CSS

base_dir = Path(__file__).parent
html_path = base_dir / "gaokao-volunteer-system-plan.html"
pdf_path = base_dir / "gaokao-volunteer-system-plan.pdf"

html_content = html_path.read_text(encoding="utf-8")

# Replace the Mermaid diagram block with a static image
mermaid_pattern = re.compile(
    r'<figure class="diagram">\s*<pre class="mermaid">.*?</pre>\s*<figcaption>图 1：高考志愿分析系统总体技术架构</figcaption>\s*</figure>',
    re.DOTALL
)

replacement = '''<figure class="diagram">
  <img src="assets/architecture.png" alt="高考志愿分析系统总体技术架构" style="max-width:100%;height:auto;border:1px solid #e5e7eb;border-radius:8px;">
  <figcaption>图 1：高考志愿分析系统总体技术架构</figcaption>
</figure>'''

html_content = mermaid_pattern.sub(replacement, html_content)

# Remove mermaid script since we don't need it in PDF
html_content = re.sub(r'<script src="\./_shared/js/mermaid\.min\.js"></script>\s*', '', html_content)
html_content = re.sub(r'<script>\s*mermaid\.initialize\(.*?\);\s*</script>\s*', '', html_content, flags=re.DOTALL)

# Ensure base URL is set for WeasyPrint
if '<base' not in html_content:
    html_content = html_content.replace('<head>', '<head>\n  <base href="file://' + str(base_dir) + '/">')

HTML(string=html_content, base_url=str(base_dir)).write_pdf(str(pdf_path))
print(f"PDF generated: {pdf_path}")
print(f"File size: {pdf_path.stat().st_size / 1024:.1f} KB")
