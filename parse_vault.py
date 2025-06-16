import tabula
import json
import pandas as pd
import re

def clean_vault_description(desc):
    if not isinstance(desc, str):
        return ""
    # Remove any extra spaces and newline characters
    return " ".join(desc.replace('\r', ' ').replace('\n', ' ').split())

def parse_vault_data():
    pdf_path = "en_1.1 - MAG Code of Points 2025-2028.pdf"
    pages = '84-91' 
    
    print(f"Reading vault tables from {pdf_path} pages {pages}...")

    try:
        tables = tabula.read_pdf(pdf_path, pages=pages, multiple_tables=True, stream=True, guess=False)
    except Exception as e:
        print(f"Error reading PDF with tabula: {e}")
        return

    if not tables:
        print("No tables found on the specified pages.")
        return

    all_vaults = {}
    print(f"Found {len(tables)} tables to process.")

    for i, df in enumerate(tables):
        print(f"Processing table {i+1}...")
        
        for index, row in df.iterrows():
            row_str = ' '.join(str(x) for x in row.dropna() if str(x).strip())
            row_str = row_str.replace('\r', ' ').strip()

            if not row_str or "Men's Artistic Gymnastics" in row_str or "Code of Points" in row_str or "Value EG" in row_str:
                continue
            
            # A more robust regex to find vaults. This will look for a 3-digit number,
            # then a value, then a description.
            pattern = re.compile(r'(\d{3})\s+(\d\.\d)\s+([A-Z].*?)(?=\s+\d{3}|$)', re.DOTALL)
            matches = pattern.finditer(row_str)

            for match in matches:
                try:
                    element_num = int(match.group(1))
                    value = float(match.group(2))
                    description = clean_vault_description(match.group(3))
                    
                    if element_num not in all_vaults:
                        all_vaults[element_num] = {
                            "element": element_num,
                            "description": description,
                            "difficulty": str(value),
                            "value": value
                        }
                except Exception as e:
                    print(f"    - Error parsing match: {match.groups()} -> {e}")

    sorted_vaults = sorted(all_vaults.values(), key=lambda v: v['element'])
    print(f"\nSuccessfully parsed {len(sorted_vaults)} unique vaults.")

    try:
        with open('vault_skills.json', 'w', encoding='utf-8') as f:
            json.dump(sorted_vaults, f, indent=2, ensure_ascii=False)
        print("Successfully wrote parsed vault data to vault_skills.json")
    except Exception as e:
        print(f"Error writing JSON file: {e}")

if __name__ == "__main__":
    parse_vault_data() 