import { FileServiceImpl } from "./file-service-impl";
import { FileService } from "./file-service.interface";

export const fileService: FileService = new FileServiceImpl();
