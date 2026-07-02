$ErrorActionPreference = "Continue"
$logFile = "c:\Users\PC\Desktop\cursor\ai-onto\start-dev.log"
Set-Location "c:\Users\PC\Desktop\cursor\ai-onto\ai-onto"

function Log($msg) {
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    Add-Content -Path $logFile -Value $line
    Write-Host $line
}

function Get-YarnExe {
    # 1. 全局 yarn
    $globalYarn = Get-Command yarn -ErrorAction SilentlyContinue
    if ($globalYarn) { return $globalYarn.Source }

    # 2. 独立目录安装的 yarn（不触发项目依赖解析）
    $localYarn = Join-Path $PWD ".yarn-tools\node_modules\yarn\bin\yarn.js"
    if (Test-Path $localYarn) { return "node `"$localYarn`"" }

    return $null
}

function Install-Yarn {
    $yarnDir = Join-Path $PWD ".yarn-tools"
    Log "Installing yarn to .yarn-tools (isolated from project deps)..."
    npm install yarn@1.22.22 --prefix $yarnDir --loglevel error 2>&1 | ForEach-Object { Log $_ }
}

function Invoke-Yarn {
    param([string[]]$Args)
    $yarnExe = Get-YarnExe
    if (-not $yarnExe) {
        Install-Yarn
        $yarnExe = Get-YarnExe
    }
    if (-not $yarnExe) {
        Log "ERROR: Failed to install yarn"
        exit 1
    }
    if ($yarnExe -like "node *") {
        $yarnPath = $yarnExe -replace '^node "(.+)"$', '$1'
        & node $yarnPath @Args
    } else {
        & $yarnExe @Args
    }
    return $LASTEXITCODE
}

Log "=== Start dev script ==="
Log "Node: $(node -v 2>&1)"
Log "npm: $(npm -v 2>&1)"

# 确保 yarn 可用
$null = Get-YarnExe
if (-not (Get-YarnExe)) { Install-Yarn }
Log "Yarn ready: $(Get-YarnExe)"

# 用 yarn 安装项目依赖（yarn 不强制校验 peer deps，与 yarn.lock 兼容）
if (-not (Test-Path "node_modules\react\package.json")) {
    Log "Installing project dependencies (this may take several minutes)..."
    $code = Invoke-Yarn @("install", "--frozen-lockfile")
    if ($code -ne 0) {
        Log "WARN: frozen-lockfile failed, retrying..."
        $code = Invoke-Yarn @("install")
    }
    if ($code -ne 0) {
        Log "ERROR: yarn install failed with exit code $code"
        exit 1
    }
} else {
    Log "node_modules already exists, skipping install"
}

if (-not (Test-Path "node_modules\react\package.json")) {
    Log "ERROR: node_modules not found after install"
    exit 1
}
Log "Dependencies OK"

Log "Starting dev server on http://localhost:9070 ..."
$code = Invoke-Yarn @("run", "dev")
if ($code -ne 0) { exit $code }
