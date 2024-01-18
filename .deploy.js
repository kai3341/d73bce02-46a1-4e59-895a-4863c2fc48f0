const { spawn } = require('child_process');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.deploy.local' });
dotenv.config({ path: '.env.deploy' });

const commands = [
  "react-app-rewired build",
  "gh-pages -d build",
];


const executor = async (commands) => {
  for (const row of commands) {
    const [command, options] = Array.isArray(row)
      ? row
      : [row];
    const processOpts = { stdio: 'inherit', shell: true, ...options };
    const process = spawn(command, processOpts);
    const returncode = await new Promise((resolve, reject) => {
      process.on('exit', resolve);
    })
    if (returncode !== 0) throw new Error(JSON.stringify({ command, returncode }, null, 2));
  }
};

executor(commands);
