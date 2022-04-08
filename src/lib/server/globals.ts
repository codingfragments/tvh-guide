

import fs from "fs";
import type { Settings } from "$lib/types/config";

function loadCfg(cfgFile='./static/config.json') {
    const jsonData = fs.readFileSync(cfgFile, 'utf8');
    const jsonObj = JSON.parse(jsonData);
    console.log("Server loaded")
    return <Settings>jsonObj;
}

export function saveCfg(cfgFile='./static/config.json') {
    console.log("🚀 ~ file: globals.ts ~ line 14 ~ saveCfg ~ cfgFile", cfgFile)
}

export const serverCfg = loadCfg();
