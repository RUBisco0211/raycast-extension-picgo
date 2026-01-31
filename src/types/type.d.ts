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
    type?: string;
    configName?: string;
};
