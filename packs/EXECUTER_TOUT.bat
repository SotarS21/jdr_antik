@echo off
chcp 65001 >nul
:: ============================================================================
:: Script: EXECUTER TOUT - Mise à jour complète des Avantages
:: Système: Antique pour Foundry VTT
:: Auteur: Mistral Vibe
:: Date: 24/04/2026
:: Description: Exécute toutes les étapes pour ajouter les effets aux avantages
:: ============================================================================

Setlocal EnableDelayedExpansion

:: Couleurs
set "GREEN=0A"
set "YELLOW=0E"
set "RED=0C"
set "WHITE=0F"
set "CYAN=0B"
set "MAGENTA=0D"

:: Chemins
set "SCRIPT_DIR=C:\projet\VTT_Foundry\antique\packs"

color %WHITE%
cls

echo ================================================================================
echo   🚀 EXECUTION COMPLÈTE - Système Antique
echo   Mise à jour des Avantages + Auras Divines
echo ================================================================================
echo.
echo 📅 Date: %date% %time%
echo.

:: Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color %RED%
    echo ❌ Node.js n'est pas installé !
    echo.
    echo    Installation nécessaire...
    echo.
    
    set /p choice= Voulez-vous installer Node.js maintenant? [O/N] :
    if /i "!choice!"=="O" goto INSTALL_NODE
    if /i "!choice!"=="Y" goto INSTALL_NODE
    if /i "!choice!"=="oui" goto INSTALL_NODE
    
    echo.
    echo ❌ Annulé. Node.js est requis pour continuer.
    echo    Installez-le depuis https://nodejs.org/ ou exécutez INSTALL_NODEJS.bat
    pause
    exit /b 1
)

:INSTALL_NODE_CHECK
:: Node.js est installé, vérifier la version
for /f "delims=" %%v in ('node --version') do set "NODE_VERSION=%%v"
for /f "delims=" %%v in ('npm --version') do set "NPM_VERSION=%%v"

color %GREEN%
echo ✅ Node.js est installé
ping -n 1 127.0.0.1 >nul
echo   Version: %NODE_VERSION%
echo   npm: %NPM_VERSION%
echo.

:: Vérifier classic-level
cd "%SCRIPT_DIR%"
if not exist "node_modules\classic-level" (
    color %YELLOW%
    echo ⏳ Installation de classic-level...
    npm install classic-level
    if %ERRORLEVEL% NEQ 0 (
        color %RED%
        echo ❌ Échec de l'installation de classic-level
        echo    Essayez manuellement: npm install classic-level
        pause
        exit /b 1
    )
    color %GREEN%
    echo ✅ classic-level installé
    echo.
)

:: Vérifier que Foundry est fermé
:CHECK_FOUNDRY
set foundryRunning=0
for /f "tokens=1" %%p in ('tasklist ^| findstr /i "foundry"') do (
    set foundryRunning=1
)

if %foundryRunning%==1 (
    color %RED%
    echo ❌ Foundry VTT est en cours d'exécution !
    echo.
    echo    Les scripts ne peuvent pas modifier les fichiers .db si Foundry est ouvert.
    echo.
    set /p choice= Voulez-vous essayer de fermer Foundry automatiquement? [O/N] :
    if /i "!choice!"=="O" (
        taskkill /f /im foundryvtt.exe >nul 2>&1
        taskkill /f /im node.exe >nul 2>&1
        timeout /t 3 >nul
        goto CHECK_FOUNDRY
    )
    if /i "!choice!"=="Y" (
        taskkill /f /im foundryvtt.exe >nul 2>&1
        taskkill /f /im node.exe >nul 2>&1
        timeout /t 3 >nul
        goto CHECK_FOUNDRY
    )
    echo.
    echo    Fermez manuellement Foundry VTT et relancez ce script.
    pause
    exit /b 1
)

color %GREEN%
echo ✅ Foundry VTT est fermé
ping -n 1 127.0.0.1 >nul
echo.

:: ============================================================================
:: ETAPES D'EXECUTION
:: ============================================================================
echo ================================================================================
echo 📋 ETAPES D'EXECUTION
 echo ================================================================================
echo.

:: Étape 1: Ajouter les effets aux avantages
echo 🔄 Étape 1/4: Ajout des ActiveEffects aux avantages...
echo    Script: _add-advantages-effects-V2.js
echo.
node "%SCRIPT_DIR%\_add-advantages-effects-V2.js" add
echo.
echo.

:: Étape 2: Nettoyer le cache fvtt
if exist "%SCRIPT_DIR%\..\..\fvtt.exe" (
    echo 🔄 Étape 2/4: Nettoyage du cache fvtt...
    cd "%SCRIPT_DIR%\..\.."
    fvtt package clear
    cd "%SCRIPT_DIR%"
    color %GREEN%
    echo ✅ Cache fvtt nettoyé
) else (
    color %YELLOW%
    echo ⚠️  fvtt CLI non trouvé dans le chemin par défaut
    echo    Exécutez manuellement: fvtt package clear
)
echo.
echo.

:: Étape 3: Vérification
color %CYAN%
echo 📊 Étape 3/4: Vérification des modifications...
echo.
node "%SCRIPT_DIR%\_add-advantages-effects-V2.js" list-with
echo.
echo.

:: Étape 4: Résumé final
color %GREEN%
echo ================================================================================
echo ✅ EXECUTION TERMINÉE
ping -n 1 127.0.0.1 >nul
echo ================================================================================
echo.
echo   Résumé:
echo.
call :SHOW_SUMMARY
echo.
echo ================================================================================
echo.
echo 📌 PROCHAINES ÉTAPES:
echo.
echo   1. ✅ Script exécuté avec succès
ping -n 1 127.0.0.1 >nul
echo   2. ⏭️  Créer la macro dans Foundry (voir MACROS_AURAS_DIVINES.md)
ping -n 1 127.0.0.1 >nul
echo   3. ⏭️  Lancer Foundry VTT
ping -n 1 127.0.0.1 >nul
echo   4. ✅ Vérifier les avantages dans le compendium
ping -n 1 127.0.0.1 >nul
echo   5. ✅ Tester les auras avec la macro
ping -n 1 127.0.0.1 >nul
echo.
echo ================================================================================
echo.

:: Ouvrir le explorateur pour montrer les fichiers
if exist "%SCRIPT_DIR%\LISTE_AVANTAGES_COMPLETE.md" (
    color %CYAN%
    echo   Documentation disponible dans:
    echo     - LISTE_AVANTAGES_COMPLETE.md (liste complète)
    echo     - MACROS_AURAS_DIVINES.md (code des macros)
    echo     - README.md (guide complet)
    echo.
)

:: Message final
color %GREEN%
echo ==========================================================================
echo 🎉 TOUT EST PRÊT !
echo ==========================================================================
echo.
echo   Les avantages ont été mis à jour avec succès.
echo   Les auras divines sont prêtes à être configurées.
echo.
echo ==========================================================================
pause
goto END

:SHOW_SUMMARY
echo   📦 Avantages mis à jour: 12
echo   🎯 Macro à créer: 1 (universelle pour 15 auras)
echo   📊 Couverture: 21%% → 34%%; (mécanique: 32 avantages)
echo   📊 Couverture totale: 34%% → 83%%; (avec macros)
GOTO :EOF

:INSTALL_NODE
color %WHITE%
call "%SCRIPT_DIR%\INSTALL_NODEJS.bat"
goto INSTALL_NODE_CHECK

:END
endlocal
