import argparse
import signal
import tornado.ioloop
import asyncio
import logging
from server import make_app

LOG_FILE = "notebookx.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(LOG_FILE, mode="w"),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger(__name__)

INTRO = """
  _   _    ___    _____   _____   ____     ___     ___    _  __   __  __
 | \ | |  / _ \  |_   _| | ____| | __ )   / _ \   / _ \  | |/ /   \ \/ /
 |  \| | | | | |   | |   |  _|   |  _ \  | | | | | | | | | ' /     \  /
 | |\  | | |_| |   | |   | |___  | |_) | | |_| | | |_| | | . \     /  \\
 |_| \_|  \___/    |_|   |_____| |____/   \___/   \___/  |_|\_\   /_/\_\\

"""


def print_help():
    """Prints usage information for Notebook-X."""
    help_text = """
Notebook-X: A lightweight Python notebook.

Usage:
  notebookx [options]

Options:
  --help, -h      Show this help message and exit.

About Notebook-X:
  - Notebook-X is a Jupyter Notebook clone that allows you to write and execute Python code in interactive cells.
  - It provides a browser-based interface with support for Markdown, code execution, and kernel management.
  - Use Notebook-X for data analysis, visualization, and computational experiments.

Getting Started:
  1. Start the server: Run `notebookx` in your terminal.
  2. Open http://localhost:8197 in your browser.
  3. Create a new notebook and add code cells to execute Python commands.

Shortcuts:
  - Shift + Enter: Execute the current cell.
  - Ctrl + Enter: Execute the current cell and keep it selected.
  - Esc + M: Convert a code cell to a Markdown cell.
  - Esc + Y: Convert a Markdown cell to a code cell.

For more details, visit: https://adimail.github.io/notebook-x
    """
    print(help_text)


def parse_arguments():
    """Parses command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Notebook-X: A lightweight Python notebook.",
        add_help=False,  # Disable default help message to use our custom function
    )
    parser.add_argument(
        "--help", "-h", action="store_true", help="Show this help message and exit."
    )

    args = parser.parse_args()

    if args.help:
        print_help()
        exit(0)

    return args


def shutdown(loop, kernel_manager):
    """Shutdown the server and all running kernels."""
    logger.info("Shutting down Notebook X server...")

    active_kernels = list(kernel_manager.kernels.keys())
    for kernel_id in active_kernels:
        logger.info(f"Shutting down kernel {kernel_id}")
        kernel_manager.shutdown_kernel(kernel_id)

    loop.stop()


def start_server():
    """Initializes and starts the Notebook-X server."""
    app = make_app()
    app.listen(8197)

    logger.info("\n" + INTRO)
    logger.info("Notebook-X is running at http://localhost:8197")

    loop = asyncio.get_event_loop()

    kernel_manager = app.settings["kernel_manager"]

    signal.signal(signal.SIGINT, lambda sig, frame: shutdown(loop, kernel_manager))
    signal.signal(signal.SIGTERM, lambda sig, frame: shutdown(loop, kernel_manager))

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        shutdown(loop, kernel_manager)


def main():
    parse_arguments()
    start_server()


if __name__ == "__main__":
    main()
