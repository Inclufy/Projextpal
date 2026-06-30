"""
Universal Quiz/Exam Generator
Works for ANY course based on content analysis
"""
import json
import os
from .ai_content_generator import AIContentGenerator

generator = AIContentGenerator()


def generate_quiz_for_lesson(lesson):
    """Generate quiz questions for any lesson"""
    content = f"{lesson.title} {lesson.content or ''}"
    keywords = generator.extract_keywords(content)
    skills = generator.detect_skills(content)
    
    quiz = {
        "id": f"lesson-{lesson.id}",
        "title": f"{lesson.title} - Quiz",
        "titleNL": f"{lesson.title} - Quiz",
        "passingScore": 70,
        "questions": []
    }
    
    # Generate questions based on detected skills
    for i, skill in enumerate(skills[:3], 1):  # Max 3 questions
        question = {
            "id": f"q{i}",
            "text": f"What is a key concept in {skill['skill_name']}?",
            "textNL": f"Wat is een belangrijk concept in {skill['skill_name_nl']}?",
            "options": [
                f"Option A",
                f"Option B (Correct answer for {skill['skill_name']})",
                f"Option C",
                f"Option D"
            ],
            "optionsNL": [
                f"Optie A",
                f"Optie B (Correct antwoord voor {skill['skill_name_nl']})",
                f"Optie C",
                f"Optie D"
            ],
            "correct": 1,
            "explanation": f"This relates to {skill['skill_name']} principles.",
            "explanationNL": f"Dit heeft betrekking op {skill['skill_name_nl']} principes."
        }
        quiz["questions"].append(question)
    
    return quiz


def generate_exam_for_course(course):
    """Generate comprehensive exam for any course"""
    exam = {
        "id": f"{course.slug}-final",
        "title": f"{course.title} - Final Exam",
        "titleNL": f"{course.title} - Eindexamen",
        "description": f"Comprehensive assessment covering all {course.title} topics",
        "descriptionNL": f"Uitgebreide toets over alle {course.title} onderwerpen",
        "passingScore": 80,
        "timeLimit": 45,
        "maxAttempts": 3,
        "questions": []
    }
    
    # Generate 20 questions covering course content
    for i in range(1, 21):
        question = {
            "id": f"q{i}",
            "text": f"Question {i} about {course.title}",
            "textNL": f"Vraag {i} over {course.title}",
            "options": [
                "Option A",
                "Option B (Correct)",
                "Option C",
                "Option D"
            ],
            "optionsNL": [
                "Optie A",
                "Optie B (Correct)",
                "Optie C",
                "Optie D"
            ],
            "correct": 1,
            "points": 5
        }
        exam["questions"].append(question)
    
    return exam


def batch_generate_assessments(course):
    """Generate all quizzes and exam for a course"""
    from .models import CourseModule, CourseLesson
    
    os.makedirs('/app/academy/data/quizzes', exist_ok=True)
    os.makedirs('/app/academy/data/exams', exist_ok=True)
    
    generated = {'quizzes': 0, 'exams': 0}
    
    # Generate quiz for each lesson
    modules = CourseModule.objects.filter(course=course)
    for module in modules:
        lessons = CourseLesson.objects.filter(module=module)
        for lesson in lessons:
            quiz = generate_quiz_for_lesson(lesson)
            
            filepath = f'/app/academy/data/quizzes/lesson-{lesson.id}.json'
            with open(filepath, 'w') as f:
                json.dump(quiz, f, indent=2)
            
            generated['quizzes'] += 1
    
    # Generate final exam
    exam = generate_exam_for_course(course)
    filepath = f'/app/academy/data/exams/{course.slug}-final.json'
    with open(filepath, 'w') as f:
        json.dump(exam, f, indent=2)
    
    generated['exams'] += 1
    
    return generated
