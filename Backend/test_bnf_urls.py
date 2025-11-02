"""
Test BNF URL generation
"""
medications = [
    "Ketorolac trometamol",
    "Bevacizumab",
    "Aflibercept",
    "Ranibizumab",
    "Latanoprost"
]

print("BNF URL Testing:\n")
for med in medications:
    slug = med.lower().replace(' ', '-').replace('/', '-')
    direct_url = f"https://bnf.nice.org.uk/drugs/{slug}/"
    search_url = f"https://bnf.nice.org.uk/search/?q={med.replace(' ', '%20')}"
    
    print(f"Medication: {med}")
    print(f"  Direct:  {direct_url}")
    print(f"  Search:  {search_url}")
    print()
