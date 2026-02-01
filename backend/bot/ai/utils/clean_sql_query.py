import re


def clean_sql_query(sql_query: str) -> str:
    """Clean up SQL query by removing code blocks and comments."""
    # Extract SQL query if wrapped in specific format
    if "SQLQuery:" in sql_query:
        sql_match = re.search(r"SQLQuery:\s*(.*?)(?:```|$)", sql_query, re.DOTALL)
        if sql_match:
            sql_query = sql_match.group(1).strip()

    # Remove code blocks
    sql_query = re.sub(r"```sql\s*(.*?)\s*```", r"\1", sql_query, flags=re.DOTALL)
    sql_query = re.sub(r"```\s*(.*?)\s*```", r"\1", sql_query, flags=re.DOTALL)

    # Remove comments
    sql_query = re.sub(r"--.*$", "", sql_query, flags=re.MULTILINE)
    sql_query = re.sub(r"/\*.*?\*/", "", sql_query, flags=re.DOTALL)

    # Ensure only SELECT queries are allowed
    if not sql_query.strip().upper().startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed")

    return sql_query.strip()
