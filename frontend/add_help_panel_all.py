#!/usr/bin/env python3
"""
Script om MethodologyHelpPanel toe te voegen aan alle methodology pagina's in ProjectPal.

Gebruik: python3 add_help_panel_all.py /path/to/frontend/src/pages

Dit script:
1. Zoekt alle methodology directories (agile, scrum, prince2, waterfall, sixsigma, kanban, hybrid)
2. Voegt de import statement toe aan elk .tsx bestand
3. Voegt de <MethodologyHelpPanel /> component toe vóór de laatste </div>
"""

import os
import re
import sys

# Mapping van directory namen naar methodology strings
METHODOLOGY_MAP = {
    'agile': 'agile',
    'scrum': 'scrum',
    'kanban': 'kanban',
    'prince2': 'prince2',
    'waterfall': 'waterfall',
    'sixsigma': 'lean_six_sigma',
    'six-sigma': 'lean_six_sigma',
    'leansixsigma': 'lean_six_sigma',
    'lss': 'lean_six_sigma',
    'hybrid': 'hybrid',
    'safe': 'safe',
    'msp': 'msp',
    'pmi': 'pmi',
}

# Bestanden die we moeten overslaan
SKIP_FILES = [
    'index.tsx',
    'index.ts',
    'types.ts',
    'types.tsx',
    'utils.ts',
    'utils.tsx',
    'constants.ts',
    'constants.tsx',
]

def get_methodology_for_directory(dir_name: str) -> str:
    """Bepaal de methodology string voor een directory naam."""
    dir_lower = dir_name.lower()
    
    # Direct match
    if dir_lower in METHODOLOGY_MAP:
        return METHODOLOGY_MAP[dir_lower]
    
    # Partial match
    for key, value in METHODOLOGY_MAP.items():
        if key in dir_lower:
            return value
    
    return None

def add_help_panel_to_file(filepath: str, methodology: str) -> str:
    """Voeg MethodologyHelpPanel toe aan een TSX bestand."""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check of al toegevoegd
    if 'MethodologyHelpPanel' in content:
        return 'skipped'
    
    # Check of het een React component is (heeft return statement met JSX)
    if not re.search(r'return\s*\(', content):
        return 'not_component'
    
    # 1. Voeg import toe na de laatste bestaande import
    import_statement = "import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';"
    
    # Zoek de laatste import statement
    import_matches = list(re.finditer(r'^import .+ from [\'"].+[\'"];?\s*$', content, re.MULTILINE))
    
    if import_matches:
        last_import = import_matches[-1]
        insert_pos = last_import.end()
        content = content[:insert_pos] + '\n' + import_statement + content[insert_pos:]
    else:
        # Geen imports gevonden, voeg aan het begin toe (na eventuele comments)
        first_code = re.search(r'^(?!\/\/|\/\*|\s*\n)', content, re.MULTILINE)
        if first_code:
            insert_pos = first_code.start()
            content = content[:insert_pos] + import_statement + '\n\n' + content[insert_pos:]
        else:
            content = import_statement + '\n' + content
    
    # 2. Voeg component toe vóór de laatste </div> in de return statement
    # Zoek het patroon: </div> gevolgd door ); (met whitespace)
    
    # Vind alle </div> posities
    div_matches = list(re.finditer(r'(\s*)(</div>)', content))
    
    component_added = False
    if div_matches:
        # Zoek de laatste </div> die gevolgd wordt door ); 
        # Dit is typisch het einde van de component return
        for match in reversed(div_matches):
            after_div = content[match.end():match.end() + 50]
            if re.match(r'\s*\);', after_div):
                # Dit is de juiste </div>
                indent = match.group(1)
                # Bepaal de correcte indentatie
                base_indent = indent.replace('\n', '')
                
                component_line = f'\n\n{base_indent}      {{/* Methodology Help Panel */}}\n{base_indent}      <MethodologyHelpPanel methodology="{methodology}" />'
                
                insert_pos = match.start()
                content = content[:insert_pos] + component_line + content[insert_pos:]
                component_added = True
                break
    
    if not component_added:
        return 'no_insertion_point'
    
    # Schrijf terug
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return 'updated'

