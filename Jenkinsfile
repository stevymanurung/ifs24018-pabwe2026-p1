pipeline {

  agent any

  triggers {
    githubPush()
  }

  options {
    timestamps()
    skipDefaultCheckout(true)
    // Hentikan tahap berikutnya bila ada publisher yang menandai build UNSTABLE/FAILURE.
    skipStagesAfterUnstable()
    timeout(time: 60, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    CI = 'true'
  }

  stages {

    // ============================================================
    // CHECKOUT
    // ============================================================
    stage('Checkout') {
      agent {
        docker {
          image 'oven/bun:alpine'
          reuseNode true
        }
      }
      steps {
        checkout scm
      }
    }

    // ============================================================
    // INSTALL DEPENDENCIES
    // ============================================================
    stage('Install Dependencies') {
      parallel {
        stage('Front-end (Bun)') {
          agent {
            docker {
              image 'oven/bun:alpine'
              reuseNode true
            }
          }
          steps {
            dir('front-end') {
              sh '''
                set -e
                echo "=== Installing front-end dependencies ==="
                bun install --frozen-lockfile
              '''
            }
          }
        }
        stage('Back-end (npm)') {
          agent {
            docker {
              image 'node:24-alpine'
              reuseNode true
            }
          }
          steps {
            dir('back-end') {
              sh '''
                set -e
                echo "=== Installing back-end dependencies ==="
                npm ci --no-audit --no-fund
              '''
            }
          }
        }
      }
    }

    // ============================================================
    // TEST
    // ============================================================
    stage('Test') {
      agent {
        docker {
          image 'node:24-alpine'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -e
          echo "=== Running back-end tests with coverage ==="
          (cd back-end && npm run test:ci)

          echo "=== Running front-end tests with coverage ==="
          (cd front-end && npx vitest run --coverage --reporter=default --reporter=junit --outputFile.junit=reports/junit.xml)

          # Path di lcov relatif terhadap tiap sub-proyek; ubah agar relatif ke root untuk SonarQube.
          mkdir -p coverage
          sed 's#^SF:#SF:back-end/#' back-end/coverage/lcov.info > coverage/back-end.lcov
          sed 's#^SF:#SF:front-end/#' front-end/coverage/lcov.info > coverage/front-end.lcov
          echo "=== Tests Passed ==="
        '''
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'back-end/reports/junit.xml, front-end/reports/junit.xml'
        }
      }
    }

    // ============================================================
    // BUILD FRONT-END + SMOKE TEST
    // ============================================================
    stage('Build & Smoke Test') {
      agent {
        docker {
          image 'node:24-alpine'
          reuseNode true
        }
      }
      environment {
        NODE_ENV = 'production'
        PORT = '3999'
        JWT_SECRET = 'smoke-test-secret-yang-hanya-dipakai-di-jenkins-0123456789'
      }
      steps {
        sh '''
          set -e
          echo "=== Building front-end ==="
          (cd front-end && npm run build)
          # Penanda agar server Delcom tidak perlu mem-build ulang front-end (lihat scripts/build.mjs).
          touch front-end/dist/.prebuilt

          echo "=== Smoke test server produksi ==="
          cd back-end
          export DB_PATH="$PWD/data/smoke.db" STATIC_DIR="$PWD/../front-end/dist"
          rm -f data/smoke.db*
          node src/server.js > smoke.log 2>&1 &
          SERVER_PID=$!
          trap "kill $SERVER_PID" EXIT
          node -e '
            const url = "http://localhost:3999";
            const wait = (ms) => new Promise((r) => setTimeout(r, ms));
            (async () => {
              for (let i = 0; i < 20; i += 1) {
                try {
                  const health = await (await fetch(url + "/api/health")).json();
                  const page = await (await fetch(url + "/")).text();
                  if (health.data.status !== "ok" || !page.includes("id=\\"root\\"")) throw new Error("respon tidak sesuai");
                  console.log("Smoke test OK:", JSON.stringify(health.data));
                  return;
                } catch (error) {
                  await wait(1000);
                }
              }
              console.error("Smoke test gagal");
              process.exit(1);
            })();
          '
        '''
      }
    }

    // ============================================================
    // TRIVY SECURITY SCAN
    // ============================================================
    stage('Trivy Security Scan') {
      agent {
        docker {
          image 'aquasec/trivy:0.74.0'
          reuseNode true
          args '''
            --entrypoint=""
            -e HOME=/tmp
            -e XDG_CACHE_HOME=/tmp/.cache
          '''
        }
      }
      steps {
        sh '''
          set -e
          mkdir -p .trivy-cache || true

          echo "=== Trivy Version ==="
          trivy --version

          echo "=== Trivy Scan ==="
          trivy fs \
            --cache-dir .trivy-cache \
            --scanners vuln \
            --severity HIGH,CRITICAL \
            --format sarif \
            --output trivy-results.sarif \
            --exit-code 1 \
            .

          ls -lh trivy-results.sarif
        '''
      }
      post {
        always {
          // failOnError false: kegagalan karena HIGH/CRITICAL berasal dari trivy --exit-code 1.
          recordIssues(
            enabledForFailure: true,
            failOnError: false,
            tools: [
              sarif(id: 'trivy', name: 'Trivy Security', pattern: 'trivy-results.sarif')
            ]
          )
        }
      }
    }

    // ============================================================
    // SONARQUBE ANALYSIS
    // ============================================================
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
            set -e
            echo "=== SonarQube Analysis ==="
            sonar-scanner
          '''
        }
      }
    }

    // ============================================================
    // QUALITY GATE
    // ============================================================
    stage('Quality Gate') {
      steps {
        script {
          // waitForQualityGate memeriksa status task SonarQube saat dipanggil, lalu menunggu webhook.
          // Jika webhook SonarQube -> Jenkins belum terpasang, langkah itu menunggu tanpa akhir, jadi
          // status diperiksa ulang setiap 30 detik (maks. 10 menit) tanpa bergantung pada webhook.
          def qualityGate = null
          for (int attempt = 1; attempt <= 20 && qualityGate == null; attempt++) {
            try {
              timeout(time: 30, unit: 'SECONDS') {
                qualityGate = waitForQualityGate(abortPipeline: false)
              }
            } catch (org.jenkinsci.plugins.workflow.steps.FlowInterruptedException e) {
              echo "Analisis SonarQube belum selesai, cek ulang (${attempt}/20)..."
            }
          }
          if (qualityGate == null) {
            error('Quality Gate tidak selesai dalam 10 menit. Periksa Background Tasks proyek di SonarQube.')
          }
          echo "Quality Gate: ${qualityGate.status}"
          if (qualityGate.status != 'OK') {
            error("Quality Gate gagal (${qualityGate.status}). Lihat detail di SonarQube.")
          }
        }
      }
    }

    // ============================================================
    // PACKAGE APPLICATION
    // ============================================================
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
          set -e
          apk add --no-cache zip unzip
          rm -f latest-app.zip

          # Kode sumber + hasil build front-end (front-end/dist). Dependensi dipasang di server.
          zip -r latest-app.zip . \
            -x "node_modules/*" -x "*/node_modules/*" \
            -x ".git/*" \
            -x ".env" -x ".env.*" -x "*/.env" -x "*/.env.*" \
            -x "coverage/*" -x "*/coverage/*" \
            -x "*/reports/*" \
            -x "back-end/data/*" -x "back-end/smoke.log" \
            -x ".trivy-cache/*" -x ".scannerwork/*" \
            -x "latest-app.zip" -x "trivy-results.sarif" \
            -x "dokumentasi/*"

          ls -lh latest-app.zip
          unzip -l latest-app.zip | tail -1
        '''
      }
    }

    // ============================================================
    // PUBLISH APPLICATION
    // ============================================================
    stage('Publish Application') {
      steps {
        archiveArtifacts(artifacts: 'latest-app.zip', fingerprint: true, allowEmptyArchive: false)

        script {
          def appName = env.JOB_NAME
            .replaceAll('[^a-zA-Z0-9._-]', '-')
            .replaceAll('-+', '-')
            .replaceAll('^-|-$', '')
          def buildId = env.BUILD_NUMBER

          echo "Application Name: ${appName}"
          echo "Build ID: ${buildId}"

          sh """
            set -e
            docker exec cicd-jenkins mkdir -p "/var/jenkins_home/userContent/applications/${appName}/${buildId}"
            docker cp latest-app.zip "cicd-jenkins:/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"
            docker exec cicd-jenkins ls -lh "/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"
          """

          def jenkinsBaseUrl = env.BUILD_URL
            .substring(0, env.BUILD_URL.indexOf('/job/'))
            .replace('localhost', 'host.docker.internal')

          env.ARTIFACT_URL = "${jenkinsBaseUrl}/userContent/applications/${appName}/${buildId}/latest-app.zip"
          echo "Artifact URL: ${env.ARTIFACT_URL}"
        }
      }
    }

    // ============================================================
    // DEPLOY APPLICATION
    // ============================================================
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
          echo "Artifact URL: ${env.ARTIFACT_URL}"

          // 1. Request redeployment
          def redeployResponse = sh(
            script: '''
              set -e
              curl -sS --fail-with-body \
                -X POST "$URL_REDEPLOY" \
                -H "Content-Type: application/json" \
                -d "{
                  \\"token_access\\": \\"$DEPLOY_TOKEN\\",
                  \\"website_id\\": \\"$WEBSITE_ID\\",
                  \\"source_url\\": \\"$ARTIFACT_URL\\",
                  \\"source_type\\": \\"jenkins\\"
                }"
            ''',
            returnStdout: true
          ).trim()
          echo "Redeploy Response: ${redeployResponse}"

          // 2. Polling deployment progress
          def maxAttempts = 120
          def attempt = 0
          def deploymentStatus = 'IN_PROGRESS'

          while (deploymentStatus == 'IN_PROGRESS') {
            attempt++
            if (attempt > maxAttempts) {
              error("Deployment timeout. Status masih IN_PROGRESS setelah ${maxAttempts} attempts.")
            }
            sleep time: 5, unit: 'SECONDS'
            echo "=== Checking Deployment Progress (${attempt}/${maxAttempts}) ==="

            def progressResponse = sh(
              script: '''
                set -e
                curl -sS --fail-with-body \
                  -X POST "$URL_PROGRESS" \
                  -H "Content-Type: application/json" \
                  -d "{
                    \\"token_access\\": \\"$DEPLOY_TOKEN\\",
                    \\"website_id\\": \\"$WEBSITE_ID\\"
                  }"
              ''',
              returnStdout: true
            ).trim()
            echo "Progress Response: ${progressResponse}"

            def json = readJSON text: progressResponse
            deploymentStatus = json?.data?.status?.toString()?.toUpperCase()
            if (!deploymentStatus) {
              error('Response progress tidak memiliki data.status')
            }
            echo "Deployment Status: ${deploymentStatus}"

            if (deploymentStatus == 'SUCCESS') {
              echo '✅ DEPLOYMENT SUCCESS'
              break
            }
            if (deploymentStatus == 'FAIL') {
              echo "========== DEPLOYMENT LOG ==========\n${json?.data?.log ?: 'Deployment failed tanpa log.'}"
              error("Deployment gagal untuk website ${WEBSITE_ID}")
            }
            echo 'Deployment masih berjalan...'
          }
        }
      }
    }

    // ============================================================
    // VERIFY DEPLOYMENT (opsional: isi APP_URL di Properties Content)
    // ============================================================
    stage('Verify Deployment') {
      when {
        expression { return env.APP_URL?.trim() }
      }
      agent {
        docker {
          image 'curlimages/curl:8.15.0'
          reuseNode true
        }
      }
      steps {
        sh '''
          for i in $(seq 1 30); do
            if curl -fsS "$APP_URL/api/health" | grep '"status":"ok"'; then
              echo "Deployment terverifikasi: $APP_URL"
              exit 0
            fi
            sleep 10
          done
          echo "Health check $APP_URL gagal" >&2
          exit 1
        '''
      }
    }
  }

  // ================================================================
  // POST ACTIONS
  // ================================================================
  post {
    always {
      archiveArtifacts(
        artifacts: 'trivy-results.sarif, back-end/coverage/**, front-end/coverage/**, back-end/smoke.log',
        allowEmptyArchive: true
      )
    }
    success {
      echo "✅ PIPELINE SUCCESS — Result: ${currentBuild.currentResult}"
      echo "📦 Artifact: ${env.ARTIFACT_URL ?: '(not published)'}"
      echo '🚀 Website berhasil dideploy.'
    }
    failure {
      echo "❌ PIPELINE FAILED — Result: ${currentBuild.currentResult}"
      echo 'Periksa log stage yang merah / Console Output untuk penyebab gagal.'
    }
    unstable {
      echo "⚠️ PIPELINE UNSTABLE — Result: ${currentBuild.currentResult}"
    }
  }
}
