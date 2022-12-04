

import fs from "fs";
import type { Settings } from "$lib/types/config";

function loadCfg(cfgFile='./static/config.json') {
    const jsonData = fs.readFileSync(cfgFile, 'utf8');
    const jsonObj = JSON.parse(jsonData);
    console.log("Server loaded")
    return <Settings>jsonObj;
}

export const serverCfg = loadCfg();
