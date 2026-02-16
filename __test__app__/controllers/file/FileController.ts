import { POST, GET, FromFiles, FromQuery, MaxFilesSize } from "../../..";
import { ControllerBase } from "../../../controllers/base/ControllerBase";
import FileService from "../../../files/FileService";
import File from '../../../files/File'
import Path from 'path';
import { MaxFileSize, OptionalFromFileArg, RequiredFromFileArg } from "../../..";
import { Validate } from "../../../validation/Index";



@Validate()
export default class FileController extends ControllerBase
{
    
    @POST()  
    public async UploadFileWithDecorator(@FromQuery("name")name : string, @FromQuery()age : number, @FromFiles()file: File)
    {
        await this.CreateFilesDirAsync();        
        let fs = new FileService();
        await fs.CopyAsync(file.Path, Path.join(this._uploadsDir, file.FileName));
        await fs.DeleteAsync(file.Path);
        return this.OK({ name, age, file});
    }  


    private _uploadsDir = Path.join(__dirname, "uploads");

    private async CreateFilesDirAsync()
    {
        const fs = new FileService();

        if(!(await fs.DirectoryExistsAsync(this._uploadsDir)))
            await fs.CreateDirectoryAsync(this._uploadsDir);        
    }
    
    @POST()  
    public async UploadFileWithNoDecorator(name : string, age : number, file: File)
    {
        await this.CreateFilesDirAsync();
       
        let fs = new FileService();
        await fs.CopyAsync(file.Path, Path.join(this._uploadsDir, file.FileName));
        await fs.DeleteAsync(file.Path);
        return this.OK({ name, age, file});
    }  

     @GET()  
    public async GetListOfFiles()
    {        
         await this.CreateFilesDirAsync();
        let fs = new FileService();
        let files = await fs.GetAllFilesAsync(this._uploadsDir);
        
        if(files.length == 0)
            return this.NotFound();
        
        return this.OK(files);
    } 

    @GET()  
    public async SendFileAsync()
    {        
         await this.CreateFilesDirAsync();
        let fs = new FileService();
        let files = await fs.GetAllFilesAsync(this._uploadsDir);

         if(files.length == 0)
            return this.NotFound();

        return this.SendFile(files[0]);
    }   
    
    @GET()  
    public async DownloadFileAsync()
    {        
         await this.CreateFilesDirAsync();
        let fs = new FileService();
        let files = await fs.GetAllFilesAsync(this._uploadsDir);
        
        if(files.length == 0)
            return this.NotFound();
        
        return this.DownloadFile(files[0]);
    }   


    @POST() 
    @MaxFileSize(1 * 1024 * 1024) 
    public async UploadFileWith1MBFileSize(file: File)
    {
        await this.CreateFilesDirAsync();
       
        let fs = new FileService();
        await fs.CopyAsync(file.Path, Path.join(this._uploadsDir, file.FileName));
        await fs.DeleteAsync(file.Path);
        return this.OK({ file});
    }  

    @POST() 
    @MaxFileSize(1 * 1024 * 1024, "The file size is bigger than 1MB") 
    public async UploadFileWith1MBFileSizeWithCustomMessage(file: File)
    {
        await this.CreateFilesDirAsync();
       
        let fs = new FileService();
        await fs.CopyAsync(file.Path, Path.join(this._uploadsDir, file.FileName));
        await fs.DeleteAsync(file.Path);
        return this.OK({ file});
    }  


    @POST()     
    public async UploadFileWithOptionalFile(@OptionalFromFileArg() file: File)
    {

        if(!file)
            return this.OK("Not file provided");

        await this.CreateFilesDirAsync();
       
        let fs = new FileService();
        await fs.CopyAsync(file.Path, Path.join(this._uploadsDir, file.FileName));
        await fs.DeleteAsync(file.Path);
        return this.OK({ file});
    }  

    @POST()     
    public async UploadFileWithRequiredFile(@RequiredFromFileArg(undefined, "File is required in this action") file: File)
    {
        await this.CreateFilesDirAsync();
       
        let fs = new FileService();
        await fs.CopyAsync(file.Path, Path.join(this._uploadsDir, file.FileName));
        await fs.DeleteAsync(file.Path);
        return this.OK({ file});
    } 
}