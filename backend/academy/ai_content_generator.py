"""
AI-Powered Content Generator
Analyzes lessons → Generates Skills, Visuals, Business Models
"""
import json
import re
from typing import List, Dict, Any

class AIContentGenerator:
    """Generate dynamic content from lesson analysis"""
    
    # Skill taxonomy - auto-detects from keywords
    SKILL_PATTERNS = {
        'project_planning': {
            'keywords': ['planning', 'timeline', 'gantt', 'schedule', 'milestone', 'deliverable'],
            'name': 'Project Planning',
            'nameNL': 'Project Planning',
            'category': 'planning',
            'icon': 'calendar',
            'color': 'blue'
        },
        'stakeholder_management': {
            'keywords': ['stakeholder', 'communication', 'sponsor', 'team', 'belanghebbende'],
            'name': 'Stakeholder Management',
            'nameNL': 'Stakeholder Management',
            'category': 'people',
            'icon': 'users',
            'color': 'purple'
        },
        'risk_management': {
            'keywords': ['risk', 'risico', 'uncertainty', 'mitigation', 'contingency'],
            'name': 'Risk Management',
            'nameNL': 'Risico Management',
            'category': 'risk',
            'icon': 'alert-triangle',
            'color': 'red'
        },
        'scope_management': {
            'keywords': ['scope', 'omvang', 'requirements', 'wbs', 'deliverable', 'change'],
            'name': 'Scope Management',
            'nameNL': 'Scope Management',
            'category': 'scope',
            'icon': 'target',
            'color': 'green'
        },
        'quality_management': {
            'keywords': ['quality', 'kwaliteit', 'standards', 'testing', 'criteria'],
            'name': 'Quality Management',
            'nameNL': 'Kwaliteitsmanagement',
            'category': 'quality',
            'icon': 'check-circle',
            'color': 'teal'
        },
        'cost_management': {
            'keywords': ['cost', 'budget', 'kosten', 'financ', 'roi', 'investment'],
            'name': 'Cost Management',
            'nameNL': 'Kostenbeheersing',
            'category': 'finance',
            'icon': 'dollar-sign',
            'color': 'yellow'
        },
        'agile_methods': {
            'keywords': ['agile', 'scrum', 'sprint', 'kanban', 'iterative', 'backlog'],
            'name': 'Agile Methods',
            'nameNL': 'Agile Methoden',
            'category': 'methodology',
            'icon': 'zap',
            'color': 'orange'
        },
        'leadership': {
            'keywords': ['leadership', 'leiderschap', 'motivation', 'team building', 'coach'],
            'name': 'Leadership',
            'nameNL': 'Leiderschap',
            'category': 'people',
            'icon': 'award',
            'color': 'indigo'
        }
    }
    
    # Business model templates
    BUSINESS_MODEL_TEMPLATES = {
        'canvas': {
            'type': 'business_model_canvas',
            'sections': [
                'key_partners', 'key_activities', 'key_resources',
                'value_propositions', 'customer_relationships', 'channels',
                'customer_segments', 'cost_structure', 'revenue_streams'
            ]
        },
        'swot': {
            'type': 'swot',
            'sections': ['strengths', 'weaknesses', 'opportunities', 'threats']
        },
        'stakeholder_matrix': {
            'type': 'power_interest_matrix',
            'quadrants': ['keep_satisfied', 'manage_closely', 'monitor', 'keep_informed']
        }
    }
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract relevant keywords from lesson content"""
        text_lower = text.lower()
        keywords = []
        
        # Extract from skill patterns
        for skill_id, skill_data in self.SKILL_PATTERNS.items():
            for keyword in skill_data['keywords']:
                if keyword in text_lower:
                    keywords.append(keyword)
        
        return list(set(keywords))
    
    def detect_skills(self, lesson_content: str) -> List[Dict[str, Any]]:
        """Auto-detect which skills this lesson teaches"""
        detected_skills = []
        text_lower = lesson_content.lower()
        
        for skill_id, skill_data in self.SKILL_PATTERNS.items():
            # Count keyword matches
            matches = sum(1 for kw in skill_data['keywords'] if kw in text_lower)
            
            if matches > 0:
                detected_skills.append({
                    'skill_id': skill_id,
                    'skill_name': skill_data['name'],
                    'skill_name_nl': skill_data['nameNL'],
                    'category': skill_data['category'],
                    'confidence': matches / len(skill_data['keywords']),
                    'points_awarded': matches * 10  # 10 points per keyword match
                })
        
        # Sort by confidence
        detected_skills.sort(key=lambda x: x['confidence'], reverse=True)
        return detected_skills
    
    def generate_business_model(self, lesson_content: str, model_type: str = 'canvas') -> Dict[str, Any]:
        """Generate business model based on lesson keywords"""
        keywords = self.extract_keywords(lesson_content)
        
        if model_type == 'canvas':
            return self._generate_canvas(keywords, lesson_content)
        elif model_type == 'swot':
            return self._generate_swot(keywords, lesson_content)
        elif model_type == 'stakeholder':
            return self._generate_stakeholder_matrix(keywords, lesson_content)
        
        return {}
    
    def _generate_canvas(self, keywords: List[str], content: str) -> Dict[str, Any]:
        """Generate Business Model Canvas"""
        canvas = {
            'type': 'business_model_canvas',
            'key_partners': [],
            'key_activities': [],
            'key_resources': [],
            'value_propositions': [],
            'customer_relationships': [],
            'channels': [],
            'customer_segments': [],
            'cost_structure': [],
            'revenue_streams': []
        }
        
        # AI-powered section filling based on keywords
        if any(kw in keywords for kw in ['stakeholder', 'sponsor', 'team']):
            canvas['key_partners'] = ['Project Sponsors', 'Team Members', 'Suppliers']
        
        if any(kw in keywords for kw in ['planning', 'schedule', 'deliverable']):
            canvas['key_activities'] = ['Project Planning', 'Resource Allocation', 'Progress Monitoring']
        
        if any(kw in keywords for kw in ['budget', 'cost', 'financ']):
            canvas['cost_structure'] = ['Labor Costs', 'Material Costs', 'Overhead']
            canvas['revenue_streams'] = ['Project Deliverables', 'Consulting Services']
        
        return canvas
    
    def _generate_swot(self, keywords: List[str], content: str) -> Dict[str, Any]:
        """Generate SWOT Analysis"""
        swot = {
            'type': 'swot',
            'strengths': [],
            'weaknesses': [],
            'opportunities': [],
            'threats': []
        }
        
        # Dynamic SWOT based on lesson focus
        if 'agile' in keywords:
            swot['strengths'] = ['Fast adaptation', 'Customer collaboration']
            swot['opportunities'] = ['Digital transformation', 'Continuous improvement']
        
        if 'risk' in keywords:
            swot['threats'] = ['Uncertain dependencies', 'Resource constraints']
            swot['strengths'] = ['Risk mitigation planning']
        
        return swot
    
    def _generate_stakeholder_matrix(self, keywords: List[str], content: str) -> Dict[str, Any]:
        """Generate Stakeholder Power/Interest Matrix"""
        matrix = {
            'type': 'power_interest_matrix',
            'keep_satisfied': [],
            'manage_closely': [],
            'monitor': [],
            'keep_informed': []
        }
        
        if 'sponsor' in keywords or 'executive' in keywords:
            matrix['manage_closely'] = ['Executive Sponsor', 'Steering Committee']
        
        if 'team' in keywords:
            matrix['keep_informed'] = ['Project Team', 'Subject Matter Experts']
        
        return matrix
    
    def generate_visual_data(self, lesson_content: str, visual_type: str) -> Dict[str, Any]:
        """Generate data for visualizations"""
        keywords = self.extract_keywords(lesson_content)
        
        visuals = {
            'charter': self._generate_charter_data,
            'timeline': self._generate_timeline_data,
            'gantt': self._generate_gantt_data,
            'risk_matrix': self._generate_risk_matrix_data,
            'wbs': self._generate_wbs_data,
        }
        
        if visual_type in visuals:
            return visuals[visual_type](keywords, lesson_content)
        
        return {}
    
    def _generate_charter_data(self, keywords: List[str], content: str) -> Dict[str, Any]:
        """Generate Project Charter visualization data"""
        return {
            'title': 'Project Charter',
            'success_criteria': [
                'Deliver on time',
                'Within budget',
                'Quality standards met',
                'Stakeholder satisfaction'
            ],
            'objectives': 'Based on lesson analysis',
            'scope': 'Auto-generated from keywords',
            'stakeholders': 'Identified stakeholders'
        }
    
    def _generate_timeline_data(self, keywords: List[str], content: str) -> Dict[str, Any]:
        """Generate Timeline data"""
        phases = ['Initiation', 'Planning', 'Execution', 'Monitoring', 'Closure']
        return {
            'phases': [{'name': p, 'duration': '4 weeks'} for p in phases]
        }
    
    def _generate_gantt_data(self, keywords: List[str], content: str) -> Dict[str, Any]:
        """Generate Gantt chart data"""
        return {
            'tasks': [
                {'name': 'Task 1', 'start': '2024-01-01', 'duration': 10},
                {'name': 'Task 2', 'start': '2024-01-11', 'duration': 15},
            ]
        }
    
    def _generate_risk_matrix_data(self, keywords: List[str], content: str) -> Dict[str, Any]:
        """Generate Risk Matrix data"""
        return {
            'risks': [
                {'name': 'Schedule Risk', 'probability': 'high', 'impact': 'high'},
                {'name': 'Resource Risk', 'probability': 'medium', 'impact': 'high'},
            ]
        }
    
    def _generate_wbs_data(self, keywords: List[str], content: str) -> Dict[str, Any]:
        """Generate WBS data"""
        return {
            'root': 'Project',
            'children': [
                {'name': 'Phase 1', 'children': [{'name': 'Task 1.1'}, {'name': 'Task 1.2'}]},
                {'name': 'Phase 2', 'children': [{'name': 'Task 2.1'}]},
            ]
        }


# Example usage
if __name__ == '__main__':
    generator = AIContentGenerator()
    
    # Example lesson content
    lesson_content = """
    This lesson covers stakeholder management and risk mitigation strategies.
    Learn how to identify stakeholders, assess their power and interest,
    and manage risks throughout the project lifecycle. Topics include
    communication planning, budget management, and quality control.
    """
    
    # Detect skills
    skills = generator.detect_skills(lesson_content)
    print("🎯 Detected Skills:")
    for skill in skills:
        print(f"  - {skill['skill_name']}: {skill['confidence']:.0%} confidence, {skill['points_awarded']} pts")
    
    # Generate business model
    canvas = generator.generate_business_model(lesson_content, 'canvas')
    print("\n📊 Generated Business Model Canvas:")
    print(json.dumps(canvas, indent=2))
    
    # Generate SWOT
    swot = generator.generate_business_model(lesson_content, 'swot')
    print("\n📈 Generated SWOT:")
    print(json.dumps(swot, indent=2))