def find_methodology_directories(pages_dir: str) -> dict:
    """Vind alle methodology directories en hun bestanden."""
    result = {}
    
    if not os.path.isdir(pages_dir):
        return result
    
    for item in os.listdir(pages_dir):
        item_path = os.path.join(pages_dir, item)
        
        if not os.path.isdir(item_path):
            continue
        
        methodology = get_methodology_for_directory(item)
        
        if methodology:
            tsx_files = []
            for filename in os.listdir(item_path):
                if filename.endswith('.tsx') and filename not in SKIP_FILES:
                    tsx_files.append(os.path.join(item_path, filename))
            
            if tsx_files:
                result[item] = {
                    'methodology': methodology,
                    'path': item_path,
                    'files': tsx_files
                }
    
    return result

def main():
    # Bepaal de pages directory
    if len(sys.argv) > 1:
        pages_dir = sys.argv[1]
    else:
        # Probeer standaard locaties
        possible_paths = [
            'src/pages',
            'frontend/src/pages',
            '../frontend/src/pages',
        ]
        pages_dir = None
        for path in possible_paths:
            if os.path.isdir(path):
                pages_dir = path
                break
        
        if not pages_dir:
            print("❌ Kon pages directory niet vinden.")
            print("Gebruik: python3 add_help_panel_all.py /path/to/frontend/src/pages")
            sys.exit(1)
    
    print("=" * 60)
    print("🔧 MethodologyHelpPanel Toevoegen aan Alle Methodology Pagina's")
    print("=" * 60)
    print(f"📁 Pages directory: {pages_dir}")
    print()
    
    # Vind alle methodology directories
    methodology_dirs = find_methodology_directories(pages_dir)
    
    if not methodology_dirs:
        print("❌ Geen methodology directories gevonden.")
        print("   Verwachte directories: agile, scrum, kanban, prince2, waterfall, sixsigma, hybrid")
        sys.exit(1)
    
    print(f"📂 Gevonden methodology directories: {len(methodology_dirs)}")
    for dir_name, info in methodology_dirs.items():
        print(f"   • {dir_name} → {info['methodology']} ({len(info['files'])} bestanden)")
    print()
    
    # Verwerk alle bestanden
    stats = {
        'updated': 0,
        'skipped': 0,
        'not_component': 0,
        'no_insertion_point': 0,
        'errors': 0,
    }
    
    for dir_name, info in methodology_dirs.items():
        methodology = info['methodology']
        print(f"\n📁 {dir_name.upper()} ({methodology})")
        print("-" * 40)
        
        for filepath in info['files']:
            filename = os.path.basename(filepath)
            
            try:
                result = add_help_panel_to_file(filepath, methodology)
                
                if result == 'skipped':
                    print(f"   ⏭️  {filename} (al toegevoegd)")
                    stats['skipped'] += 1
                elif result == 'not_component':
                    print(f"   ⚪ {filename} (geen React component)")
                    stats['not_component'] += 1
                elif result == 'no_insertion_point':
                    print(f"   ⚠️  {filename} (kon insertion point niet vinden)")
                    stats['no_insertion_point'] += 1
                elif result == 'updated':
                    print(f"   ✅ {filename}")
                    stats['updated'] += 1
                    
            except Exception as e:
                print(f"   ❌ {filename}: {str(e)}")
                stats['errors'] += 1
    
    # Samenvatting
    print()
    print("=" * 60)
    print("📊 SAMENVATTING")
    print("=" * 60)
    print(f"   ✅ Bijgewerkt:        {stats['updated']} bestanden")
    print(f"   ⏭️  Al aanwezig:      {stats['skipped']} bestanden")
    print(f"   ⚪ Geen component:    {stats['not_component']} bestanden")
    print(f"   ⚠️  Geen insert punt: {stats['no_insertion_point']} bestanden")
    print(f"   ❌ Fouten:           {stats['errors']} bestanden")
    print()
    
    if stats['updated'] > 0:
        print("✨ Klaar! De MethodologyHelpPanel is toegevoegd.")
        print("   Test de pagina's om te controleren of de floating help button verschijnt.")
    else:
        print("ℹ️  Geen bestanden bijgewerkt.")

if __name__ == '__main__':
    main()