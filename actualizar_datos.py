import json
import os
import sys
import pandas as pd

source_path = sys.argv[1]
output_path = sys.argv[2]

book = pd.ExcelFile(source_path)
records = []
for sheet in book.sheet_names:
    if not sheet.startswith("Licenciaturas"):
        continue
    calendar = sheet.replace("Licenciaturas ", "")
    frame = pd.read_excel(source_path, sheet_name=sheet, header=1)
    headers = [str(col).strip() for col in frame.columns]
    center_col = headers.index("CENTRO")
    campus_col = headers.index("CAMPUS")
    career_col = headers.index("CARRERA")
    score_col = headers.index("PUNTAJE MÍNIMO")
    center = ""
    campus = ""
    for _, row in frame.iterrows():
        if pd.notna(row.iloc[center_col]):
            center = str(row.iloc[center_col]).strip()
        if pd.notna(row.iloc[campus_col]):
            campus = str(row.iloc[campus_col]).strip()
        career = row.iloc[career_col]
        score = pd.to_numeric(row.iloc[score_col], errors="coerce")
        if pd.isna(career) or pd.isna(score) or not center or not campus:
            continue
        career = str(career).strip()
        if not career or career.lower() == "nan":
            continue
        records.append({
            "calendar": calendar,
            "center": center,
            "campus": campus,
            "career": career,
            "minimumScore": round(float(score), 4),
        })

payload = {
    "source": "Coordinación General de Control Escolar de la UdeG",
    "sourceUrl": "https://escolar.udg.mx/estadisticas-puntajes-minimos",
    "updatedAt": os.path.getmtime(source_path),
    "records": records,
}
with open(output_path, "w", encoding="utf-8") as output:
    json.dump(payload, output, ensure_ascii=False, separators=(",", ":"))
print(f"Exported {len(records)} records")
