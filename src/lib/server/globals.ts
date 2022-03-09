

import fs from "fs";
import type { Settings } from "$lib/types/config";

function loadCfg() {
    const jsonData = fs.readFileSync('./static/config.json', 'utf8');
    const jsonObj = JSON.parse(jsonData);
    console.log("Server loaded")
    return <Settings>jsonObj;
}

export const serverCfg = loadCfg();