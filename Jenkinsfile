pipeline {
  agent any

  triggers { githubPush() }

  options {
    timestamps()
    skipDefaultCheckout(true)
    skipStagesAfterUnstable()
    timeout(time: 60, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
    disableConcurrentBuilds()
  }

  environment {
    CI = 'true'
    APP_PORT = '3001'
    HEALTH_URL = 'http://localhost:3001/api/health'
  }

  stages {
    stage('Checkout') {
      agent {
        docker {
          image 'node:24-alpine'
          reuseNode true
        }
      }
      steps {
        checkout scm
        sh '''
          set -eu
          echo "=== Checkout completed ==="
          pwd
          test -f package.json
          test -f package-lock.json
          test -f server/package.json
          test -f server/package-lock.json
          test -f client/package.json
          test -f client/package-lock.json
          echo "Root, server and client manifests found."
        '''
      }
    }

    stage('Install Dependencies') {
      agent {
        docker {
          image 'node:24-alpine'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -eu
          node --version
          npm --version
          echo "=== Install root dependencies ==="
          npm ci --no-audit --no-fund
          echo "=== Install Express/SQLite backend ==="
          npm --prefix server ci --no-audit --no-fund
          echo "=== Install React frontend ==="
          npm --prefix client ci --no-audit --no-fund
        '''
      }
    }

    stage('Lint') {
      agent {
        docker {
          image 'node:24-alpine'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -eu
          npm --prefix client run lint
        '''
      }
    }

    stage('Test') {
      agent {
        docker {
          image 'node:24-alpine'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -eu
          mkdir -p server/reports client/reports
          echo "=== Backend tests (Node test runner) ==="
          npm --prefix server run test:ci
          echo "=== Frontend tests (Vitest) ==="
          npm --prefix client run test:ci
          echo "=== Tests completed ==="
        '''
      }
      post {
        always {
          junit allowEmptyResults: true,
            testResults: 'server/reports/junit.xml,client/reports/junit.xml'
          archiveArtifacts allowEmptyArchive: true,
            artifacts: 'server/coverage/**,client/coverage/**,server/reports/**,client/reports/**'
        }
      }
    }

    stage('Build') {
      agent {
        docker {
          image 'node:24-alpine'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -eu
          npm --prefix client run build
          test -f client/dist/index.html
          echo "Frontend build completed."
        '''
      }
    }

    stage('Smoke Test') {
      agent {
        docker {
          image 'node:24-alpine'
          reuseNode true
        }
      }
      environment {
        NODE_ENV = 'production'
        PORT = '3999'
        JWT_SECRET = 'jenkins-smoke-test-secret-only-not-for-production-0123456789'
      }
      steps {
        sh '''
          set -eu
          mkdir -p server/data
          rm -f server/data/jenkins-smoke.db server/data/jenkins-smoke.db-*
          cd server
          export DB_FILE="$PWD/data/jenkins-smoke.db"
          export CLIENT_DIST="$WORKSPACE/client/dist"
          node src/index.js > "$WORKSPACE/server/smoke.log" 2>&1 &
          SERVER_PID=$!
          trap 'kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true' EXIT
          node --input-type=module <<'NODE'
          const base = 'http://127.0.0.1:3999';
          const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
          for (let attempt = 1; attempt <= 30; attempt += 1) {
            try {
              const healthResponse = await fetch(`${base}/api/health`);
              if (!healthResponse.ok) throw new Error(`health HTTP ${healthResponse.status}`);
              const health = await healthResponse.json();
              const pageResponse = await fetch(base);
              if (!pageResponse.ok) throw new Error(`page HTTP ${pageResponse.status}`);
              const page = await pageResponse.text();
              if (health?.status !== 'ok') throw new Error('health response is not ok');
              if (!page.includes('id="root"')) throw new Error('frontend root element missing');
              console.log('Smoke test passed:', JSON.stringify(health.data));
              process.exit(0);
            } catch (error) {
              if (attempt === 30) {
                console.error('Smoke test failed:', error.message);
                process.exit(1);
              }
              await pause(1000);
            }
          }
          NODE
        '''
      }
      post {
        always {
          archiveArtifacts allowEmptyArchive: true, artifacts: 'server/smoke.log'
        }
      }
    }

    stage('Trivy Security Scan') {
      agent {
        docker {
          image 'aquasec/trivy:0.74.0'
          reuseNode true
          args '--entrypoint="" -e HOME=/tmp -e XDG_CACHE_HOME=/tmp/.cache'
        }
      }
      steps {
        sh '''
          set -eu
          mkdir -p .trivy-cache
          trivy --version
          trivy fs \
            --cache-dir .trivy-cache \
            --scanners vuln \
            --severity HIGH,CRITICAL \
            --format sarif \
            --output trivy-results.sarif \
            --exit-code 1 \
            .
          test -s trivy-results.sarif
        '''
      }
      post {
        always {
          recordIssues(
            enabledForFailure: true,
            failOnError: false,
            tools: [sarif(id: 'trivy', name: 'Trivy Security', pattern: 'trivy-results.sarif')]
          )
        }
      }
    }

    stage('SonarQube Analysis') {
      agent {
        docker {
          image 'sonarsource/sonar-scanner-cli:latest'
          reuseNode true
          args '--network cicd-network'
        }
      }
      steps {
        withSonarQubeEnv('SonarQube') {
          sh '''
            set -eu
            sonar-scanner
          '''
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Package Application') {
      agent {
        docker {
          image 'node:24-alpine'
          reuseNode true
          args '-u root'
        }
      }
      steps {
        sh '''
          set -eu
          apk add --no-cache zip unzip
          rm -f latest-app.zip
          zip -r latest-app.zip . \
            -x 'node_modules/*' -x '*/node_modules/*' \
            -x '.git/*' \
            -x '.env' -x '.env.*' -x '*/.env' -x '*/.env.*' \
            -x 'coverage/*' -x '*/coverage/*' \
            -x '*/reports/*' \
            -x 'server/data/*' -x 'server/smoke.log' \
            -x '.trivy-cache/*' -x '.scannerwork/*' \
            -x 'latest-app.zip' -x 'trivy-results.sarif' \
            -x 'docs/*'
          unzip -t latest-app.zip
          ls -lh latest-app.zip
        '''
      }
    }

    stage('Publish Application') {
      steps {
        archiveArtifacts artifacts: 'latest-app.zip', fingerprint: true, allowEmptyArchive: false
        script {
          def appName = env.JOB_NAME
            .replaceAll('[^a-zA-Z0-9._-]', '-')
            .replaceAll('-+', '-')
            .replaceAll('^-|-$', '')
          def buildId = env.BUILD_NUMBER
          sh """
            set -eu
            docker exec cicd-jenkins mkdir -p "/var/jenkins_home/userContent/applications/${appName}/${buildId}"
            docker cp latest-app.zip "cicd-jenkins:/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"
            docker exec cicd-jenkins ls -lh "/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"
          """
          def marker = env.BUILD_URL.indexOf('/job/')
          if (marker < 0) error('BUILD_URL tidak memiliki segmen /job/.')
          def jenkinsBaseUrl = env.BUILD_URL.substring(0, marker).replace('localhost', 'host.docker.internal')
          env.ARTIFACT_URL = "${jenkinsBaseUrl}/userContent/applications/${appName}/${buildId}/latest-app.zip"
          echo "Artifact URL: ${env.ARTIFACT_URL}"
        }
      }
    }

    stage('Deploy Application') {
      agent {
        docker {
          image 'curlimages/curl:8.15.0'
          reuseNode true
          args '--network cicd-network'
        }
      }
      steps {
        script {
          def redeployResponse = sh(
            script: '''
              set -eu
              : "${URL_REDEPLOY:?URL_REDEPLOY belum dikonfigurasi}"
              : "${DEPLOY_TOKEN:?DEPLOY_TOKEN belum dikonfigurasi}"
              : "${WEBSITE_ID:?WEBSITE_ID belum dikonfigurasi}"
              : "${ARTIFACT_URL:?ARTIFACT_URL belum tersedia}"
              curl -sS --fail-with-body -X POST "$URL_REDEPLOY" \\
                -H 'Content-Type: application/json' \\
                -d "{\\"token_access\\":\\"$DEPLOY_TOKEN\\",\\"website_id\\":\\"$WEBSITE_ID\\",\\"source_url\\":\\"$ARTIFACT_URL\\",\\"source_type\\":\\"jenkins\\"}"
            ''',
            returnStdout: true
          ).trim()
          echo "Redeploy response: ${redeployResponse}"

          def maxAttempts = 120
          def status = 'IN_PROGRESS'
          for (int attempt = 1; attempt <= maxAttempts && status == 'IN_PROGRESS'; attempt++) {
            sleep time: 5, unit: 'SECONDS'
            def response = sh(
              script: '''
                set -eu
                curl -sS --fail-with-body -X POST "$URL_PROGRESS" \\
                  -H 'Content-Type: application/json' \\
                  -d "{\\"token_access\\":\\"$DEPLOY_TOKEN\\",\\"website_id\\":\\"$WEBSITE_ID\\"}"
              ''',
              returnStdout: true
            ).trim()
            def json = readJSON text: response
            status = json?.data?.status?.toString()?.toUpperCase()
            if (!status) error('Response progress tidak memiliki data.status.')
            echo "Deployment status (${attempt}/${maxAttempts}): ${status}"
            if (status == 'FAIL') {
              error("Deployment gagal: ${json?.data?.log ?: 'log tidak tersedia'}")
            }
            if (status != 'SUCCESS' && status != 'IN_PROGRESS') {
              error("Status deployment tidak dikenal: ${status}")
            }
          }
          if (status != 'SUCCESS') error('Deployment timeout setelah 120 percobaan.')
          echo 'Deployment berhasil.'
        }
      }
    }

    stage('Verify Deployment') {
      when { expression { return env.APP_URL?.trim() } }
      agent {
        docker {
          image 'curlimages/curl:8.15.0'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -eu
          for i in $(seq 1 30); do
            if curl -fsS "$APP_URL/api/health" | grep -q '"status":"ok"'; then
              echo "Deployment terverifikasi: $APP_URL"
              exit 0
            fi
            echo "Menunggu health check ($i/30)..."
            sleep 10
          done
          echo "Health check gagal: $APP_URL" >&2
          exit 1
        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts allowEmptyArchive: true,
        artifacts: 'trivy-results.sarif,server/reports/**,client/reports/**,server/smoke.log'
    }
    success {
      echo "PIPELINE SUCCESS — ${currentBuild.currentResult}"
      echo "Artifact: ${env.ARTIFACT_URL ?: '(belum dipublikasikan)'}"
    }
    failure {
      echo "PIPELINE FAILED — ${currentBuild.currentResult}. Periksa stage merah dan Console Output."
    }
    unstable {
      echo "PIPELINE UNSTABLE — ${currentBuild.currentResult}"
    }
  }
}
