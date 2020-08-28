mkdir tmp
mkdir tmp/schema
mkdir tmp/app

APP_DIR="$PWD/tmp/app"
SCHEMA_DIR="$PWD/tmp/schema"

node schema-generator 10 "$PWD/tmp"

bash -c "node issuer $SCHEMA_DIR"
