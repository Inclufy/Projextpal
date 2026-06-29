#!/usr/bin/env python3
import os
import re
import psycopg2

conn = psycopg2.connect(
    host=os.environ.get("DB_HOST", "localhost"),
    port=os.environ.get("DB_PORT", "5432"),
    database=os.environ.get("DB_NAME", "projextpal"),
    user=os.environ.get("DB_USER", "projextpal"),
    password=os.environ["DB_PASSWORD"],
)

def parse_ts_file(filepath):
    """Parse TypeScript file - extract lessons in order"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lessons = []
    
    # Match lessons with transcript
    pattern = r"id:\s*['\"]([^'\"]+)['\"],[\s\S]*?title:\s*['\"]([^'\"]+)['\"],[\s\S]*?transcript:\s*`([^`]+)`"
    
    matches = re.finditer(pattern, content)
    
    for match in matches:
        lesson_id = match.group(1)
        title = match.group(2)
        transcript = match.group(3).strip()
        if transcript and len(transcript) > 100:
            lessons.append({
                'id': lesson_id,
                'title': title,
                'content': transcript
            })
    
    return lessons

def update_lessons_by_order(course_title, lessons):
    """Update lessons by matching order within course"""
    cursor = conn.cursor()
    
    # Get all lessons from this course in order
    query = """
    SELECT l.id, l.title, l.order, m.order as module_order
    FROM academy_courselesson l
    JOIN academy_coursemodule m ON l.module_id = m.id
    JOIN academy_course c ON m.course_id = c.id
    WHERE c.title = %s
    ORDER BY m.order, l.order;
    """
    
    cursor.execute(query, (course_title,))
    db_lessons = cursor.fetchall()
    
    print(f"Database has {len(db_lessons)} lessons")
    print(f"Frontend has {len(lessons)} lessons with content\n")
    
    updated = 0
    for i, (db_id, db_title, lesson_order, module_order) in enumerate(db_lessons):
        if i < len(lessons):
            frontend_lesson = lessons[i]
            
            # Update content
            update_query = "UPDATE academy_courselesson SET content = %s WHERE id = %s RETURNING title;"
            cursor.execute(update_query, (frontend_lesson['content'], db_id))
            result = cursor.fetchone()
            conn.commit()
            
            if result:
                print(f"✅ {i+1}. {result[0]}")
                print(f"   Content: {len(frontend_lesson['content'])} chars")
                updated += 1
        else:
            print(f"⚠️  No content for: {db_title}")
    
    return updated

print("=== IMPORTING PM FUNDAMENTALS ===\n")

lessons = parse_ts_file('frontend/src/data/academy/courses/pm-fundamentals.ts')

updated = update_lessons_by_order('Project Management Fundamentals', lessons)

print(f"\n=== SUMMARY ===")
print(f"Updated: {updated} lessons")

conn.close()
