@echo off
chcp 65001 >nul
echo ============================================================
echo [ANTIQUE v14] Migration des ActiveEffects pour les avantages
echo ============================================================
echo.

:: Vérifier si Node.js est installé
node --version >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js est installé
    GOTO RUN_SCRIPT
) ELSE (
    echo ❌ Node.js n'est PAS installé
    GOTO INSTALL_NODE
)

:INSTALL_NODE
echo.
echo 📦 Installation de Node.js automatique...
echo.
echo Ouvrir le navigateur pour télécharger Node.js...
echo.
echo ============================================================
echo ATTENTION : Cette étape nécessite votre intervention
echo ============================================================
echo.
echo 1. Un navigateur va s'ouvrir sur https://nodejs.org/
echo 2. Télécharger la version LTS (recommandée)
echo 3. Exécuter l'installateur avec les options par défaut
    echo 4. Cliquer sur "Next" jusqu'à la fin
    echo 5. Ne pas fermer cette fenêtre après l'installation
    echo.

:: Ouvrir le navigateur par défaut
start "" "https://nodejs.org/"

:: Attendre que l'utilisateur installe Node.js
echo.
echo ⏳ Appuyez sur ENTRÉE une fois Node.js installé...
pause >nul

:VERIFY_NODE
echo.
echo Vérification de l'installation...
node --version >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js est maintenant installé
    GOTO RUN_SCRIPT
) ELSE (
    echo ❌ Node.js n'est toujours pas détecté
    echo.
    echo Vérifiez que :
    echo   - Le chemin de Node.js est dans le PATH
    echo   - Vous avez redémarré votre invite de commandes
    echo.
    GOTO ASK_RETRY
)

:ASK_RETRY
echo Appuyez sur R pour réessayer ou Q pour quitter
set /p choice=
IF /I "%choice%" EQU "R" (
    GOTO VERIFY_NODE
) ELSE IF /I "%choice%" EQU "Q" (
    GOTO END
) ELSE (
    GOTO ASK_RETRY
)

:RUN_SCRIPT
echo.
echo 🚀 Début de la migration...
echo.
cd /d "%~dp0"
node _migrate-avantages-effects.js

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Migration terminée avec succès !
    echo.
    echo ============================================================
    echo PROCHAINE ÉTAPE : Nettoyer le cache de Foundry
    echo ============================================================
    echo.
    echo Exécuter :
    echo   fvtt package clear
    echo.
    echo Ou supprimer manuellement :
    echo   C:\Users\%USERNAME%\AppData\Local\FoundryVTT\Data\Cache\n    echo.
) ELSE (
    echo.
    echo ❌ Erreur lors de la migration
)

:END
pause
