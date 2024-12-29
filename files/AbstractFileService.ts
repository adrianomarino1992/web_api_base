
export default abstract class AbstractFileService 
{  

    public abstract CopyAsync(origin: string, dest: string): Promise<void>;
    public abstract DeleteAsync(file: string): Promise<void>;
    public abstract GetAllFilesAsync(origin: string): Promise<string[]>;
    public abstract GetAllFordersAsync(origin: string): Promise<string[]>;
    public abstract FileExistsAsync(file: string): Promise<boolean>;
    public abstract DirectoryExistsAsync(path: string): Promise<boolean>;
    public abstract CreateDirectoryAsync(path: string): Promise<void>;
    public abstract WriteAllTextAsync(path : string, text : string, encoding : 'utf-8' | 'win-1252') : Promise<void>;  
    public abstract ReadAllTextAsync(path : string, encoding : 'utf-8' | 'win-1252') : Promise<string>;  
   
}





