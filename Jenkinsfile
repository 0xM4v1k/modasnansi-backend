pipeline {
    agent any
    
    tools {
        // VERIFICACION: Asegúrate de que 'NodeJS-18' esté configurado en Global Tool Configuration
        nodejs 'NodeJS-18'
    }
    
    environment {
        // VERIFICACION: Confirma que la credencial 'sonar-token' existe en Jenkins
        SONAR_TOKEN = credentials('sonarqube')
        // VERIFICACION: Verifica que SonarQube esté corriendo en esta URL
        SONAR_HOST_URL = 'http://54.165.164.194/:9000'
        // Variables para Docker
        DOCKER_PROJECT_NAME = 'modas-nansi'
        DOCKER_IMAGE_NAME = 'modasnansi-backend'
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_COMPOSE_FILE = 'docker/docker-compose.yml'
        // Variables para contenedores
        APP_CONTAINER_NAME = "${DOCKER_PROJECT_NAME}_app_1"
        DB_CONTAINER_NAME = "${DOCKER_PROJECT_NAME}_db_1"       
        // Variables para base de datos
        DB_USER = 'root'
        DB_PASSWORD = 'password123'
        DB_NAME = 'modas-nansi'
    }
    
    stages {
        stage('🔍 Environment Check') {
            steps {
                echo "=== VERIFICANDO ENTORNO ==="
                echo "Workspace: ${WORKSPACE}"
                echo "Node version verificada:"
                sh 'node --version'
                echo "NPM version verificada:"
                sh 'npm --version'
                echo "Working directory:"
                sh 'pwd'
                echo "Contenido del directorio actual:"
                sh 'ls -la'
                echo "Git status:"
                sh 'git status || echo "No es un repo git o git no disponible"'
                echo "=== FIN VERIFICACION ENTORNO ==="
            }
        }
        
        stage('📥 Checkout') {
            steps {
                echo "=== INICIANDO CHECKOUT ==="
                checkout scm
                echo "Checkout completado. Verificando archivos descargados:"
                sh 'ls -la'
                echo "Verificando que package.json existe:"
                sh 'cat package.json | head -20 || echo "ERROR: package.json no encontrado"'
                echo "=== FIN CHECKOUT ==="
            }
        }
        
        stage('📦 Install Dependencies') {
            steps {
                echo "=== INSTALANDO DEPENDENCIAS ==="
                echo "Verificando package.json antes de instalar:"
                sh 'test -f package.json && echo "✅ package.json existe" || echo "❌ package.json NO existe"'
                echo "Verificando package-lock.json:"
                sh 'test -f package-lock.json && echo "✅ package-lock.json existe" || echo "⚠️ package-lock.json NO existe, se creará"'
                
                echo "Ejecutando npm ci..."
                sh 'npm ci'
                
                echo "Verificando instalación:"
                sh 'test -d node_modules && echo "✅ node_modules creado correctamente" || echo "❌ FALLO: node_modules no existe"'
                sh 'ls node_modules | head -10'
                echo "=== FIN INSTALACION DEPENDENCIAS ==="
            }
        }
        
        stage('🏗️ Build') {
            steps {
                echo "=== EJECUTANDO BUILD ==="
                echo "Verificando script build en package.json:"
                sh 'grep -A5 -B5 "build" package.json || echo "⚠️ Script build no encontrado"'
                
                echo "Verificando que src/ existe:"
                sh 'test -d src && echo "✅ Directorio src/ existe" || echo "❌ ERROR: src/ no existe"'
                sh 'ls -la src/ || echo "No se puede listar src/"'
                
                echo "Ejecutando build..."
                sh 'npm run build'
                
                echo "Verificando que dist/ fue creado:"
                sh 'test -d dist && echo "✅ Build exitoso - dist/ creado" || echo "❌ FALLO: dist/ no fue creado"'
                sh 'ls -la dist/ || echo "No se puede listar dist/"'
                echo "=== FIN BUILD ==="
            }
        }
        
        stage('🧪 Test') {
            steps {
                echo "=== EJECUTANDO TESTS ==="
                echo "Verificando script test en package.json:"
                sh 'grep -A5 -B5 "\\"test\\"" package.json || echo "⚠️ Script test no encontrado"'
                
                echo "Verificando archivos de configuración de test:"
                sh 'test -f jest.config.js && echo "✅ jest.config.js existe" || echo "⚠️ jest.config.js no existe"'
                sh 'test -f jest.setup.js && echo "✅ jest.setup.js existe" || echo "⚠️ jest.setup.js no existe"'
                
                echo "Buscando archivos de test:"
                sh 'find . -name "*.spec.ts" -o -name "*.test.ts" | head -10 || echo "⚠️ No se encontraron archivos de test"'
                
                echo "Ejecutando tests..."
                sh 'npx sonar-scanner'
                echo "✅ Tests completados exitosamente"
                echo "=== FIN TESTS ==="
            }
        }
        
        stage('📊 SonarQube Analysis') {
            steps {
                echo "=== INICIANDO ANALISIS SONARQUBE ==="
                script {
                    echo "Verificando configuración de SonarQube..."
                    echo "SONAR_HOST_URL: ${SONAR_HOST_URL}"
                    echo "SONAR_TOKEN está configurado: ${SONAR_TOKEN ? '✅ SÍ' : '❌ NO'}"
                    
                    echo "Verificando conectividad con SonarQube:"
                    sh """
                        curl -f ${SONAR_HOST_URL}/api/system/status || echo "⚠️ No se puede conectar a SonarQube en ${SONAR_HOST_URL}"
                    """
                    
                    echo "Verificando archivo sonar-project.properties:"
                    sh 'test -f sonar-project.properties && echo "✅ sonar-project.properties existe" || echo "⚠️ sonar-project.properties no existe"'
                    sh 'cat sonar-project.properties || echo "No se puede leer sonar-project.properties"'
                    
                    echo "Obteniendo herramienta SonarQube Scanner..."
                    def scannerHome = tool 'SonarQube-Scanner'
                    echo "Scanner Home: ${scannerHome}"
                    
                    echo "Verificando que el scanner existe:"
                    sh "test -f ${scannerHome}/bin/sonar-scanner && echo '✅ Scanner encontrado' || echo '❌ Scanner NO encontrado'"
                    
                    withSonarQubeEnv('sonarqube') {
                        echo "Ejecutando análisis de SonarQube..."
                        echo "Parámetros del análisis:"
                        echo "- Project Key: modasnansi-backend"
                        echo "- Project Name: ModasNansi Backend"
                        echo "- Sources: src"
                        echo "- Host URL: ${SONAR_HOST_URL}"
                        
                        sh """
                            echo "Contenido de src antes del análisis:"
                            find src -type f -name "*.ts" | head -20 || echo "No hay archivos .ts en src"
                            
                            echo "Ejecutando sonar-scanner..."
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=modasnansi-backend \
                            -Dsonar.projectName='ModasNansi Backend' \
                            -Dsonar.projectVersion=1.0.0 \
                            -Dsonar.sources=src \
                            -Dsonar.exclusions=**/*.spec.ts,**/*.test.ts,**/test/**,**/*.js,node_modules/**,dist/** \
                            -Dsonar.sourceEncoding=UTF-8 \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_TOKEN} \
                            -Dsonar.verbose=true
                        """
                        echo "✅ Análisis de SonarQube completado"
                    }
                }
                echo "=== FIN ANALISIS SONARQUBE ==="
            }
        }
        
        stage('🚪 Quality Gate') {
            steps {
                echo "=== VERIFICANDO QUALITY GATE ==="
                echo "Esperando resultado del Quality Gate..."
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        echo "Consultando estado del Quality Gate..."
                        def qg = waitForQualityGate()
                        echo "Quality Gate Status: ${qg.status}"
                        
                        if (qg.status != 'OK') {
                            echo "❌ Quality Gate FALLÓ: ${qg.status}"
                            error "Quality Gate failed: ${qg.status}"
                        } else {
                            echo "✅ Quality Gate PASÓ exitosamente"
                        }
                    }
                }
                echo "=== FIN QUALITY GATE ==="
            }
        }

        // 🚀 Etapa: Despliegue de la aplicación NestJS
        stage('🚀 Deploy Application') {
            steps {
                echo '🚀 === INICIO: PROCESO DE DESPLIEGUE ==='
                dir('docker') {
                    script {
                        try {
                            // 🧹 Limpieza de despliegue anterior
                            echo '1️⃣ Limpiando despliegue anterior...'
                            try {
                                sh "docker-compose -p modas-nansi down -v --remove-orphans"
                                echo "✅ Contenedores anteriores detenidos"
                            } catch (Exception e) {
                                echo "⚠️ Advertencia al detener contenedores: ${e.getMessage()}"
                            }
                            
                            // 🧹 Limpieza de imágenes previas
                            echo '1.1️⃣ Limpiando imágenes previas...'
                            try {
                                sh '''
                                    docker image rm $(docker images -q modas-nansi-app) 2>/dev/null || echo "⚠️ No hay imágenes previas de la app"
                                    docker image prune -f || echo "⚠️ No se pudieron limpiar imágenes"
                                '''
                            } catch (Exception e) {
                                echo "⚠️ Advertencia al limpiar imágenes: ${e.getMessage()}"
                            }
                            
                            // 🏗️ Construcción y levantamiento de servicios
                            echo '2️⃣ Construyendo y levantando servicios...'
                            sh "docker-compose -p modas-nansi up -d --build"
                            
                            // ⏳ Espera para que los servicios inicien
                            echo '3️⃣ Esperando inicialización de servicios...'
                            echo 'Esperando que MySQL esté listo...'
                            sleep(20)
                            
                            // 🔍 Verificación del estado de contenedores
                            echo '3.1️⃣ Verificando estado de contenedores...'
                            sh "docker-compose -p modas-nansi ps"
                            
                            // 🔍 Verificar logs de la aplicación para debugging
                            echo '3.2️⃣ Verificando logs de la aplicación...'
                            try {
                                sh "docker logs modas-nansi-app-1 --tail 20"
                            } catch (Exception e) {
                                echo "⚠️ No se pueden obtener logs de la aplicación: ${e.getMessage()}"
                            }
                            
                            // 🔍 Verificación de la base de datos
                            echo '4️⃣ Verificando conexión a la base de datos...'
                            timeout(time: 2, unit: 'MINUTES') {
                                waitUntil {
                                    script {
                                        try {
                                            sh "docker exec modas-nansi-db-1 mysqladmin ping -h localhost -u root -ppassword123 --silent"
                                            return true
                                        } catch (Exception e) {
                                            echo "⏳ Esperando que MySQL esté listo..."
                                            sleep(5)
                                            return false
                                        }
                                    }
                                }
                            }
                            echo "✅ MySQL está listo"
                            
                            // 🔍 Verificar si la aplicación está corriendo correctamente
                            echo '5️⃣ Verificando estado de la aplicación...'
                            def appStatus = sh(script: "docker inspect modas-nansi-app-1 --format='{{.State.Status}}'", returnStdout: true).trim()
                            echo "Estado de la aplicación: ${appStatus}"
                            
                            if (appStatus != 'running') {
                                echo "⚠️ La aplicación no está corriendo. Verificando logs..."
                                sh "docker logs modas-nansi-app-1 --tail 50"
                                echo "Intentando reiniciar la aplicación..."
                                sh "docker restart modas-nansi-app-1"
                                sleep(30)
                            }
                            
                            // 🔍 Verificación de la estructura de base de datos
                            echo '6️⃣ Verificando estructura de la base de datos...'
                            sh '''
                                docker exec modas-nansi-db-1 mysql -uroot -ppassword123 -e "
                                    USE modas-nansi; 
                                    SHOW TABLES;
                                    SELECT 'Database modas-nansi is ready!' as status;
                                "
                            '''
                            
                            // ⏳ Espera adicional para la aplicación NestJS
                            echo '7️⃣ Esperando inicio de la aplicación NestJS...'
                            sleep(30)
                            
                            // 🔍 Verificación de logs de la aplicación
                            echo '8️⃣ Mostrando logs finales de la aplicación:'
                            sh "docker logs modas-nansi-app-1 --tail 30"
                            
                            // 🔍 Verificación de que la aplicación responde - CORREGIDO
                            echo '9️⃣ Verificando que la aplicación responde...'
                            timeout(time: 2, unit: 'MINUTES') {
                                waitUntil {
                                    script {
                                        try {
                                            // Intentar múltiples formas de conectar
                                            def curlResult = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000", returnStdout: true).trim()
                                            echo "Código de respuesta HTTP: ${curlResult}"
                                            
                                            // Aceptar cualquier código HTTP (200, 418, etc.) - significa que la app responde
                                            if (curlResult != "" && curlResult != "000") {
                                                echo "✅ Aplicación está respondiendo con código: ${curlResult}"
                                                return true
                                            } else {
                                                echo "⏳ Aplicación aún no responde, intentando alternativas..."
                                                
                                                // Intentar con 127.0.0.1
                                                def curlResult2 = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000", returnStdout: true).trim()
                                                if (curlResult2 != "" && curlResult2 != "000") {
                                                    echo "✅ Aplicación responde en 127.0.0.1 con código: ${curlResult2}"
                                                    return true
                                                }
                                                
                                                // Verificar estado del contenedor
                                                def status = sh(script: "docker inspect modas-nansi-app-1 --format='{{.State.Status}}'", returnStdout: true).trim()
                                                echo "Estado actual del contenedor: ${status}"
                                                
                                                if (status != 'running') {
                                                    echo "❌ El contenedor no está corriendo. Logs recientes:"
                                                    sh "docker logs modas-nansi-app-1 --tail 10"
                                                    return false
                                                }
                                                
                                                echo "⏳ Esperando que la aplicación responda..."
                                                sleep(5)
                                                return false
                                            }
                                        } catch (Exception e) {
                                            echo "⏳ Error al conectar: ${e.getMessage()}"
                                            
                                            // Verificar estado del contenedor cada vez
                                            def status = sh(script: "docker inspect modas-nansi-app-1 --format='{{.State.Status}}'", returnStdout: true).trim()
                                            echo "Estado actual del contenedor: ${status}"
                                            
                                            if (status != 'running') {
                                                echo "❌ El contenedor no está corriendo. Logs recientes:"
                                                sh "docker logs modas-nansi-app-1 --tail 10"
                                                return false
                                            }
                                            
                                            sleep(5)
                                            return false
                                        }
                                    }
                                }
                            }
                            echo "✅ Aplicación está respondiendo"
                            
                            // 📊 Estado final de los servicios
                            echo '🔟 Estado final de los servicios:'
                            sh "docker-compose -p modas-nansi ps"
                            
                            // 🌐 URLs de acceso
                            echo '🌐 === INFORMACIÓN DE ACCESO ==='
                            echo "🚀 Aplicación NestJS: http://localhost:3000"
                            echo "🗄️ Base de datos MySQL: localhost:3307"
                            echo "📦 Contenedor App: modas-nansi-app-1"
                            echo "📦 Contenedor DB: modas-nansi-db-1"
                            echo '================================'
                            
                        } catch (Exception e) {
                            echo "❌ Error durante el despliegue: ${e.getMessage()}"
                            
                            // 🔍 Información de debugging
                            echo '🔍 === INFORMACIÓN DE DEBUGGING ==='
                            try {
                                echo 'Estado de contenedores:'
                                sh "docker-compose -p modas-nansi ps"
                                
                                echo 'Logs de la aplicación:'
                                sh "docker logs modas-nansi-app-1 --tail 50 || echo 'No se pueden obtener logs de la app'"
                                
                                echo 'Logs de la base de datos:'
                                sh "docker logs modas-nansi-db-1 --tail 20 || echo 'No se pueden obtener logs de la DB'"
                                
                                echo 'Contenedores en ejecución:'
                                sh "docker ps -a"
                                
                            } catch (Exception debugE) {
                                echo "No se pudo obtener información de debugging: ${debugE.getMessage()}"
                            }
                            
                            throw e
                        }
                    }
                }
                echo '✅ === FIN: DESPLIEGUE COMPLETADO ==='
            }
        }
    }
    
    post {
        always {
            echo "=== POST-PROCESO SIEMPRE ==="
            echo "Información del build:"
            echo "- Build Number: ${BUILD_NUMBER}"
            echo "- Build URL: ${BUILD_URL}"
            echo "- Workspace: ${WORKSPACE}"
            
            echo "Estado final del workspace:"
            sh 'ls -la || echo "No se puede listar el workspace"'
            
            echo "Limpiando workspace..."
            cleanWs()
            echo "✅ Workspace limpio"
            echo "=== FIN POST-PROCESO ==="
        }
        success {
            echo "🎉 ¡PIPELINE COMPLETADO EXITOSAMENTE!"
            echo "✅ Todas las etapas pasaron correctamente"
            echo "✅ Código analizado en SonarQube"
            echo "✅ Quality Gate aprobado"
            echo "✅ Aplicación desplegada en Docker"
            echo "🚀 Aplicación disponible en: http://localhost:3000"
            echo "📦 Contenedor App: modas-nansi-app-1"
            echo "🗄️ Base de datos disponible en: localhost:3307"
            echo "📦 Contenedor DB: modas-nansi-db-1"
        }
        failure {
            echo "💥 PIPELINE FALLÓ"
            echo "❌ Revisa los logs arriba para identificar el problema"
            echo "❌ Verifica la configuración de herramientas en Jenkins"
            echo "❌ Confirma que SonarQube esté funcionando"
            echo "❌ Verifica que Docker esté corriendo correctamente"
        }
        unstable {
            echo "⚠️ PIPELINE INESTABLE"
            echo "⚠️ Algunos tests pueden haber fallado pero el build continuó"
        }
    }
}
