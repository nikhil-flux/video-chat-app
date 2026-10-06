#!/bin/bash
# Do not add "set -x": it would print the registration token into the logs.
set -euo pipefail
exec > >(tee /var/log/runner-setup.log) 2>&1

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y docker.io curl jq tar
systemctl enable --now docker

useradd -m -s /bin/bash runner
usermod -aG docker runner

RUNNER_VERSION=$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest | jq -r .tag_name | sed 's/^v//')
mkdir -p /home/runner/actions-runner
cd /home/runner/actions-runner
curl -fsSL -o runner.tar.gz "https://github.com/actions/runner/releases/download/v$RUNNER_VERSION/actions-runner-linux-x64-$RUNNER_VERSION.tar.gz"
tar xzf runner.tar.gz
rm runner.tar.gz
chown -R runner:runner /home/runner/actions-runner

./bin/installdependencies.sh

sudo -u runner ./config.sh --unattended \
  --url "${repo_url}" \
  --token "${runner_token}" \
  --labels "${runner_labels}" \
  --name "ec2-$(hostname)" \
  --replace

./svc.sh install runner
./svc.sh start
echo "Runner setup finished"