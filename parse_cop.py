import tabula, json
pdf_file="../en_1.1 - MAG Code of Points 2025-2028 (2).pdf"
sections=[10,11,12,13,14,15]
names=["Floor Exercise","Pommel Horse","Still Rings","Vault","Parallel Bars","High Bar"]
data={}
for sec,name in zip(sections,names):
 dfs=tabula.read_pdf(pdf_file,pages=sec,multiple_tables=True)
 skills=[]
 for df in dfs: skills.extend(df.to_dict(orient="records"))
 data[name]=skills
with open("skills_from_pdf.json","w") as f: json.dump(data,f,indent=2)
