
import File from 'fs';
import FileAsync from 'fs/promises';
import Path from 'path';
import AbstractFileService from './AbstractFileService';
import FileNotFoundException from '../exceptions/FileNotFoundException';
import Exception from '../exceptions/Exception';
import { IFileInfo } from "./IFileInfo";



export default class FileService extends AbstractFileService
{
    
    public async WriteAllTextAsync(path: string, text: string, encoding: 'utf-8' | 'win-1252'): Promise<void> {
        
        return new Promise<void>((resolve, reject) => {

            File.writeFile(path, text, encoding == "utf-8" ? "utf-8" : "latin1", (err)=> {
                if(err)
                    return reject(new Exception(err.message));

                return resolve();
            });

        });       
    }


    public async ReadAllTextAsync(path: string, encoding: 'utf-8' | 'win-1252'): Promise<string> {

        if(! (await this.FileExistsAsync(path)))
            throw new FileNotFoundException(`File ${path} not exists`);

            return new Promise<string>((resolve, reject) => {

                File.readFile(path, encoding == "utf-8" ? "utf-8" : "latin1", (err, text)=> {
                    if(err)
                        return reject(new Exception(err.message));
    
                    return resolve(text);
                });
    
            });   

    }      

    public CreateDirectoryAsync(path: string): Promise<void> {

        return new Promise<void>(async (resolve, reject) => 
        {           
            try{

               if(!await this.DirectoryExistsAsync(path))
               {
                    File.mkdirSync(path, {recursive: true});
                    return resolve();
               }                    
                
                return resolve();

            }catch(err)
            {
               return reject(err);
            }
        });
    }
    
    public FileExistsAsync(file: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => 
        {           
            try{

                return resolve(File.existsSync(file) && File.lstatSync(file).isFile());

            }catch(err)
            {
                return  reject(err);
            }
        });
    }

    public DirectoryExistsAsync(path: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => 
        {            
            try{
                
                return resolve(File.existsSync(path) && File.lstatSync(path).isDirectory());

            }catch(err)
            {
                return  reject(err);
            }
        });
    }

    public GetAllFilesAsync(origin: string): Promise<string[]> {
        
        return new Promise<string[]>(async (resolve, reject) => 
        {
            if(!File.existsSync(origin))
               return reject(new Error(`The path ${origin} not exists`));

            try{

            let files = await FileAsync.readdir(origin, {withFileTypes : true});

            return resolve(files.filter(u => u.isFile()).map(u => Path.join(origin, u.name)));

            }catch(err)
            {
                return  reject(err);
            }
        });
    }

    public GetAllFordersAsync(origin: string): Promise<string[]> {

        return new Promise<string[]>(async (resolve, reject) => 
        {
            if(!File.existsSync(origin))
                return reject(new Error(`The path ${origin} not exists`));

            try{

            let files = await FileAsync.readdir(origin, {withFileTypes : true});           

            return resolve(files.filter(u => u.isDirectory()).map(u => Path.join(origin, u.name)));

            }catch(err)
            {
                return  reject(err);
            }
        });
    }

    public CopyAsync(origin: string, dest: string): Promise<void> {
     
        return new Promise<void>(async (resolve, reject)=>
        {
            try{
                
                File.copyFile(origin, dest, (err) => 
                {
                    if(err) 
                         return reject(err);

                    resolve();
                })

            }catch(err)
            {
                reject(err);
            }
        });
        
    }      

    public DeleteAsync(file: string): Promise<void> {
     
        return new Promise<void>(async (resolve, reject)=>
        {
            try{
                 File.unlink(file, (err) => 
                {
                    if(err) 
                        return reject(err);

                    resolve();
                })

            }catch(err)
            {
                reject(err);
            }
        });
        
    }      

    public async RenameAsync(oldPath: string, newPath: string): Promise<void> 
    {
        try 
        {
            await FileAsync.rename(oldPath, newPath);
        } 
        catch (err) 
        {
            throw new Exception(
                err instanceof Error
                    ? err.message
                    : "Error renaming file or directory"
            );
        }
    }

    public async DeleteDirectoryAsync(path: string): Promise<void> {
        
        try 
        {
            await FileAsync.rm(path, {
                recursive: true,
                force: true
            });
        } 
        catch (err) 
        {
            throw new Exception(
                err instanceof Error
                    ? err.message
                    : "Error deleting directory"
            );
        }
    }

    public async IsFileAsync(path: string): Promise<boolean> 
    {
        if(!await this.FileExistsAsync(path))
                throw new FileNotFoundException(`File: ${path} not found`);

        const stats = await FileAsync.stat(path);
        return stats.isFile();
    }

    public async GetFileInfoAsync(path: string): Promise<IFileInfo> 
    {
        try 
        {
            if(!await this.FileExistsAsync(path))
                throw new FileNotFoundException(`File: ${path} not found`);

            const stats = await FileAsync.stat(path);

            if (!stats.isFile())
                throw new Exception(`The path ${path} is not a file`);

            const fullPath = Path.resolve(path);
            const extension = Path.extname(fullPath);

            return {
                Name: Path.basename(fullPath),
                FullPath: fullPath,
                SizeEmBytes: stats.size,
                SizeEmMBs: stats.size / 1024 / 1024,
                Ext: extension,
                Folder: Path.dirname(fullPath)
            };
        } 
        catch (err: unknown) 
        {
            throw new Exception(
                err instanceof Error
                    ? err.message
                    : `Error getting file information from ${path}`
            );
        }
    }

    
    
}



