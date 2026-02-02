import usePicGoContext from "../util/context";

export type ImgUrlExportFormat = {
    name: string;
    label: string;
    generate: (urls: string[]) => string;
};

export type UploadFormData = {
    uploader_config: string;
    files: string[];
};

export type UserUploaderConfig = {
    uploaderType: string;
    configName?: string;
};
