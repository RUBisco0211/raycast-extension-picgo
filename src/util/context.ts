import { PicGo } from "picgo";

export default function () {
    const ctx = new PicGo();

    const getActiveUploaderType = () => ctx.getConfig<string>("picBed.uploader");
    const uploaderTypeList = ctx.uploaderConfig.listUploaderTypes();

    function getConfigList(type: string) {
        if (!uploaderTypeList.find((t) => t === type)) throw new Error(`Uploader type '${type}' not found`);
        return ctx.uploaderConfig.getConfigList(type);
    }

    function getActiveConfig(type: string) {
        if (!uploaderTypeList.find((t) => t === type)) throw new Error(`Uploader type '${type}' not found`);
        return ctx.uploaderConfig.getActiveConfig(type);
    }

    function isAvailableConfig(type: string, configName?: string) {
        if (!configName) return false;
        if (!uploaderTypeList.find((t) => t === type)) return false;
        if (!getConfigList(type).find((cfg) => cfg._configName === configName)) return false;
        return true;
    }

    function syncConfig(type: string, configName: string) {
        if (!configName) throw new Error("ConfigName undefined");
        if (!uploaderTypeList.find((t) => t === type)) throw new Error(`Uploader type '${type}' not found`);
        const cfg = getConfigList(type).find((c) => c._configName == configName)!;
        if (!cfg) throw new Error(`Config name '${configName}' not found for uploader type '${type}'`);
        ctx.setConfig({
            "picBed.uploader": type,
            "picBed.current": type,
            [`picBed.${type}`]: cfg,
            [`uploader.${type}.defaultId`]: cfg._id,
        });
    }

    return {
        ctx,
        uploaderTypeList,

        getActiveUploaderType,
        getConfigList,
        getActiveConfig,

        isAvailableConfig,
        syncConfig,
    };
}
