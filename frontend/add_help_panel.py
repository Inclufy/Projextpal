#!/usr/bin/env python3
"""
Script om MethodologyHelpPanel toe te voegen aan alle Six Sigma pagina's.
Gebruik: python3 add_help_panel_sixsigma.py
"""

import os
import re

SIXSIGMA_DIR = 'src/pages/sixsigma'

def add_help_panel_to_file(filepath):
    """Voeg MethodologyHelpPanel toe aan een TSX bestand."""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check of al toegevoegd
    if 'MethodologyHelpPanel' in content:
        return 'skipped'
    
    # 1. Voeg import toe na de laatste bestaande import
    import_statement = "import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';"
    
    # Zoek de laatste import statement
    import_matches = list(re.finditer(r'^import .+ from [\'"].+[\'"];?\s*$', content, re.MULTILINE))
    
    if import_matches:
        last_import = import_matches[-1]
        insert_pos = last_import.end()
        content = content[:insert_pos] + '\n' + import_statement + content[insert_pos:]
    else:
        content = import_statement + '\n' + content
    
    # 2. Voeg component toe vóór de laatste </div> in de return statement
    div_matches = list(re.finditer(r'(\s*)(</div>)', content))
    
    if div_matches:
        for match in reversed(div_matches):
            after_div = content[match.end():match.end() + 50]
            if re.match(r'\s*\);', after_div):
                indent = match.group(1)
                base_indent = indent.replace('\n', '')
                
                component_line = f'\n{base_indent}  <MethodologyHelpPanel methodology="lean_six_sigma" />'
                
                insert_pos = match.start()
                content = content[:insert_pos] + component_line + content[insert_pos:]
                break
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return 'updated'

def main():
    print("🔧 MethodologyHelpPanel toevoegen aan Six Sigma pagina's...")
    print(f"📁 Directory: {SIXSIGMA_DIR}")
    print()
    
    updated = 0
    skipped = 0
    
    for filename in sorted(os.listdir(SIXSIGMA_DIR)):
        if not filename.endswith('.tsx'):
            continue
        
        filepath = os.path.join(SIXSIGMA_DIR, filename)
        
        try:
            result = add_help_panel_to_file(filepath)
            
            if result == 'skipped':
                print(f"⏭️  Skip: {filename} (al toegevoegd)")
                skipped += 1
            else:
                print(f"✅ Bijgewerkt: {filename}")
                updated += 1
                
        except Exception as e:
            print(f"❌ Fout bij {filename}: {e}")
    
    print()
    print(f"✅ Klaar! Bijgewerkt: {updated} | Overgeslagen: {skipped}")

if __name__ == '__main__':
    main()