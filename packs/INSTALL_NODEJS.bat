@echo off
chcp 65001 >nul
:: ============================================================================
:: Script: Installation de Node.js pour le projet Antique
:: Système: Windows
:: Auteur: Mistral Vibe
:: Description: Vérifie et installe Node.js si nécessaire
:: ============================================================================

Setlocal EnableDelayedExpansion

:: Couleurs
set "GREEN=0A"
set "YELLOW=0E"
set "RED=0C"
set "WHITE=0F"
set "CYAN=0B"

:: Chemins
set "NODE_INSTALLER=C:\Nodejs\node-v20.12.2-x64.msi"
set "NODE_URL=https://nodejs.org/dist/v20.12.2/node-v20.12.2-x64.msi"
set "TARGET_DIR=C:\projet\VTT_Foundry\antique\packs"

color %WHITE%
cls

echo ╔════════════════════════════════════════════════════════════════╗
echo ║  🌐 INSTALLATION DE NODE.JS POUR LE SYSTÈME ANTIQUE             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Vérifier si Node.js est déjà installé
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "delims=" %%v in ('node --version') do set "NODE_VERSION=%%v"
    for /f "delims=" %%v in ('npm --version') do set "NPM_VERSION=%%v"
    
    color %GREEN%
    echo ✅ Node.js est déjà installé !
    echo.
    echo    Version de Node.js : %NODE_VERSION%
    echo    Version de npm    : %NPM_VERSION%
    echo.
    
    :: Vérifier si la version est suffisante (>= 16.0.0)
    for /f "tokens=1-3 delims=. " %%a in ('node --version') do (
        set /a "MAJOR=%%b" 2>nul
        if %%b GEQ 16 (
            echo ✅ Version compatible (>= 16.0.0)
        ) else (
            color %YELLOW%
            echo ⚠️  Version trop ancienne (^< 16.0.0)
            echo    Une mise à jour est recommandée.
        )
    )
    echo.
    echo ═════════════════════════════════════════════════════════════╗
echo ║  Vous pouvez maintenant exécuter le script :                   ║
echo ║  node _add-advantages-effects.js                              ║
echo ╚════════════════════════════════════════════════════════════╝
    echo.
    pause
    exit /b
)

:: Node.js n'est pas installé
color %YELLOW%
echo ⚠️  Node.js n'est PAS installé sur ce système.
echo.
echo    Node.js est nécessaire pour exécuter les scripts de gestion
    des compendiums Foundry VTT.
echo.

:: Vérifier si le dossier des installateurs existe
if not exist "%SystemDrive%\Nodejs" (
    mkdir "%SystemDrive%\Nodejs"
    echo ℹ️  Création du dossier : %SystemDrive%\Nodejs
    echo.
)

:: Proposer le téléchargement
:NODE_DOWNLOAD
set /p choix= Télécharger Node.js v20.12.2 (LTS) maintenant? [O/N] :
if /i "%choix%"=="O" goto DOWNLOAD_NODE
if /i "%choix%"=="Y" goto DOWNLOAD_NODE
if /i "%choix%"=="oui" goto DOWNLOAD_NODE
exit /b

:DOWNLOAD_NODE
echo.
echo ⏳ Téléchargement de Node.js...
echo.

:: Utiliser bitsadmin pour télécharger
bitsadmin /transfer NodejsDownloadJob /download /priority normal %NODE_URL% %NODE_INSTALLER% >nul

if exist "%NODE_INSTALLER%" (
    echo ✅ Téléchargement terminé !
    echo.
    goto INSTALL_NODE
) else (
    color %RED%
    echo ❌ Échec du téléchargement.
    echo.
    echo    Veuillez télécharger manuellement Node.js depuis :
    echo    %NODE_URL%
    echo.
    echo    Ou visitez : https://nodejs.org/
    echo.
    pause
    exit /b
)

:INSTALL_NODE
echo ⏳ Installation de Node.js...
echo.
echo    Cela peut prendre quelques minutes...
echo.

start /wait msiexec /i "%NODE_INSTALLER%" /qn /norestart

:: Vérifier si l'installation a réussi
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    color %GREEN%
    echo ✅ Node.js installé avec succès !
    echo.
    for /f "delims=" %%v in ('node --version') do set "NODE_VERSION=%%v"
    for /f "delims=" %%v in ('npm --version') do set "NPM_VERSION=%%v"
    echo    Version de Node.js : %NODE_VERSION%
    echo    Version de npm    : %NPM_VERSION%
) else (
    color %RED%
    echo ❌ L'installation a échoué.
    echo.
    echo    Veuillez installer manuellement depuis : https://nodejs.org/
)

echo.
echo ═════════════════════════════════════════════════════════════╗
echo ║  Vous pouvez maintenant exécuter les scripts avec node          ║
echo ║  Exemple: node _add-advantages-effects.js                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
