import { showToast, Toast } from "@raycast/api";
import { PicGo } from "picgo";
import { UserUploaderConfig } from "../types/type";

const getActiveUploaderType = () => {
    try {
        return ctx.getConfig<string>("picBed.uploader");
    } catch (e) {
        console.error("Fail to load PicGo config", e);
        showToast(Toast.Style.Failure, "Error", "Fail to load PicGo config");
        return "";
    }
};

const getUploadersTypes = () => {
    try {
        return ctx.uploaderConfig.listUploaderTypes() ?? [];
    } catch (e) {
        console.error("Fail to load PicGo config", e);
        showToast(Toast.Style.Failure, "Error", "Fail to load PicGo config");
        return [];
    }
};

export const getConfigList = (t?: string) => {
    try {
        if (!t) t = getActiveUploaderType();
        return ctx.uploaderConfig.getConfigList(t);
    } catch (e) {
        console.error("Fail to load PicGo config", e);
        showToast(Toast.Style.Failure, "Error", "Fail to load PicGo config");
        return [];
    }
};

const getActiveConfig = (t?: string) => {
    try {
        if (!t) t = getActiveUploaderType();
        return ctx.uploaderConfig.getActiveConfig(t);
    } catch (e) {
        console.error("Fail to load PicGo config", e);
        showToast(Toast.Style.Failure, "Error", "Fail to load PicGo config");
        return;
    }
};

export const syncConfig = (t: string, configName?: string) => {
    ctx.uploaderConfig.use(t, configName);
};

export const ctx = new PicGo();

export const uploaderTypes = getUploadersTypes();
export const initialConfig: UserUploaderConfig = {
    type: getActiveUploaderType(),
    configName: getActiveConfig()?._configName,
};
