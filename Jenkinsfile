
pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
        skipStagesAfterUnstable()
    }

    stages {

        // ============================================================
        // CHECKOUT
        // ============================================================
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
                    echo "=== Repository Checkout ==="
                    pwd
                    git rev-parse --short HEAD
                    echo "=== Checkout Completed ==="
                '''
            }
        }

        // ============================================================
        // INSTALL DEPENDENCIES
        // ============================================================
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

                    echo "=== Node and npm Versions ==="
                    node --version
                    npm --version

                    echo "=== Check Root Lockfile ==="
                    test -f package.json
                    test -f package-lock.json

                    echo "=== Install Root Dependencies ==="
                    npm ci

                    echo "=== Install Server Dependencies ==="
                    if [ -f server/package.json ]; then
                        if [ -f server/package-lock.json ]; then
                            npm --prefix server ci
                        else
                            echo "ERROR: server/package-lock.json not found"
                            exit 1
                        fi
                    fi

                    echo "=== Install Client Dependencies ==="
                    if [ -f client/package.json ]; then
                        if [ -f client/package-lock.json ]; then
                            npm --prefix client ci
                        else
                            echo "ERROR: client/package-lock.json not found"
                            exit 1
                        fi
                    fi

                    echo "=== Verify Vitest ==="
                    npm exec -- vitest --version

                    echo "=== Verify Coverage Provider ==="
                    node -e "console.log(require.resolve('@vitest/coverage-v8/package.json'))"

                    echo "=== Dependencies Installed Successfully ==="
                '''
            }
        }

        // ============================================================
        // TEST AND COVERAGE
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
                    set -eu

                    echo "=== Node Version ==="
                    node --version

                    echo "=== Verify Local Vitest ==="
                    npm exec -- vitest --version

                    echo "=== Verify Coverage Provider ==="
                    node -e "console.log(require.resolve('@vitest/coverage-v8/package.json'))"

                    echo "=== Running Root Tests with Coverage ==="
                    npm exec -- vitest run --coverage

                    echo "=== Root Tests Passed ==="

                    echo "=== Running Server Tests ==="
                    if [ -f server/package.json ]; then
                        npm --prefix server test
                    fi

                    echo "=== Running Client Tests ==="
                    if [ -f client/package.json ]; then
                        npm --prefix client test
                    fi

                    echo "=== All Configured Tests Passed ==="
                '''
            }

            post {
                always {
                    archiveArtifacts(
                        artifacts: 'coverage/**,server/coverage/**,client/coverage/**',
                        allowEmptyArchive: true,
                        fingerprint: false
                    )
                }
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
                    set -eu

                    mkdir -p .trivy-cache

                    echo "======================================"
                    echo "        TRIVY SECURITY SCAN"
                    echo "======================================"

                    trivy --version

                    trivy fs \
                        --cache-dir .trivy-cache \
                        --scanners vuln \
                        --severity HIGH,CRITICAL \
                        --format sarif \
                        --output trivy-results.sarif \
                        --exit-code 1 \
                        .

                    echo "=== Trivy Scan Completed ==="
                    ls -lh trivy-results.sarif
                '''
            }

            post {
                always {
                    recordIssues(
                        enabledForFailure: true,
                        failOnError: false,
                        tools: [
                            sarif(
                                id: 'trivy',
                                name: 'Trivy Security',
                                pattern: 'trivy-results.sarif'
                            )
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
                        set -eu

                        echo "=== SonarQube Analysis ==="
                        sonar-scanner
                        echo "=== SonarQube Analysis Completed ==="
                    '''
                }
            }
        }

        // ============================================================
        // QUALITY GATE
        // ============================================================
        stage('Quality Gate') {
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
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
                    set -eu

                    echo "======================================"
                    echo "       CREATING APPLICATION PACKAGE"
                    echo "======================================"

                    apk add --no-cache zip unzip

                    rm -f latest-app.zip

                    zip -r latest-app.zip . \
                        -x "node_modules/*" \
                        -x "server/node_modules/*" \
                        -x "client/node_modules/*" \
                        -x ".git/*" \
                        -x ".env" \
                        -x ".env.*" \
                        -x "coverage/*" \
                        -x "server/coverage/*" \
                        -x "client/coverage/*" \
                        -x ".trivy-cache/*" \
                        -x "latest-app.zip" \
                        -x "trivy-results.sarif"

                    echo "=== Application Package Created ==="
                    ls -lh latest-app.zip

                    echo "=== Verify ZIP ==="
                    unzip -t latest-app.zip
                '''
            }
        }

        // ============================================================
        // PUBLISH APPLICATION
        // ============================================================
        stage('Publish Application') {
            steps {
                archiveArtifacts(
                    artifacts: 'latest-app.zip',
                    fingerprint: true,
                    allowEmptyArchive: false
                )

                script {
                    def appName = env.JOB_NAME
                        .replaceAll('[^a-zA-Z0-9._-]', '-')
                        .replaceAll('-+', '-')
                        .replaceAll('^-|-$', '')

                    def buildId = env.BUILD_NUMBER

                    echo "Application Name: ${appName}"
                    echo "Build ID: ${buildId}"

                    sh """
                        set -eu

                        docker exec cicd-jenkins \
                            mkdir -p \
                            "/var/jenkins_home/userContent/applications/${appName}/${buildId}"

                        docker cp \
                            latest-app.zip \
                            "cicd-jenkins:/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"

                        docker exec cicd-jenkins \
                            ls -lh \
                            "/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"
                    """

                    def jenkinsBaseUrl = env.BUILD_URL
                        .substring(0, env.BUILD_URL.indexOf('/job/'))
                        .replace('localhost', 'host.docker.internal')

                    env.ARTIFACT_URL =
                        "${jenkinsBaseUrl}/userContent/applications/${appName}/${buildId}/latest-app.zip"

                    echo "=== APPLICATION PUBLISHED ==="
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
                    echo "=== START APPLICATION DEPLOYMENT ==="
                    echo "Artifact URL: ${env.ARTIFACT_URL}"

                    // Request redeployment.
                    def redeployResponse = sh(
                        script: '''
                            set -eu

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

                    echo "Redeploy Response:"
                    echo redeployResponse

                    // Poll deployment status.
                    def maxAttempts = 120
                    def attempt = 0
                    def deploymentStatus = 'IN_PROGRESS'

                    while (deploymentStatus == 'IN_PROGRESS') {
                        attempt++

                        if (attempt > maxAttempts) {
                            error(
                                "Deployment timeout after ${maxAttempts} attempts."
                            )
                        }

                        sleep time: 5, unit: 'SECONDS'

                        echo "=== Checking Deployment (${attempt}/${maxAttempts}) ==="

                        def progressResponse = sh(
                            script: '''
                                set -eu

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

                        echo "Progress Response:"
                        echo progressResponse

                        def json = readJSON text: progressResponse

                        deploymentStatus = json?.data?.status
                            ?.toString()
                            ?.toUpperCase()

                        if (!deploymentStatus) {
                            error(
                                "Response progress tidak memiliki data.status."
                            )
                        }

                        echo "Deployment Status: ${deploymentStatus}"

                        if (deploymentStatus == 'SUCCESS') {
                            echo "=== DEPLOYMENT SUCCESS ==="
                            break
                        }

                        if (deploymentStatus == 'FAIL') {
                            def deploymentLog =
                                json?.data?.log ?: 'Deployment failed tanpa log.'

                            echo "========== DEPLOYMENT LOG =========="
                            echo deploymentLog
                            echo "===================================="

                            error("Deployment gagal untuk website ${WEBSITE_ID}.")
                        }

                        if (deploymentStatus != 'IN_PROGRESS') {
                            error(
                                "Status deployment tidak dikenal: ${deploymentStatus}"
                            )
                        }
                    }

                    echo "=== DEPLOYMENT FINISHED ==="
                }
            }
        }
    }

    // ================================================================
    // POST ACTIONS
    // ================================================================
    post {
        always {
            archiveArtifacts(
                artifacts: 'trivy-results.sarif',
                allowEmptyArchive: true
            )
        }

        success {
            echo "=========================================="
            echo "       PIPELINE SUCCESS"
            echo "=========================================="
            echo "Result: ${currentBuild.currentResult}"
            echo "Artifact: ${env.ARTIFACT_URL ?: '(not published)'}"
            echo "Website berhasil dideploy."
        }

        failure {
            echo "=========================================="
            echo "       PIPELINE FAILED"
            echo "=========================================="
            echo "Result: ${currentBuild.currentResult}"
            echo "Periksa stage merah dan Console Output."
        }

        unstable {
            echo "=========================================="
            echo "       PIPELINE UNSTABLE"
            echo "=========================================="
            echo "Result: ${currentBuild.currentResult}"
        }
    }
}
