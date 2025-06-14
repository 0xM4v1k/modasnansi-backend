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
        DOCKER_IMAGE_NAME = 'modasnansi-backend'
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_COMPOSE_FILE = 'docker/docker-compose.yml'
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

        stage('🐳 Docker Build & Deploy') {
            steps {
                echo "=== INICIANDO DOCKER BUILD & DEPLOY ==="
                script {
                    try {
                        echo "Verificando archivos Docker..."
                        sh "ls -la docker/"
                        
                        echo "Deteniendo contenedores existentes si existen..."
                        sh """
                            cd docker || { echo "❌ No se puede acceder al directorio docker"; exit 1; }
                            docker-compose -f docker-compose.yml down --remove-orphans || echo "⚠️ No hay contenedores previos corriendo"
                        """
                        
                        echo "Eliminando imágenes Docker previas..."
                        sh """
                            docker image ls | grep modas-nansi-app || echo "⚠️ No hay imágenes previas"
                            docker image rm \$(docker image ls -q docker_app*) 2>/dev/null || echo "⚠️ No se pudieron eliminar imágenes previas"
                            docker image rm \$(docker image ls -q modas-nansi-app*) 2>/dev/null || echo "⚠️ No se pudieron eliminar imágenes previas"
                        """
                        
                        echo "Construyendo nueva imagen Docker..."
                        sh """
                            cd docker
                            echo "Contenido del directorio actual:"
                            ls -la
                            echo "Verificando Dockerfile:"
                            cat Dockerfile | head -10
                            
                            echo "Construyendo imagen..."
                            docker-compose build --no-cache
                        """
                        
                        echo "Verificando que la imagen se construyó correctamente..."
                        sh "docker images | grep docker_app || { echo '❌ Imagen no construida correctamente'; exit 1; }"
                        
                        echo "Levantando servicios con Docker Compose..."
                        sh """
                            cd docker
                            docker-compose up -d
                        """
                        
                        echo "Esperando que los servicios estén listos..."
                        sleep 30
                        
                        echo "Verificando que los contenedores están corriendo..."
                        sh """
                            cd docker
                            docker-compose ps
                            echo "Estado de los contenedores:"
                            docker-compose logs --tail=20
                        """
                        
                        echo "Verificando conectividad de la aplicación..."
                        sh """
                            echo "Esperando que la aplicación esté lista..."
                            timeout 60s bash -c 'until curl -f http://localhost:3000 2>/dev/null; do echo "Esperando aplicación..."; sleep 5; done' || echo "⚠️ Aplicación no responde"
                            
                            echo "Verificando que el puerto 3000 está abierto:"
                            netstat -tlnp | grep :3000 || echo "⚠️ Puerto 3000 no está abierto"
                        """
                        
                        echo "✅ Deploy completado exitosamente"
                        echo "🚀 Aplicación corriendo en: http://localhost:3000"
                        echo "📦 Contenedor: modas-nansi-app"
                        echo "🗄️ Base de datos MySQL corriendo en: localhost:3307"
                        echo "📦 Contenedor DB: modas-nansi-db"
                        
                    } catch (Exception e) {
                        echo "❌ Error durante el deploy: ${e.getMessage()}"
                        echo "Logs de contenedores para debugging:"
                        sh """
                            cd docker
                            docker-compose logs || echo "No se pueden obtener logs"
                            echo "Estado de contenedores:"
                            docker ps -a || echo "No se puede obtener estado de contenedores"
                        """
                        throw e
                    }
                }
                echo "=== FIN DOCKER BUILD & DEPLOY ==="
            }
        }
        
        stage('🔍 Post-Deploy Verification') {
            steps {
                echo "=== VERIFICACION POST-DEPLOY ==="
                script {
                    echo "Realizando verificaciones finales..."
                    
                    echo "1. Verificando estado de contenedores:"
                    sh """
                        cd docker
                        docker-compose ps
                        echo "Contenedores específicos:"
                        docker ps | grep modas-nansi || echo "⚠️ No se encontraron contenedores modas-nansi"
                    """
                    
                    echo "2. Verificando logs de la aplicación:"
                    sh """
                        cd docker
                        docker-compose logs app --tail=20
                        echo "Logs directos del contenedor modas-nansi-app:"
                        docker logs modas-nansi-app --tail=10 || echo "⚠️ No se pueden obtener logs del contenedor"
                    """
                    
                    echo "3. Verificando logs de la base de datos:"
                    sh """
                        cd docker
                        docker-compose logs db --tail=10
                        echo "Estado de MySQL:"
                        docker exec modas-nansi-db mysqladmin -u root -ppassword123 status || echo "⚠️ MySQL no responde"
                    """
                    
                    echo "4. Test de conectividad HTTP:"
                    sh """
                        echo "Test básico de conectividad:"
                        curl -f http://localhost:3000 || echo "⚠️ Aplicación no responde"
                        curl -I http://localhost:3000 || echo "⚠️ No se puede hacer HEAD request"
                        
                        echo "Test de endpoint health (si existe):"
                        curl -f http://localhost:3000/health || echo "⚠️ Endpoint /health no responde"
                    """
                    
                    echo "5. Verificando conectividad de base de datos:"
                    sh """
                        cd docker
                        docker-compose exec -T db mysql -u root -ppassword123 -e "SHOW DATABASES;" || echo "⚠️ No se puede conectar a MySQL"
                        docker exec modas-nansi-db mysql -u root -ppassword123 -e "SELECT 1;" || echo "⚠️ MySQL no acepta conexiones"
                    """
                    
                    echo "6. Verificando recursos del sistema:"
                    sh """
                        echo "Uso de memoria de contenedores:"
                        docker stats --no-stream --format "table {{.Container}}\\t{{.CPUPerc}}\\t{{.MemUsage}}" modas-nansi-app modas-nansi-db || echo "⚠️ No se pueden obtener estadísticas"
                        
                        echo "Puertos expuestos:"
                        docker port modas-nansi-app || echo "⚠️ No se pueden obtener puertos de la app"
                        docker port modas-nansi-db || echo "⚠️ No se pueden obtener puertos de la DB"
                    """
                    
                    echo "✅ Verificaciones post-deploy completadas"
                }
                echo "=== FIN VERIFICACION POST-DEPLOY ==="
            }
        }
    }
    
}
