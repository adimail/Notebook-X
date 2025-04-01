import argparse
import signal
import tornado.ioloop
import asyncio
import logging
from server import make_app
from server.src.utils.help import print_help, INTRO
from server.logger import logger


def parse_arguments():
    """Parses command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Notebook-X: A lightweight Python notebook.",
        add_help=False,
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
