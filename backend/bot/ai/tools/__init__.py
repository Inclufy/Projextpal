from langchain.tools import Tool, StructuredTool
from typing import List, Dict, Callable
from functools import wraps
from pydantic import BaseModel, create_model
import inspect


class EmptyInput(BaseModel):
    """Empty input schema for tools that don't take arguments"""
    pass


class ToolRegistry:
    _tools: Dict[str, StructuredTool] = {}

    @classmethod
    def register_tool(cls, return_direct: bool = True):
        """Decorator to register a tool with the registry"""

        def decorator(func: Callable):
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)

            name = func.__name__
            description = func.__doc__ or f"Tool for {name}"

            sig = inspect.signature(func)

            if not sig.parameters:
                args_schema = EmptyInput
            else:
                fields = {}
                for param_name, param in sig.parameters.items():
                    param_type = param.annotation
                    if param_type == inspect.Parameter.empty:
                        param_type = str

                    has_default = param.default is not inspect.Parameter.empty
                    default_value = param.default if has_default else ...

                    if param_type == str:
                        fields[param_name] = (str, default_value)
                    elif param_type == int:
                        fields[param_name] = (int, default_value)
                    elif param_type == bool:
                        fields[param_name] = (bool, default_value)
                    elif param_type == float:
                        fields[param_name] = (float, default_value)
                    else:
                        fields[param_name] = (str, default_value)

                args_schema = create_model(f"{name}_input", **fields)

            tool = StructuredTool(
                name=name,
                description=description,
                func=wrapper,
                return_direct=return_direct,
                args_schema=args_schema,
            )

            cls._tools[name] = tool
            return wrapper

        return decorator

    @classmethod
    def get_tools(cls) -> List[Tool]:
        """Get all registered tools"""
        return list(cls._tools.values())

    @classmethod
    def get_tool(cls, name: str) -> Tool:
        """Get a specific tool by name"""
        return cls._tools.get(name)

    @classmethod
    def clear_tools(cls):
        """Clear all registered tools"""
        cls._tools.clear()


FORM_TOOLS_LIST = []


def form_tool(func):
    """Decorator to register a function in FORM_TOOLS_LIST."""
    FORM_TOOLS_LIST.append(func.__name__)
    return func


from . import (
    project_tools,
    task_tools,
    milestone_tools,
    project_task_tools,
    timeline_adjustment_tools,
    project_analysis_tools,
    program_tools,
)

import os

if os.environ.get("RUN_MAIN") == "true":
    print("\nRegistered Tools on Startup:")
    for i, tool in enumerate(ToolRegistry.get_tools()):
        print(f"{i+1}. {tool.name}")
    print("\n")
