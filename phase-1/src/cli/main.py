"""
Main CLI application for the Todo Console Application
Task ID: T007, T033
Specification section: FR-010 - text-based console interface
"""
import sys
import os
import logging
from typing import List

# Add the project root to the Python path to enable relative imports
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from src.services.task_service import TaskService
from src.repositories.persistent_task_repository import PersistentTaskRepository
from src.cli.commands import Commands

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """
    Main entry point for the todo console application
    """
    # Initialize the application components
    repository = PersistentTaskRepository()
    service = TaskService(repository)
    commands = Commands(service)

    logger.info("Todo Console Application started")
    print("Welcome to the Todo Console Application!")
    print("Type 'help' for available commands or 'exit' to quit.\n")

    while True:
        try:
            # Get user input
            user_input = input("todo> ").strip()
            logger.debug(f"User input: {user_input}")

            if not user_input:
                continue

            # Parse the command, handling quoted arguments
            import shlex
            try:
                parts = shlex.split(user_input)
                command = parts[0].lower() if parts else ""
                args = parts[1:] if len(parts) > 1 else []
            except ValueError:
                # If shlex fails due to unmatched quotes, fall back to simple split
                parts = user_input.split()
                command = parts[0].lower() if parts else ""
                args = parts[1:] if len(parts) > 1 else []

            # Execute the command
            if command in ['exit', 'quit']:
                logger.info("User requested exit")
                print("Goodbye!")
                break
            elif command == 'help':
                logger.info("Help command executed")
                commands.help_command()
            elif command == 'add':
                logger.info(f"Add command executed with args: {args}")
                commands.add_command(args)
            elif command == 'list':
                logger.info("List command executed")
                commands.list_command()
            elif command == 'complete':
                logger.info(f"Complete command executed with args: {args}")
                commands.complete_command(args)
            elif command == 'incomplete':
                logger.info(f"Incomplete command executed with args: {args}")
                commands.incomplete_command(args)
            elif command == 'update':
                logger.info(f"Update command executed with args: {args}")
                commands.update_command(args)
            elif command == 'delete':
                logger.info(f"Delete command executed with args: {args}")
                commands.delete_command(args)
            elif command == 'clear':
                logger.info("Clear screen command executed")
                commands.clear_command()
            elif command == 'clear_all':
                logger.info("Clear all tasks command executed")
                commands.clear_all_command()
            else:
                logger.warning(f"Unknown command: {command}")
                print(f"Unknown command: {command}. Type 'help' for available commands.")

        except KeyboardInterrupt:
            logger.info("Application interrupted by user")
            print("\nGoodbye!")
            break
        except EOFError:
            logger.info("End of input received")
            print("\nGoodbye!")
            break
        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()