@echo off
chcp 65001 > nul
echo ============================================
echo Script: Appliquer les ActiveEffects aux compendiums
echo ============================================
echo.

:: Vérifier que Node.js est installé
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js non trouvé!
    echo   Exécutez d'abord: INSTALL_NODEJS.bat
    pause
    exit /b 1
)

echo ℹ️  Node.js trouvé: %node --version%
echo.

:: Vérifier que Foundry est fermé
tasklist | findstr /i "foundryvtt" > nul
if %errorlevel% equ 0 (
    echo ❌ Foundry VTT est en cours d'exécution!
    echo   Fermer Foundry avant de continuer.
    pause
    exit /b 1
)

echo ✅ Foundry est fermé
echo.

:: Exécuter le script principal
echo 🔄 Application des ActiveEffects aux avantages...
echo.
node "_add-all-effects.js"

echo.
echo ============================================
echo ⚠️  IMPORTANT: Nettoyer le cache!
echo ============================================
echo.

:: Tenter de nettoyer avec fvtt
fvtt package clear > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Cache nettoyé avec fvtt
) else (
    echo ℹ️  fvtt non disponible, nettoyage manuel nécessaire:
    echo   rmdir /s /q "D:\AppDataFoundry$\FoundryVTT_Data\Cache"
)

echo.
echo ✅ Script terminé!
echo   Redémarrez Foundry VTT pour voir les changements.
echo.
pause
