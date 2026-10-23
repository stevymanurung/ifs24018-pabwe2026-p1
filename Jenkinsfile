// Pipeline CI/CD Study Planner: install -> lint -> test -> build -> deploy (Docker) -> smoke test.
// Prasyarat Jenkins: plugin NodeJS (instalasi bernama "node-22"), JUnit, serta Docker pada node Jenkins.
pipeline {
  agent any

  tools { nodejs 'node-22' }

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    APP_PORT = '3001'
    HEALTH_URL = "http://localhost:${APP_PORT}/api/health"
  }

  stages {
    stage('Install') {
      steps {
        sh 'node --version && npm --version'
        sh 'npm --prefix server ci'
        sh 'npm --prefix client ci'
      }
    }

    stage('Lint') {
      steps { sh 'npm --prefix client run lint' }
    }

    stage('Test') {
      steps {
        sh 'mkdir -p server/reports client/reports'
        sh 'npm --prefix server run test:ci'
        sh 'npm --prefix client run test:ci'
      }
      post {
        always { junit allowEmptyResults: false, testResults: 'server/reports/junit.xml, client/reports/junit.xml' }
      }
    }

    stage('Build') {
      steps { sh 'npm --prefix client run build' }
    }

    stage('Deploy') {
      steps { sh 'docker compose up -d --build' }
    }

    stage('Smoke Test') {
      steps {
        // Menunggu kontainer siap (maksimal 30 x 2 detik), lalu memeriksa API dan halaman utama.
        sh '''
          for i in $(seq 1 30); do
            curl -fsS "$HEALTH_URL" && break
            echo "Menunggu aplikasi siap ($i/30)..."; sleep 2
          done
          curl -fsS "$HEALTH_URL" | grep -q '"status":"ok"'
          curl -fsS "http://localhost:${APP_PORT}/" | grep -q 'id="root"'
          curl -fsS "http://localhost:${APP_PORT}/api/dashboard" > /dev/null
        '''
      }
    }
  }

  post {
    success { echo 'Deployment berhasil dan lolos smoke test.' }
    failure { echo 'Pipeline gagal: periksa log tahap yang berwarna merah.' }
  }
}
