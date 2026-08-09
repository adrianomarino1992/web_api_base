import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import os from 'os';
import FileService from '../files/FileService';
import FileNotFoundException from '../exceptions/FileNotFoundException';

describe("FileService", () => {
    let service: FileService;
    let tempRoot: string;

    beforeEach(() => {
        service = new FileService();
        tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'core-api-fileservice-'));
    });

    afterEach(() => {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    });

    test("should write and read text using utf-8", async () => {
        const filePath = path.join(tempRoot, 'utf8.txt');
        const content = 'olá mundo';

        await service.WriteAllTextAsync(filePath, content, 'utf-8');

        const result = await service.ReadAllTextAsync(filePath, 'utf-8');

        expect(result).toBe(content);
    });

    test("should write and read text using win-1252", async () => {
        const filePath = path.join(tempRoot, 'latin1.txt');
        const content = 'ação';

        await service.WriteAllTextAsync(filePath, content, 'win-1252');

        const result = await service.ReadAllTextAsync(filePath, 'win-1252');

        expect(result).toBe(content);
    });

    test("should create directory only when it does not exist", async () => {
        const dirPath = path.join(tempRoot, 'nested', 'child');

        await service.CreateDirectoryAsync(dirPath);
        await service.CreateDirectoryAsync(dirPath);

        expect(await service.DirectoryExistsAsync(dirPath)).toBe(true);
    });

    test("should list only files from a directory", async () => {
        const filePath = path.join(tempRoot, 'a.txt');
        const secondFilePath = path.join(tempRoot, 'b.txt');
        const folderPath = path.join(tempRoot, 'folder');

        fs.writeFileSync(filePath, 'a');
        fs.writeFileSync(secondFilePath, 'b');
        fs.mkdirSync(folderPath);

        const files = await service.GetAllFilesAsync(tempRoot);

        expect(files).toEqual(expect.arrayContaining([filePath, secondFilePath]));
        expect(files).not.toContain(folderPath);
    });

    test("should list only folders from a directory", async () => {
        const folderPath = path.join(tempRoot, 'folder');
        const secondFolderPath = path.join(tempRoot, 'folder2');
        const filePath = path.join(tempRoot, 'file.txt');

        fs.mkdirSync(folderPath);
        fs.mkdirSync(secondFolderPath);
        fs.writeFileSync(filePath, 'content');

        const folders = await service.GetAllFordersAsync(tempRoot);

        expect(folders).toEqual(expect.arrayContaining([folderPath, secondFolderPath]));
        expect(folders).not.toContain(filePath);
    });

    test("should copy and delete files", async () => {
        const origin = path.join(tempRoot, 'origin.txt');
        const dest = path.join(tempRoot, 'dest.txt');
        const content = 'copy me';

        fs.writeFileSync(origin, content);

        await service.CopyAsync(origin, dest);

        expect(fs.readFileSync(dest, 'utf-8')).toBe(content);
        expect(await service.FileExistsAsync(dest)).toBe(true);

        await service.DeleteAsync(dest);

        expect(await service.FileExistsAsync(dest)).toBe(false);
    });

    test("should identify an existing file", async () => {
        const filePath = path.join(tempRoot, 'file.txt');
        fs.writeFileSync(filePath, 'content');

        await expect(service.IsFile(filePath)).resolves.toBe(true);
    });

    test("should throw when checking a missing file", async () => {
        const filePath = path.join(tempRoot, 'missing.txt');

        await expect(service.IsFile(filePath)).rejects.toBeInstanceOf(FileNotFoundException);
    });

    test("should return file info for an existing file", async () => {
        const filePath = path.join(tempRoot, 'report.txt');
        const content = '1234567890';
        fs.writeFileSync(filePath, content);

        const info = await service.GetFileInfo(filePath);

        expect(info.Name).toBe('report.txt');
        expect(info.FullPath).toBe(path.resolve(filePath));
        expect(info.SizeEmBytes).toBe(Buffer.byteLength(content));
        expect(info.SizeEmMBs).toBe(Buffer.byteLength(content) / 1024 / 1024);
        expect(info.Ext).toBe('.txt');
        expect(info.Folder).toBe(path.dirname(path.resolve(filePath)));
    });

    test("should throw when getting info from a missing file", async () => {
        const filePath = path.join(tempRoot, 'missing.txt');

        await expect(service.GetFileInfo(filePath)).rejects.toThrow(`File: ${filePath} not found`);
    });

    test("should throw when reading a missing file", async () => {
        const filePath = path.join(tempRoot, 'missing.txt');

        await expect(service.ReadAllTextAsync(filePath, 'utf-8')).rejects.toBeInstanceOf(FileNotFoundException);
    });
});
