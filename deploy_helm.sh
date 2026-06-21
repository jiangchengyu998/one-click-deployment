#!/bin/sh
set -eu

usage() {
  cat <<EOF
Usage: $0 <chart_path> <hostname> <app_name> <tag> <environment> [env_file]

Example:
  $0 ./cd one-click-deploy.ydphoto.com one-click-deploy 1.0.0 dev .env.development

The optional env_file is converted to a Kubernetes Secret and injected into the
Deployment through envFrom.
EOF
}

check_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$1 is required but not installed." >&2
    exit 1
  fi
}

escape_for_sed() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/&/\\&/g'
}

if [ "$#" -lt 5 ]; then
  usage
  exit 2
fi

chart_path="$1"
hostname="$2"
app_name="$3"
tag="$4"
environment="$5"
env_file="${6:-}"
secret_name="${app_name}-${environment}-env"

check_command helm
check_command kubectl

if [ ! -f "${chart_path}/values.yaml" ]; then
  echo "Cannot find ${chart_path}/values.yaml" >&2
  exit 3
fi

if [ -n "${env_file}" ]; then
  if [ ! -f "${env_file}" ]; then
    echo "Cannot find env file: ${env_file}" >&2
    exit 4
  fi

  echo "Applying environment Secret from ${env_file}: ${secret_name}"
  kubectl create secret generic "${secret_name}" \
    --from-env-file="${env_file}" \
    --dry-run=client \
    -o yaml | kubectl apply -f -
fi

tmpfile=$(mktemp /tmp/values.XXXXXX.yaml) || {
  echo "mktemp failed" >&2
  exit 5
}
trap 'rm -f "${tmpfile}"' EXIT

h_escaped=$(escape_for_sed "${hostname}")
app_escaped=$(escape_for_sed "${app_name}")
tag_escaped=$(escape_for_sed "${tag}")
env_escaped=$(escape_for_sed "${environment}")
secret_escaped=$(escape_for_sed "${secret_name}")

sed -e "s|HOSTNAME|${h_escaped}|g" \
    -e "s|APP-NAME|${app_escaped}|g" \
    -e "s|TAG|${tag_escaped}|g" \
    -e "s|ENVIRONMENT|${env_escaped}|g" \
    -e "s|ENV_SECRET_NAME|${secret_escaped}|g" \
    "${chart_path}/values.yaml" > "${tmpfile}"

echo "Deploying ${app_name} with Helm values: ${tmpfile}"
helm upgrade --install "${app_name}" "${chart_path}" \
  -f "${tmpfile}" \
  --rollback-on-failure \
  --wait \
  --timeout 180s

echo "Deployment completed: release=${app_name}, chart=${chart_path}, imageTag=${tag}"
