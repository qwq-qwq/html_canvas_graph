pipeline {
    agent any

    environment {
        APP_NAME    = "graph"
        BUCKET      = "graph"
        SRC_DIR     = "."
        S3_ENDPOINT = "https://s3.perek.rest"
        AWS_DEFAULT_REGION = "garage"
        AWS_REQUEST_CHECKSUM_CALCULATION = "when_required"
        AWS_RESPONSE_CHECKSUM_VALIDATION = "when_required"
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
    }

    options {
        timeout(time: 5, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Deploy') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'garage-s3',
                                                  usernameVariable: 'AWS_ACCESS_KEY_ID',
                                                  passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                        echo "$GIT_COMMIT_SHORT" > .version
                        aws --endpoint-url "$S3_ENDPOINT" s3 sync "$SRC_DIR/" "s3://$BUCKET/" \
                            --delete \
                            --exclude ".git/*" \
                            --exclude "node_modules/*" \
                            --exclude "Jenkinsfile" \
                            --exclude "docker-compose.yml" \
                            --exclude "setup-monitoring.sh" \
                            --exclude "eslint.config.mjs" \
                            --exclude "package*.json" \
                            --exclude "README.md"
                    '''
                }
            }
        }

        stage('Verify') {
            steps {
                sh 'curl -sSf "https://${APP_NAME}.perek.rest/" -o /dev/null'
            }
        }
    }

    post {
        success { echo "Deployed ${APP_NAME}.perek.rest (${GIT_COMMIT_SHORT})" }
        failure { echo "Deploy of ${APP_NAME}.perek.rest failed" }
        always  { cleanWs() }
    }
}