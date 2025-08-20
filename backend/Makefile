# Makefile for common development tasks

.PHONY: test test-unit test-integration test-watch coverage lint format run celery

# Run all tests
test:
	PYTHONPATH=. pytest

# Run only unit tests (fast)
test-unit:
	PYTHONPATH=. pytest -m unit

# Run integration tests
test-integration:
	PYTHONPATH=. pytest -m integration

# Run tests in watch mode (re-run on file changes)
test-watch:
	PYTHONPATH=. pytest-watch

# Generate coverage report
coverage:
	PYTHONPATH=. pytest --cov=. --cov-report=html
	open htmlcov/index.html

# Lint code
lint:
	ruff check .
	mypy .

# Format code
format:
	black .
	isort .

# Run development server
run:
	uvicorn main:app --reload --port 8000

# Run Celery worker
celery:
	celery -A celery_app worker --loglevel=info

# Run both server and Celery
dev:
	honcho start