#!/usr/bin/env python3
"""
Script to remove mock data from frontend pages
"""
import os
import re

def fix_file(filepath, fixes):
    """Apply fixes to a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for pattern, replacement in fixes:
            content = re.sub(pattern, replacement, content, flags=re.DOTALL | re.MULTILINE)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed {filepath}")
        else:
            print(f"⚠️  No changes needed in {filepath}")
            
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")

# Define fixes for each file
fixes = {
    'frontend/src/app/pages/Properties.tsx': [
        # Remove mock data definition
        (r'const mockProperties = \[.*?\];', ''),
        # Fix display logic
        (r'const displayProperties = properties\.length > 0 \? properties : mockProperties;', ''),
        # Fix filtered properties to use properties directly
        (r'const filteredProperties = displayProperties\.filter', 'const filteredProperties = properties.filter'),
    ],
    
    'frontend/src/app/pages/Transactions.tsx': [
        # Remove mock data definitions
        (r'// Mock data for dropdowns.*?const mockCustomers = \[.*?\];', ''),
        (r'// Mock data\s*const mockTransactions = \[.*?\];', ''),
        # Fix display logic
        (r'const displayTransactions = transactions\.length > 0 \? transactions : mockTransactions;', ''),
        # Fix filtered transactions
        (r'const filteredTransactions = displayTransactions\.filter', 'const filteredTransactions = transactions.filter'),
        # Fix form props
        (r'properties=\{mockProperties\}', 'properties={[]}'),
        (r'customers=\{mockCustomers\}', 'customers={[]}'),
    ],
    
    'frontend/src/app/pages/PropertyListings.tsx': [
        # Remove mock data
        (r'// Mock data - will be replaced with API calls\s*const listings = \[.*?\];', 'const listings: any[] = [];'),
    ],
    
    'frontend/src/app/pages/LandTitles.tsx': [
        # Remove mock data
        (r'// Mock data - will be replaced with API calls\s*const documents = \[.*?\];', 'const documents: any[] = [];'),
    ],
    
    'frontend/src/app/pages/CustomerPortal.tsx': [
        # Remove mock data
        (r'const mockProjects = \[.*?\];', ''),
        # Fix display logic
        (r'const displayProjects = projects\.length > 0 \? projects : mockProjects;', 'const displayProjects = projects;'),
    ],
    
    'frontend/src/app/pages/SurveyProjects.tsx': [
        # Remove mock data for dropdowns
        (r'// Mock data for dropdowns.*?const mockSurveyors = \[.*?\];', ''),
        # Fix form props
        (r'customers=\{mockCustomers\}', 'customers={[]}'),
        (r'surveyors=\{mockSurveyors\}', 'surveyors={[]}'),
    ]
}

def main():
    print("🧹 Removing mock data from frontend pages...")
    
    for filepath, file_fixes in fixes.items():
        if os.path.exists(filepath):
            fix_file(filepath, file_fixes)
        else:
            print(f"⚠️  File not found: {filepath}")
    
    print("\n✅ Mock data removal complete!")

if __name__ == '__main__':
    main()