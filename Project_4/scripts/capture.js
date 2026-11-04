const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTML_PATH = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
const OUTPUT_PATH = path.resolve(__dirname, '../assets/preview.png');
const USER_DATA_DIR = path.resolve(__dirname, '../.chrome-temp');

async function main() {
  console.log('Launching headless Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900'
  ]);

  chrome.on('error', (err) => console.error('Chrome spawn error:', err));

  // Wait for debugging port
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Failed to get WebSocket debugger URL');
    chrome.kill();
    process.exit(1);
  }

  console.log('Connecting to Chrome CDP...');
  const ws = new WebSocket(wsUrl);

  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);
  console.log('Connected to CDP!');

  // Create new target / page
  const { targetId } = await send('Target.createTarget', { url: HTML_PATH });
  const pageWsUrl = `ws://127.0.0.1:9222/devtools/page/${targetId}`;

  const pageWs = new WebSocket(pageWsUrl);
  let pageId = 1;
  const pagePending = new Map();

  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = pageId++;
      pagePending.set(msgId, { resolve, reject });
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  pageWs.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pagePending.has(data.id)) {
      const { resolve, reject } = pagePending.get(data.id);
      pagePending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise(resolve => pageWs.onopen = resolve);

  await sendPage('Page.enable');
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2, // HiDPI crisp retina screenshot
    mobile: false
  });

  // Wait for initial render
  await new Promise(r => setTimeout(r, 1000));

  console.log('Centering graph and setting traversal step...');
  await sendPage('Runtime.evaluate', {
    expression: `
      if (window.__APP__) {
        window.__APP__.canvas.centerGraph();
        window.__APP__.ui.goToStep(10);
      }
    `
  });

  // Give canvas time to render the frame with glow, ripple, and centered position
  await new Promise(r => setTimeout(r, 800));

  console.log('Capturing screenshot...');
  const { data } = await sendPage('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true
  });

  fs.writeFileSync(OUTPUT_PATH, Buffer.from(data, 'base64'));
  console.log(`Screenshot saved to: ${OUTPUT_PATH}`);

  // Now capture DFS on Petersen Graph
  console.log('Switching to DFS and Petersen Graph...');
  await sendPage('Runtime.evaluate', {
    expression: `
      if (window.__APP__) {
        const app = window.__APP__;
        app.graph.deserialize(window.PRESETS.petersen.data);
        app.ui.dom.algoSelect.value = 'dfs';
        app.ui.currentAlgorithm = 'dfs';
        app.ui.renderPseudocode();
        app.ui.updateStartNodeOptions();
        app.ui.updateMetrics();
        app.ui.rebuildTimeline();
        app.canvas.centerGraph();
        app.ui.goToStep(14); // mid-traversal with stack frames
      }
    `
  });

  await new Promise(r => setTimeout(r, 800));

  const dfsData = await sendPage('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true
  });

  const DFS_OUTPUT = path.resolve(__dirname, '../assets/dfs-preview.png');
  fs.writeFileSync(DFS_OUTPUT, Buffer.from(dfsData.data, 'base64'));
  console.log(`DFS Screenshot saved to: ${DFS_OUTPUT}`);

  // Clean up
  pageWs.close();
  ws.close();
  chrome.kill();

  try {
    fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
  } catch (e) {}

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
