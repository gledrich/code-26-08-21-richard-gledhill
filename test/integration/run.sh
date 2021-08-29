function cleanup() {
  echo 'cleaning up docker containers'
  docker-compose -f docker-compose.yaml down -v --remove-orphans
}

function run() {
  echo 'building docker containers'
  docker-compose -f docker-compose.yaml up --build --force-recreate --renew-anon-volumes --abort-on-container-exit --always-recreate-deps
}

trap cleanup EXIT
run