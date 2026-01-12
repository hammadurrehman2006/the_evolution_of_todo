#!/bin/bash
export PYTHONPATH=$PYTHONPATH:$(pwd)/phase-3/backend
export DATABASE_URL="postgresql://user:pass@localhost/db"
export JWT_SECRET="secret"
pytest phase-3/backend/tests/unit/
