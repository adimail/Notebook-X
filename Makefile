build:
	@echo "Building frontend..."
	cd frontend && npm run build

run:
	python3 run.py

dev:
	@echo "Starting dev server"
	cd frontend && npm run dev
