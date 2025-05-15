import { spawn } from 'child_process';
import * as path from 'path';

// Path to the CLI executable
const cliPath = path.resolve(__dirname, '../dist/index.js');

describe('CLI Integration Tests', () => {
  // Test the help command
  it('should display help information', async () => {
    const cliProcess = spawn('node', [cliPath, '--help']);
    
    // Collect stdout and stderr
    let stdout = '';
    let stderr = '';
    
    cliProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    cliProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Wait for the process to exit
    const exitCode = await new Promise<number>((resolve) => {
      cliProcess.on('exit', resolve);
    });
    
    // Check the results
    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('Options:');
    expect(stdout).toContain('Commands:');
    expect(stdout).toContain('start');
    expect(stdout).toContain('test');
  });

  // Test the version command
  it('should display version information', async () => {
    const cliProcess = spawn('node', [cliPath, '--version']);
    
    // Collect stdout and stderr
    let stdout = '';
    let stderr = '';
    
    cliProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    cliProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Wait for the process to exit
    const exitCode = await new Promise<number>((resolve) => {
      cliProcess.on('exit', resolve);
    });
    
    // Check the results
    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatch(/\d+\.\d+\.\d+/); // Should match a semver pattern
  });
});
